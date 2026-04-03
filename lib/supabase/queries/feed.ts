import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database, SignalType } from '@/lib/types'
import type { FeedPost, FeedSubPost, FeedSnipper } from '@/lib/types'

type TypedClient = SupabaseClient<Database>

async function enrichPostsWithDetails(
  supabase: TypedClient,
  posts: Database['public']['Tables']['posts']['Row'][]
): Promise<Omit<FeedPost, 'is_community'>[]> {
  if (posts.length === 0) return []

  const postIds = posts.map((p) => p.id)
  const snipperIds = Array.from(new Set(posts.map((p) => p.snipper_id)))

  // Fetch sub-posts and snippers in parallel
  const [subPostsResult, snippersResult] = await Promise.all([
    supabase
      .from('sub_posts')
      .select('*')
      .in('post_id', postIds)
      .order('position', { ascending: true }),
    supabase
      .from('snippers')
      .select('id, name, type, owner_id, is_public, topic_tags')
      .in('id', snipperIds),
  ])

  const subPostsByPost = new Map<string, FeedSubPost[]>()
  for (const sp of subPostsResult.data ?? []) {
    const list = subPostsByPost.get(sp.post_id) ?? []
    list.push(sp)
    subPostsByPost.set(sp.post_id, list)
  }

  const snippersById = new Map<string, FeedSnipper>()
  for (const s of snippersResult.data ?? []) {
    snippersById.set(s.id, s as FeedSnipper)
  }

  return posts
    .filter((p) => snippersById.has(p.snipper_id))
    .map((post) => ({
      ...post,
      sub_posts: subPostsByPost.get(post.id) ?? [],
      snippers: snippersById.get(post.snipper_id)!,
    }))
}

export async function fetchFeedPosts(
  supabase: TypedClient,
  userId: string,
  cursor?: string,
  limit = 10
): Promise<FeedPost[]> {
  // Get snipper IDs the user subscribes to
  const { data: subs } = await supabase
    .from('snipper_subscriptions')
    .select('snipper_id')
    .eq('user_id', userId)

  if (!subs || subs.length === 0) return []

  const snipperIds = subs.map((s) => s.snipper_id)

  let query = supabase
    .from('posts')
    .select('*')
    .in('snipper_id', snipperIds)
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
  // Get snipper IDs user already subscribes to
  const { data: subs } = await supabase
    .from('snipper_subscriptions')
    .select('snipper_id')
    .eq('user_id', userId)

  const subscribedIds = subs?.map((s) => s.snipper_id) ?? []

  // Get public snippers not subscribed to
  let snipperQuery = supabase
    .from('snippers')
    .select('id')
    .eq('is_public', true)

  if (subscribedIds.length > 0) {
    snipperQuery = snipperQuery.not('id', 'in', `(${subscribedIds.join(',')})`)
  }

  const { data: publicSnippers } = await snipperQuery
  if (!publicSnippers || publicSnippers.length === 0) return []

  const publicSnipperIds = publicSnippers.map((s) => s.id)

  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .in('snipper_id', publicSnipperIds)
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
    .from('snipper_subscriptions')
    .select('snipper_id')
    .eq('user_id', userId)

  if (!subs || subs.length === 0) return 0

  const snipperIds = subs.map((s) => s.snipper_id)

  // Count posts from last 24 hours as "unread" approximation
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

  const { count } = await supabase
    .from('posts')
    .select('id', { count: 'exact', head: true })
    .in('snipper_id', snipperIds)
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
  snipperId: string
) {
  // Check if subscription exists
  const { data: existing } = await supabase
    .from('snipper_subscriptions')
    .select('id')
    .eq('user_id', userId)
    .eq('snipper_id', snipperId)
    .single()

  if (existing) {
    await supabase
      .from('snipper_subscriptions')
      .delete()
      .eq('id', existing.id)
    return false // unfollowed
  } else {
    await supabase
      .from('snipper_subscriptions')
      .insert({ user_id: userId, snipper_id: snipperId })
    return true // followed
  }
}
