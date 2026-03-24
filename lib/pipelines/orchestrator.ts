// Orchestrator — routes jobs to the correct pipeline based on user-agent type
// (news | learning | recommendation)

import { SupabaseClient } from '@supabase/supabase-js'

interface OrchestratorInput {
  jobId: string
  agentId: string
  supabase: SupabaseClient
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function runOrchestrator(input: OrchestratorInput): Promise<void> {
  // TODO: Implement orchestrator
  // 1. Fetch user-agent type from DB
  // 2. Route to correct pipeline (news, learning, recommendation)
  // 3. Run pipeline steps in sequence
}
