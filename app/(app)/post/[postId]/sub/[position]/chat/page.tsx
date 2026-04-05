import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { ChatShell } from './chat-shell'

interface ChatPageProps {
  params: Promise<{ postId: string; position: string }>
  searchParams: Promise<{ q?: string }>
}

export default async function ChatPage({ params, searchParams }: ChatPageProps) {
  const { postId, position: posStr } = await params
  const { q } = await searchParams
  const position = parseInt(posStr, 10)
  if (isNaN(position)) notFound()

  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch post, sub-posts, and snipper
  const [{ data: post }, { data: subPosts }] = await Promise.all([
    supabase
      .from('posts')
      .select('id, snipper_id')
      .eq('id', postId)
      .single(),
    supabase
      .from('sub_posts')
      .select('id, post_id, position, content')
      .eq('post_id', postId)
      .order('position', { ascending: true }),
  ])

  if (!post || !subPosts) notFound()

  const targetSubPost = subPosts.find((sp: { position: number }) => sp.position === position)
  if (!targetSubPost) notFound()

  const { data: snipperRow } = await supabase
    .from('snippers')
    .select('id, name, type, topic_tags')
    .eq('id', post.snipper_id)
    .single()

  if (!snipperRow) notFound()

  return (
    <ChatShell
      postId={postId}
      subPostId={targetSubPost.id}
      position={position}
      initialQuestion={q ?? ''}
      snipperName={snipperRow.name}
      snipperType={snipperRow.type}
      snipperTopicTags={snipperRow.topic_tags ?? []}
      subPosts={subPosts.map((sp: { position: number; content: string }) => ({ position: sp.position, content: sp.content }))}
      targetContent={targetSubPost.content}
    />
  )
}
