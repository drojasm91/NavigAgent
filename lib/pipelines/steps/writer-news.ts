// Step 2 — Write & Self-edit (Claude Sonnet)
// Pure function: no DB access, no side effects

import Anthropic from '@anthropic-ai/sdk'
import { NEWS_WRITER_PROMPT } from '@/lib/prompts'
import { parseJsonFromAI } from '@/lib/utils'
import type { WriterInput, WriterOutput, WriterSubPost } from '@/lib/pipelines/types'

export async function runNewsWriter(input: WriterInput): Promise<WriterOutput> {
  const client = new Anthropic()

  const userMessage = JSON.stringify({
    researchBrief: input.researchBrief,
    agentName: input.agentName,
    agentDescription: input.agentDescription,
    topicTags: input.topicTags,
    promptConfig: input.promptConfig,
  })

  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1500,
    system: NEWS_WRITER_PROMPT,
    messages: [{ role: 'user', content: userMessage }],
  })

  const raw = message.content[0].type === 'text' ? message.content[0].text : ''
  const parsed = parseJsonFromAI(raw)

  // Validate and clean sub-posts
  const subPosts: WriterSubPost[] = []

  if (Array.isArray(parsed.subPosts)) {
    for (const sp of parsed.subPosts) {
      if (typeof sp.content !== 'string' || typeof sp.position !== 'number') continue

      // Enforce 280 char limit — truncate at last sentence boundary if over
      const content = sp.content.length <= 280
        ? sp.content
        : truncateAtSentence(sp.content, 280)

      subPosts.push({ position: sp.position, content })
    }
  }

  // Ensure we have 3-10 sub-posts
  if (subPosts.length < 3) {
    throw new Error(`Writer produced only ${subPosts.length} sub-posts (minimum 3)`)
  }

  const qualityScore = typeof parsed.qualityScore === 'number'
    ? Math.max(0, Math.min(1, parsed.qualityScore))
    : 0.5

  return {
    subPosts: subPosts.slice(0, 10),
    qualityScore,
  }
}

function truncateAtSentence(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text

  const truncated = text.slice(0, maxLength)
  const lastPeriod = truncated.lastIndexOf('.')
  const lastExclamation = truncated.lastIndexOf('!')
  const lastQuestion = truncated.lastIndexOf('?')
  const lastSentenceEnd = Math.max(lastPeriod, lastExclamation, lastQuestion)

  if (lastSentenceEnd > maxLength * 0.5) {
    return truncated.slice(0, lastSentenceEnd + 1)
  }

  // Fall back to last space
  const lastSpace = truncated.lastIndexOf(' ')
  if (lastSpace > maxLength * 0.5) {
    return truncated.slice(0, lastSpace) + '...'
  }

  return truncated.slice(0, maxLength - 3) + '...'
}
