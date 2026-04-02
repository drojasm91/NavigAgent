import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database, UserAgentType } from '@/lib/types'
import type { WriterOutput } from '@/lib/pipelines/types'

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

export async function createAgentWithPosts(
  supabase: TypedClient,
  userId: string,
  data: CreateAgentData,
  samplePosts: WriterOutput[]
): Promise<string> {
  // 1. Create agent + subscription
  const agentId = await createAgentWithSubscription(supabase, userId, data)

  // 2. Insert each sample as a post + sub_posts
  for (const sample of samplePosts) {
    const { data: post, error: postError } = await supabase
      .from('posts')
      .insert({
        agent_id: agentId,
        type: 'thread',
        quality_score: sample.qualityScore,
      })
      .select('id')
      .single()

    if (postError || !post) continue

    const subPostRows = sample.subPosts.map((sp) => ({
      post_id: post.id,
      position: sp.position,
      content: sp.content,
    }))

    await supabase.from('sub_posts').insert(subPostRows)
  }

  // 3. Set last_run_at so scheduler doesn't immediately re-run
  await supabase
    .from('user_agents')
    .update({ last_run_at: new Date().toISOString() })
    .eq('id', agentId)

  return agentId
}
