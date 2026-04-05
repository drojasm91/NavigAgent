import { ConversationSummaryCard } from './conversation-summary-card'
import type { ConversationSummaryPreview } from '@/lib/types'

interface ConversationSummaryListProps {
  summaries: ConversationSummaryPreview[]
}

export function ConversationSummaryList({ summaries }: ConversationSummaryListProps) {
  if (summaries.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-muted-foreground">
          No conversations yet. Be the first to ask.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        Conversations ({summaries.length})
      </h3>
      <div className="space-y-2">
        {summaries.map((summary) => (
          <ConversationSummaryCard key={summary.id} summary={summary} />
        ))}
      </div>
    </div>
  )
}
