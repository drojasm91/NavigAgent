import { PageHeader } from '@/components/navigation/page-header'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Compass } from 'lucide-react'

export default function DiscoverPage() {
  return (
    <>
      <PageHeader title="Discover" />
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <Compass className="size-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-lg font-semibold mb-1">No community agents yet</h2>
        <p className="text-muted-foreground text-sm mb-6 max-w-xs mx-auto">
          Be the first to create a public agent and share it with the community.
        </p>
        <Link href="/agents/new" className={cn(buttonVariants({ variant: 'default' }))}>
          Create an agent
        </Link>
      </div>
    </>
  )
}
