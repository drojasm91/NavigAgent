// Layer 3 — Personalization Loop (weekly cron)
// Reads like signals per user per user-agent, updates prompt_config.
// TODO: implement full logic once @anthropic-ai/sdk is added as a dependency

import { SupabaseClient } from '@supabase/supabase-js'

interface PersonalizationInput {
  userId: string
  supabase: SupabaseClient
}

export async function runPersonalizationLoop({ userId, supabase }: PersonalizationInput) {
  // Get all user-agent subscriptions for this user
  const { data: subscriptions, error: subError } = await supabase
    .from('user_agent_subscriptions')
    .select('agent_id')
    .eq('user_id', userId)

  if (subError || !subscriptions?.length) {
    return
  }

  const subs = subscriptions as { agent_id: string }[]

  for (const sub of subs) {
    // Read like signals from the past 4 weeks
    const fourWeeksAgo = new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString()

    const { data: postRows } = await supabase
      .from('posts')
      .select('id')
      .eq('agent_id', sub.agent_id)

    const postIds = (postRows as { id: string }[] | null)?.map((p) => p.id) ?? []

    const { data: signals } = await supabase
      .from('likes')
      .select('signal_type, post_id')
      .eq('user_id', userId)
      .in('post_id', postIds)
      .gte('created_at', fourWeeksAgo)

    if (!signals?.length) {
      continue
    }

    // Get the current user-agent config
    const { data: userAgent } = await supabase
      .from('user_agents')
      .select('prompt_config, description, type')
      .eq('id', sub.agent_id)
      .single()

    if (!userAgent) {
      continue
    }

    const typedSignals = signals as { signal_type: string; post_id: string }[]
    const typedAgent = userAgent as { prompt_config: Record<string, unknown> | null; description: string; type: string }

    // Summarize signal patterns
    const signalSummary = {
      likes: typedSignals.filter((s) => s.signal_type === 'like').length,
      skips: typedSignals.filter((s) => s.signal_type === 'skip').length,
      readFull: typedSignals.filter((s) => s.signal_type === 'read_full').length,
      askedQuestion: typedSignals.filter((s) => s.signal_type === 'asked_question').length,
      rabbitHoleEntered: typedSignals.filter((s) => s.signal_type === 'rabbit_hole_entered').length,
      total: typedSignals.length,
    }

    // Merge signal summary into prompt_config as a placeholder
    // Full AI-powered personalization will be added when @anthropic-ai/sdk is installed
    const currentConfig = typedAgent.prompt_config ?? {}
    const updatedConfig = {
      ...currentConfig,
      signal_summary: signalSummary,
      last_updated: new Date().toISOString(),
    }

    await supabase
      .from('user_agents')
      .update({ prompt_config: updatedConfig })
      .eq('id', sub.agent_id)
  }
}
