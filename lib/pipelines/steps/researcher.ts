// Step 1 — Research & Plan (Perplexity + Claude Haiku)
// Pure function: no DB access, no side effects

import Anthropic from '@anthropic-ai/sdk'
import { queryPerplexity } from '@/lib/perplexity'
import { NEWS_RESEARCHER_PROMPT } from '@/lib/prompts'
import { parseJsonFromAI } from '@/lib/utils'
import type { ResearcherInput, ResearcherOutput } from '@/lib/pipelines/types'

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
    agentName: input.agentName,
    agentDescription: input.agentDescription,
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
  const parsed = parseJsonFromAI(raw) as Record<string, unknown>

  if (parsed.skip) {
    return { skip: true }
  }

  return {
    skip: false,
    data: {
      brief: typeof parsed.data?.brief === 'string' ? parsed.data.brief : '',
      angle: typeof parsed.data?.angle === 'string' ? parsed.data.angle : '',
      sources: Array.isArray(parsed.data?.sources)
        ? parsed.data.sources.filter((s: unknown) => typeof s === 'string')
        : perplexity.citations,
      topicsToAvoid: Array.isArray(parsed.data?.topicsToAvoid)
        ? parsed.data.topicsToAvoid.filter((t: unknown) => typeof t === 'string')
        : [],
      isBreaking: parsed.data?.isBreaking === true,
    },
  }
}

function buildSearchQuery(input: ResearcherInput): string {
  const tags = input.topicTags.join(', ')
  return `Latest developments and news about ${input.agentDescription}. Topics: ${tags}. Focus on the most significant events from the last 24-48 hours. Include specific facts, numbers, and expert opinions.`
}
