export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { FeedShell } from '@/components/feed/feed-shell'
// import { fetchFeedPosts, fetchCommunityPosts, countUnreadOwnPosts } from '@/lib/supabase/queries'
import { PageHeader } from '@/components/navigation/page-header'
// import type { FeedPost } from '@/lib/types'
import { DUMMY_POSTS } from '@/lib/dummy-data'

export default async function HomePage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // TODO: Replace dummy data with real DB fetch
  // let initialPosts: FeedPost[] = []
  // try {
  //   const ownPosts = await fetchFeedPosts(supabase, user.id)
  //   initialPosts = ownPosts
  //   const unread = await countUnreadOwnPosts(supabase, user.id)
  //   if (unread < 5) {
  //     const community = await fetchCommunityPosts(supabase, user.id)
  //     initialPosts = [...initialPosts, ...community]
  //   }
  // } catch {
  //   // Feed will load client-side as fallback
  // }

  return (
    <>
      <PageHeader title="NavigAgent" />
      <div className="max-w-lg mx-auto px-4 py-4">
        <FeedShell userId={user.id} initialPosts={DUMMY_POSTS} />
      </div>
    </>
  )
}
