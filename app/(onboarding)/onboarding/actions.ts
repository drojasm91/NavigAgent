'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function completeOnboarding() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('users')
    .update({ onboarding_completed: true })
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
