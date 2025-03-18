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
  username?: string;
}

// Define bucket name in one place for easy changes
const RECIPE_IMAGES_BUCKET = 'recipe-images';

export const recipeService = {
  /**
   * Upload an image for a recipe
   */
  async uploadRecipeImage(file: File) {
    try {
      // Create a unique file path for the recipe image
      const filePath = `${Date.now()}_${Math.random().toString(36).substring(2)}`;
      
      // Upload the file to Supabase Storage
      const { data, error } = await supabase.storage
        .from(RECIPE_IMAGES_BUCKET)
        .upload(filePath, file, {
          upsert: true,
          cacheControl: '3600'
        });
      
      if (error) {
        console.error('Recipe image upload error:', error);
        throw error;
      }
      
      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from(RECIPE_IMAGES_BUCKET)
        .getPublicUrl(filePath);
      
      return { publicUrl };
    } catch (error) {
      console.error('Recipe image upload error:', {
        bucket: RECIPE_IMAGES_BUCKET,
        error: error instanceof Error ? error.message : error
      });
      throw error;
    }
  },
  
  /**
   * Create a new recipe in the database
   */
  async createRecipe(recipe: Omit<Recipe, 'id' | 'user_id' | 'created_at' | 'username'>) {
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
    // First, get all recipes
    const { data: recipes, error } = await supabase
      .from('recipes')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      return { data: null, error };
    }
    
    // If we have recipes, fetch usernames for each recipe
    if (recipes && recipes.length > 0) {
      // Get unique user IDs from recipes
      const userIds = [...new Set(recipes.map(recipe => recipe.user_id))];
      
      // Fetch profiles for these users
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username')
        .in('id', userIds);
        
      if (!profilesError && profiles) {
        // Create a map of user_id -> username
        const usernameMap = profiles.reduce((map, profile) => {
          map[profile.id] = profile.username;
          return map;
        }, {} as Record<string, string>);
        
        // Add username to each recipe
        const recipesWithUsernames = recipes.map(recipe => ({
          ...recipe,
          username: usernameMap[recipe.user_id] || null
        }));
        
        return { data: recipesWithUsernames, error: null };
      }
    }
    
    return { data: recipes, error };
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
    
    // First, get user's recipes
    const { data: recipes, error } = await supabase
      .from('recipes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
      
    if (error) {
      return { data: null, error };
    }
    
    // If we have recipes, fetch username for the user
    if (recipes && recipes.length > 0) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', userId)
        .single();
        
      if (!profileError && profile) {
        // Add username to each recipe
        const recipesWithUsername = recipes.map(recipe => ({
          ...recipe,
          username: profile.username
        }));
        
        return { data: recipesWithUsername, error: null };
      }
    }
    
    return { data: recipes, error };
  },
  
  /**
   * Get a single recipe by ID
   */
  async getRecipe(id: string) {
    // Get the recipe
    const { data: recipe, error } = await supabase
      .from('recipes')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error || !recipe) {
      return { data: recipe, error };
    }
    
    // Get the username
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', recipe.user_id)
      .single();
      
    if (!profileError && profile) {
      // Add username to the recipe
      const recipeWithUsername = {
        ...recipe,
        username: profile.username
      };
      
      return { data: recipeWithUsername, error: null };
    }
    
    return { data: recipe, error: null };
  },
  
  /**
   * Update an existing recipe
   */
  async updateRecipe(id: string, recipe: Partial<Omit<Recipe, 'id' | 'user_id' | 'created_at' | 'username'>>) {
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