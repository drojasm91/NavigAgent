export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserTier = 'beta' | 'free' | 'paid'
export type UserAgentType = 'news' | 'learning' | 'recommendation'
export type Cadence = 'daily' | 'weekly'
export type PostType = 'thread' | 'card'
export type SignalType = 'like' | 'skip' | 'read_full' | 'asked_question' | 'rabbit_hole_entered'
export type JobStatus = 'pending' | 'running' | 'completed' | 'failed'

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          avatar_url: string | null
          tier: UserTier
          location: string | null
          created_at: string
          last_active_at: string | null
        }
        Insert: {
          id?: string
          email: string
          name: string
          avatar_url?: string | null
          tier?: UserTier
          location?: string | null
          created_at?: string
          last_active_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          name?: string
          avatar_url?: string | null
          tier?: UserTier
          location?: string | null
          created_at?: string
          last_active_at?: string | null
        }
      }
      user_agents: {
        Row: {
          id: string
          owner_id: string
          name: string
          type: UserAgentType
          description: string
          topic_tags: string[]
          prompt_config: Json
          cadence: Cadence
          cadence_time: string | null
          is_public: boolean
          is_active: boolean
          last_run_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          name: string
          type: UserAgentType
          description: string
          topic_tags?: string[]
          prompt_config?: Json
          cadence?: Cadence
          cadence_time?: string | null
          is_public?: boolean
          is_active?: boolean
          last_run_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          name?: string
          type?: UserAgentType
          description?: string
          topic_tags?: string[]
          prompt_config?: Json
          cadence?: Cadence
          cadence_time?: string | null
          is_public?: boolean
          is_active?: boolean
          last_run_at?: string | null
          created_at?: string
        }
      }
      user_agent_subscriptions: {
        Row: {
          id: string
          user_id: string
          agent_id: string
          curriculum_pointer: number
          subscribed_at: string
        }
        Insert: {
          id?: string
          user_id: string
          agent_id: string
          curriculum_pointer?: number
          subscribed_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          agent_id?: string
          curriculum_pointer?: number
          subscribed_at?: string
        }
      }
      posts: {
        Row: {
          id: string
          agent_id: string
          type: PostType
          curriculum_position: number | null
          metadata: Json | null
          quality_score: number | null
          created_at: string
        }
        Insert: {
          id?: string
          agent_id: string
          type: PostType
          curriculum_position?: number | null
          metadata?: Json | null
          quality_score?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          agent_id?: string
          type?: PostType
          curriculum_position?: number | null
          metadata?: Json | null
          quality_score?: number | null
          created_at?: string
        }
      }
      sub_posts: {
        Row: {
          id: string
          post_id: string
          position: number
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          position: number
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          position?: number
          content?: string
          created_at?: string
        }
      }
      likes: {
        Row: {
          id: string
          user_id: string
          post_id: string
          signal_type: SignalType
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          post_id: string
          signal_type: SignalType
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          post_id?: string
          signal_type?: SignalType
          created_at?: string
        }
      }
      jobs: {
        Row: {
          id: string
          agent_id: string
          status: JobStatus
          triggered_at: string
          completed_at: string | null
          error: string | null
        }
        Insert: {
          id?: string
          agent_id: string
          status?: JobStatus
          triggered_at?: string
          completed_at?: string | null
          error?: string | null
        }
        Update: {
          id?: string
          agent_id?: string
          status?: JobStatus
          triggered_at?: string
          completed_at?: string | null
          error?: string | null
        }
      }
    }
  }
}
