import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database, UserAgentType } from '@/lib/types'

type TypedClient = SupabaseClient<Database>

interface CreateAgentData {
  name: string
  type: UserAgentType
  description: string
  topicTags: string[]
}

export async function createAgentWithSubscription(
  supabase: TypedClient,
  userId: string,
  data: CreateAgentData
): Promise<string> {
  // Insert the user-agent
  const { data: agent, error: agentError } = await supabase
    .from('user_agents')
    .insert({
      owner_id: userId,
      name: data.name,
      type: data.type,
      description: data.description,
      topic_tags: data.topicTags,
      cadence: 'daily',
      is_public: false,
      is_active: true,
    })
    .select('id')
    .single()

  if (agentError || !agent) {
    throw new Error(agentError?.message ?? 'Failed to create agent')
  }

  // Auto-subscribe the creator
  const { error: subError } = await supabase
    .from('user_agent_subscriptions')
    .insert({
      user_id: userId,
      agent_id: agent.id,
    })

  if (subError) {
    throw new Error(subError.message)
  }

  return agent.id
}
