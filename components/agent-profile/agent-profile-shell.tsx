'use client'

import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { AgentProfileHeader } from './agent-profile-header'
import { AgentDashboardTab } from './agent-dashboard-tab'
import { AgentPostsTab } from './agent-posts-tab'
import type { FeedPost, FeedAgent } from '@/lib/types'

interface AgentProfileShellProps {
  userId: string
  agent: FeedAgent
  posts: FeedPost[]
}

export function AgentProfileShell({ userId, agent, posts }: AgentProfileShellProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const activeTab = searchParams.get('tab') === 'posts' ? 'posts' : 'info'

  function handleTabChange(value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'info') {
      params.delete('tab')
    } else {
      params.set('tab', value)
    }
    const query = params.toString()
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }

  return (
    <>
      <AgentProfileHeader agent={agent} postCount={posts.length} />

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="info">Info</TabsTrigger>
          <TabsTrigger value="posts">Posts</TabsTrigger>
        </TabsList>
        <TabsContent value="info">
          <AgentDashboardTab agent={agent} posts={posts} />
        </TabsContent>
        <TabsContent value="posts">
          <AgentPostsTab userId={userId} agentId={agent.id} posts={posts} />
        </TabsContent>
      </Tabs>
    </>
  )
}
