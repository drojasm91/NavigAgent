'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TypeBadge } from '@/components/feed/type-badge'
import type { SnipperType } from '@/lib/types'

interface SnipperItem {
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

interface MySnippersListProps {
  snippers: SnipperItem[]
  userId: string
}

const FILTER_OPTIONS: { label: string; value: string }[] = [
  { label: 'All', value: 'all' },
  { label: 'News', value: 'news' },
  { label: 'Learning', value: 'learning' },
  { label: 'Recommendations', value: 'recommendation' },
]

export function MySnippersList({ snippers, userId }: MySnippersListProps) {
  const [filter, setFilter] = useState('all')

  if (snippers.length === 0) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-lg font-semibold mb-1">No Snippers yet</h2>
        <p className="text-muted-foreground text-sm mb-6 max-w-xs mx-auto">
          Create your first Snipper to start getting personalized content in your feed.
        </p>
        <Link
          href="/snippers/new"
          className="inline-flex items-center gap-1.5 rounded-full bg-primary text-primary-foreground text-sm font-medium px-4 py-2.5 active:scale-[0.98] transition-all"
        >
          <Plus className="h-4 w-4" />
          Create a Snipper
        </Link>
      </div>
    )
  }

  const filteredSnippers = filter === 'all' ? snippers : snippers.filter((s) => s.type === filter)
  const hasMultipleTypes = new Set(snippers.map((s) => s.type)).size > 1

  return (
    <div className="pt-4">
      {/* Create snipper banner */}
      <Link
        href="/snippers/new"
        className="flex items-center justify-between rounded-2xl bg-primary/5 border border-primary/10 px-4 py-3.5 mb-4 active:scale-[0.98] transition-all"
      >
        <div>
          <p className="text-sm font-semibold">Create a new Snipper</p>
          <p className="text-xs text-muted-foreground mt-0.5">Add an AI expert to your feed</p>
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
      </Link>

      {/* Type filter chips */}
      {hasMultipleTypes && (
        <div className="flex gap-2 mb-4">
          {FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setFilter(opt.value)}
              className={cn(
                'rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
                filter === opt.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground active:bg-accent'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}

      <div className="space-y-3">
      {filteredSnippers.map((snipper) => {
        const isOwner = snipper.owner_id === userId
        const initial = snipper.name.charAt(0).toUpperCase()

        return (
          <Link
            key={snipper.id}
            href={`/snipper/${snipper.id}`}
            className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4 transition-all active:scale-[0.98] active:bg-muted"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold shrink-0">
              {initial}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-sm truncate">{snipper.name}</p>
                <TypeBadge type={snipper.type as SnipperType} />
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                {snipper.description}
              </p>
              <div className="flex items-center gap-2 mt-2 text-[11px] text-muted-foreground">
                <span className="capitalize">{snipper.cadence}</span>
                <span>·</span>
                <span>{snipper.is_active ? 'Active' : 'Paused'}</span>
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

      {filteredSnippers.length === 0 && filter !== 'all' && (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No {filter} Snippers yet
        </p>
      )}
      </div>
    </div>
  )
}
