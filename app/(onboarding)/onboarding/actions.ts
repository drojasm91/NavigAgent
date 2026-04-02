'use server'

import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { CLASSIFY_INTEREST_PROMPT } from '@/lib/prompts'
import { parseJsonFromAI } from '@/lib/utils'

interface OnboardingData {
  vibes: string[]
  topics: string[]
  freeText: string
}

export interface ClassifyOption {
  label: string
  vibeId: string
  suggestedTopics: string[]
}

interface ClassifyResult {
  vibeId: string | null
  label: string | null
  suggestedTopics: string[]
  ambiguous?: boolean
  options?: ClassifyOption[]
  error?: boolean
}

const VALID_VIBES = ['stay_informed', 'learn', 'live_better', 'think_deeper']

export async function classifyInterest(text: string): Promise<ClassifyResult> {
  try {
    const client = new Anthropic()

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 200,
      system: CLASSIFY_INTEREST_PROMPT,
      messages: [{ role: 'user', content: text }],
    })

    const raw = message.content[0].type === 'text' ? message.content[0].text : ''
    const parsed = parseJsonFromAI(raw) as Record<string, unknown>

    // Handle ambiguous response
    if (parsed.ambiguous && Array.isArray(parsed.options)) {
      const options: ClassifyOption[] = parsed.options
        .filter((o: Record<string, unknown>) => typeof o.label === 'string' && VALID_VIBES.includes(o.vibeId as string))
        .map((o: Record<string, unknown>) => ({
          label: o.label as string,
          vibeId: o.vibeId as string,
          suggestedTopics: Array.isArray(o.suggestedTopics)
            ? (o.suggestedTopics as unknown[]).filter((t): t is string => typeof t === 'string').slice(0, 3)
            : [],
        }))
        .slice(0, 3)

      if (options.length >= 2) {
        return { vibeId: null, label: null, suggestedTopics: [], ambiguous: true, options }
      }
    }

    // Handle direct (unambiguous) response
    const vibeId = VALID_VIBES.includes(parsed.vibeId) ? parsed.vibeId : 'stay_informed'
    const label = typeof parsed.label === 'string' ? parsed.label : null
    const suggestedTopics = Array.isArray(parsed.suggestedTopics)
      ? parsed.suggestedTopics.filter((t: unknown) => typeof t === 'string').slice(0, 3)
      : []

    return { vibeId, label, suggestedTopics }
  } catch {
    return { vibeId: null, label: null, suggestedTopics: [], error: true }
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
