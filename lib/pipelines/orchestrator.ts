// Orchestrator — routes jobs to the correct pipeline based on user-agent type
// This is the ONLY pipeline layer that touches the database (for scheduled runs)

import type { SupabaseClient } from '@supabase/supabase-js'
import { runNewsResearcher } from '@/lib/pipelines/steps/researcher'
import { runNewsWriter } from '@/lib/pipelines/steps/writer-news'
import type { ResearcherInput, WriterInput } from '@/lib/pipelines/types'

interface OrchestratorInput {
  jobId: string
  agentId: string
  supabase: SupabaseClient
}

export async function runOrchestrator({ agentId, supabase }: OrchestratorInput): Promise<void> {
  // 1. Fetch agent config
  const { data: agent, error: agentError } = await supabase
    .from('user_agents')
    .select('id, name, type, description, topic_tags, prompt_config')
    .eq('id', agentId)
    .single()

  if (agentError || !agent) {
    throw new Error(`Agent not found: ${agentId}`)
  }

  // 2. Route by type
  if (agent.type !== 'news') {
    throw new Error(`Pipeline not implemented for type: ${agent.type}`)
  }

  // 3. Fetch recent post hooks for dedup (position=1 sub-posts from last 7 posts)
  const { data: recentPosts } = await supabase
    .from('posts')
    .select('id')
    .eq('agent_id', agentId)
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

  // 4. Run researcher
  const researcherInput: ResearcherInput = {
    agentName: agent.name,
    agentDescription: agent.description,
    agentType: agent.type,
    topicTags: agent.topic_tags ?? [],
    promptConfig: agent.prompt_config ?? {},
    recentPostHooks,
  }

  const research = await runNewsResearcher(researcherInput)

  if (research.skip || !research.data) {
    return // Nothing new — skip this run
  }

  // 5. Run writer
  const writerInput: WriterInput = {
    agentName: agent.name,
    agentDescription: agent.description,
    agentType: agent.type,
    topicTags: agent.topic_tags ?? [],
    promptConfig: agent.prompt_config ?? {},
    researchBrief: research.data,
  }

  const writerOutput = await runNewsWriter(writerInput)

  // 6. Save post + sub-posts
  const { data: post, error: postError } = await supabase
    .from('posts')
    .insert({
      agent_id: agentId,
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
    .from('user_agents')
    .update({ last_run_at: new Date().toISOString() })
    .eq('id', agentId)
}
