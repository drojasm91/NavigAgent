import { Badge } from '@/components/ui/badge'
import type { UserAgentType } from '@/lib/types'
import { cn } from '@/lib/utils'

const typeConfig: Record<UserAgentType, { label: string; className: string }> = {
  news: {
    label: 'News',
    className: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800',
  },
  learning: {
    label: 'Learning',
    className: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800',
  },
  recommendation: {
    label: 'recommendation',
    className: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800',
  },
}

export function TypeBadge({ type }: { type: UserAgentType }) {
  const config = typeConfig[type]
  return (
    <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0', config.className)}>
      {config.label}
    </Badge>
  )
}
