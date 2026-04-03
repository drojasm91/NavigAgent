'use server'

import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { createAgentWithPosts } from '@/lib/supabase/queries/agents'
import { AGENT_FOLLOWUP_PROMPT, AGENT_NAME_PROMPT, AGENT_REFINEMENT_CHAT_PROMPT } from '@/lib/prompts'
import { parseJsonFromAI } from '@/lib/utils'
import { runNewsResearcher } from '@/lib/pipelines/steps/researcher'
import { runNewsWriter } from '@/lib/pipelines/steps/writer-news'
import type { UserAgentType, Json } from '@/lib/types'
import type { WriterOutput, WriterSubPost } from '@/lib/pipelines/types'

// Re-export for the UI component
export type { WriterOutput, WriterSubPost }

export interface FollowUpQuestion {
  question: string
  options: string[]
}

interface FollowUpResult {
  questions: FollowUpQuestion[]
  error?: boolean
}

interface AgentPreview {
  name: string
  description: string
  topicTags: string[]
  error?: boolean
}

interface CreateAgentResult {
  agentId?: string
  error?: string
}

interface SamplePostResult {
  post?: WriterOutput
  error?: string
}

export async function generateFollowUpQuestions(
  type: UserAgentType,
  topic: string
): Promise<FollowUpResult> {
  try {
    const client = new Anthropic()

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 400,
      system: AGENT_FOLLOWUP_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Agent type: ${type}\nTopic: ${topic}`,
        },
      ],
    })

    const raw = message.content[0].type === 'text' ? message.content[0].text : ''
    const parsed = parseJsonFromAI(raw)

    if (!Array.isArray(parsed.questions)) {
      return { questions: [], error: true }
    }

    const questions: FollowUpQuestion[] = parsed.questions
      .filter(
        (q: Record<string, unknown>) =>
          typeof q.question === 'string' && Array.isArray(q.options)
      )
      .map((q: Record<string, unknown>) => ({
        question: q.question as string,
        options: (q.options as unknown[])
          .filter((o): o is string => typeof o === 'string')
          .slice(0, 5),
      }))
      .slice(0, 3)

    return { questions }
  } catch {
    return { questions: [], error: true }
  }
}

export async function generateAgentPreview(
  type: UserAgentType,
  topic: string,
  answers: Record<string, string[]>,
  refinementInstructions?: string
): Promise<AgentPreview> {
  try {
    const client = new Anthropic()

    const answersText = Object.entries(answers)
      .map(([question, selections]) => `${question}: ${selections.join(', ')}`)
      .join('\n')

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      system: AGENT_NAME_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Agent type: ${type}\nTopic: ${topic}\nPreferences:\n${answersText}${refinementInstructions ? `\n\nAdditional refinement instructions from the user:\n${refinementInstructions}` : ''}`,
        },
      ],
    })

    const raw = message.content[0].type === 'text' ? message.content[0].text : ''
    const parsed = parseJsonFromAI(raw)

    return {
      name: typeof parsed.name === 'string' ? parsed.name : 'My Agent',
      description: typeof parsed.description === 'string' ? parsed.description : '',
      topicTags: Array.isArray(parsed.topicTags)
        ? parsed.topicTags.filter((t: unknown) => typeof t === 'string').slice(0, 4)
        : [],
    }
  } catch {
    return { name: 'My Agent', description: '', topicTags: [], error: true }
  }
}

export async function generateSamplePost(
  type: UserAgentType,
  name: string,
  description: string,
  topicTags: string[],
  previousPostHooks: string[] = [],
  refinementInstructions?: string
): Promise<SamplePostResult> {
  try {
    const promptConfig = refinementInstructions ? { refinementInstructions } : {}

    // Build researcher input — pass previous hooks to avoid topic repetition
    const researcherInput = {
      agentName: name,
      agentDescription: description,
      agentType: type,
      topicTags,
      promptConfig,
      recentPostHooks: previousPostHooks,
    }

    // Run researcher
    let research = await runNewsResearcher(researcherInput)

    // If researcher skips, retry with broader query
    if (research.skip) {
      const broadInput = {
        ...researcherInput,
        agentDescription: `${description}. Find ANY recent development or interesting angle on this topic.`,
      }
      research = await runNewsResearcher(broadInput)
    }

    // If still skipping, use a fallback brief
    if (research.skip || !research.data) {
      research = {
        skip: false,
        data: {
          brief: `Write an engaging overview of the current state of ${description}. Focus on the most interesting recent developments in ${topicTags.join(', ')}.`,
          angle: 'Current state overview with the most surprising recent development',
          sources: [],
          topicsToAvoid: [],
          isBreaking: false,
        },
      }
    }

    // Run writer
    const writerOutput = await runNewsWriter({
      agentName: name,
      agentDescription: description,
      agentType: type,
      topicTags,
      promptConfig,
      researchBrief: research.data!,
    })

    return { post: { ...writerOutput, sources: research.data?.sources ?? [] } }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to generate sample post' }
  }
}

export async function createAgentWithSamples(
  type: UserAgentType,
  name: string,
  description: string,
  topicTags: string[],
  samplePosts: WriterOutput[],
  refinementInstructions?: string,
  refinementChat?: ChatMessage[],
  sessionId?: string
): Promise<CreateAgentResult> {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  try {
    const agentId = await createAgentWithPosts(supabase, user.id, {
      name,
      type,
      description,
      topicTags,
      promptConfig: refinementInstructions || refinementChat
        ? {
            ...(refinementInstructions ? { refinementInstructions } : {}),
            ...(refinementChat ? { refinementChat: refinementChat as unknown as Json } : {}),
          } as Json
        : undefined,
    }, samplePosts)

    // Mark refinement session as activated
    if (sessionId) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from('refinement_sessions')
        .update({ agent_id: agentId, activated: true })
        .eq('session_id', sessionId)
    }

    return { agentId }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to create agent' }
  }
}

export async function generateBackgroundPost(agentId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  try {
    // Fetch agent config
    const { data: agent, error: agentError } = await supabase
      .from('user_agents')
      .select('id, name, type, description, topic_tags, prompt_config')
      .eq('id', agentId)
      .eq('owner_id', user.id)
      .single()

    if (agentError || !agent) {
      return { success: false, error: 'Agent not found' }
    }

    if (agent.type !== 'news') {
      return { success: false, error: `Pipeline not implemented for type: ${agent.type}` }
    }

    // Fetch recent post hooks for dedup
    const { data: recentPosts } = await supabase
      .from('posts')
      .select('id')
      .eq('agent_id', agentId)
      .order('created_at', { ascending: false })
      .limit(7)

    const recentPostIds = recentPosts?.map((p) => p.id) ?? []
    let recentPostHooks: string[] = []

    if (recentPostIds.length > 0) {
      const { data: hooks } = await supabase
        .from('sub_posts')
        .select('content')
        .in('post_id', recentPostIds)
        .eq('position', 1)

      recentPostHooks = hooks?.map((h) => h.content) ?? []
    }

    // Run researcher
    let research = await runNewsResearcher({
      agentName: agent.name,
      agentDescription: agent.description,
      agentType: agent.type,
      topicTags: agent.topic_tags ?? [],
      promptConfig: agent.prompt_config ?? {},
      recentPostHooks,
    })

    if (research.skip || !research.data) {
      research = {
        skip: false,
        data: {
          brief: `Write an engaging overview of a current development in ${agent.description}. Focus on ${(agent.topic_tags ?? []).join(', ')}.`,
          angle: 'Current state overview with an interesting recent development',
          sources: [],
          topicsToAvoid: recentPostHooks,
          isBreaking: false,
        },
      }
    }

    // Run writer
    const writerOutput = await runNewsWriter({
      agentName: agent.name,
      agentDescription: agent.description,
      agentType: agent.type,
      topicTags: agent.topic_tags ?? [],
      promptConfig: agent.prompt_config ?? {},
      researchBrief: research.data!,
    })

    // Save post + sub_posts
    const { data: post, error: postError } = await supabase
      .from('posts')
      .insert({
        agent_id: agentId,
        type: 'thread',
        quality_score: writerOutput.qualityScore,
        metadata: {
          sources: research.data?.sources ?? [],
          angle: research.data?.angle ?? '',
          isBreaking: research.data?.isBreaking ?? false,
        },
      })
      .select('id')
      .single()

    if (postError || !post) {
      return { success: false, error: 'Failed to save post' }
    }

    const subPostRows = writerOutput.subPosts.map((sp) => ({
      post_id: post.id,
      position: sp.position,
      content: sp.content,
    }))

    await supabase.from('sub_posts').insert(subPostRows)

    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to generate post' }
  }
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export async function refineAgentChat(
  message: string,
  chatHistory: ChatMessage[],
  currentPreview: { name: string; description: string; topicTags: string[] },
  context?: { sessionId: string; agentType: string; topic: string }
): Promise<{ response: string; refinementInstructions: string; error?: string }> {
  try {
    const client = new Anthropic()

    const userMessage = JSON.stringify({
      currentAgent: currentPreview,
      chatHistory,
      latestMessage: message,
    })

    const msg = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      system: AGENT_REFINEMENT_CHAT_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    })

    const raw = msg.content[0].type === 'text' ? msg.content[0].text : ''
    const parsed = parseJsonFromAI(raw)

    const response = typeof parsed.response === 'string' ? parsed.response : 'Got it — regenerating with your preferences.'
    const refinementInstructions = typeof parsed.refinementInstructions === 'string' ? parsed.refinementInstructions : ''

    // Save both messages to refinement_logs + track session
    if (context) {
      const supabase = createClient()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sb = supabase as any
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // Create session row on first message, upsert on subsequent
        await sb.from('refinement_sessions').upsert({
          session_id: context.sessionId,
          user_id: user.id,
          agent_type: context.agentType,
          topic: context.topic,
          agent_name: currentPreview.name,
        }, { onConflict: 'session_id' })

        await sb.from('refinement_logs').insert([
          {
            user_id: user.id,
            session_id: context.sessionId,
            agent_type: context.agentType,
            topic: context.topic,
            agent_name: currentPreview.name,
            role: 'user',
            content: message,
          },
          {
            user_id: user.id,
            session_id: context.sessionId,
            agent_type: context.agentType,
            topic: context.topic,
            agent_name: currentPreview.name,
            role: 'assistant',
            content: response,
          },
        ])
      }
    }

    return { response, refinementInstructions }
  } catch {
    return { response: '', refinementInstructions: '', error: 'Failed to process refinement' }
  }
}
