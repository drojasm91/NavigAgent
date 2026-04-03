import { PageHeader } from '@/components/navigation/page-header'
import { CreateSnipperFlow } from '@/components/snippers/create-snipper-flow'

export const maxDuration = 120

export default function NewSnipperPage() {
  return (
    <>
      <PageHeader />
      <div className="max-w-lg mx-auto">
        <CreateSnipperFlow />
      </div>
    </>
  )
}
