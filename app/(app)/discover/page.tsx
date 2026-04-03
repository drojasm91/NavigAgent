import { PageHeader } from '@/components/navigation/page-header'
import Link from 'next/link'

export default function DiscoverPage() {
  return (
    <>
      <PageHeader />
      <div className="max-w-lg mx-auto px-4">
        <div className="py-16 text-center">
        <h2 className="text-lg font-semibold mb-1">No community Snippers yet</h2>
        <p className="text-muted-foreground text-sm mb-6 max-w-xs mx-auto">
          Be the first to create a public Snipper and share it with the community.
        </p>
        <Link
          href="/snippers/new"
          className="inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-medium h-8 px-2.5"
        >
          Create a Snipper
        </Link>
        </div>
      </div>
    </>
  )
}
