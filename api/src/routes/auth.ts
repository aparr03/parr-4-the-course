/**
 * AUTH ROUTES MODULE
 * -----------------
 * This file defines API endpoints related to authentication.
 * It provides routes for user authentication operations.
 * 
 * Note: This is different from the auth.ts in middleware folder, which contains 
 * authentication middleware functions.
 */

import express from 'express';
import { supabaseAdmin } from '../lib/supabase.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

// Get current authenticated user
router.get('/me', authenticateUser, async (req, res) => {
  try {
    // User is already attached to req by authenticateUser middleware
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', req.user.id)
      .single();
    
    if (error) throw error;
    
    res.json({
      id: req.user.id,
      email: req.user.email,
      ...profile
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// Note: Most auth operations are handled client-side with Supabase Auth
// This API primarily serves as a proxy for enhanced security and to add custom logic

export default router; 