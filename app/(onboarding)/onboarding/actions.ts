'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

interface OnboardingData {
  vibes: string[]
  topics: string[]
  freeText: string
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
