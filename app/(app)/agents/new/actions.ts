'use server'

import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { createAgentWithSubscription } from '@/lib/supabase/queries/agents'
import { AGENT_FOLLOWUP_PROMPT, AGENT_NAME_PROMPT } from '@/lib/prompts'
import type { UserAgentType } from '@/lib/types'

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
    const cleaned = raw.replace(/```json?\s*/g, '').replace(/```\s*/g, '').trim()
    const parsed = JSON.parse(cleaned)

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
    const cleaned = raw.replace(/```json?\s*/g, '').replace(/```\s*/g, '').trim()
    const parsed = JSON.parse(cleaned)

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

export async function createAgent(
  type: UserAgentType,
  name: string,
  description: string,
  topicTags: string[]
): Promise<CreateAgentResult> {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  try {
    const agentId = await createAgentWithSubscription(supabase, user.id, {
      name,
      type,
      description,
      topicTags,
    })

    return { agentId }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to create agent' }
  }
}
