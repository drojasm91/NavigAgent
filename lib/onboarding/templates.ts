import type { UserAgentType } from '@/lib/types'

export interface VibeOption {
  id: string
  emoji: string
  label: string
  description: string
}

export interface AgentTemplate {
  id: string
  vibeId: string
  emoji: string
  name: string
  description: string
  type: UserAgentType
  topicTags: string[]
}

export const VIBES: VibeOption[] = [
  {
    id: 'stay_informed',
    emoji: '\u{1F4E1}',
    label: 'Stay informed',
    description: 'News, markets, industry trends, sports',
  },
  {
    id: 'learn',
    emoji: '\u{1F9E0}',
    label: 'Learn new things',
    description: 'History, science, how things work',
  },
  {
    id: 'live_better',
    emoji: '\u2728',
    label: 'Live better',
    description: 'Restaurants, events, what to watch',
  },
  {
    id: 'think_deeper',
    emoji: '\u{1F50D}',
    label: 'Think deeper',
    description: 'Contrarian takes, ethics, geopolitics',
  },
  {
    id: 'build',
    emoji: '\u{1F6E0}',
    label: 'Build stuff',
    description: 'Prompts, no-code, creator economy',
  },
]

export const AGENT_TEMPLATES: AgentTemplate[] = [
  // Stay informed
  {
    id: 'geopolitics-wire',
    vibeId: 'stay_informed',
    emoji: '\u{1F30D}',
    name: 'The Geopolitics Wire',
    description: 'Daily briefings on power shifts, alliances, and flashpoints shaping the world.',
    type: 'news',
    topicTags: ['geopolitics', 'world-affairs', 'diplomacy'],
  },
  {
    id: 'crypto-pulse',
    vibeId: 'stay_informed',
    emoji: '\u{1F4B0}',
    name: 'Crypto Pulse',
    description: 'Market moves, protocol updates, and the signals that actually matter in web3.',
    type: 'news',
    topicTags: ['crypto', 'web3', 'defi'],
  },
  // Learn new things
  {
    id: 'how-things-work',
    vibeId: 'learn',
    emoji: '\u2699\uFE0F',
    name: 'How Things Actually Work',
    description: 'From jet engines to the internet — one mechanism explained brilliantly per day.',
    type: 'learning',
    topicTags: ['engineering', 'science', 'explainers'],
  },
  {
    id: 'history-rabbit-holes',
    vibeId: 'learn',
    emoji: '\u{1F3DB}\uFE0F',
    name: "History's Rabbit Holes",
    description: 'The strange, surprising stories your history teacher never told you.',
    type: 'learning',
    topicTags: ['history', 'culture', 'stories'],
  },
  // Live better
  {
    id: 'hidden-gems',
    vibeId: 'live_better',
    emoji: '\u{1F37D}\uFE0F',
    name: 'Hidden Gems',
    description: 'Restaurants, bars, and spots worth the trip — curated by someone who gets it.',
    type: 'recommendation',
    topicTags: ['restaurants', 'food', 'local'],
  },
  {
    id: 'what-to-watch',
    vibeId: 'live_better',
    emoji: '\u{1F3AC}',
    name: 'What to Watch Tonight',
    description: 'One perfect pick for your mood — movies, series, docs, no endless scrolling.',
    type: 'recommendation',
    topicTags: ['movies', 'streaming', 'entertainment'],
  },
  // Think deeper
  {
    id: 'contrarian-wire',
    vibeId: 'think_deeper',
    emoji: '\u{1F504}',
    name: 'The Contrarian Wire',
    description: 'The strongest argument against what everyone believes. Updated daily.',
    type: 'news',
    topicTags: ['contrarian', 'economics', 'analysis'],
  },
  {
    id: 'ethics-lab',
    vibeId: 'think_deeper',
    emoji: '\u2696\uFE0F',
    name: 'The Ethics Lab',
    description: 'Real dilemmas with no easy answers. Think before you pick a side.',
    type: 'news',
    topicTags: ['ethics', 'philosophy', 'society'],
  },
  // Build stuff
  {
    id: 'prompt-craft',
    vibeId: 'build',
    emoji: '\u{1F4AC}',
    name: 'Prompt Craft',
    description: 'One prompt technique per day that makes AI do what you actually want.',
    type: 'learning',
    topicTags: ['prompt-engineering', 'ai', 'tools'],
  },
  {
    id: 'no-code-builder',
    vibeId: 'build',
    emoji: '\u{1F9E9}',
    name: 'No-Code Builder',
    description: 'Ship real products without writing code. New trick every day.',
    type: 'learning',
    topicTags: ['no-code', 'tools', 'automation'],
  },
]

export function getTemplatesForVibes(selectedVibeIds: string[]): AgentTemplate[] {
  const templates: AgentTemplate[] = []
  for (const vibeId of selectedVibeIds) {
    const matching = AGENT_TEMPLATES.filter((t) => t.vibeId === vibeId)
    templates.push(...matching.slice(0, 2))
    if (templates.length >= 8) break
  }
  return templates.slice(0, 8)
}

export function countAgentsForVibes(selectedVibeIds: string[]): number {
  return getTemplatesForVibes(selectedVibeIds).length
}
