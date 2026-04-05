import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/types'
import type { ConversationSummaryPreview } from '@/lib/types'

type TypedClient = SupabaseClient<Database>

export async function fetchConversationSummaries(
  supabase: TypedClient,
  subPostId: string,
  limit = 3
): Promise<ConversationSummaryPreview[]> {
  const { data, error } = await supabase
    .from('conversation_summaries')
    .select('id, question, key_insights, created_at')
    .eq('sub_post_id', subPostId)
    .order('created_at', { ascending: false })
    .limit(limit)

  // Gracefully return empty if table doesn't exist yet
  if (error) return []
  return data ?? []
}

export async function fetchConversationCounts(
  supabase: TypedClient,
  subPostIds: string[]
): Promise<Record<string, number>> {
  if (subPostIds.length === 0) return {}

  const { data, error } = await supabase
    .from('conversation_summaries')
    .select('sub_post_id')
    .in('sub_post_id', subPostIds)

  // Gracefully return empty if table doesn't exist yet
  if (error) return {}

  const counts: Record<string, number> = {}
  for (const row of data ?? []) {
    counts[row.sub_post_id] = (counts[row.sub_post_id] ?? 0) + 1
  }
  return counts
}

export async function saveConversationSummary(
  supabase: TypedClient,
  data: {
    subPostId: string
    postId: string
    userId: string
    question: string
    keyInsights: string[]
  }
) {
  const { error } = await supabase
    .from('conversation_summaries')
    .insert({
      sub_post_id: data.subPostId,
      post_id: data.postId,
      user_id: data.userId,
      question: data.question,
      key_insights: data.keyInsights,
    })

  if (error) throw error
}
