import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function EmptyFeed() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <h2 className="text-lg font-semibold mb-1">Your feed is empty</h2>
      <p className="text-muted-foreground text-sm mb-6 max-w-xs">
        Create your first user-agent or discover what others have built.
      </p>
      <div className="flex gap-3">
        <Link href="/agents/new" className={cn(buttonVariants({ variant: 'default' }))}>
          Create agent
        </Link>
        <Link href="/discover" className={cn(buttonVariants({ variant: 'outline' }))}>
          Discover
        </Link>
      </div>
    </div>
  )
}
