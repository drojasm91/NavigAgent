'use client'

import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

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
      {total > 1 && (
        <div className="flex items-center justify-center gap-2 mb-3">
          {Array.from({ length: total }, (_, i) => i + 1).map((num) => (
            <button
              key={num}
              onClick={() => navigateTo(num)}
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
