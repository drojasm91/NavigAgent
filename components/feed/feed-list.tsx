'use client'

import { useEffect, useRef } from 'react'
import { PostCard } from './post-card'
import { EmptyFeed } from './empty-feed'
import { Skeleton } from '@/components/ui/skeleton'
import type { FeedPost } from '@/lib/types'

interface FeedListProps {
  posts: FeedPost[]
  loading: boolean
  loadingMore: boolean
  hasMore: boolean
  onLoadMore: () => void
  currentSnipperId?: string
  hideDigIn?: boolean
}

function PostSkeleton() {
  return (
    <div className="rounded-xl border p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-12" />
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  )
}

export function FeedList({
  posts,
  loading,
  loadingMore,
  hasMore,
  onLoadMore,
  currentSnipperId,
  hideDigIn = false,
}: FeedListProps) {
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!hasMore || loading) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          onLoadMore()
        }
      },
      { threshold: 0.1 }
    )

    const sentinel = sentinelRef.current
    if (sentinel) observer.observe(sentinel)

    return () => {
      if (sentinel) observer.unobserve(sentinel)
    }
  }, [hasMore, loading, onLoadMore])

  if (loading) {
    return (
      <div className="space-y-3">
        <PostSkeleton />
        <PostSkeleton />
        <PostSkeleton />
      </div>
    )
  }

  if (posts.length === 0) {
    return <EmptyFeed />
  }

  return (
    <div className="space-y-3">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          currentSnipperId={currentSnipperId}
          hideDigIn={hideDigIn}
        />
      ))}

      {loadingMore && (
        <div className="space-y-3">
          <PostSkeleton />
        </div>
      )}

      {hasMore && <div ref={sentinelRef} className="h-4" />}

      {!hasMore && posts.length > 0 && (
        <p className="text-center text-sm text-muted-foreground py-6">
          You&apos;re all caught up
        </p>
      )}
    </div>
  )
}
