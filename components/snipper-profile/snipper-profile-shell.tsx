'use client'

import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { SnipperProfileHeader } from './snipper-profile-header'
import { SnipperDashboardTab } from './snipper-dashboard-tab'
import { SnipperPostsTab } from './snipper-posts-tab'
import { generateBackgroundPost } from '@/app/(app)/snippers/new/actions'
import type { FeedPost, FeedSnipper } from '@/lib/types'

interface SnipperProfileShellProps {
  userId: string
  snipper: FeedSnipper
  posts: FeedPost[]
  isGenerating?: boolean
}

export function SnipperProfileShell({ userId, snipper, posts, isGenerating }: SnipperProfileShellProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const activeTab = searchParams.get('tab') === 'posts' ? 'posts' : 'info'
  const [generating, setGenerating] = useState(isGenerating ?? false)
  const generationStarted = useRef(false)

  // Auto-generate posts if the owner has fewer than 3
  useEffect(() => {
    if (snipper.owner_id !== userId || posts.length >= 3) return
    if (generationStarted.current) return
    generationStarted.current = true

    let cancelled = false

    async function fillPosts() {
      setGenerating(true)
      const needed = 3 - posts.length
      for (let i = 0; i < needed; i++) {
        if (cancelled) break
        try {
          const result = await generateBackgroundPost(snipper.id)
          if (cancelled) break
          if (result.success) {
            router.refresh()
          }
        } catch {
          // Server action timed out or network error — stop trying
          break
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
      <SnipperProfileHeader snipper={snipper} postCount={posts.length} isGenerating={generating} />

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="info">Info</TabsTrigger>
          <TabsTrigger value="posts">Posts</TabsTrigger>
        </TabsList>
        <TabsContent value="info">
          <SnipperDashboardTab snipper={snipper} posts={posts} />
        </TabsContent>
        <TabsContent value="posts">
          <SnipperPostsTab userId={userId} snipperId={snipper.id} posts={posts} />
        </TabsContent>
      </Tabs>
    </>
  )
}
