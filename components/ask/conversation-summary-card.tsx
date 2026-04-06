'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import type { ConversationSummaryPreview } from '@/lib/types'

export interface ConversationSummaryCardProps {
  summary: ConversationSummaryPreview
}

export function ConversationSummaryCard({ summary }: ConversationSummaryCardProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <button
      type="button"
      onClick={() => setExpanded((v) => !v)}
      className="w-full text-left rounded-lg border p-3 space-y-1.5 active:scale-[0.98] transition-transform"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-foreground leading-snug">
          {summary.question}
        </p>
        {summary.key_insights.length > 0 && (
          expanded
            ? <ChevronUp className="size-4 shrink-0 text-muted-foreground mt-0.5" />
            : <ChevronDown className="size-4 shrink-0 text-muted-foreground mt-0.5" />
        )}
      </div>
      {summary.key_insights.length > 0 && (
        expanded ? (
          <ul className="space-y-1.5">
            {summary.key_insights.map((insight, i) => (
              <li key={i} className="text-xs text-muted-foreground leading-relaxed">
                {insight}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
            {summary.key_insights[0]}
          </p>
        )
      )}
    </button>
  )
}
