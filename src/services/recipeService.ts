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
  tags?: string[];
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
      const { error } = await supabase.storage
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
    
    // Extract tags from the recipe object
    const { tags, ...recipeData } = recipe;
    
    // First, create the recipe
    const { data: newRecipe, error } = await supabase
      .from('recipes')
      .insert({
        ...recipeData,
        user_id: userId
      })
      .select()
      .single();
      
    if (error || !newRecipe) {
      return { error, data: null };
    }
    
    // If there are tags, save them
    if (tags && tags.length > 0) {
      await this.updateRecipeTags(newRecipe.id, tags);
    }
    
    return { data: { ...newRecipe, tags }, error: null };
  },
  
  /**
   * Get all recipes
   * If isAdmin is true, returns all recipes without limit
   */
  async getAllRecipes(isAdmin = false) {
    try {
      // Query recipes table
      let query = supabase
        .from('recipes')
        .select('*')
        .order('created_at', { ascending: false });
        
      // Apply limit for non-admin users
      if (!isAdmin) {
        query = query.limit(50);
      }
      
      const { data: recipes, error } = await query;
      
      if (error) {
        return { data: null, error };
      }
      
      if (!recipes || recipes.length === 0) {
        return { data: [], error: null };
      }
      
      // Get usernames and tags for recipes
      const recipesWithUsernamesAndTags = await this.enrichRecipesWithUsernamesAndTags(recipes);
      
      return { data: recipesWithUsernamesAndTags, error: null };
    } catch (error) {
      console.error('Error fetching recipes:', error);
      return { 
        data: null, 
        error: error instanceof Error ? error : new Error('An unexpected error occurred') 
      };
    }
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
      
    // Get tags for the recipe
    const { data: recipeTags, error: tagsError } = await supabase
      .from('recipe_tags')
      .select('tag')
      .eq('recipe_id', id);
      
    if (tagsError) {
      console.error('Error fetching recipe tags:', tagsError);
    }
    
    // Create recipe with username and tags
    const recipeWithUsernameAndTags = {
      ...recipe,
      username: profileError ? undefined : profile.username,
      tags: tagsError ? [] : recipeTags.map(rt => rt.tag)
    };
    
    return { data: recipeWithUsernameAndTags, error: null };
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
    
    // Extract tags from the recipe object
    const { tags, ...recipeData } = recipe;
    
    // Update the recipe
    const { data: updatedRecipe, error } = await supabase
      .from('recipes')
      .update(recipeData)
      .eq('id', id)
      .select()
      .single();
      
    if (error) {
      return { error, data: null };
    }
    
    // If tags were provided, update them
    if (tags !== undefined) {
      await this.updateRecipeTags(id, tags);
    }
    
    return { data: { ...updatedRecipe, tags }, error: null };
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
  },

  /**
   * Update tags for a recipe
   */
  async updateRecipeTags(recipeId: string, tags: string[]) {
    try {
      // First, remove all existing tags for this recipe
      const { error: deleteError } = await supabase
        .from('recipe_tags')
        .delete()
        .eq('recipe_id', recipeId);
        
      if (deleteError) {
        console.error('Error removing existing tags:', deleteError);
        return { success: false, error: deleteError };
      }
      
      // If there are no new tags, we're done
      if (!tags || tags.length === 0) {
        return { success: true, error: null };
      }
      
      // Create tag objects for insert
      const tagObjects = tags.map(tag => ({
        recipe_id: recipeId,
        tag: tag.trim().toLowerCase()
      }));
      
      // Insert new tags
      const { error: insertError } = await supabase
        .from('recipe_tags')
        .insert(tagObjects);
        
      if (insertError) {
        console.error('Error inserting new tags:', insertError);
        return { success: false, error: insertError };
      }
      
      return { success: true, error: null };
    } catch (error) {
      console.error('Error updating recipe tags:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error : new Error('An unexpected error occurred') 
      };
    }
  },

  /**
   * Get all available tags
   */
  async getAllTags() {
    try {
      const { data, error } = await supabase
        .from('recipe_tags')
        .select('tag')
        .order('tag');
        
      if (error) {
        return { data: null, error };
      }
      
      // Extract unique tags
      const uniqueTags = [...new Set(data.map(t => t.tag))];
      
      return { data: uniqueTags, error: null };
    } catch (error) {
      console.error('Error fetching tags:', error);
      return { 
        data: null, 
        error: error instanceof Error ? error : new Error('An unexpected error occurred') 
      };
    }
  },

  /**
   * Helper function to add usernames and tags to a list of recipes
   */
  async enrichRecipesWithUsernamesAndTags(recipes: Recipe[]) {
    // Get unique user IDs
    const userIds = [...new Set(recipes.map(recipe => recipe.user_id))];
    
    // Fetch all usernames in a single query
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, username')
      .in('id', userIds);
      
    // Create a map of user_id -> username for efficient lookup
    const usernameMap = profiles && !profilesError
      ? profiles.reduce((map, profile) => {
          map[profile.id] = profile.username;
          return map;
        }, {} as {[key: string]: string})
      : {};
    
    // Get recipe IDs
    const recipeIds = recipes.map(recipe => recipe.id);
    
    // Fetch all tags for these recipes
    const { data: recipeTags, error: tagsError } = await supabase
      .from('recipe_tags')
      .select('recipe_id, tag')
      .in('recipe_id', recipeIds);
    
    // Create a map of recipe_id -> tags for efficient lookup
    const tagsMap = recipeTags && !tagsError
      ? recipeTags.reduce((map, { recipe_id, tag }) => {
          if (!map[recipe_id]) {
            map[recipe_id] = [];
          }
          map[recipe_id].push(tag);
          return map;
        }, {} as {[key: string]: string[]})
      : {};
    
    // Add username and tags to each recipe
    return recipes.map(recipe => ({
      ...recipe,
      username: usernameMap ? usernameMap[recipe.user_id] || 'Unknown User' : 'Unknown User',
      tags: tagsMap ? tagsMap[recipe.id] || [] : []
    }));
  }
}; 