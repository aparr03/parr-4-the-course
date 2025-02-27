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
      recipes: {
        Row: {
          id: string
          created_at: string
          title: string
          description: string | null
          instructions: string
          ingredients: string[]
          cooking_time: number
          servings: number
          image_url: string | null
          user_id: string
          category: string | null
          tags: string[] | null
        }
        Insert: {
          id?: string
          created_at?: string
          title?: string
          description?: string | null
          instructions: string
          ingredients: string[]
          cooking_time: number
          servings: number
          image_url?: string | null
          user_id: string
          category?: string | null
          tags?: string[] | null
        }
        Update: {
          id?: string
          created_at?: string
          title?: string
          description?: string | null
          instructions?: string
          ingredients?: string[]
          cooking_time?: number
          servings?: number
          image_url?: string | null
          user_id?: string
          category?: string | null
          tags?: string[] | null
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
