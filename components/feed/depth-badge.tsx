import { Badge } from '@/components/ui/badge'
import type { SnipperDepth } from '@/lib/types'
import { cn } from '@/lib/utils'

const depthConfig: Record<SnipperDepth, { label: string; className: string }> = {
  high_level: {
    label: 'High-level',
    className: 'bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-950 dark:text-violet-300 dark:border-violet-800',
  },
  balanced: {
    label: 'Balanced',
    className: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-950 dark:text-slate-300 dark:border-slate-800',
  },
  deep: {
    label: 'Deep',
    className: 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800',
  },
}

export function DepthBadge({ depth }: { depth: SnipperDepth }) {
  const config = depthConfig[depth]
  return (
    <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0', config.className)}>
      {config.label}
    </Badge>
  )
}
