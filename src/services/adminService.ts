import { supabase } from '../lib/supabase';

// Define banned email interface
export interface BannedEmail {
  id: string;
  email: string;
  reason: string;
  created_at: string;
}

/**
 * Service for admin-related operations
 * This service provides functionality for admin users to manage other users and their content
 */
export const adminService = {
  /**
   * Check if the current user has admin privileges
   */
  async isAdmin() {
    try {
      const { data: user } = await supabase.auth.getUser();
      
      if (!user || !user.user) {
        return { isAdmin: false, error: null };
      }
      
      // Get the user's profile to check for admin role
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.user.id)
        .single();
      
      if (error) {
        return { isAdmin: false, error };
      }
      
      return { isAdmin: profile?.is_admin || false, error: null };
    } catch (error) {
      console.error('Error checking admin status:', error);
      return { 
        isAdmin: false, 
        error: error instanceof Error ? error : new Error('Failed to check admin status') 
      };
    }
  },
  
  /**
   * Get all users (admin only)
   */
  async getAllUsers() {
    try {
      const { isAdmin, error: adminCheckError } = await this.isAdmin();
      
      if (adminCheckError) {
        return { data: null, error: adminCheckError };
      }
      
      if (!isAdmin) {
        return { 
          data: null, 
          error: new Error('Unauthorized: Admin privileges required') 
        };
      }
      
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      return { data: profiles, error };
    } catch (error) {
      console.error('Error getting all users:', error);
      return { 
        data: null, 
        error: error instanceof Error ? error : new Error('Failed to get users') 
      };
    }
  },
  
  /**
   * Delete a user account (admin only)
   */
  async deleteUser(userId: string) {
    try {
      const { isAdmin, error: adminCheckError } = await this.isAdmin();
      
      if (adminCheckError) {
        return { success: false, error: adminCheckError };
      }
      
      if (!isAdmin) {
        return { 
          success: false, 
          error: new Error('Unauthorized: Admin privileges required') 
        };
      }
      
      // First delete the user's recipes
      const { error: recipesDeleteError } = await supabase
        .from('recipes')
        .delete()
        .eq('user_id', userId);
      
      if (recipesDeleteError) {
        console.error('Error deleting user recipes:', recipesDeleteError);
        return { success: false, error: recipesDeleteError };
      }
      
      // Then delete the user's profile
      const { error: profileDeleteError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);
      
      if (profileDeleteError) {
        console.error('Error deleting user profile:', profileDeleteError);
        return { success: false, error: profileDeleteError };
      }
      
      // Delete the user auth using the admin RPC function
      const { error: userDeleteError } = await supabase.rpc('delete_user_by_id', {
        user_id: userId
      });
      
      if (userDeleteError) {
        console.error('Error deleting user account:', userDeleteError);
        return { success: false, error: userDeleteError };
      }
      
      return { success: true, error: null };
    } catch (error) {
      console.error('Error deleting user account:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error : new Error('Failed to delete user account') 
      };
    }
  },
  
  /**
   * Delete a recipe (admin only)
   */
  async deleteRecipe(recipeId: string) {
    try {
      const { isAdmin, error: adminCheckError } = await this.isAdmin();
      
      if (adminCheckError) {
        return { success: false, error: adminCheckError };
      }
      
      if (!isAdmin) {
        return { 
          success: false, 
          error: new Error('Unauthorized: Admin privileges required') 
        };
      }
      
      const { error } = await supabase
        .from('recipes')
        .delete()
        .eq('id', recipeId);
      
      if (error) {
        console.error('Error deleting recipe:', error);
        return { success: false, error };
      }
      
      return { success: true, error: null };
    } catch (error) {
      console.error('Error deleting recipe:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error : new Error('Failed to delete recipe') 
      };
    }
  },
  
  /**
   * Get all banned emails (admin only)
   */
  async getBannedEmails() {
    try {
      const { isAdmin, error: adminCheckError } = await this.isAdmin();
      
      if (adminCheckError) {
        return { data: null, error: adminCheckError };
      }
      
      if (!isAdmin) {
        return { 
          data: null, 
          error: new Error('Unauthorized: Admin privileges required') 
        };
      }
      
      const { data, error } = await supabase
        .from('banned_emails')
        .select('*')
        .order('created_at', { ascending: false });
      
      return { data, error };
    } catch (error) {
      console.error('Error getting banned emails:', error);
      return { 
        data: null, 
        error: error instanceof Error ? error : new Error('Failed to get banned emails') 
      };
    }
  },
  
  /**
   * Ban an email (admin only)
   */
  async banEmail(email: string, reason: string) {
    try {
      const { isAdmin, error: adminCheckError } = await this.isAdmin();
      
      if (adminCheckError) {
        return { success: false, error: adminCheckError };
      }
      
      if (!isAdmin) {
        return { 
          success: false, 
          error: new Error('Unauthorized: Admin privileges required') 
        };
      }
      
      // Add email to banned_emails table
      const { error } = await supabase
        .from('banned_emails')
        .insert({ email, reason });
      
      if (error) {
        console.error('Error banning email:', error);
        return { success: false, error };
      }
      
      return { success: true, error: null };
    } catch (error) {
      console.error('Error banning email:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error : new Error('Failed to ban email') 
      };
    }
  },
  
  /**
   * Remove a banned email (admin only)
   */
  async removeBannedEmail(id: string) {
    try {
      const { isAdmin, error: adminCheckError } = await this.isAdmin();
      
      if (adminCheckError) {
        return { success: false, error: adminCheckError };
      }
      
      if (!isAdmin) {
        return { 
          success: false, 
          error: new Error('Unauthorized: Admin privileges required') 
        };
      }
      
      // Remove email from banned_emails table
      const { error } = await supabase
        .from('banned_emails')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error removing banned email:', error);
        return { success: false, error };
      }
      
      return { success: true, error: null };
    } catch (error) {
      console.error('Error removing banned email:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error : new Error('Failed to remove banned email') 
      };
    }
  }
}; 