import { PageHeader } from '@/components/navigation/page-header'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Bot } from 'lucide-react'

export default function AgentsPage() {
  return (
    <>
      <PageHeader title="My Agents" />
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <Bot className="size-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-lg font-semibold mb-1">No agents yet</h2>
        <p className="text-muted-foreground text-sm mb-6 max-w-xs mx-auto">
          Create your first user-agent to start getting personalized content in your feed.
        </p>
        <Link href="/agents/new" className={cn(buttonVariants({ variant: 'default' }))}>
          Create your first agent
        </Link>
      </div>
    </>
  )
}
