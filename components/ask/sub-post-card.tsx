'use client'

import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface SubPostCardProps {
  content: string
  position: number
  total: number
  postId: string
}

export function SubPostCard({
  content,
  position,
  total,
  postId,
}: SubPostCardProps) {
  const router = useRouter()
  const canPrev = position > 1
  const canNext = position < total

  function navigateTo(newPosition: number) {
    if (newPosition < 1 || newPosition > total) return
    if (newPosition === position) return
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(`sn-last-sub-${postId}`, String(newPosition))
    }
    router.replace(`/post/${postId}/sub/${newPosition}`)
  }

  return (
    <div className="rounded-xl bg-muted/50 border p-4">
      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={() => navigateTo(position - 1)}
          disabled={!canPrev}
          className={`flex items-center justify-center w-7 h-7 shrink-0 rounded-full text-muted-foreground active:bg-background transition-colors ${
            canPrev ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          aria-label="Previous sub-post"
          aria-hidden={!canPrev}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex-1" />

        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-background text-[10px] font-bold bg-foreground">
            {position}
          </div>
          <span className="text-xs text-muted-foreground">
            {position} of {total}
          </span>
        </div>

        <div className="flex-1" />

        <button
          onClick={() => navigateTo(position + 1)}
          disabled={!canNext}
          className={`flex items-center justify-center w-7 h-7 shrink-0 rounded-full text-muted-foreground active:bg-background transition-colors ${
            canNext ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          aria-label="Next sub-post"
          aria-hidden={!canNext}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <p className="text-[15px] leading-relaxed text-foreground">
        {content}
      </p>
    </div>
  )
}
