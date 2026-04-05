// One-time backfill: recomputes conversation_count on every sub-post based on
// the current contents of conversation_summaries. Used to fix drift from the
// counter cache migration where the backfill step was skipped.
//
// Requires authentication (to prevent random abuse) and uses the service
// client to bypass RLS for the UPDATE.
//
// Visit /api/dev/backfill-counts in the browser after logging in. Safe to
// re-run — it's idempotent.

import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return new Response('Unauthorized — log in first', { status: 401 })
  }

  const service = createServiceClient()

  const { data: subPosts, error: subPostsError } = await service
    .from('sub_posts')
    .select('id')

  if (subPostsError || !subPosts) {
    return Response.json({ error: 'Failed to load sub_posts', details: subPostsError?.message }, { status: 500 })
  }

  let updated = 0
  let errors = 0

  for (const sp of subPosts) {
    const { count, error: countError } = await service
      .from('conversation_summaries')
      .select('*', { count: 'exact', head: true })
      .eq('sub_post_id', sp.id)

    if (countError) {
      errors++
      continue
    }

    const { error: updateError } = await service
      .from('sub_posts')
      .update({ conversation_count: count ?? 0 })
      .eq('id', sp.id)

    if (updateError) {
      errors++
    } else {
      updated++
    }
  }

  return Response.json({
    total: subPosts.length,
    updated,
    errors,
  })
}
