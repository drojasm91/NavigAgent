import type { Json, UserAgentType } from '@/lib/types'

// --- Researcher ---

export interface ResearcherInput {
  agentName: string
  agentDescription: string
  agentType: UserAgentType
  topicTags: string[]
  promptConfig: Json
  recentPostHooks: string[] // empty during creation
}

export interface SourceRef {
  url: string
  label: string
}

export interface ResearchBrief {
  brief: string
  angle: string
  sources: SourceRef[]
  topicsToAvoid: string[]
  isBreaking: boolean
}

export interface ResearcherOutput {
  skip: boolean
  data?: ResearchBrief
}

// --- Writer ---

export interface WriterInput {
  agentName: string
  agentDescription: string
  agentType: UserAgentType
  topicTags: string[]
  promptConfig: Json
  researchBrief: ResearchBrief
}

export interface WriterSubPost {
  position: number
  content: string
}

export interface WriterOutput {
  subPosts: WriterSubPost[]
  qualityScore: number
  sources?: SourceRef[]
}
