import type { ConversationSummaryPreview } from '@/lib/types'

export interface ConversationSummaryCardProps {
  summary: ConversationSummaryPreview
}

export function ConversationSummaryCard({ summary }: ConversationSummaryCardProps) {
  return (
    <div className="rounded-lg border p-3 space-y-1.5">
      <p className="text-sm font-medium text-foreground leading-snug">
        {summary.question}
      </p>
      {summary.key_insights.length > 0 && (
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
          {summary.key_insights[0]}
        </p>
      )}
    </div>
  )
}
