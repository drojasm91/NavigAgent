import { PageHeader } from '@/components/navigation/page-header'
import Link from 'next/link'

export default function DiscoverPage() {
  return (
    <>
      <PageHeader title="Discover" />
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <h2 className="text-lg font-semibold mb-1">No community agents yet</h2>
        <p className="text-muted-foreground text-sm mb-6 max-w-xs mx-auto">
          Be the first to create a public agent and share it with the community.
        </p>
        <Link
          href="/agents/new"
          className="inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-medium h-8 px-2.5"
        >
          Create an agent
        </Link>
      </div>
    </>
  )
}
