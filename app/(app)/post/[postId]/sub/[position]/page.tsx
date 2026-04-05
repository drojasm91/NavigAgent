import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { fetchConversationSummaries } from '@/lib/supabase/queries'
import { SubPostHero } from '@/components/ask/sub-post-hero'
import { ConversationSummaryList } from '@/components/ask/conversation-summary-list'
import { AskInput } from '@/components/ask/ask-input'
import { BackButton } from '@/components/ask/back-button'
import type { FeedSubPost, FeedSnipper } from '@/lib/types'

interface SubPostPageProps {
  params: Promise<{ postId: string; position: string }>
}

export default async function SubPostPage({ params }: SubPostPageProps) {
  const { postId, position: posStr } = await params
  const position = parseInt(posStr, 10)
  if (isNaN(position)) notFound()

  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch post + sub-posts in parallel
  const [{ data: post }, { data: subPosts }] = await Promise.all([
    supabase
      .from('posts')
      .select('id, snipper_id')
      .eq('id', postId)
      .single(),
    supabase
      .from('sub_posts')
      .select('*')
      .eq('post_id', postId)
      .order('position', { ascending: true }),
  ])

  if (!post || !subPosts) notFound()

  const targetSubPost = subPosts.find((sp: { position: number }) => sp.position === position)
  if (!targetSubPost) notFound()

  // Fetch snipper and summaries in parallel
  const [{ data: snipperRow }, summaries] = await Promise.all([
    supabase
      .from('snippers')
      .select('id, name, type, depth, owner_id, is_public, topic_tags')
      .eq('id', post.snipper_id)
      .single(),
    fetchConversationSummaries(supabase, targetSubPost.id),
  ])

  if (!snipperRow) notFound()

  return (
    <div className="max-w-lg mx-auto">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b">
        <div className="px-4 py-3 flex items-center gap-3">
          <BackButton />
          <span className="text-sm font-medium text-muted-foreground truncate">
            {snipperRow.name} &middot; Post {position} of {subPosts.length}
          </span>
        </div>
      </header>

      <div className="px-4 py-6 space-y-6">
        <SubPostHero
          content={targetSubPost.content}
          position={targetSubPost.position}
          total={subPosts.length}
        />

        <ConversationSummaryList summaries={summaries} />

        <AskInput
          postId={postId}
          position={position}
        />
      </div>
    </div>
  )
}
