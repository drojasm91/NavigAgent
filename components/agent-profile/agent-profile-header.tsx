'use client'

import { useRouter } from 'next/navigation'
import { ChevronLeft, UserPlus } from 'lucide-react'
import { TypeBadge } from '@/components/feed/type-badge'
import type { FeedAgent } from '@/lib/types'

interface AgentProfileHeaderProps {
  agent: FeedAgent
  postCount: number
}

export function AgentProfileHeader({ agent, postCount }: AgentProfileHeaderProps) {
  const router = useRouter()
  const initial = agent.name.charAt(0).toUpperCase()

  return (
    <div className="pb-3 space-y-2.5">
      {/* Row 1: Back + Avatar + Name + Badge + Follow */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => router.back()}
          className="shrink-0 rounded-full p-1 text-muted-foreground active:bg-accent transition-colors -ml-1"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold shrink-0">
          {initial}
        </div>
        <h1 className="font-bold text-base truncate">{agent.name}</h1>
        <TypeBadge type={agent.type} />
        <div className="flex-1" />
        <button className="flex items-center gap-1.5 shrink-0 rounded-full border border-border px-3 py-1.5 text-xs font-medium active:bg-accent transition-colors">
          <UserPlus className="h-3.5 w-3.5" />
          Follow
        </button>
      </div>

      {/* Row 2: Tags + Stats */}
      <div className="flex items-center justify-between gap-3">
        {agent.topic_tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 min-w-0">
            {agent.topic_tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        <div className="flex items-center gap-3 text-xs text-muted-foreground shrink-0">
          <span><strong className="text-foreground">{postCount}</strong> posts</span>
          <span><strong className="text-foreground">--</strong> followers</span>
        </div>
      </div>
    </div>
  )
}
