'use client'

import { FeedList } from '@/components/feed/feed-list'
import type { FeedPost } from '@/lib/types'

interface SnipperPostsTabProps {
  userId: string
  snipperId: string
  posts: FeedPost[]
}

export function SnipperPostsTab({ snipperId, posts }: SnipperPostsTabProps) {
  return (
    <div className="pt-4">
      <FeedList
        posts={posts}
        loading={false}
        loadingMore={false}
        hasMore={false}
        onLoadMore={() => {}}
        currentSnipperId={snipperId}
        hideDigIn
      />
    </div>
  )
}
