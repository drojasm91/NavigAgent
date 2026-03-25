'use server'

import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { CLASSIFY_INTEREST_PROMPT } from '@/lib/prompts'

interface OnboardingData {
  vibes: string[]
  topics: string[]
  freeText: string
}

interface ClassifyResult {
  vibeId: string | null
  suggestedTopics: string[]
  error?: boolean
}

const VALID_VIBES = ['stay_informed', 'learn', 'live_better', 'think_deeper']

export async function classifyInterest(text: string): Promise<ClassifyResult> {
  try {
    const client = new Anthropic()

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 150,
      system: CLASSIFY_INTEREST_PROMPT,
      messages: [{ role: 'user', content: text }],
    })

    const raw = message.content[0].type === 'text' ? message.content[0].text : ''
    // Strip markdown fences if present
    const cleaned = raw.replace(/```json?\s*/g, '').replace(/```\s*/g, '').trim()
    const parsed = JSON.parse(cleaned)

    const vibeId = VALID_VIBES.includes(parsed.vibeId) ? parsed.vibeId : 'stay_informed'
    const suggestedTopics = Array.isArray(parsed.suggestedTopics)
      ? parsed.suggestedTopics.filter((t: unknown) => typeof t === 'string').slice(0, 3)
      : []

    return { vibeId, suggestedTopics }
  } catch {
    return { vibeId: null, suggestedTopics: [], error: true }
  }
}

export async function completeOnboarding(data?: OnboardingData) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('users')
    .update({
      onboarding_completed: true,
      vibes: data?.vibes ?? [],
      topics: data?.topics ?? [],
      free_text: data?.freeText ?? '',
    })
    .eq('id', user.id)

  if (error) {
    return { error: error.message }
  }

  const cookieStore = cookies()
  cookieStore.set('onboarding_done', 'true', {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
  })

  return { success: true }
}
