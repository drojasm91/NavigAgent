// Layer 2 — Pipeline Job
// Background task that reads a job record and routes it to the correct pipeline.

import { task, logger } from '@trigger.dev/sdk/v3'
import { createServiceClient } from '@/lib/supabase/service'
import { runOrchestrator } from '@/lib/pipelines/orchestrator'

interface PipelineJobPayload {
  jobId: string
  agentId: string
}

export const pipelineJob = task({
  id: 'navigagent-pipeline',
  maxDuration: 300,
  retry: { maxAttempts: 1 }, // Orchestrator handles its own retries per step
  run: async ({ jobId, agentId }: PipelineJobPayload) => {
    const supabase = createServiceClient()

    // Mark job as running
    await supabase
      .from('jobs')
      .update({ status: 'running' })
      .eq('id', jobId)

    const startedAt = Date.now()

    try {
      await runOrchestrator({ jobId, agentId, supabase })

      await supabase
        .from('jobs')
        .update({ status: 'completed', completed_at: new Date().toISOString() })
        .eq('id', jobId)

      logger.log('Pipeline: completed', { jobId, agentId, durationMs: Date.now() - startedAt })
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)

      await supabase
        .from('jobs')
        .update({
          status: 'failed',
          completed_at: new Date().toISOString(),
          error: message,
        })
        .eq('id', jobId)

      logger.error('Pipeline: failed', { jobId, agentId, error: message })
      // Do not rethrow — a failed pipeline never blocks the scheduler
    }
  },
})
