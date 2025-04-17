import express from 'express';
import { supabaseAdmin } from '../lib/supabase.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

// Get all bookmarks for the authenticated user
router.get('/', authenticateUser, async (req, res) => {
  try {
    const { data: bookmarks, error } = await supabaseAdmin
      .from('recipe_bookmarks')
      .select('recipe_id, recipes(*)')
      .eq('user_id', req.user.id);
    
    if (error) throw error;
    
    // Format the response to return just the recipes
    const formattedBookmarks = bookmarks?.map(bookmark => bookmark.recipes) || [];
    
    res.json(formattedBookmarks);
  } catch (error) {
    console.error('Error fetching bookmarks:', error);
    res.status(500).json({ error: 'Failed to fetch bookmarks' });
  }
});

// Toggle bookmark status for a recipe
router.post('/toggle', authenticateUser, async (req, res) => {
  try {
    const { recipeId } = req.body;
    
    if (!recipeId) {
      return res.status(400).json({ error: 'Recipe ID is required' });
    }
    
    // Check if the bookmark already exists
    const { data: existingBookmark, error: checkError } = await supabaseAdmin
      .from('recipe_bookmarks')
      .select('id')
      .eq('user_id', req.user.id)
      .eq('recipe_id', recipeId)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }
    
    let result;
    
    // If bookmark exists, remove it; otherwise add it
    if (existingBookmark) {
      result = await supabaseAdmin
        .from('recipe_bookmarks')
        .delete()
        .eq('id', existingBookmark.id);
        
      if (result.error) throw result.error;
      
      res.json({ bookmarked: false, message: 'Bookmark removed' });
    } else {
      result = await supabaseAdmin
        .from('recipe_bookmarks')
        .insert({
          user_id: req.user.id,
          recipe_id: recipeId,
        });
        
      if (result.error) throw result.error;
      
      res.json({ bookmarked: true, message: 'Recipe bookmarked' });
    }
  } catch (error) {
    console.error('Error toggling bookmark:', error);
    res.status(500).json({ error: 'Failed to toggle bookmark status' });
  }
});

export default router; 