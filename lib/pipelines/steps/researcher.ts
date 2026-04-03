// Step 1 — Research & Plan (Perplexity + Claude Haiku)
// Pure function: no DB access, no side effects

import Anthropic from '@anthropic-ai/sdk'
import { queryPerplexity } from '@/lib/perplexity'
import { NEWS_RESEARCHER_PROMPT } from '@/lib/prompts'
import { parseJsonFromAI } from '@/lib/utils'
import type { ResearcherInput, ResearcherOutput, SourceRef } from '@/lib/pipelines/types'

export async function runNewsResearcher(input: ResearcherInput): Promise<ResearcherOutput> {
  // 1. Build search query from agent config
  const searchQuery = buildSearchQuery(input)

  // 2. Call Perplexity for web research
  const perplexity = await queryPerplexity(searchQuery)

  // 3. Call Haiku to analyze research + decide angle
  const client = new Anthropic()

  const userMessage = JSON.stringify({
    research: perplexity.content,
    citations: perplexity.citations,
    snipperName: input.snipperName,
    snipperDescription: input.snipperDescription,
    topicTags: input.topicTags,
    promptConfig: input.promptConfig,
    recentPostHooks: input.recentPostHooks,
  })

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 800,
    system: NEWS_RESEARCHER_PROMPT,
    messages: [{ role: 'user', content: userMessage }],
  })

  const raw = message.content[0].type === 'text' ? message.content[0].text : ''
  const parsed = parseJsonFromAI(raw)

  if (parsed.skip) {
    return { skip: true }
  }

  return {
    skip: false,
    data: {
      brief: typeof parsed.data?.brief === 'string' ? parsed.data.brief : '',
      angle: typeof parsed.data?.angle === 'string' ? parsed.data.angle : '',
      sources: Array.isArray(parsed.data?.sources)
        ? parsed.data.sources.map((s: unknown): SourceRef => {
            if (typeof s === 'string') return { url: s, label: s }
            if (s && typeof s === 'object' && 'url' in s) {
              const obj = s as Record<string, unknown>
              return {
                url: typeof obj.url === 'string' ? obj.url : '',
                label: typeof obj.label === 'string' ? obj.label : (typeof obj.url === 'string' ? obj.url : ''),
              }
            }
            return { url: '', label: '' }
          }).filter((s) => s.url)
        : perplexity.citations.map((url) => ({ url, label: url })),
      topicsToAvoid: Array.isArray(parsed.data?.topicsToAvoid)
        ? parsed.data.topicsToAvoid.filter((t: unknown) => typeof t === 'string')
        : [],
      isBreaking: parsed.data?.isBreaking === true,
    },
  }
}

function buildSearchQuery(input: ResearcherInput): string {
  const tags = input.topicTags.join(', ')
  let query = `Latest developments and news about ${input.snipperDescription}. Topics: ${tags}. Focus on the most significant events from the last 24-48 hours. Include specific facts, numbers, and expert opinions.`

  if (input.recentPostHooks.length > 0) {
    query += ` IMPORTANT: Do NOT cover these topics that were already written about: ${input.recentPostHooks.join(' | ')}. Find a DIFFERENT story or angle.`
  }

  return query
}
