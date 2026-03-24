// Orchestrator — routes jobs to the correct pipeline based on user-agent type
// (news | learning | recommendation)
// TODO: implement full pipeline routing once system-agent steps are built

import { SupabaseClient } from '@supabase/supabase-js'

interface OrchestratorInput {
  jobId: string
  agentId: string
  supabase: SupabaseClient
}

export async function runOrchestrator({ jobId, agentId, supabase }: OrchestratorInput) {
  // Fetch user-agent to determine type
  const { data: userAgent, error } = await supabase
    .from('user_agents')
    .select('id, type, description, prompt_config, topic_tags')
    .eq('id', agentId)
    .single()

  if (error || !userAgent) {
    throw new Error(`Orchestrator: user-agent ${agentId} not found`)
  }

  const agentType = (userAgent as { type: string }).type

  switch (agentType) {
    case 'news':
      // TODO: run news pipeline (relevance-checker → planner → researcher → writer → editor)
      break
    case 'learning':
      // TODO: run learning pipeline (planner → writer → editor)
      break
    case 'recommendation':
      // TODO: run recommendation pipeline (planner → researcher → writer → editor)
      break
    default:
      throw new Error(`Orchestrator: unknown user-agent type "${agentType}"`)
  }

  // Update last_run_at
  await supabase
    .from('user_agents')
    .update({ last_run_at: new Date().toISOString() })
    .eq('id', agentId)
}
