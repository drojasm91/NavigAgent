'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { BackButton } from './back-button'

interface SubPostLite {
  position: number
  content: string
}

interface SubPostNavShellProps {
  postId: string
  position: number
  totalSubPosts: number
  snipperName: string
  allSubPosts: SubPostLite[]
  children: React.ReactNode
}

const SWIPE_COMMIT_RATIO = 0.25 // 25% of viewport width triggers a navigation
const EDGE_RESISTANCE = 0.3 // How much of the drag to apply when at an edge
const ANIMATION_MS = 250

export function SubPostNavShell({
  postId,
  position,
  totalSubPosts,
  snipperName,
  allSubPosts,
  children,
}: SubPostNavShellProps) {
  const router = useRouter()
  const touchStart = useRef<{ x: number; y: number } | null>(null)
  const [dragDelta, setDragDelta] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  const prev = allSubPosts.find((sp) => sp.position === position - 1)
  const next = allSubPosts.find((sp) => sp.position === position + 1)

  function navigateTo(newPosition: number) {
    if (newPosition < 1 || newPosition > totalSubPosts) return
    if (newPosition === position) return
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(`sn-last-sub-${postId}`, String(newPosition))
    }
    router.replace(`/post/${postId}/sub/${newPosition}`)
  }

  function handleTouchStart(e: React.TouchEvent<HTMLDivElement>) {
    if (isAnimating) return
    touchStart.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    }
  }

  function handleTouchMove(e: React.TouchEvent<HTMLDivElement>) {
    if (!touchStart.current || isAnimating) return
    const dx = e.touches[0].clientX - touchStart.current.x
    const dy = e.touches[0].clientY - touchStart.current.y

    // Only track horizontal gestures — let vertical scrolls pass through
    if (Math.abs(dy) > Math.abs(dx)) return

    // Rubber-band at the edges
    if ((dx > 0 && !prev) || (dx < 0 && !next)) {
      setDragDelta(dx * EDGE_RESISTANCE)
      return
    }

    setDragDelta(dx)
  }

  function handleTouchEnd(e: React.TouchEvent<HTMLDivElement>) {
    if (!touchStart.current || isAnimating) return
    const dx = e.changedTouches[0].clientX - touchStart.current.x
    touchStart.current = null

    const threshold = window.innerWidth * SWIPE_COMMIT_RATIO

    if (dx < -threshold && next) {
      // Commit forward — animate content off-screen left, then navigate
      setIsAnimating(true)
      setDragDelta(-window.innerWidth)
      window.setTimeout(() => {
        navigateTo(position + 1)
      }, ANIMATION_MS)
    } else if (dx > threshold && prev) {
      // Commit backward — animate content off-screen right, then navigate
      setIsAnimating(true)
      setDragDelta(window.innerWidth)
      window.setTimeout(() => {
        navigateTo(position - 1)
      }, ANIMATION_MS)
    } else {
      // Snap back to the current sub-post
      setIsAnimating(true)
      setDragDelta(0)
      window.setTimeout(() => {
        setIsAnimating(false)
      }, ANIMATION_MS)
    }
  }

  const canPrev = position > 1
  const canNext = position < totalSubPosts

  const trackStyle: React.CSSProperties = {
    transform: `translate3d(calc(-33.3333% + ${dragDelta}px), 0, 0)`,
    transition: isAnimating ? `transform ${ANIMATION_MS}ms ease-out` : 'none',
    width: '300%',
  }

  return (
    <div>
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

      <div
        className="overflow-x-hidden touch-pan-y"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="flex" style={trackStyle}>
          <div className="w-1/3 shrink-0">
            {prev ? (
              <SubPostPreview
                position={prev.position}
                total={totalSubPosts}
                content={prev.content}
              />
            ) : null}
          </div>
          <div className="w-1/3 shrink-0">{children}</div>
          <div className="w-1/3 shrink-0">
            {next ? (
              <SubPostPreview
                position={next.position}
                total={totalSubPosts}
                content={next.content}
              />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}

function SubPostPreview({
  position,
  total,
  content,
}: {
  position: number
  total: number
  content: string
}) {
  return (
    <div className="px-4 py-6">
      <div className="rounded-xl bg-muted/30 border border-dashed p-4 opacity-70">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-foreground/60 text-background text-[10px] font-bold">
            {position}
          </div>
          <span className="text-xs text-muted-foreground">
            {position} of {total}
          </span>
        </div>
        <p className="text-[15px] leading-relaxed text-foreground/80">
          {content}
        </p>
      </div>
    </div>
  )
}
