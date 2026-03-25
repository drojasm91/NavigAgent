'use client'

import { useState } from 'react'
import { FeedList } from '@/components/feed/feed-list'
import { ThreadDrawer } from '@/components/thread/thread-drawer'
import { useLikeSignal } from '@/hooks/use-like-signal'
import type { FeedPost } from '@/lib/types'

interface AgentPostsTabProps {
  userId: string
  agentId: string
  posts: FeedPost[]
}

export function AgentPostsTab({ userId, agentId, posts }: AgentPostsTabProps) {
  const { signals, recordSignal } = useLikeSignal(userId)
  const [selectedPost, setSelectedPost] = useState<FeedPost | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  function handlePostTap(post: FeedPost) {
    setSelectedPost(post)
    setDrawerOpen(true)
  }

  return (
    <div className="pt-4">
      <FeedList
        posts={posts}
        loading={false}
        loadingMore={false}
        hasMore={false}
        onLoadMore={() => {}}
        onPostTap={handlePostTap}
        currentAgentId={agentId}
      />

      <ThreadDrawer
        post={selectedPost}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        signals={signals}
        onSignal={recordSignal}
        hideDigIn
      />
    </div>
  )
}
