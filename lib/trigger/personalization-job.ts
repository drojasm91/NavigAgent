// Layer 3 — Personalization Loop
// Weekly cron. Reads like signals per user per user-agent, updates prompt_config.

import { schedules, logger } from '@trigger.dev/sdk/v3'
import { createServiceClient } from '@/lib/supabase/service'
import { runPersonalizationLoop } from '@/lib/pipelines/personalization-loop'

export const personalizationJob = schedules.task({
  id: 'navigagent-personalization',
  // Every Sunday at 03:00 UTC
  cron: '0 3 * * 0',
  run: async () => {
    const supabase = createServiceClient()

    // Get all users with at least one user-agent subscription
    const { data: users, error } = await supabase
      .from('user_agent_subscriptions')
      .select('user_id')

    if (error) {
      logger.error('Personalization: failed to fetch users', { error })
      return
    }

    const uniqueUserIds = Array.from(new Set(users.map((u) => u.user_id)))
    logger.log(`Personalization: processing ${uniqueUserIds.length} users`)

    for (const userId of uniqueUserIds) {
      try {
        await runPersonalizationLoop({ userId, supabase })
        logger.log('Personalization: updated user', { userId })
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        logger.error('Personalization: failed for user', { userId, error: message })
        // Continue to next user — one failure never blocks the rest
      }
    }
  },
})
