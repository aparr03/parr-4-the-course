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
          username: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      recipes: {
        Row: {
          id: string
          title: string
          description: string | null
          instructions: string
          cook_time_minutes: number | null
          prep_time_minutes: number | null
          servings: number | null
          image_url: string | null
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          instructions: string
          cook_time_minutes?: number | null
          prep_time_minutes?: number | null
          servings?: number | null
          image_url?: string | null
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          instructions?: string
          cook_time_minutes?: number | null
          prep_time_minutes?: number | null
          servings?: number | null
          image_url?: string | null
          user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      ingredients: {
        Row: {
          id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
        }
      }
      recipe_ingredients: {
        Row: {
          id: string
          recipe_id: string
          ingredient_id: string
          quantity: string
          unit: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          recipe_id: string
          ingredient_id: string
          quantity: string
          unit?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          recipe_id?: string
          ingredient_id?: string
          quantity?: string
          unit?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
        }
      }
      recipe_categories: {
        Row: {
          id: string
          recipe_id: string
          category_id: string
          created_at: string
        }
        Insert: {
          id?: string
          recipe_id: string
          category_id: string
          created_at?: string
        }
        Update: {
          id?: string
          recipe_id?: string
          category_id?: string
          created_at?: string
        }
      }
      favorites: {
        Row: {
          id: string
          user_id: string
          recipe_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          recipe_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          recipe_id?: string
          created_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          content: string
          user_id: string
          recipe_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          content: string
          user_id: string
          recipe_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          content?: string
          user_id?: string
          recipe_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      ratings: {
        Row: {
          id: string
          rating: number
          user_id: string
          recipe_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          rating: number
          user_id: string
          recipe_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          rating?: number
          user_id?: string
          recipe_id?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_recipe_average_rating: {
        Args: {
          recipe_id: string
        }
        Returns: number
      }
    }
  }
}
