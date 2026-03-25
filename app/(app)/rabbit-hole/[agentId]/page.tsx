export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { RabbitHoleShell } from '@/components/rabbit-hole/rabbit-hole-shell'
import { DUMMY_POSTS } from '@/lib/dummy-data'

interface RabbitHolePageProps {
  params: Promise<{ agentId: string }>
}

export default async function RabbitHolePage({ params }: RabbitHolePageProps) {
  const { agentId } = await params
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // TODO: Replace dummy data with real DB fetch
  const agentPosts = DUMMY_POSTS.filter((p) => p.agent_id === agentId)

  if (agentPosts.length === 0) notFound()

  const agent = agentPosts[0].user_agents

  // Sort: learning → curriculum order, news/recommendation → newest first
  const sortedPosts =
    agent.type === 'learning'
      ? [...agentPosts].sort(
          (a, b) => (a.curriculum_position ?? 0) - (b.curriculum_position ?? 0)
        )
      : [...agentPosts].sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )

  return (
    <div className="max-w-lg mx-auto px-4 py-4">
      <RabbitHoleShell userId={user.id} agent={agent} posts={sortedPosts} />
    </div>
  )
}
