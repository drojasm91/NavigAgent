'use client'

import { useState } from 'react'
import { FeedList } from '@/components/feed/feed-list'
import { ThreadDrawer } from '@/components/thread/thread-drawer'
import { AgentIdentityBar } from './agent-identity-bar'
import { useLikeSignal } from '@/hooks/use-like-signal'
import type { FeedPost, FeedAgent } from '@/lib/types'

interface RabbitHoleShellProps {
  userId: string
  agent: FeedAgent
  posts: FeedPost[]
}

export function RabbitHoleShell({ userId, agent, posts }: RabbitHoleShellProps) {
  const { signals, recordSignal } = useLikeSignal(userId)
  const [selectedPost, setSelectedPost] = useState<FeedPost | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  function handlePostTap(post: FeedPost) {
    setSelectedPost(post)
    setDrawerOpen(true)
  }

  return (
    <>
      <AgentIdentityBar agent={agent} />

      <FeedList
        posts={posts}
        loading={false}
        loadingMore={false}
        hasMore={false}
        onLoadMore={() => {}}
        onPostTap={handlePostTap}
      />

      <ThreadDrawer
        post={selectedPost}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        signals={signals}
        onSignal={recordSignal}
        hideDigIn
      />
    </>
  )
}
