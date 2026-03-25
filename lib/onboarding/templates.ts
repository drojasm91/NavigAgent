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
    description: 'News, markets, industry trends, AI, crypto, sports, geopolitics',
  },
  {
    id: 'learn',
    emoji: '\u{1F9E0}',
    label: 'Learn new things',
    description: 'History, science, vibe coding, how things work',
  },
  {
    id: 'live_better',
    emoji: '\u2728',
    label: 'Get recommendations',
    description: 'Restaurants, events, what to watch',
  },
  {
    id: 'think_deeper',
    emoji: '\u{1F4A1}',
    label: 'Get deep insights',
    description: 'Books, philosophy, great minds',
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
  // Get deep insights
  {
    id: 'book-shelf',
    vibeId: 'think_deeper',
    emoji: '\u{1F4DA}',
    name: 'The Book Shelf',
    description: 'One book worth reading, why it matters, and the key ideas — delivered as a thread.',
    type: 'learning',
    topicTags: ['books', 'ideas', 'reading'],
  },
  {
    id: 'great-minds',
    vibeId: 'think_deeper',
    emoji: '\u{1F9D0}',
    name: 'Great Minds Daily',
    description: 'One thinker, one idea, one shift in how you see the world.',
    type: 'learning',
    topicTags: ['philosophy', 'thinkers', 'ideas'],
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
