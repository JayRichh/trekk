export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          display_name: string | null
          avatar_url: string | null
          bio: string | null
          favorite_trails: string[] | null
          completed_trails: string[] | null
          planned_trails: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          display_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          favorite_trails?: string[] | null
          completed_trails?: string[] | null
          planned_trails?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          display_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          favorite_trails?: string[] | null
          completed_trails?: string[] | null
          planned_trails?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      trail_ratings: {
        Row: {
          id: string
          created_at: string
          user_id: string
          trail_id: string
          rating: number
          comment: string | null
          photos: string[] | null
          tips: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          trail_id: string
          rating: number
          comment?: string | null
          photos?: string[] | null
          tips?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          trail_id?: string
          rating?: number
          comment?: string | null
          photos?: string[] | null
          tips?: string | null
        }
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
  }
}
