// Layer 1 — Scheduler
// Hourly cron. Checks which user-agents are due to run and enqueues pipeline jobs.

import { schedules, logger } from '@trigger.dev/sdk/v3'
import { createServiceClient } from '@/lib/supabase/service'
import { pipelineJob } from './pipeline-job'

export const schedulerTask = schedules.task({
  id: 'navigagent-scheduler',
  // Runs at the top of every hour
  cron: '0 * * * *',
  run: async () => {
    const supabase = createServiceClient()
    const now = new Date()

    // Fetch all active user-agents
    const { data: userAgents, error } = await supabase
      .from('user_agents')
      .select('id, owner_id, cadence, last_run_at')
      .eq('is_active', true)

    if (error) {
      logger.error('Scheduler: failed to fetch user-agents', { error })
      return
    }

    logger.log(`Scheduler: checking ${userAgents.length} active user-agents`)

    for (const userAgent of userAgents) {
      if (!isDue(userAgent.cadence, userAgent.last_run_at, now)) continue

      // Check if any subscriber has fewer than 5 unread posts
      const hasLowInventory = await checkLowInventory(supabase, userAgent.id)
      if (!hasLowInventory) continue

      // Beta tier cap: daily cadence only (enforced by is_active flag at creation,
      // but double-checked here)
      if (userAgent.cadence !== 'daily') continue

      // Create a pending job record
      const { data: job, error: jobError } = await supabase
        .from('jobs')
        .insert({ agent_id: userAgent.id, status: 'pending' })
        .select('id')
        .single()

      if (jobError || !job) {
        logger.error('Scheduler: failed to create job', { agentId: userAgent.id, jobError })
        continue
      }

      // Enqueue the pipeline job
      await pipelineJob.trigger({ jobId: job.id, agentId: userAgent.id })

      logger.log('Scheduler: enqueued job', { jobId: job.id, agentId: userAgent.id })
    }
  },
})

// Returns true if the cadence interval has elapsed since last_run_at
function isDue(cadence: string, lastRunAt: string | null, now: Date): boolean {
  if (!lastRunAt) return true // Never run before — always due
  const last = new Date(lastRunAt)
  const hoursSince = (now.getTime() - last.getTime()) / (1000 * 60 * 60)
  if (cadence === 'daily') return hoursSince >= 24
  if (cadence === 'weekly') return hoursSince >= 168
  return false
}

// Returns true if any subscriber has fewer than 5 unread posts from this agent
async function checkLowInventory(supabase: ReturnType<typeof createServiceClient>, agentId: string): Promise<boolean> {
  const { data: subscriptions } = await supabase
    .from('user_agent_subscriptions')
    .select('user_id, curriculum_pointer')
    .eq('agent_id', agentId)

  if (!subscriptions || subscriptions.length === 0) return false

  // Count total posts for this agent
  const { count: totalPosts } = await supabase
    .from('posts')
    .select('id', { count: 'exact', head: true })
    .eq('agent_id', agentId)

  if (!totalPosts) return true // No posts at all — definitely needs to run

  // Check if any subscriber has fewer than 5 unread posts
  for (const sub of subscriptions) {
    const unread = totalPosts - (sub.curriculum_pointer ?? 0)
    if (unread < 5) return true
  }

  return false
}
