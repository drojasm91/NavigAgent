'use client'

import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { TypeBadge } from '@/components/feed/type-badge'
import type { FeedAgent } from '@/lib/types'

interface AgentIdentityBarProps {
  agent: FeedAgent
}

export function AgentIdentityBar({ agent }: AgentIdentityBarProps) {
  const router = useRouter()
  const initial = agent.name.charAt(0).toUpperCase()

  return (
    <div className="flex items-center gap-3 pb-4 border-b border-border mb-4">
      <button
        onClick={() => router.back()}
        className="shrink-0 rounded-full p-1.5 text-muted-foreground active:bg-accent transition-colors"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0">
        {initial}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm truncate">{agent.name}</span>
          <TypeBadge type={agent.type} />
        </div>
        {agent.topic_tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {agent.topic_tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
