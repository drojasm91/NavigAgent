'use server'

import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { createAgentWithPosts } from '@/lib/supabase/queries/agents'
import { AGENT_FOLLOWUP_PROMPT, AGENT_NAME_PROMPT } from '@/lib/prompts'
import { parseJsonFromAI } from '@/lib/utils'
import { runNewsResearcher } from '@/lib/pipelines/steps/researcher'
import { runNewsWriter } from '@/lib/pipelines/steps/writer-news'
import type { UserAgentType } from '@/lib/types'
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
  answers: Record<string, string[]>
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
          content: `Agent type: ${type}\nTopic: ${topic}\nPreferences:\n${answersText}`,
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
  topicTags: string[]
): Promise<SamplePostResult> {
  try {
    // Build researcher input — no history during creation
    const researcherInput = {
      agentName: name,
      agentDescription: description,
      agentType: type,
      topicTags,
      promptConfig: {},
      recentPostHooks: [],
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
      promptConfig: {},
      researchBrief: research.data!,
    })

    return { post: writerOutput }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to generate sample post' }
  }
}

export async function createAgentWithSamples(
  type: UserAgentType,
  name: string,
  description: string,
  topicTags: string[],
  samplePosts: WriterOutput[]
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
    }, samplePosts)

    // Trigger background jobs to fill up to 3 posts
    const remaining = Math.max(0, 3 - samplePosts.length)
    if (remaining > 0) {
      // Create pending jobs and trigger pipeline
      for (let i = 0; i < remaining; i++) {
        const { data: job } = await supabase
          .from('jobs')
          .insert({ agent_id: agentId, status: 'pending' })
          .select('id')
          .single()

        if (job) {
          // Dynamically import to avoid bundling Trigger.dev in client
          try {
            const { pipelineJob } = await import('@/lib/trigger/pipeline-job')
            await pipelineJob.trigger({ jobId: job.id, agentId })
          } catch {
            // Trigger.dev may not be available in dev — jobs stay pending for scheduler
          }
        }
      }
    }

    return { agentId }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to create agent' }
  }
}
