'use server'

import { createClient } from '@/lib/supabase/server'
import { fetchConversationSummaries } from '@/lib/supabase/queries'
import type { FeedSubPost, FeedSnipper, ConversationSummaryPreview } from '@/lib/types'

export interface SubPostPageData {
  subPost: FeedSubPost
  allSubPosts: FeedSubPost[]
  snipper: FeedSnipper
  summaries: ConversationSummaryPreview[]
  postId: string
}

export async function fetchSubPostPageData(
  postId: string,
  position: number
): Promise<SubPostPageData | null> {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Fetch post, sub-posts, and snipper in parallel
  const [{ data: post }, { data: subPosts }] = await Promise.all([
    supabase
      .from('posts')
      .select('id, snipper_id')
      .eq('id', postId)
      .single(),
    supabase
      .from('sub_posts')
      .select('*')
      .eq('post_id', postId)
      .order('position', { ascending: true }),
  ])

  if (!post || !subPosts) return null

  const targetSubPost = subPosts.find((sp: { position: number }) => sp.position === position)
  if (!targetSubPost) return null

  // Fetch snipper and summaries in parallel
  const [{ data: snipperRow }, summaries] = await Promise.all([
    supabase
      .from('snippers')
      .select('id, name, type, depth, owner_id, is_public, topic_tags, description')
      .eq('id', post.snipper_id)
      .single(),
    fetchConversationSummaries(supabase, targetSubPost.id),
  ])

  if (!snipperRow) return null

  return {
    subPost: targetSubPost,
    allSubPosts: subPosts,
    snipper: snipperRow as FeedSnipper,
    summaries,
    postId,
  }
}
