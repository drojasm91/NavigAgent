'use client'

import { cn } from '@/lib/utils'
import type { VibeOption } from '@/lib/onboarding/templates'

interface VibeCardProps {
  vibe: VibeOption
  selected: boolean
  onToggle: () => void
}

export function VibeCard({ vibe, selected, onToggle }: VibeCardProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        'w-full rounded-xl border p-4 text-left transition-all duration-200',
        'active:scale-[0.97]',
        selected
          ? 'border-primary bg-primary/5 shadow-sm'
          : 'border-border bg-card hover:bg-muted/50'
      )}
    >
      <div className="flex items-center gap-3.5">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-xl">
          {vibe.emoji}
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-sm leading-tight">{vibe.label}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{vibe.description}</p>
        </div>
        <div
          className={cn(
            'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
            selected
              ? 'border-primary bg-primary'
              : 'border-muted-foreground/30'
          )}
        >
          {selected && (
            <svg className="h-3 w-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      </div>
    </button>
  )
}
