'use client'

import { cn } from '@/lib/utils'

interface TopicChipProps {
  label: string
  selected: boolean
  onToggle: () => void
}

export function TopicChip({ label, selected, onToggle }: TopicChipProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        'rounded-full px-4 py-2 text-sm font-medium transition-all duration-150',
        'active:scale-[0.95]',
        selected
          ? 'bg-primary text-primary-foreground shadow-sm'
          : 'bg-muted text-foreground hover:bg-muted/80'
      )}
    >
      {label}
    </button>
  )
}
