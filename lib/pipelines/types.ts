import type { Json, SnipperType } from '@/lib/types'

// --- Researcher ---

export interface ResearcherInput {
  snipperName: string
  snipperDescription: string
  snipperType: SnipperType
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
  snipperName: string
  snipperDescription: string
  snipperType: SnipperType
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
