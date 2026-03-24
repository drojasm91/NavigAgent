'use client'

import { useState, useCallback, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { fetchFeedPosts, fetchCommunityPosts, countUnreadOwnPosts } from '@/lib/supabase/queries'
import type { FeedPost } from '@/lib/types'

interface UseFeedOptions {
  userId: string
  initialPosts?: FeedPost[]
}

export function useFeed({ userId, initialPosts = [] }: UseFeedOptions) {
  const [posts, setPosts] = useState<FeedPost[]>(initialPosts)
  const [loading, setLoading] = useState(initialPosts.length === 0)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const supabase = createClient()

  // Initial load if no server-side data provided
  useEffect(() => {
    if (initialPosts.length > 0) return

    async function load() {
      try {
        const ownPosts = await fetchFeedPosts(supabase, userId)
        let allPosts = ownPosts

        // Append community posts if fewer than 5 own posts
        const unread = await countUnreadOwnPosts(supabase, userId)
        if (unread < 5) {
          const community = await fetchCommunityPosts(supabase, userId)
          allPosts = [...ownPosts, ...community]
        }

        setPosts(allPosts)
        setHasMore(ownPosts.length >= 10)
      } catch {
        // Silent fail — feed shows empty state
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [userId, initialPosts.length, supabase])

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return

    setLoadingMore(true)
    try {
      const lastPost = posts.filter((p) => !p.is_community).at(-1)
      const cursor = lastPost?.created_at

      const nextPosts = await fetchFeedPosts(supabase, userId, cursor)
      if (nextPosts.length === 0) {
        setHasMore(false)
      } else {
        setPosts((prev) => [...prev, ...nextPosts])
      }
    } catch {
      // Silent fail
    } finally {
      setLoadingMore(false)
    }
  }, [loadingMore, hasMore, posts, supabase, userId])

  return { posts, loading, loadingMore, hasMore, loadMore }
}
