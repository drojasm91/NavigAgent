'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
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

function getInitialTab(): 'info' | 'posts' {
  if (typeof window === 'undefined') return 'posts'
  const params = new URLSearchParams(window.location.search)
  return params.get('tab') === 'info' ? 'info' : 'posts'
}

export function SnipperProfileShell({ userId, snipper, posts, isGenerating }: SnipperProfileShellProps) {
  const router = useRouter()

  const [activeTab, setActiveTab] = useState<'info' | 'posts'>(getInitialTab)
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
    const tab = value as 'info' | 'posts'
    setActiveTab(tab)
    const url = new URL(window.location.href)
    if (tab === 'info') {
      url.searchParams.delete('tab')
    } else {
      url.searchParams.set('tab', tab)
    }
    window.history.replaceState(null, '', url.toString())
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
