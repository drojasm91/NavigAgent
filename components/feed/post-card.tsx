'use client'

import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { TypeBadge } from './type-badge'
import type { FeedPost } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Heart, MessageCircle, ArrowRight } from 'lucide-react'

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

function AgentAvatar({ name }: { name: string }) {
  const initial = name.charAt(0).toUpperCase()
  return (
    <div className="size-10 rounded-full bg-neutral-800 dark:bg-neutral-200 flex items-center justify-center shrink-0">
      <span className="text-sm font-semibold text-white dark:text-neutral-800">
        {initial}
      </span>
    </div>
  )
}

interface PostCardProps {
  post: FeedPost
  onTap: () => void
}

export function PostCard({ post, onTap }: PostCardProps) {
  const agent = post.user_agents
  const hookText = post.sub_posts?.[0]?.content ?? ''
  const likeCount = Math.floor((post.quality_score ?? 0.8) * 50)
  const postCount = post.sub_posts.length

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

      <CardHeader className="flex flex-row items-start gap-3 pb-2">
        <AgentAvatar name={agent.name} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm truncate">{agent.name}</span>
            <TypeBadge type={agent.type} />
          </div>
        </div>
        <span className="text-xs text-muted-foreground shrink-0 mt-0.5">
          {timeAgo(post.created_at)}
        </span>
      </CardHeader>

      <CardContent className="pb-3">
        <p className="text-[15px] leading-relaxed">{hookText}</p>
      </CardContent>

      <CardFooter className="justify-between pt-0">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Heart className="size-4" />
            {likeCount}
          </span>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MessageCircle className="size-4" />
            {postCount} posts
          </span>
        </div>
        <span className="flex items-center gap-1 text-xs font-medium text-foreground">
          Read thread
          <ArrowRight className="size-3.5" />
        </span>
      </CardFooter>
    </Card>
  )
}
