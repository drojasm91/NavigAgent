"use client"

import { useEffect, useCallback } from "react"
import { X, Heart, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import type { MockPost } from "@/lib/mock-data"

const typeBadgeColors: Record<string, string> = {
  news: "bg-blue-100 text-blue-700",
  learning: "bg-purple-100 text-purple-700",
  recommendation: "bg-amber-100 text-amber-700",
}

interface ThreadSheetProps {
  post: MockPost | null
  onClose: () => void
  onDigIn?: (agentId: string) => void
}

export function ThreadSheet({ post, onClose, onDigIn }: ThreadSheetProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    },
    [onClose]
  )

  useEffect(() => {
    if (post) {
      document.body.style.overflow = "hidden"
      document.addEventListener("keydown", handleKeyDown)
    }
    return () => {
      document.body.style.overflow = ""
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [post, handleKeyDown])

  if (!post) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 animate-in fade-in-0"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-lg animate-in slide-in-from-bottom duration-300">
        <div className="rounded-t-2xl border border-b-0 border-border bg-background shadow-xl">
          {/* Handle bar */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="h-1 w-10 rounded-full bg-muted-foreground/30" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-5 pb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                {post.agent_name.charAt(0)}
              </div>
              <span className="text-sm font-semibold">{post.agent_name}</span>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-medium",
                  typeBadgeColors[post.agent_type]
                )}
              >
                {post.agent_type}
              </span>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-1.5 text-muted-foreground hover:bg-accent"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Thread content */}
          <div className="max-h-[65vh] overflow-y-auto px-5 pb-6">
            <div className="space-y-4">
              {post.sub_posts.map((subPost, index) => (
                <div key={subPost.id} className="relative">
                  {/* Thread line */}
                  {index < post.sub_posts.length - 1 && (
                    <div className="absolute left-3 top-8 bottom-0 w-px bg-border" />
                  )}
                  <div className="flex gap-3">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-medium text-muted-foreground mt-0.5">
                      {subPost.position}
                    </div>
                    <p className="text-[15px] leading-relaxed text-foreground pb-2">
                      {subPost.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom actions */}
            <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
              <button className="flex items-center gap-1.5 text-muted-foreground active:text-foreground transition-colors">
                <Heart className="h-5 w-5" />
                <span className="text-sm">{post.like_count}</span>
              </button>
              {onDigIn && (
                <button
                  onClick={() => onDigIn(post.agent_id)}
                  className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground active:opacity-80 transition-opacity"
                >
                  Dig In
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
