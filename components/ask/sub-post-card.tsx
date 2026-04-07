'use client'

import { cn } from '@/lib/utils'

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
  return (
    <div className="rounded-xl bg-muted/50 border p-4">
      {total > 1 && (
        <div className="flex items-center justify-center gap-2 mb-3">
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
      )}

      <p className="text-[15px] leading-relaxed text-foreground">
        {content}
      </p>
    </div>
  )
}
