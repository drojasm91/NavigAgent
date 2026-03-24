'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { TypeBadge } from './type-badge'
import type { FeedPost } from '@/lib/types'
import { cn } from '@/lib/utils'

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  return `${days}d`
}

interface PostCardProps {
  post: FeedPost
  onTap: () => void
}

export function PostCard({ post, onTap }: PostCardProps) {
  const agent = post.user_agents
  const hookText =
    post.type === 'thread'
      ? post.sub_posts?.[0]?.content ?? ''
      : post.sub_posts?.[0]?.content ?? ''

  return (
    <Card
      className={cn(
        'cursor-pointer active:scale-[0.98] transition-transform',
        post.is_community && 'border-dashed'
      )}
      onClick={onTap}
    >
      {post.is_community && (
        <div className="px-4 pt-3 pb-0">
          <span className="text-[11px] text-muted-foreground font-medium">
            From the community
          </span>
        </div>
      )}
      <CardHeader className="flex flex-row items-center gap-2 pb-1">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="font-semibold text-sm truncate">{agent.name}</span>
          <TypeBadge type={agent.type} />
        </div>
        <span className="text-xs text-muted-foreground shrink-0">
          {timeAgo(post.created_at)}
        </span>
      </CardHeader>
      <CardContent>
        <p className="text-[15px] leading-relaxed">{hookText}</p>
        {post.type === 'thread' && post.sub_posts.length > 1 && (
          <p className="text-xs text-muted-foreground mt-2">
            {post.sub_posts.length} posts in thread
          </p>
        )}
      </CardContent>
    </Card>
  )
}
