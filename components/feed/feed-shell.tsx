'use client'

import { FeedList } from './feed-list'
import { useFeed } from '@/hooks/use-feed'
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

  return (
    <FeedList
      posts={posts}
      loading={loading}
      loadingMore={loadingMore}
      hasMore={hasMore}
      onLoadMore={loadMore}
    />
  )
}
