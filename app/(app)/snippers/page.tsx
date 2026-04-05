import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/navigation/page-header'
import { MySnippersList } from '@/components/snippers/my-snippers-list'

export default async function SnippersPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Fetch all snippers the user is subscribed to
  const { data: subs } = await supabase
    .from('snipper_subscriptions')
    .select('snipper_id')
    .eq('user_id', user.id)

  const snipperIds = subs?.map((s) => s.snipper_id) ?? []

  let snippers: Array<{
    id: string
    name: string
    type: string
    depth: string
    description: string
    owner_id: string
    is_active: boolean
    cadence: string
    topic_tags: string[]
    created_at: string
  }> = []

  if (snipperIds.length > 0) {
    const { data } = await supabase
      .from('snippers')
      .select('id, name, type, depth, description, owner_id, is_active, cadence, topic_tags, created_at')
      .in('id', snipperIds)
      .order('created_at', { ascending: false })

    snippers = data ?? []
  }

  return (
    <>
      <PageHeader />
      <div className="max-w-lg mx-auto px-4 pb-24">
        <MySnippersList snippers={snippers} userId={user.id} />
      </div>
    </>
  )
}
