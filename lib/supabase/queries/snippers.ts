import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database, SnipperType, Json } from '@/lib/types'
import type { WriterOutput } from '@/lib/pipelines/types'

type TypedClient = SupabaseClient<Database>

interface CreateSnipperData {
  name: string
  type: SnipperType
  description: string
  topicTags: string[]
  promptConfig?: Json
}

export async function createSnipperWithSubscription(
  supabase: TypedClient,
  userId: string,
  data: CreateSnipperData
): Promise<string> {
  // Insert the snipper
  const { data: snipper, error: snipperError } = await supabase
    .from('snippers')
    .insert({
      owner_id: userId,
      name: data.name,
      type: data.type,
      description: data.description,
      topic_tags: data.topicTags,
      prompt_config: data.promptConfig ?? {},
      cadence: 'daily',
      is_public: false,
      is_active: true,
    })
    .select('id')
    .single()

  if (snipperError || !snipper) {
    throw new Error(snipperError?.message ?? 'Failed to create snipper')
  }

  // Auto-subscribe the creator
  const { error: subError } = await supabase
    .from('snipper_subscriptions')
    .insert({
      user_id: userId,
      snipper_id: snipper.id,
    })

  if (subError) {
    throw new Error(subError.message)
  }

  return snipper.id
}

export async function createSnipperWithPosts(
  supabase: TypedClient,
  userId: string,
  data: CreateSnipperData,
  samplePosts: WriterOutput[]
): Promise<string> {
  // 1. Create snipper + subscription
  const snipperId = await createSnipperWithSubscription(supabase, userId, data)

  // 2. Insert each sample as a post + sub_posts
  for (const sample of samplePosts) {
    const { data: post, error: postError } = await supabase
      .from('posts')
      .insert({
        snipper_id: snipperId,
        type: 'thread',
        quality_score: sample.qualityScore,
        metadata: { sources: sample.sources ?? [] } as Json,
      })
      .select('id')
      .single()

    if (postError || !post) continue

    const subPostRows = sample.subPosts.map((sp) => ({
      post_id: post.id,
      position: sp.position,
      content: sp.content,
    }))

    await supabase.from('sub_posts').insert(subPostRows)
  }

  // 3. Set last_run_at so scheduler doesn't immediately re-run
  await supabase
    .from('snippers')
    .update({ last_run_at: new Date().toISOString() })
    .eq('id', snipperId)

  return snipperId
}
