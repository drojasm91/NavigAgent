import { Skeleton } from '@/components/ui/skeleton'
import { PageHeader } from '@/components/navigation/page-header'

export default function Loading() {
  return (
    <>
      <PageHeader />
      <div className="max-w-lg mx-auto px-4 py-4 space-y-4">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    </>
  )
}
