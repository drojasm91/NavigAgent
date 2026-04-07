'use client'

import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface SubPostCardProps {
  content: string
  position: number
  total: number
  onPositionChange?: (position: number) => void
}

export function SubPostCard({
  content,
  position,
  total,
  onPositionChange,
}: SubPostCardProps) {
  const canPrev = position > 1
  const canNext = position < total

  return (
    <div className="rounded-xl bg-muted/50 border p-4">
      {total > 1 && (
        <div className="flex items-center gap-2 mb-3">
          <button
            onClick={() => onPositionChange?.(position - 1)}
            className={`flex items-center justify-center w-7 h-7 shrink-0 rounded-full text-muted-foreground active:bg-background transition-colors ${
              canPrev ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            aria-label="Previous sub-post"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center justify-center gap-2 flex-1">
            {Array.from({ length: total }, (_, i) => i + 1).map((num) => (
              <button
                key={num}
                onClick={() => onPositionChange?.(num)}
                className={cn(
                  'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] transition-colors',
                  num === position
                    ? 'bg-foreground text-background font-bold'
                    : 'bg-muted text-muted-foreground font-medium active:bg-accent'
                )}
              >
                {num}
              </button>
            ))}
          </div>

          <button
            onClick={() => onPositionChange?.(position + 1)}
            className={`flex items-center justify-center w-7 h-7 shrink-0 rounded-full text-muted-foreground active:bg-background transition-colors ${
              canNext ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            aria-label="Next sub-post"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      <p className="text-[15px] leading-relaxed text-foreground">
        {content}
      </p>
    </div>
  )
}
