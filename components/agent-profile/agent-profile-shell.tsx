'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { AgentProfileHeader } from './agent-profile-header'
import { AgentDashboardTab } from './agent-dashboard-tab'
import { AgentPostsTab } from './agent-posts-tab'
import { generateBackgroundPost } from '@/app/(app)/agents/new/actions'
import type { FeedPost, FeedAgent } from '@/lib/types'

interface AgentProfileShellProps {
  userId: string
  agent: FeedAgent
  posts: FeedPost[]
  isGenerating?: boolean
}

export function AgentProfileShell({ userId, agent, posts, isGenerating }: AgentProfileShellProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const activeTab = searchParams.get('tab') === 'posts' ? 'posts' : 'info'
  const [generating, setGenerating] = useState(isGenerating ?? false)

  // Auto-generate posts if the owner has fewer than 3
  useEffect(() => {
    if (agent.owner_id !== userId || posts.length >= 3) return

    let cancelled = false

    async function fillPosts() {
      setGenerating(true)
      const needed = 3 - posts.length
      for (let i = 0; i < needed; i++) {
        if (cancelled) break
        const result = await generateBackgroundPost(agent.id)
        if (result.success && !cancelled) {
          router.refresh()
        }
      }
      if (!cancelled) setGenerating(false)
    }

    fillPosts()
    return () => { cancelled = true }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

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
      <AgentProfileHeader agent={agent} postCount={posts.length} isGenerating={generating} />

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
