'use client'

import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface SubPostArrowNavProps {
  postId: string
  position: number
  totalSubPosts: number
  children: React.ReactNode
}

export function SubPostArrowNav({
  postId,
  position,
  totalSubPosts,
  children,
}: SubPostArrowNavProps) {
  const router = useRouter()
  const canPrev = position > 1
  const canNext = position < totalSubPosts

  function navigateTo(newPosition: number) {
    if (newPosition < 1 || newPosition > totalSubPosts) return
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(`sn-last-sub-${postId}`, String(newPosition))
    }
    router.replace(`/post/${postId}/sub/${newPosition}`)
  }

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => navigateTo(position - 1)}
        disabled={!canPrev}
        className={`flex items-center justify-center w-8 h-8 shrink-0 rounded-full text-muted-foreground active:bg-muted transition-colors ${
          canPrev ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        aria-label="Previous sub-post"
        aria-hidden={!canPrev}
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <div className="flex-1 min-w-0">{children}</div>
      <button
        onClick={() => navigateTo(position + 1)}
        disabled={!canNext}
        className={`flex items-center justify-center w-8 h-8 shrink-0 rounded-full text-muted-foreground active:bg-muted transition-colors ${
          canNext ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        aria-label="Next sub-post"
        aria-hidden={!canNext}
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  )
}
