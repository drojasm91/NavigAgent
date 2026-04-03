// Orchestrator — routes jobs to the correct pipeline based on snipper type
// This is the ONLY pipeline layer that touches the database (for scheduled runs)

import type { SupabaseClient } from '@supabase/supabase-js'
import { runNewsResearcher } from '@/lib/pipelines/steps/researcher'
import { runNewsWriter } from '@/lib/pipelines/steps/writer-news'
import type { ResearcherInput, WriterInput } from '@/lib/pipelines/types'

interface OrchestratorInput {
  jobId: string
  snipperId: string
  supabase: SupabaseClient
}

export async function runOrchestrator({ snipperId, supabase }: OrchestratorInput): Promise<void> {
  // 1. Fetch snipper config
  const { data: snipper, error: snipperError } = await supabase
    .from('snippers')
    .select('id, name, type, description, topic_tags, prompt_config')
    .eq('id', snipperId)
    .single()

  if (snipperError || !snipper) {
    throw new Error(`Snipper not found: ${snipperId}`)
  }

  // 2. Route by type
  if (snipper.type !== 'news') {
    throw new Error(`Pipeline not implemented for type: ${snipper.type}`)
  }

  // 3. Fetch recent post hooks for dedup (position=1 sub-posts from last 7 posts)
  const { data: recentPosts } = await supabase
    .from('posts')
    .select('id')
    .eq('snipper_id', snipperId)
    .order('created_at', { ascending: false })
    .limit(7)

  const recentPostIds = recentPosts?.map((p) => p.id) ?? []
  let recentPostHooks: string[] = []

  if (recentPostIds.length > 0) {
    const { data: hooks } = await supabase
      .from('sub_posts')
      .select('content')
      .in('post_id', recentPostIds)
      .eq('position', 1)

    recentPostHooks = hooks?.map((h) => h.content) ?? []
  }

  // 4. Run researcher agent
  const researcherInput: ResearcherInput = {
    snipperName: snipper.name,
    snipperDescription: snipper.description,
    snipperType: snipper.type,
    topicTags: snipper.topic_tags ?? [],
    promptConfig: snipper.prompt_config ?? {},
    recentPostHooks,
  }

  const research = await runNewsResearcher(researcherInput)

  if (research.skip || !research.data) {
    return // Nothing new — skip this run
  }

  // 5. Run writer agent
  const writerInput: WriterInput = {
    snipperName: snipper.name,
    snipperDescription: snipper.description,
    snipperType: snipper.type,
    topicTags: snipper.topic_tags ?? [],
    promptConfig: snipper.prompt_config ?? {},
    researchBrief: research.data,
  }

  const writerOutput = await runNewsWriter(writerInput)

  // 6. Save post + sub-posts
  const { data: post, error: postError } = await supabase
    .from('posts')
    .insert({
      snipper_id: snipperId,
      type: 'thread',
      quality_score: writerOutput.qualityScore,
      metadata: {
        sources: research.data.sources,
        angle: research.data.angle,
        isBreaking: research.data.isBreaking,
      },
    })
    .select('id')
    .single()

  if (postError || !post) {
    throw new Error(`Failed to insert post: ${postError?.message}`)
  }

  const subPostRows = writerOutput.subPosts.map((sp) => ({
    post_id: post.id,
    position: sp.position,
    content: sp.content,
  }))

  const { error: subError } = await supabase
    .from('sub_posts')
    .insert(subPostRows)

  if (subError) {
    throw new Error(`Failed to insert sub-posts: ${subError.message}`)
  }

  // 7. Update last_run_at
  await supabase
    .from('snippers')
    .update({ last_run_at: new Date().toISOString() })
    .eq('id', snipperId)
}
