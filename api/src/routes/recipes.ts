import express from 'express';
import { supabaseAdmin, getSupabaseClient } from '../lib/supabase.js';
import { authenticateUser, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Get all recipes (public endpoint with optional auth for personalization)
router.get('/', optionalAuth, async (req, res) => {
  try {
    let query = supabaseAdmin
      .from('recipes')
      .select('*')
      .order('created_at', { ascending: false });
    
    // If user is not authenticated, only show public recipes
    if (!req.user) {
      // Apply visibility filter separately to avoid TypeScript error
      const { data, error } = await query.eq('visibility', 'public');
      
      if (error) throw error;
      
      // Enhance recipes with user data, likes, etc.
      const enhancedRecipes = await enhanceRecipesWithMetadata(data || []);
      
      return res.json(enhancedRecipes);
    }
    
    // User is authenticated, get all recipes
    const { data, error } = await query;
    
    if (error) throw error;
    
    // Enhance recipes with user data, likes, etc.
    const enhancedRecipes = await enhanceRecipesWithMetadata(data || []);
    
    res.json(enhancedRecipes);
  } catch (error) {
    console.error('Error fetching recipes:', error);
    res.status(500).json({ error: 'Failed to fetch recipes' });
  }
});

// Get a recipe by ID
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Build the query in stages to avoid TypeScript errors
    let query = supabaseAdmin
      .from('recipes')
      .select('*')
      .eq('id', id);
    
    // If user is not authenticated, only show public recipes
    if (!req.user) {
      query = query.eq('visibility', 'public');
    }
    
    // Execute the query with single() at the end
    const { data, error } = await query.single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Recipe not found' });
      }
      throw error;
    }
    
    // Enhance the recipe with additional metadata
    const enhancedRecipe = await enhanceRecipeWithMetadata(data);
    
    res.json(enhancedRecipe);
  } catch (error) {
    console.error('Error fetching recipe:', error);
    res.status(500).json({ error: 'Failed to fetch recipe' });
  }
});

// Create a new recipe (requires authentication)
router.post('/', authenticateUser, async (req, res) => {
  try {
    const { title, description, ingredients, instructions, time, servings, tags, visibility } = req.body;
    
    // Basic validation
    if (!title || !ingredients || !instructions) {
      return res.status(400).json({ 
        error: 'Missing required fields. Title, ingredients and instructions are required.' 
      });
    }
    
    // Insert the recipe into the database
    const { data, error } = await supabaseAdmin
      .from('recipes')
      .insert({
        title,
        description,
        ingredients,
        instructions,
        time,
        servings,
        tags,
        visibility: visibility || 'public',
        user_id: req.user.id
      })
      .select()
      .single();
    
    if (error) throw error;
    
    res.status(201).json(data);
  } catch (error) {
    console.error('Error creating recipe:', error);
    res.status(500).json({ error: 'Failed to create recipe' });
  }
});

// Update a recipe (requires authentication and ownership)
router.put('/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Check if the user is the owner of the recipe
    const { data: recipe, error: fetchError } = await supabaseAdmin
      .from('recipes')
      .select('user_id')
      .eq('id', id)
      .single();
    
    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return res.status(404).json({ error: 'Recipe not found' });
      }
      throw fetchError;
    }
    
    if (recipe.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized: You can only update your own recipes' });
    }
    
    // Update the recipe
    const { data, error } = await supabaseAdmin
      .from('recipes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    res.json(data);
  } catch (error) {
    console.error('Error updating recipe:', error);
    res.status(500).json({ error: 'Failed to update recipe' });
  }
});

// Delete a recipe (requires authentication and ownership)
router.delete('/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if the user is the owner of the recipe
    const { data: recipe, error: fetchError } = await supabaseAdmin
      .from('recipes')
      .select('user_id')
      .eq('id', id)
      .single();
    
    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return res.status(404).json({ error: 'Recipe not found' });
      }
      throw fetchError;
    }
    
    if (recipe.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized: You can only delete your own recipes' });
    }
    
    // Delete the recipe
    const { error } = await supabaseAdmin
      .from('recipes')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting recipe:', error);
    res.status(500).json({ error: 'Failed to delete recipe' });
  }
});

// Helper function to enhance recipes with additional metadata
async function enhanceRecipesWithMetadata(recipes: any[]) {
  if (!recipes.length) return [];
  
  // Get user IDs
  const userIds = [...new Set(recipes.map(recipe => recipe.user_id))];
  
  // Fetch profiles for all recipe creators
  const { data: profiles } = await supabaseAdmin
    .from('profiles')
    .select('id, username, avatar_url')
    .in('id', userIds);
  
  // Create a map of user_id -> profile
  const profileMap = (profiles || []).reduce((map, profile) => {
    map[profile.id] = profile;
    return map;
  }, {} as Record<string, any>);
  
  // Enhance each recipe with user data
  return recipes.map(recipe => {
    const profile = profileMap[recipe.user_id] || { username: 'Unknown user' };
    return {
      ...recipe,
      username: profile.username,
      avatar_url: profile.avatar_url
    };
  });
}

// Helper function for a single recipe
async function enhanceRecipeWithMetadata(recipe: any) {
  if (!recipe) return null;
  
  const enhanced = (await enhanceRecipesWithMetadata([recipe]))[0];
  
  // Fetch comments for this recipe
  const { data: comments } = await supabaseAdmin
    .from('recipe_comments')
    .select(`
      id, 
      content, 
      created_at,
      user_id,
      profiles(username, avatar_url)
    `)
    .eq('recipe_id', recipe.id)
    .order('created_at', { ascending: true });
  
  // Fetch like count
  const { count: likesCount } = await supabaseAdmin
    .from('recipe_likes')
    .select('*', { count: 'exact', head: true })
    .eq('recipe_id', recipe.id);
  
  return {
    ...enhanced,
    comments: comments || [],
    likes_count: likesCount || 0
  };
}

export default router; 