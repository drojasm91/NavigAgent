export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/navigation/page-header'
import { MyAgentsList } from '@/components/agents/my-agents-list'

export default async function AgentsPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Fetch all agents the user is subscribed to
  const { data: subs } = await supabase
    .from('user_agent_subscriptions')
    .select('agent_id')
    .eq('user_id', user.id)

  const agentIds = subs?.map((s) => s.agent_id) ?? []

  let agents: Array<{
    id: string
    name: string
    type: string
    description: string
    owner_id: string
    is_active: boolean
    cadence: string
    topic_tags: string[]
    created_at: string
  }> = []

  if (agentIds.length > 0) {
    const { data } = await supabase
      .from('user_agents')
      .select('id, name, type, description, owner_id, is_active, cadence, topic_tags, created_at')
      .in('id', agentIds)
      .order('created_at', { ascending: false })

    agents = data ?? []
  }

  return (
    <>
      <PageHeader title="My Agents" />
      <div className="max-w-lg mx-auto px-4 pb-24">
        <MyAgentsList agents={agents} userId={user.id} />
      </div>
    </>
  )
}
