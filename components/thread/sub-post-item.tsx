import Link from 'next/link'
import { MessageCircle } from 'lucide-react'

interface SubPostItemProps {
  content: string
  position: number
  total: number
  isLast: boolean
  postId?: string
  conversationCount?: number
}

export function SubPostItem({ content, position, isLast, postId, conversationCount }: SubPostItemProps) {
  const inner = (
    <div className="relative">
      {!isLast && (
        <div className="absolute left-3 top-8 bottom-0 w-px bg-border" />
      )}
      <div className="flex gap-3">
        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-medium text-muted-foreground mt-0.5">
          {position}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[15px] leading-relaxed text-foreground pb-2">
            {content}
          </p>
          {(conversationCount ?? 0) > 0 && (
            <div className="flex items-center justify-end gap-1 pb-2">
              <MessageCircle className="w-3 h-3 text-muted-foreground" />
              <span className="text-[11px] text-muted-foreground">
                {conversationCount} {conversationCount === 1 ? 'conversation' : 'conversations'}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  if (postId) {
    return (
      <Link
        href={`/post/${postId}/sub/${position}`}
        className="block active:opacity-70 transition-opacity"
      >
        {inner}
      </Link>
    )
  }

  return inner
}
