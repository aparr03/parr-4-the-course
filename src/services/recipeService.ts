import { supabase } from '../lib/supabase';

// Define Recipe type
export interface Recipe {
  id: string;
  title: string;
  ingredients: string;
  instructions: string;
  time: string;
  servings: string;
  imageUrl?: string;
  user_id: string;
  created_at: string;
}

export const recipeService = {
  /**
   * Create a new recipe in the database
   */
  async createRecipe(recipe: Omit<Recipe, 'id' | 'user_id' | 'created_at'>) {
    const user = supabase.auth.getUser();
    const userId = (await user).data.user?.id;
    
    if (!userId) {
      return { error: { message: 'You must be logged in to create a recipe' }, data: null };
    }
    
    return supabase
      .from('recipes')
      .insert({
        ...recipe,
        user_id: userId
      })
      .select()
      .single();
  },
  
  /**
   * Get all recipes from the database
   */
  async getAllRecipes() {
    return supabase
      .from('recipes')
      .select('*')
      .order('created_at', { ascending: false });
  },
  
  /**
   * Get recipes created by the current user
   */
  async getUserRecipes() {
    const user = supabase.auth.getUser();
    const userId = (await user).data.user?.id;
    
    if (!userId) {
      return { error: { message: 'You must be logged in to view your recipes. Please sign in to see your saved recipes.' }, data: null };
    }
    
    return supabase
      .from('recipes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
  },
  
  /**
   * Get a single recipe by ID
   */
  async getRecipe(id: string) {
    return supabase
      .from('recipes')
      .select('*')
      .eq('id', id)
      .single();
  },
  
  /**
   * Update an existing recipe
   */
  async updateRecipe(id: string, recipe: Partial<Omit<Recipe, 'id' | 'user_id' | 'created_at'>>) {
    const user = supabase.auth.getUser();
    const userId = (await user).data.user?.id;
    
    if (!userId) {
      return { error: { message: 'You must be logged in to update a recipe' }, data: null };
    }
    
    // First check if the user owns this recipe
    const { data: existingRecipe, error: fetchError } = await supabase
      .from('recipes')
      .select('user_id')
      .eq('id', id)
      .single();
    
    if (fetchError) {
      return { error: fetchError, data: null };
    }
    
    if (existingRecipe.user_id !== userId) {
      return { error: { message: 'You can only update your own recipes' }, data: null };
    }
    
    return supabase
      .from('recipes')
      .update(recipe)
      .eq('id', id)
      .select()
      .single();
  },
  
  /**
   * Delete a recipe by ID
   */
  async deleteRecipe(id: string) {
    const user = supabase.auth.getUser();
    const userId = (await user).data.user?.id;
    
    if (!userId) {
      return { error: { message: 'You must be logged in to delete a recipe' }, data: null };
    }
    
    // First check if the user owns this recipe
    const { data: existingRecipe, error: fetchError } = await supabase
      .from('recipes')
      .select('user_id')
      .eq('id', id)
      .single();
    
    if (fetchError) {
      return { error: fetchError, data: null };
    }
    
    if (existingRecipe.user_id !== userId) {
      return { error: { message: 'You can only delete your own recipes' }, data: null };
    }
    
    return supabase
      .from('recipes')
      .delete()
      .eq('id', id);
  }
}; 