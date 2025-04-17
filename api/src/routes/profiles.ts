import express from 'express';
import { supabaseAdmin } from '../lib/supabase.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

// Get profile by user ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select(`
        id,
        username,
        avatar_url,
        bio,
        created_at
      `)
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Profile not found' });
      }
      throw error;
    }
    
    // Get recipes by this user
    const { data: recipes, error: recipesError } = await supabaseAdmin
      .from('recipes')
      .select('*')
      .eq('user_id', id)
      .eq('visibility', 'public')
      .order('created_at', { ascending: false });
    
    if (recipesError) throw recipesError;
    
    res.json({
      ...profile,
      recipes: recipes || []
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update user profile (requires authentication)
router.put('/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if the user is updating their own profile
    if (id !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized: You can only update your own profile' });
    }
    
    const { username, bio } = req.body;
    
    // Validate inputs
    if (username && (username.length < 3 || username.length > 20)) {
      return res.status(400).json({ error: 'Username must be between 3 and 20 characters' });
    }
    
    if (bio && bio.length > 300) {
      return res.status(400).json({ error: 'Bio must be 300 characters or less' });
    }
    
    // Check if username is already taken
    if (username) {
      const { data: existingUser, error: checkError } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('username', username)
        .neq('id', id)
        .single();
      
      if (!checkError && existingUser) {
        return res.status(400).json({ error: 'Username is already taken' });
      }
    }
    
    // Update the profile
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({
        username,
        bio,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    res.json(data);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

export default router; 