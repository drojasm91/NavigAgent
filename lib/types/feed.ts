import type { PostType, SnipperType, Json } from './database'

export interface FeedSubPost {
  id: string
  post_id: string
  position: number
  content: string
  created_at: string
}

export interface FeedSnipper {
  id: string
  name: string
  type: SnipperType
  owner_id: string
  is_public: boolean
  topic_tags: string[]
  description?: string
  created_at?: string
}

export interface FeedPost {
  id: string
  snipper_id: string
  type: PostType
  curriculum_position: number | null
  metadata: Json | null
  quality_score: number | null
  created_at: string
  sub_posts: FeedSubPost[]
  snippers: FeedSnipper
  is_community: boolean
}
