'use server'

import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { createSnipperWithPosts } from '@/lib/supabase/queries/snippers'
import { SNIPPER_FOLLOWUP_PROMPT, SNIPPER_NAME_PROMPT, SNIPPER_REFINEMENT_CHAT_PROMPT } from '@/lib/prompts'
import { parseJsonFromAI } from '@/lib/utils'
import { runNewsResearcher } from '@/lib/pipelines/steps/researcher'
import { runNewsWriter } from '@/lib/pipelines/steps/writer-news'
import type { SnipperType, SnipperDepth, Json } from '@/lib/types'
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

interface SnipperPreview {
  name: string
  description: string
  topicTags: string[]
  error?: boolean
}

interface CreateSnipperResult {
  snipperId?: string
  error?: string
}

interface SamplePostResult {
  post?: WriterOutput
  error?: string
}

export async function generateFollowUpQuestions(
  type: SnipperType,
  topic: string
): Promise<FollowUpResult> {
  try {
    const client = new Anthropic()

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 400,
      system: SNIPPER_FOLLOWUP_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Snipper type: ${type}\nTopic: ${topic}`,
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

export async function generateSnipperPreview(
  type: SnipperType,
  topic: string,
  answers: Record<string, string[]>,
  refinementInstructions?: string
): Promise<SnipperPreview> {
  try {
    const client = new Anthropic()

    const answersText = Object.entries(answers)
      .map(([question, selections]) => `${question}: ${selections.join(', ')}`)
      .join('\n')

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      system: SNIPPER_NAME_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Snipper type: ${type}\nTopic: ${topic}\nPreferences:\n${answersText}${refinementInstructions ? `\n\nAdditional refinement instructions from the user:\n${refinementInstructions}` : ''}`,
        },
      ],
    })

    const raw = message.content[0].type === 'text' ? message.content[0].text : ''
    const parsed = parseJsonFromAI(raw)

    return {
      name: typeof parsed.name === 'string' ? parsed.name : 'My Snipper',
      description: typeof parsed.description === 'string' ? parsed.description : '',
      topicTags: Array.isArray(parsed.topicTags)
        ? parsed.topicTags.filter((t: unknown) => typeof t === 'string').slice(0, 4)
        : [],
    }
  } catch {
    return { name: 'My Snipper', description: '', topicTags: [], error: true }
  }
}

export async function generateSamplePost(
  type: SnipperType,
  name: string,
  description: string,
  topicTags: string[],
  previousPostHooks: string[] = [],
  refinementInstructions?: string,
  depthPreference: SnipperDepth = 'balanced'
): Promise<SamplePostResult> {
  try {
    const promptConfig = {
      ...(refinementInstructions ? { refinementInstructions } : {}),
      depthPreference,
    }

    // Build researcher input — pass previous hooks to avoid topic repetition
    const researcherInput = {
      snipperName: name,
      snipperDescription: description,
      snipperType: type,
      topicTags,
      promptConfig,
      recentPostHooks: previousPostHooks,
    }

    // Run researcher agent
    let research = await runNewsResearcher(researcherInput)

    // If researcher skips, retry with broader query
    if (research.skip) {
      const broadInput = {
        ...researcherInput,
        snipperDescription: `${description}. Find ANY recent development or interesting angle on this topic.`,
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

    // Run writer agent
    const writerOutput = await runNewsWriter({
      snipperName: name,
      snipperDescription: description,
      snipperType: type,
      topicTags,
      promptConfig,
      researchBrief: research.data!,
    })

    return { post: { ...writerOutput, sources: research.data?.sources ?? [] } }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to generate sample post' }
  }
}

export async function createSnipperWithSamples(
  type: SnipperType,
  name: string,
  description: string,
  topicTags: string[],
  samplePosts: WriterOutput[],
  refinementInstructions?: string,
  refinementChat?: ChatMessage[],
  sessionId?: string,
  depthPreference: SnipperDepth = 'balanced'
): Promise<CreateSnipperResult> {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  try {
    const promptConfig = {
      ...(refinementInstructions ? { refinementInstructions } : {}),
      ...(refinementChat ? { refinementChat: refinementChat as unknown as Json } : {}),
    }
    const snipperId = await createSnipperWithPosts(supabase, user.id, {
      name,
      type,
      depth: depthPreference,
      description,
      topicTags,
      promptConfig: Object.keys(promptConfig).length > 0 ? promptConfig as unknown as Json : undefined,
    }, samplePosts)

    // Mark refinement session as activated
    if (sessionId) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from('refinement_sessions')
        .update({ snipper_id: snipperId, activated: true })
        .eq('session_id', sessionId)
    }

    return { snipperId }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to create snipper' }
  }
}

export async function generateBackgroundPost(snipperId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  try {
    // Fetch snipper config
    const { data: snipper, error: snipperError } = await supabase
      .from('snippers')
      .select('id, name, type, depth, description, topic_tags, prompt_config')
      .eq('id', snipperId)
      .eq('owner_id', user.id)
      .single()

    if (snipperError || !snipper) {
      return { success: false, error: 'Snipper not found' }
    }

    const promptConfig = { ...(snipper.prompt_config as Record<string, unknown> ?? {}), depthPreference: snipper.depth ?? 'balanced' }

    if (snipper.type !== 'news') {
      return { success: false, error: `Pipeline not implemented for type: ${snipper.type}` }
    }

    // Fetch recent post hooks for dedup
    const { data: recentPosts } = await supabase
      .from('posts')
      .select('id')
      .eq('snipper_id', snipperId)
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

    // Run researcher agent
    let research = await runNewsResearcher({
      snipperName: snipper.name,
      snipperDescription: snipper.description,
      snipperType: snipper.type,
      topicTags: snipper.topic_tags ?? [],
      promptConfig,
      recentPostHooks,
    })

    if (research.skip || !research.data) {
      research = {
        skip: false,
        data: {
          brief: `Write an engaging overview of a current development in ${snipper.description}. Focus on ${(snipper.topic_tags ?? []).join(', ')}.`,
          angle: 'Current state overview with an interesting recent development',
          sources: [],
          topicsToAvoid: recentPostHooks,
          isBreaking: false,
        },
      }
    }

    // Run writer agent
    const writerOutput = await runNewsWriter({
      snipperName: snipper.name,
      snipperDescription: snipper.description,
      snipperType: snipper.type,
      topicTags: snipper.topic_tags ?? [],
      promptConfig,
      researchBrief: research.data!,
    })

    // Save post + sub_posts
    const { data: post, error: postError } = await supabase
      .from('posts')
      .insert({
        snipper_id: snipperId,
        type: 'thread',
        quality_score: writerOutput.qualityScore,
        metadata: {
          sources: research.data?.sources ?? [],
          angle: research.data?.angle ?? '',
          isBreaking: research.data?.isBreaking ?? false,
        } as unknown as Json,
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

export async function refineSnipperChat(
  message: string,
  chatHistory: ChatMessage[],
  currentPreview: { name: string; description: string; topicTags: string[] },
  context?: { sessionId: string; snipperType: string; topic: string }
): Promise<{ response: string; refinementInstructions: string; error?: string }> {
  try {
    const client = new Anthropic()

    const userMessage = JSON.stringify({
      currentSnipper: currentPreview,
      chatHistory,
      latestMessage: message,
    })

    const msg = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      system: SNIPPER_REFINEMENT_CHAT_PROMPT,
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
          agent_type: context.snipperType,
          topic: context.topic,
          agent_name: currentPreview.name,
        }, { onConflict: 'session_id' })

        await sb.from('refinement_logs').insert([
          {
            user_id: user.id,
            session_id: context.sessionId,
            agent_type: context.snipperType,
            topic: context.topic,
            agent_name: currentPreview.name,
            role: 'user',
            content: message,
          },
          {
            user_id: user.id,
            session_id: context.sessionId,
            agent_type: context.snipperType,
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
