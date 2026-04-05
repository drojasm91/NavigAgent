'use client'

import { useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { BackButton } from './back-button'

interface SubPostNavShellProps {
  postId: string
  position: number
  totalSubPosts: number
  snipperName: string
  children: React.ReactNode
}

export function SubPostNavShell({
  postId,
  position,
  totalSubPosts,
  snipperName,
  children,
}: SubPostNavShellProps) {
  const router = useRouter()
  const touchStart = useRef<{ x: number; y: number } | null>(null)

  function navigateTo(newPosition: number) {
    if (newPosition < 1 || newPosition > totalSubPosts) return
    if (newPosition === position) return
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(`sn-last-sub-${postId}`, String(newPosition))
    }
    router.replace(`/post/${postId}/sub/${newPosition}`)
  }

  function handleTouchStart(e: { touches: { clientX: number; clientY: number }[] }) {
    touchStart.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    }
  }

  function handleTouchEnd(e: { changedTouches: { clientX: number; clientY: number }[] }) {
    if (!touchStart.current) return
    const dx = e.changedTouches[0].clientX - touchStart.current.x
    const dy = e.changedTouches[0].clientY - touchStart.current.y
    touchStart.current = null

    // Require minimum horizontal distance and horizontal dominance over vertical
    if (Math.abs(dx) < 50) return
    if (Math.abs(dy) > Math.abs(dx)) return

    if (dx < 0) {
      navigateTo(position + 1)
    } else {
      navigateTo(position - 1)
    }
  }

  const canPrev = position > 1
  const canNext = position < totalSubPosts

  return (
    <div onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b">
        <div className="px-4 py-3 flex items-center gap-3">
          <BackButton />
          <span className="text-sm font-medium text-muted-foreground truncate flex-1">
            {snipperName}
          </span>
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => navigateTo(position - 1)}
              disabled={!canPrev}
              className="flex items-center justify-center w-7 h-7 rounded-full text-muted-foreground active:bg-muted disabled:opacity-30 transition-colors"
              aria-label="Previous sub-post"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs text-muted-foreground tabular-nums px-1">
              {position} of {totalSubPosts}
            </span>
            <button
              onClick={() => navigateTo(position + 1)}
              disabled={!canNext}
              className="flex items-center justify-center w-7 h-7 rounded-full text-muted-foreground active:bg-muted disabled:opacity-30 transition-colors"
              aria-label="Next sub-post"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>
      {children}
    </div>
  )
}
