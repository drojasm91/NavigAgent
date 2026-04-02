'use client'

import Link from 'next/link'
import { Plus } from 'lucide-react'
import { TypeBadge } from '@/components/feed/type-badge'
import type { UserAgentType } from '@/lib/types'

interface AgentItem {
  id: string
  name: string
  type: string
  description: string
  owner_id: string
  is_active: boolean
  cadence: string
  topic_tags: string[]
  created_at: string
}

interface MyAgentsListProps {
  agents: AgentItem[]
  userId: string
}

export function MyAgentsList({ agents, userId }: MyAgentsListProps) {
  if (agents.length === 0) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-lg font-semibold mb-1">No agents yet</h2>
        <p className="text-muted-foreground text-sm mb-6 max-w-xs mx-auto">
          Create your first agent to start getting personalized content in your feed.
        </p>
        <Link
          href="/agents/new"
          className="inline-flex items-center gap-1.5 rounded-full bg-primary text-primary-foreground text-sm font-medium px-4 py-2.5 active:scale-[0.98] transition-all"
        >
          <Plus className="h-4 w-4" />
          Create agent
        </Link>
      </div>
    )
  }

  return (
    <div className="pt-4 space-y-3">
      {agents.map((agent) => {
        const isOwner = agent.owner_id === userId
        const initial = agent.name.charAt(0).toUpperCase()

        return (
          <Link
            key={agent.id}
            href={`/agent/${agent.id}`}
            className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4 transition-all active:scale-[0.98] active:bg-muted"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold shrink-0">
              {initial}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-sm truncate">{agent.name}</p>
                <TypeBadge type={agent.type as UserAgentType} />
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                {agent.description}
              </p>
              <div className="flex items-center gap-2 mt-2 text-[11px] text-muted-foreground">
                <span className="capitalize">{agent.cadence}</span>
                <span>·</span>
                <span>{agent.is_active ? 'Active' : 'Paused'}</span>
                {isOwner && (
                  <>
                    <span>·</span>
                    <span className="text-primary font-medium">Created by you</span>
                  </>
                )}
              </div>
            </div>
          </Link>
        )
      })}

      {/* Create agent button */}
      <Link
        href="/agents/new"
        className="flex items-center justify-center gap-1.5 rounded-2xl border border-dashed border-muted-foreground/30 p-4 text-sm text-muted-foreground transition-all active:scale-[0.98] active:bg-muted"
      >
        <Plus className="h-4 w-4" />
        Create another agent
      </Link>
    </div>
  )
}
