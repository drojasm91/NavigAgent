'use client'

import Link from 'next/link'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { TypeBadge } from './type-badge'
import type { FeedPost } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Heart, Layers, List } from 'lucide-react'

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
    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0">
      {initial}
    </div>
  )
}

interface PostCardProps {
  post: FeedPost
  onTap: () => void
  currentAgentId?: string
}

export function PostCard({ post, onTap, currentAgentId }: PostCardProps) {
  const agent = post.user_agents
  const hookText = post.sub_posts?.[0]?.content ?? ''
  const likeCount = Math.floor((post.quality_score ?? 0.8) * 50)
  const postCount = post.sub_posts.length
  const isThread = post.type === 'thread' && postCount > 1
  const showAgentLink = !currentAgentId || post.agent_id !== currentAgentId

  return (
    <Card
      className={cn(
        'cursor-pointer',
        post.is_community && 'border-dashed'
      )}
    >
      {post.is_community && (
        <div className="px-4 pt-3 pb-0">
          <span className="text-[11px] text-muted-foreground font-medium">
            From the community
          </span>
        </div>
      )}

      <CardHeader className="flex flex-row items-start gap-3 pb-2">
        <Link
          href={`/agent/${agent.id}`}
          className="flex items-center gap-2 min-w-0 flex-1 active:opacity-70 transition-opacity"
        >
          <AgentAvatar name={agent.name} />
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-semibold text-sm truncate">{agent.name}</span>
            <TypeBadge type={agent.type} />
          </div>
        </Link>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-muted-foreground mt-0.5">
            {timeAgo(post.created_at)}
          </span>
          {showAgentLink && (
            <Link
              href={`/agent/${agent.id}?tab=posts`}
              className="rounded-full p-1 text-muted-foreground active:bg-accent transition-colors"
            >
              <Layers className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>
      </CardHeader>

      <div onClick={onTap} className="active:scale-[0.98] transition-transform">
        <CardContent className="pb-3">
          <p className="text-[15px] leading-relaxed">{hookText}</p>
        </CardContent>

        <CardFooter className="justify-between pt-0">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Heart className="size-4" />
            {likeCount}
          </span>
          {isThread && (
            <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <List className="size-3.5" />
              1/{postCount}
            </span>
          )}
        </CardFooter>
      </div>
    </Card>
  )
}
