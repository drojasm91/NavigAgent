'use client'

import { useState } from 'react'
import { FeedList } from './feed-list'
import { ThreadDrawer } from '@/components/thread/thread-drawer'
import { useFeed } from '@/hooks/use-feed'
import { useLikeSignal } from '@/hooks/use-like-signal'
import type { FeedPost } from '@/lib/types'

interface FeedShellProps {
  userId: string
  initialPosts?: FeedPost[]
}

export function FeedShell({ userId, initialPosts }: FeedShellProps) {
  const { posts, loading, loadingMore, hasMore, loadMore } = useFeed({
    userId,
    initialPosts,
  })
  const { signals, recordSignal } = useLikeSignal(userId)
  const [selectedPost, setSelectedPost] = useState<FeedPost | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  function handlePostTap(post: FeedPost) {
    setSelectedPost(post)
    setDrawerOpen(true)
  }

  return (
    <>
      <FeedList
        posts={posts}
        loading={loading}
        loadingMore={loadingMore}
        hasMore={hasMore}
        onLoadMore={loadMore}
        onPostTap={handlePostTap}
      />

      <ThreadDrawer
        post={selectedPost}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        signals={signals}
        onSignal={recordSignal}
      />
    </>
  )
}
