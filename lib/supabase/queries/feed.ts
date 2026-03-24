import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database, SignalType } from '@/lib/types'
import type { FeedPost, FeedSubPost, FeedAgent } from '@/lib/types'

type TypedClient = SupabaseClient<Database>

async function enrichPostsWithDetails(
  supabase: TypedClient,
  posts: Database['public']['Tables']['posts']['Row'][]
): Promise<Omit<FeedPost, 'is_community'>[]> {
  if (posts.length === 0) return []

  const postIds = posts.map((p) => p.id)
  const agentIds = Array.from(new Set(posts.map((p) => p.agent_id)))

  // Fetch sub-posts and agents in parallel
  const [subPostsResult, agentsResult] = await Promise.all([
    supabase
      .from('sub_posts')
      .select('*')
      .in('post_id', postIds)
      .order('position', { ascending: true }),
    supabase
      .from('user_agents')
      .select('id, name, type, owner_id, is_public, topic_tags')
      .in('id', agentIds),
  ])

  const subPostsByPost = new Map<string, FeedSubPost[]>()
  for (const sp of subPostsResult.data ?? []) {
    const list = subPostsByPost.get(sp.post_id) ?? []
    list.push(sp)
    subPostsByPost.set(sp.post_id, list)
  }

  const agentsById = new Map<string, FeedAgent>()
  for (const a of agentsResult.data ?? []) {
    agentsById.set(a.id, a as FeedAgent)
  }

  return posts
    .filter((p) => agentsById.has(p.agent_id))
    .map((post) => ({
      ...post,
      sub_posts: subPostsByPost.get(post.id) ?? [],
      user_agents: agentsById.get(post.agent_id)!,
    }))
}

export async function fetchFeedPosts(
  supabase: TypedClient,
  userId: string,
  cursor?: string,
  limit = 10
): Promise<FeedPost[]> {
  // Get agent IDs the user subscribes to
  const { data: subs } = await supabase
    .from('user_agent_subscriptions')
    .select('agent_id')
    .eq('user_id', userId)

  if (!subs || subs.length === 0) return []

  const agentIds = subs.map((s) => s.agent_id)

  let query = supabase
    .from('posts')
    .select('*')
    .in('agent_id', agentIds)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (cursor) {
    query = query.lt('created_at', cursor)
  }

  const { data, error } = await query
  if (error) throw error

  const enriched = await enrichPostsWithDetails(supabase, data ?? [])
  return enriched.map((p) => ({ ...p, is_community: false }))
}

export async function fetchCommunityPosts(
  supabase: TypedClient,
  userId: string,
  limit = 5
): Promise<FeedPost[]> {
  // Get agent IDs user already subscribes to
  const { data: subs } = await supabase
    .from('user_agent_subscriptions')
    .select('agent_id')
    .eq('user_id', userId)

  const subscribedIds = subs?.map((s) => s.agent_id) ?? []

  // Get public agents not subscribed to
  let agentQuery = supabase
    .from('user_agents')
    .select('id')
    .eq('is_public', true)

  if (subscribedIds.length > 0) {
    agentQuery = agentQuery.not('id', 'in', `(${subscribedIds.join(',')})`)
  }

  const { data: publicAgents } = await agentQuery
  if (!publicAgents || publicAgents.length === 0) return []

  const publicAgentIds = publicAgents.map((a) => a.id)

  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .in('agent_id', publicAgentIds)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error

  const enriched = await enrichPostsWithDetails(supabase, data ?? [])
  return enriched.map((p) => ({ ...p, is_community: true }))
}

export async function countUnreadOwnPosts(
  supabase: TypedClient,
  userId: string
) {
  const { data: subs } = await supabase
    .from('user_agent_subscriptions')
    .select('agent_id')
    .eq('user_id', userId)

  if (!subs || subs.length === 0) return 0

  const agentIds = subs.map((s) => s.agent_id)

  // Count posts from last 24 hours as "unread" approximation
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

  const { count } = await supabase
    .from('posts')
    .select('id', { count: 'exact', head: true })
    .in('agent_id', agentIds)
    .gte('created_at', since)

  return count ?? 0
}

export async function recordLikeSignal(
  supabase: TypedClient,
  userId: string,
  postId: string,
  signalType: SignalType
) {
  const { error } = await supabase
    .from('likes')
    .upsert(
      { user_id: userId, post_id: postId, signal_type: signalType },
      { onConflict: 'user_id,post_id,signal_type' }
    )

  if (error) throw error
}

export async function toggleSubscription(
  supabase: TypedClient,
  userId: string,
  agentId: string
) {
  // Check if subscription exists
  const { data: existing } = await supabase
    .from('user_agent_subscriptions')
    .select('id')
    .eq('user_id', userId)
    .eq('agent_id', agentId)
    .single()

  if (existing) {
    await supabase
      .from('user_agent_subscriptions')
      .delete()
      .eq('id', existing.id)
    return false // unfollowed
  } else {
    await supabase
      .from('user_agent_subscriptions')
      .insert({ user_id: userId, agent_id: agentId })
    return true // followed
  }
}
