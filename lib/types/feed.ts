import type { PostType, UserAgentType, Json } from './database'

export interface FeedSubPost {
  id: string
  post_id: string
  position: number
  content: string
  created_at: string
}

export interface FeedAgent {
  id: string
  name: string
  type: UserAgentType
  owner_id: string
  is_public: boolean
  topic_tags: string[]
}

export interface FeedPost {
  id: string
  agent_id: string
  type: PostType
  curriculum_position: number | null
  metadata: Json | null
  quality_score: number | null
  created_at: string
  sub_posts: FeedSubPost[]
  user_agents: FeedAgent
  is_community: boolean
}
