'use client'

import { FeedList } from '@/components/feed/feed-list'
import type { FeedPost } from '@/lib/types'

interface AgentPostsTabProps {
  userId: string
  agentId: string
  posts: FeedPost[]
}

export function AgentPostsTab({ agentId, posts }: AgentPostsTabProps) {
  return (
    <div className="pt-4">
      <FeedList
        posts={posts}
        loading={false}
        loadingMore={false}
        hasMore={false}
        onLoadMore={() => {}}
        currentAgentId={agentId}
        hideDigIn
      />
    </div>
  )
}
