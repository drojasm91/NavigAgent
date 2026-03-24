"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { PostCard } from "@/components/feed/post-card"
import { ThreadSheet } from "@/components/thread/thread-sheet"
import { mockPosts, mockUserAgents } from "@/lib/mock-data"
import type { MockPost } from "@/lib/mock-data"

const typeBadgeColors: Record<string, string> = {
  news: "bg-blue-100 text-blue-700",
  learning: "bg-purple-100 text-purple-700",
  recommendation: "bg-amber-100 text-amber-700",
}

export default function RabbitHolePage() {
  const params = useParams()
  const router = useRouter()
  const agentId = params.agentId as string
  const [selectedPost, setSelectedPost] = useState<MockPost | null>(null)

  const agent = mockUserAgents.find((a) => a.id === agentId)
  const agentPosts = mockPosts.filter((p) => p.agent_id === agentId)

  if (!agent) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Agent not found</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header with agent identity */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto max-w-lg px-4">
          <div className="flex h-14 items-center gap-3">
            <button
              onClick={() => router.back()}
              className="rounded-full p-1.5 text-muted-foreground active:bg-accent transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
              {agent.name.charAt(0)}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">{agent.name}</span>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-medium",
                  typeBadgeColors[agent.type]
                )}
              >
                {agent.type}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 pb-8 pt-4">
        {agentPosts.length > 0 ? (
          <div className="space-y-3">
            {agentPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onTap={setSelectedPost}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-muted-foreground">No posts yet</p>
            <p className="mt-1 text-sm text-muted-foreground/70">
              This agent&apos;s first post is on the way
            </p>
          </div>
        )}
      </main>

      {/* No Dig In button inside rabbit hole for the agent's own posts */}
      <ThreadSheet
        post={selectedPost}
        onClose={() => setSelectedPost(null)}
      />
    </div>
  )
}
