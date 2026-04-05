export const maxDuration = 120

import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { SnipperProfileShell } from '@/components/snipper-profile/snipper-profile-shell'
import type { FeedSnipper, FeedPost, FeedSubPost } from '@/lib/types'

interface SnipperPageProps {
  params: Promise<{ snipperId: string }>
}

export default async function SnipperPage({ params }: SnipperPageProps) {
  const { snipperId } = await params
  const supabase = createClient()

  // Parallelize auth + snipper fetch (independent queries)
  const [{ data: { user } }, { data: snipperRow }] = await Promise.all([
    supabase.auth.getUser(),
    supabase
      .from('snippers')
      .select('id, name, type, depth, owner_id, is_public, topic_tags, description, created_at')
      .eq('id', snipperId)
      .single(),
  ])

  if (!user) redirect('/login')
  if (!snipperRow) notFound()

  const snipper: FeedSnipper = {
    id: snipperRow.id,
    name: snipperRow.name,
    type: snipperRow.type,
    depth: snipperRow.depth,
    owner_id: snipperRow.owner_id,
    is_public: snipperRow.is_public,
    topic_tags: snipperRow.topic_tags ?? [],
    description: snipperRow.description,
    created_at: snipperRow.created_at,
  }

  // Fetch real posts for this snipper
  const { data: postRows } = await supabase
    .from('posts')
    .select('*')
    .eq('snipper_id', snipperId)
    .order('created_at', { ascending: false })

  const posts: FeedPost[] = []

  if (postRows && postRows.length > 0) {
    const postIds = postRows.map((p) => p.id)
    const { data: subPostRows } = await supabase
      .from('sub_posts')
      .select('*')
      .in('post_id', postIds)
      .order('position', { ascending: true })

    const subPostsByPost = new Map<string, FeedSubPost[]>()
    for (const sp of subPostRows ?? []) {
      const list = subPostsByPost.get(sp.post_id) ?? []
      list.push(sp)
      subPostsByPost.set(sp.post_id, list)
    }

    for (const post of postRows) {
      posts.push({
        ...post,
        sub_posts: subPostsByPost.get(post.id) ?? [],
        snippers: snipper,
        is_community: false,
      })
    }
  }

  // Sort: learning → curriculum order, news/recommendation → newest first
  const sortedPosts =
    snipper.type === 'learning'
      ? [...posts].sort(
          (a, b) => (a.curriculum_position ?? 0) - (b.curriculum_position ?? 0)
        )
      : posts // already sorted newest first from query

  return (
    <div className="max-w-lg mx-auto px-4 py-4">
      <SnipperProfileShell userId={user.id} snipper={snipper} posts={sortedPosts} />
    </div>
  )
}
