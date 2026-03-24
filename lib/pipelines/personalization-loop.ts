// Layer 3 — Personalization Loop (weekly cron)

import { SupabaseClient } from '@supabase/supabase-js'

interface PersonalizationLoopInput {
  userId: string
  supabase: SupabaseClient
}

export async function runPersonalizationLoop({ userId, supabase }: PersonalizationLoopInput): Promise<void> {
  // TODO: Implement Layer 3 — Personalization Loop
  // 1. Read like signals from past 4 weeks
  // 2. Identify engagement patterns
  // 3. Generate instruction update via claude-haiku
  // 4. Merge into prompt_config
}
