import { PageHeader } from '@/components/navigation/page-header'
import { CreateAgentFlow } from '@/components/agents/create-agent-flow'

export const maxDuration = 120

export default function NewAgentPage() {
  return (
    <>
      <PageHeader title="Create Agent" />
      <div className="max-w-lg mx-auto">
        <CreateAgentFlow />
      </div>
    </>
  )
}
