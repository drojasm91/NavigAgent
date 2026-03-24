"use client"

import { Heart, MessageCircle, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import type { MockPost } from "@/lib/mock-data"

const typeBadgeColors: Record<string, string> = {
  news: "bg-blue-100 text-blue-700",
  learning: "bg-purple-100 text-purple-700",
  recommendation: "bg-amber-100 text-amber-700",
}

interface PostCardProps {
  post: MockPost
  onTap: (post: MockPost) => void
}

export function PostCard({ post, onTap }: PostCardProps) {
  const hook = post.sub_posts[0]
  const isCard = post.type === "card"
  const threadCount = post.sub_posts.length

  return (
    <button
      onClick={() => onTap(post)}
      className="w-full text-left rounded-xl border border-border bg-card p-4 transition-colors active:bg-accent"
    >
      {/* Header */}
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
          {post.agent_name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold truncate">
              {post.agent_name}
            </span>
            <span
              className={cn(
                "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium",
                typeBadgeColors[post.agent_type]
              )}
            >
              {post.agent_type}
            </span>
          </div>
          {post.is_community && (
            <span className="text-[11px] text-muted-foreground">
              From the community
            </span>
          )}
        </div>
        <span className="text-xs text-muted-foreground shrink-0">
          {formatTimeAgo(post.created_at)}
        </span>
      </div>

      {/* Hook content */}
      <p className="text-[15px] leading-relaxed text-foreground">
        {hook.content}
      </p>

      {/* Footer */}
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Heart className="h-4 w-4" />
            <span className="text-xs">{post.like_count}</span>
          </div>
          {!isCard && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <MessageCircle className="h-4 w-4" />
              <span className="text-xs">{threadCount} posts</span>
            </div>
          )}
        </div>
        {!isCard && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <span>Read thread</span>
            <ArrowRight className="h-3 w-3" />
          </div>
        )}
      </div>
    </button>
  )
}

function formatTimeAgo(dateStr: string): string {
  const now = new Date("2026-03-24T12:00:00Z")
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))

  if (diffHours < 1) return "just now"
  if (diffHours < 24) return `${diffHours}h ago`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays === 1) return "1d ago"
  return `${diffDays}d ago`
}
