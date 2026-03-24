export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { FeedShell } from '@/components/feed/feed-shell'
import { fetchFeedPosts, fetchCommunityPosts, countUnreadOwnPosts } from '@/lib/supabase/queries'
import type { FeedPost } from '@/lib/types'

export default async function HomePage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Server-side initial fetch for fast first paint
  let initialPosts: FeedPost[] = []

  try {
    const ownPosts = await fetchFeedPosts(supabase, user.id)
    initialPosts = ownPosts

    const unread = await countUnreadOwnPosts(supabase, user.id)
    if (unread < 5) {
      const community = await fetchCommunityPosts(supabase, user.id)
      initialPosts = [...initialPosts, ...community]
    }
  } catch {
    // Feed will load client-side as fallback
  }

  return (
    <main className="min-h-screen">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b">
        <div className="max-w-lg mx-auto px-4 py-3">
          <h1 className="text-lg font-bold">NavigAgent</h1>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-4">
        <FeedShell userId={user.id} initialPosts={initialPosts} />
      </div>
    </main>
  )
}
