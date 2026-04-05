export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserTier = 'beta' | 'free' | 'paid'
export type SnipperType = 'news' | 'learning' | 'recommendation'
export type Cadence = 'daily' | 'weekly'
export type PostType = 'thread' | 'card'
export type SignalType = 'like' | 'skip' | 'read_full' | 'asked_question' | 'rabbit_hole_entered'
export type JobStatus = 'pending' | 'running' | 'completed' | 'failed'
export type SnipperDepth = 'high_level' | 'balanced' | 'deep'

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
          onboarding_completed: boolean
          vibes: string[]
          topics: string[]
          free_text: string
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
          onboarding_completed?: boolean
          vibes?: string[]
          topics?: string[]
          free_text?: string
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
          onboarding_completed?: boolean
          vibes?: string[]
          topics?: string[]
          free_text?: string
        }
        Relationships: []
      }
      snippers: {
        Row: {
          id: string
          owner_id: string
          name: string
          type: SnipperType
          depth: SnipperDepth
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
          type: SnipperType
          depth?: SnipperDepth
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
          type?: SnipperType
          depth?: SnipperDepth
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
        Relationships: []
      }
      snipper_subscriptions: {
        Row: {
          id: string
          user_id: string
          snipper_id: string
          curriculum_pointer: number
          subscribed_at: string
        }
        Insert: {
          id?: string
          user_id: string
          snipper_id: string
          curriculum_pointer?: number
          subscribed_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          snipper_id?: string
          curriculum_pointer?: number
          subscribed_at?: string
        }
        Relationships: []
      }
      posts: {
        Row: {
          id: string
          snipper_id: string
          type: PostType
          curriculum_position: number | null
          metadata: Json | null
          quality_score: number | null
          created_at: string
        }
        Insert: {
          id?: string
          snipper_id: string
          type: PostType
          curriculum_position?: number | null
          metadata?: Json | null
          quality_score?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          snipper_id?: string
          type?: PostType
          curriculum_position?: number | null
          metadata?: Json | null
          quality_score?: number | null
          created_at?: string
        }
        Relationships: []
      }
      sub_posts: {
        Row: {
          id: string
          post_id: string
          position: number
          content: string
          conversation_count: number
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          position: number
          content: string
          conversation_count?: number
          created_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          position?: number
          content?: string
          conversation_count?: number
          created_at?: string
        }
        Relationships: []
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
        Relationships: []
      }
      jobs: {
        Row: {
          id: string
          snipper_id: string
          status: JobStatus
          triggered_at: string
          completed_at: string | null
          error: string | null
        }
        Insert: {
          id?: string
          snipper_id: string
          status?: JobStatus
          triggered_at?: string
          completed_at?: string | null
          error?: string | null
        }
        Update: {
          id?: string
          snipper_id?: string
          status?: JobStatus
          triggered_at?: string
          completed_at?: string | null
          error?: string | null
        }
        Relationships: []
      }
      conversation_summaries: {
        Row: {
          id: string
          sub_post_id: string
          post_id: string
          user_id: string
          question: string
          key_insights: string[]
          created_at: string
        }
        Insert: {
          id?: string
          sub_post_id: string
          post_id: string
          user_id: string
          question: string
          key_insights: string[]
          created_at?: string
        }
        Update: {
          id?: string
          sub_post_id?: string
          post_id?: string
          user_id?: string
          question?: string
          key_insights?: string[]
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
