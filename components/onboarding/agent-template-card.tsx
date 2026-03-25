'use client'

import { cn } from '@/lib/utils'
import { TypeBadge } from '@/components/feed/type-badge'
import type { AgentTemplate } from '@/lib/onboarding/templates'

interface AgentTemplateCardProps {
  template: AgentTemplate
  selected: boolean
  onToggle: () => void
  index: number
}

export function AgentTemplateCard({ template, selected, onToggle, index }: AgentTemplateCardProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        'w-full rounded-2xl border p-4 text-left transition-all duration-200',
        'active:scale-[0.97] animate-in fade-in slide-in-from-bottom-4',
        selected
          ? 'border-primary bg-primary/5'
          : 'border-border bg-card'
      )}
      style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'both' }}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl mt-0.5">{template.emoji}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm truncate">{template.name}</span>
            <TypeBadge type={template.type} />
          </div>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {template.description}
          </p>
        </div>
        <div
          className={cn(
            'mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
            selected
              ? 'border-primary bg-primary'
              : 'border-muted-foreground/30 bg-transparent'
          )}
        >
          {selected && (
            <svg className="h-3.5 w-3.5 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      </div>
    </button>
  )
}
