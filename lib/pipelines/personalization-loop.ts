// Layer 3 — Personalization Loop (weekly cron)
// Reads like signals per user per user-agent, updates prompt_config.

import { SupabaseClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'

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

  const anthropic = new Anthropic()

  for (const sub of subscriptions) {
    // Read like signals from the past 4 weeks
    const fourWeeksAgo = new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString()

    const { data: signals } = await supabase
      .from('likes')
      .select('signal_type, post_id')
      .eq('user_id', userId)
      .in('post_id',
        (await supabase
          .from('posts')
          .select('id')
          .eq('agent_id', sub.agent_id)
        ).data?.map((p) => p.id) ?? []
      )
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

    // Summarize signal patterns
    const signalSummary = {
      likes: signals.filter((s) => s.signal_type === 'like').length,
      skips: signals.filter((s) => s.signal_type === 'skip').length,
      readFull: signals.filter((s) => s.signal_type === 'read_full').length,
      askedQuestion: signals.filter((s) => s.signal_type === 'asked_question').length,
      rabbitHoleEntered: signals.filter((s) => s.signal_type === 'rabbit_hole_entered').length,
      total: signals.length,
    }

    // Use Claude to generate personalization update
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      messages: [
        {
          role: 'user',
          content: `You are a personalization engine for a content feed. Based on user engagement signals, generate a short natural language instruction to improve future content.

User-agent type: ${userAgent.type}
User-agent description: ${userAgent.description}
Current personalization config: ${JSON.stringify(userAgent.prompt_config ?? {})}

Engagement signals (last 4 weeks):
- Likes: ${signalSummary.likes}
- Skips: ${signalSummary.skips}
- Read full thread: ${signalSummary.readFull}
- Asked questions: ${signalSummary.askedQuestion}
- Entered rabbit hole: ${signalSummary.rabbitHoleEntered}

Generate a concise personalization instruction (1-3 sentences) that adjusts framing, angle, depth, or style. Never change the topic or type. Output ONLY the instruction text, nothing else.`,
        },
      ],
    })

    const instruction = response.content[0].type === 'text' ? response.content[0].text : ''

    // Merge into prompt_config
    const currentConfig = (userAgent.prompt_config as Record<string, unknown>) ?? {}
    const updatedConfig = {
      ...currentConfig,
      personalization_instruction: instruction,
      last_updated: new Date().toISOString(),
    }

    await supabase
      .from('user_agents')
      .update({ prompt_config: updatedConfig })
      .eq('id', sub.agent_id)
  }
}
