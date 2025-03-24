import { supabase } from '../lib/supabase';
import { Recipe } from './recipeService';

export interface BookmarkWithRecipe {
  id: string;
  user_id: string;
  recipe_id: string;
  created_at: string;
  recipe: Recipe;
}

export const bookmarkService = {
  /**
   * Toggle a bookmark for a recipe - add if it doesn't exist, remove if it does
   */
  async toggleBookmark(recipeId: string) {
    const user = supabase.auth.getUser();
    const userId = (await user).data.user?.id;
    
    if (!userId) {
      return { error: { message: 'You must be logged in to bookmark recipes' }, data: null };
    }
    
    // Check if bookmark already exists
    const { data: existingBookmark, error: checkError } = await supabase
      .from('bookmarks')
      .select('*')
      .eq('user_id', userId)
      .eq('recipe_id', recipeId)
      .maybeSingle();
    
    if (checkError) {
      return { error: checkError, data: null };
    }
    
    // If bookmark exists, delete it; otherwise, create it
    if (existingBookmark) {
      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('id', existingBookmark.id);
        
      return { 
        data: { bookmarked: false }, 
        error 
      };
    } else {
      const { data, error } = await supabase
        .from('bookmarks')
        .insert({
          user_id: userId,
          recipe_id: recipeId
        })
        .select()
        .single();
        
      return { 
        data: { bookmarked: true, bookmark: data }, 
        error 
      };
    }
  },
  
  /**
   * Check if a recipe is bookmarked by the current user
   */
  async isBookmarked(recipeId: string) {
    const user = supabase.auth.getUser();
    const userId = (await user).data.user?.id;
    
    if (!userId) {
      return { bookmarked: false };
    }
    
    const { data, error } = await supabase
      .from('bookmarks')
      .select('*')
      .eq('user_id', userId)
      .eq('recipe_id', recipeId)
      .maybeSingle();
      
    if (error) {
      console.error('Error checking bookmark status:', error);
      return { bookmarked: false };
    }
    
    return { bookmarked: !!data };
  },
  
  /**
   * Get all bookmarked recipes for the current user
   */
  async getBookmarkedRecipes() {
    const user = supabase.auth.getUser();
    const userId = (await user).data.user?.id;
    
    if (!userId) {
      return { error: { message: 'You must be logged in to view bookmarked recipes' }, data: null };
    }
    
    // Get bookmarks with the associated recipes and user profiles
    const { data, error } = await supabase
      .from('bookmarks')
      .select(`
        *,
        recipe:recipes(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
      
    if (error) {
      return { data: null, error };
    }
    
    if (!data || data.length === 0) {
      return { data: [], error: null };
    }
    
    // Get unique user IDs from the recipes
    const userIds = [...new Set(data.map(bookmark => bookmark.recipe.user_id))];
    
    // Fetch all usernames in a single query
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, username')
      .in('id', userIds);
      
    if (profilesError) {
      console.error('Error fetching usernames:', profilesError);
      return { data, error: null };
    }
    
    // Create a map of user_id -> username for efficient lookup
    const usernameMap = profiles?.reduce((map, profile) => {
      map[profile.id] = profile.username;
      return map;
    }, {} as {[key: string]: string}) || {};
    
    // Add username to each recipe
    const bookmarksWithUsernames = data.map(bookmark => ({
      ...bookmark,
      recipe: {
        ...bookmark.recipe,
        username: usernameMap[bookmark.recipe.user_id] || 'Unknown User'
      }
    }));
    
    return { data: bookmarksWithUsernames, error: null };
  }
}; 