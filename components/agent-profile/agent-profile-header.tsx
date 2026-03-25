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
    <div className="pb-4">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="mb-3 rounded-full p-1.5 text-muted-foreground active:bg-accent transition-colors -ml-1.5"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      {/* Identity */}
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground text-base font-bold shrink-0">
          {initial}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-lg truncate">{agent.name}</h1>
            <TypeBadge type={agent.type} />
          </div>
        </div>
      </div>

      {/* Topic tags */}
      {agent.topic_tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
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

      {/* Stats + Follow */}
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span><strong className="text-foreground">{postCount}</strong> posts</span>
          <span><strong className="text-foreground">--</strong> followers</span>
        </div>
        <button className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium active:bg-accent transition-colors">
          <UserPlus className="h-3.5 w-3.5" />
          Follow
        </button>
      </div>
    </div>
  )
}
