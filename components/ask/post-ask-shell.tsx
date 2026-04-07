'use client'

import { useRef, useState } from 'react'
import { BackButton } from './back-button'
import { SubPostCard } from './sub-post-card'
import { Skeleton } from '@/components/ui/skeleton'

interface SubPostLite {
  position: number
  content: string
}

interface PostAskShellProps {
  postId: string
  initialPosition: number
  snipperName: string
  allSubPosts: SubPostLite[]
  children: React.ReactNode
}

const SWIPE_COMMIT_RATIO = 0.15
const EDGE_RESISTANCE = 0.3
const ANIMATION_MS = 250

export function PostAskShell({
  postId,
  initialPosition,
  snipperName,
  allSubPosts,
  children,
}: PostAskShellProps) {
  const touchStart = useRef<{ x: number; y: number } | null>(null)
  const [dragDelta, setDragDelta] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [activePosition, setActivePosition] = useState(initialPosition)

  const totalSubPosts = allSubPosts.length
  const activeSubPost = allSubPosts.find((sp) => sp.position === activePosition)
  const prev = allSubPosts.find((sp) => sp.position === activePosition - 1)
  const next = allSubPosts.find((sp) => sp.position === activePosition + 1)

  function changePosition(newPosition: number) {
    if (newPosition < 1 || newPosition > totalSubPosts) return
    if (newPosition === activePosition) return
    setActivePosition(newPosition)
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(`sn-last-sub-${postId}`, String(newPosition))
    }
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

    if (Math.abs(dy) > Math.abs(dx)) return

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
      setIsAnimating(true)
      setDragDelta(-window.innerWidth)
      window.setTimeout(() => {
        changePosition(activePosition + 1)
        setDragDelta(0)
        setIsAnimating(false)
      }, ANIMATION_MS)
    } else if (dx > threshold && prev) {
      setIsAnimating(true)
      setDragDelta(window.innerWidth)
      window.setTimeout(() => {
        changePosition(activePosition - 1)
        setDragDelta(0)
        setIsAnimating(false)
      }, ANIMATION_MS)
    } else {
      setIsAnimating(true)
      setDragDelta(0)
      window.setTimeout(() => {
        setIsAnimating(false)
      }, ANIMATION_MS)
    }
  }

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
          <div className="w-1/3 shrink-0">
            <div className="px-4 pt-6 pb-2">
              <SubPostCard
                content={activeSubPost?.content ?? ''}
                position={activePosition}
                total={totalSubPosts}
                onPositionChange={changePosition}
              />
            </div>
          </div>
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

      {children}
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
    <div className="px-4 py-6 space-y-6">
      <SubPostCard
        position={position}
        total={total}
        content={content}
      />
      <div className="space-y-4">
        <Skeleton className="h-4 w-48 mx-auto" />
        <Skeleton className="h-11 w-full rounded-full" />
      </div>
    </div>
  )
}
