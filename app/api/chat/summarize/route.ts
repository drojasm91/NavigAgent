import Anthropic from '@anthropic-ai/sdk'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { saveConversationSummary, recordLikeSignal } from '@/lib/supabase/queries'
import { ASK_SUMMARY_PROMPT } from '@/lib/prompts'
import { parseJsonFromAI } from '@/lib/utils'

interface SummarizeRequestBody {
  messages: { role: 'user' | 'assistant'; content: string }[]
  subPostId: string
  postId: string
  position: number
}

export async function POST(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = (await request.json()) as SummarizeRequestBody
  const { messages, subPostId, postId, position } = body

  if (!messages?.length || !subPostId || !postId || position == null) {
    return Response.json({ error: 'Bad request' }, { status: 400 })
  }

  // Need at least 2 messages (1 user + 1 assistant) for a meaningful summary
  if (messages.length < 2) {
    return Response.json({ error: 'Conversation too short' }, { status: 400 })
  }

  const client = new Anthropic()

  const conversationText = messages
    .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
    .join('\n\n')

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 500,
    system: ASK_SUMMARY_PROMPT,
    messages: [{ role: 'user', content: conversationText }],
  })

  const raw = response.content[0].type === 'text' ? response.content[0].text : ''
  const parsed = parseJsonFromAI(raw) as {
    skip?: boolean
    question?: string
    keyInsights?: string[]
  }

  // AI decided this conversation isn't worth saving
  if (parsed.skip) {
    // Still record the engagement signal
    await recordLikeSignal(supabase, user.id, postId, 'asked_question')
    return Response.json({ skip: true })
  }

  if (!parsed.question || !parsed.keyInsights?.length) {
    return Response.json({ error: 'Failed to generate summary' }, { status: 500 })
  }

  // Save summary and record signal in parallel
  await Promise.all([
    saveConversationSummary(supabase, {
      subPostId,
      postId,
      userId: user.id,
      question: parsed.question,
      keyInsights: parsed.keyInsights,
    }),
    recordLikeSignal(supabase, user.id, postId, 'asked_question'),
  ])

  revalidatePath(`/post/${postId}/sub/${position}`)

  return Response.json({
    question: parsed.question,
    keyInsights: parsed.keyInsights,
  })
}
