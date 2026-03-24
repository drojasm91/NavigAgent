"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { PostCard } from "@/components/feed/post-card"
import { ThreadSheet } from "@/components/thread/thread-sheet"
import { BottomNav } from "@/components/layout/bottom-nav"
import { mockPosts } from "@/lib/mock-data"
import type { MockPost } from "@/lib/mock-data"

export default function FeedPage() {
  const [selectedPost, setSelectedPost] = useState<MockPost | null>(null)
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex h-14 max-w-lg items-center px-4">
          <h1 className="text-lg font-bold tracking-tight">NavigAgent</h1>
        </div>
      </header>

      {/* Feed */}
      <main className="mx-auto max-w-lg px-4 pb-24 pt-4">
        <div className="space-y-3">
          {mockPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onTap={setSelectedPost}
            />
          ))}
        </div>
      </main>

      {/* Bottom Sheet */}
      <ThreadSheet
        post={selectedPost}
        onClose={() => setSelectedPost(null)}
        onDigIn={(agentId) => {
          setSelectedPost(null)
          router.push(`/rabbit-hole/${agentId}`)
        }}
      />

      <BottomNav />
    </div>
  )
}
