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
        'w-full rounded-2xl border-2 p-5 text-left transition-all duration-200',
        'active:scale-[0.97]',
        selected
          ? 'border-primary bg-primary/5 scale-[1.02]'
          : 'border-transparent bg-muted/50 hover:bg-muted'
      )}
    >
      <div className="flex items-start gap-4">
        <span className="text-3xl">{vibe.emoji}</span>
        <div className="min-w-0">
          <p className="font-semibold text-base">{vibe.label}</p>
          <p className="text-sm text-muted-foreground mt-0.5">{vibe.description}</p>
        </div>
      </div>
    </button>
  )
}
