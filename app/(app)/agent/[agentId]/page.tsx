export const dynamic = 'force-dynamic'
export const maxDuration = 120

import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { AgentProfileShell } from '@/components/agent-profile/agent-profile-shell'
import type { FeedAgent, FeedPost, FeedSubPost } from '@/lib/types'

interface AgentPageProps {
  params: Promise<{ agentId: string }>
}

export default async function AgentPage({ params }: AgentPageProps) {
  const { agentId } = await params
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Fetch agent from DB
  const { data: agentRow } = await supabase
    .from('user_agents')
    .select('id, name, type, owner_id, is_public, topic_tags, description, created_at')
    .eq('id', agentId)
    .single()

  if (!agentRow) notFound()

  const agent: FeedAgent = {
    id: agentRow.id,
    name: agentRow.name,
    type: agentRow.type,
    owner_id: agentRow.owner_id,
    is_public: agentRow.is_public,
    topic_tags: agentRow.topic_tags ?? [],
    description: agentRow.description,
    created_at: agentRow.created_at,
  }

  // Fetch real posts for this agent
  const { data: postRows } = await supabase
    .from('posts')
    .select('*')
    .eq('agent_id', agentId)
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
        user_agents: agent,
        is_community: false,
      })
    }
  }

  // Sort: learning → curriculum order, news/recommendation → newest first
  const sortedPosts =
    agent.type === 'learning'
      ? [...posts].sort(
          (a, b) => (a.curriculum_position ?? 0) - (b.curriculum_position ?? 0)
        )
      : posts // already sorted newest first from query

  return (
    <div className="max-w-lg mx-auto px-4 py-4">
      <AgentProfileShell userId={user.id} agent={agent} posts={sortedPosts} />
    </div>
  )
}
