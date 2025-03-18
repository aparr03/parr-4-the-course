import { supabase } from '../lib/supabase';

// Define Profile type
export interface Profile {
  id: string;
  username: string;
  avatar_url?: string;
  created_at: string;
}

// Define bucket name in one place for easy changes
const AVATAR_BUCKET = 'avatars';

export const profileService = {
  /**
   * Create a new user profile
   */
  async createProfile(userId: string, username: string) {
    return supabase
      .from('profiles')
      .insert({
        id: userId,
        username
      })
      .select()
      .single();
  },
  
  /**
   * Get a profile by user ID
   */
  async getProfileByUserId(userId: string) {
    try {
      // Check if this profile exists
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId);
      
      // If profile exists, return it
      if (!error && data && data.length > 0) {
        return { data: data[0], error: null };
      }
      
      // If no data but no error, just return null data
      if (!error) {
        return { data: null, error: null };
      }
      
      // If there was an error with the query
      return { data: null, error };
    } catch (error) {
      console.error('Error in getProfileByUserId:', error);
      return { data: null, error };
    }
  },
  
  /**
   * Get a user ID by username
   */
  async getUserIdByUsername(username: string) {
    return supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
      .single();
  },
  
  /**
   * Check if a username is available
   */
  async isUsernameAvailable(username: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', username);
    
    // If no error and data array is empty, username is available
    if (!error && (!data || data.length === 0)) {
      return { available: true, error: null };
    }
    
    // If data exists, username is taken
    if (data && data.length > 0) {
      return { available: false, error: null };
    }
    
    // If there's an error, log it and return false
    console.error('Error checking username availability:', error);
    return { available: false, error };
  },
  
  /**
   * Update user profile
   */
  async updateProfile(userId: string, updates: Partial<Omit<Profile, 'id' | 'created_at'>>) {
    return supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
  },

  /**
   * Upload a profile picture
   */
  async uploadAvatar(userId: string, file: File) {
    try {
      // Create a unique file path for the user's avatar
      const filePath = `${userId}/${Math.random().toString(36).substring(2)}`;
      
      // Create log object for consolidated logging
      const logInfo = {
        action: 'avatar_upload',
        userId,
        filePath: `${AVATAR_BUCKET}/${filePath}`,
        steps: [] as {step: string, status: string, data?: any, error?: any}[]
      };
      
      // Add upload step
      logInfo.steps.push({step: 'upload_start', status: 'pending'});
      
      // Upload the file to Supabase Storage
      const { error } = await supabase.storage
        .from(AVATAR_BUCKET)
        .upload(filePath, file, {
          upsert: true,
          cacheControl: '3600'
        });
      
      if (error) {
        logInfo.steps[0].status = 'error';
        logInfo.steps[0].error = error;
        console.error('Avatar upload process:', logInfo);
        throw error;
      }
      
      logInfo.steps[0].status = 'success';
      
      // Add URL generation step
      logInfo.steps.push({step: 'get_url', status: 'pending'});
      
      // Try to get a signed URL (temporary but should work)
      try {
        const { data: signedData } = await supabase.storage
          .from(AVATAR_BUCKET)
          .createSignedUrl(filePath, 60 * 60 * 24 * 365); // 1 year expiry
          
        if (signedData && signedData.signedUrl) {
          logInfo.steps[1].status = 'success';
          logInfo.steps[1].data = { urlType: 'signed', signedUrl: signedData.signedUrl };
          
          // Add profile update step
          logInfo.steps.push({step: 'update_profile', status: 'pending'});
          
          // Update the user's profile with the signed URL
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ avatar_url: signedData.signedUrl })
            .eq('id', userId);
            
          if (updateError) {
            logInfo.steps[2].status = 'error';
            logInfo.steps[2].error = updateError;
            console.error('Avatar upload process:', logInfo);
            throw updateError;
          }
          
          logInfo.steps[2].status = 'success';
          console.log('Avatar upload process:', logInfo);
          
          return { publicUrl: signedData.signedUrl };
        }
      } catch (signError) {
        logInfo.steps[1].status = 'error';
        logInfo.steps[1].error = signError;
        logInfo.steps.push({step: 'fallback_to_public_url', status: 'pending'});
        // Fall back to public URL
      }
      
      // Get the public URL as fallback
      const { data: { publicUrl } } = supabase.storage
        .from(AVATAR_BUCKET)
        .getPublicUrl(filePath);
      
      if (logInfo.steps.length === 2) {
        logInfo.steps[1].status = 'success';
        logInfo.steps[1].data = { urlType: 'public', publicUrl };
        logInfo.steps.push({step: 'update_profile', status: 'pending'});
      } else {
        logInfo.steps[2].status = 'success';
        logInfo.steps.push({step: 'update_profile', status: 'pending'});
      }
      
      // Update the user's profile with the public URL as fallback
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', userId);
      
      if (updateError) {
        logInfo.steps[logInfo.steps.length - 1].status = 'error';
        logInfo.steps[logInfo.steps.length - 1].error = updateError;
        console.error('Avatar upload process:', logInfo);
        throw updateError;
      }
      
      logInfo.steps[logInfo.steps.length - 1].status = 'success';
      console.log('Avatar upload process:', logInfo);
      
      return { publicUrl };
    } catch (error) {
      console.error('Avatar upload error:', {
        userId,
        bucket: AVATAR_BUCKET,
        error: error instanceof Error ? error.message : error
      });
      throw error;
    }
  },

  /**
   * Delete a profile picture
   */
  async deleteAvatar(userId: string, filePath: string) {
    // Remove the file from storage
    const { error: deleteError } = await supabase.storage
      .from(AVATAR_BUCKET)
      .remove([filePath]);
    
    if (deleteError) {
      throw deleteError;
    }
    
    // Update the profile to remove the avatar reference
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: null })
      .eq('id', userId);
    
    if (updateError) {
      throw updateError;
    }
    
    return { success: true };
  },

  /**
   * Update username immediately after signup
   */
  async updateUsernameAfterSignup(userId: string, username: string) {
    try {
      // First try to update directly without checking
      // This is faster and will work most of the time if the profile already exists
      let { data: directUpdateResult, error: directUpdateError } = await supabase
        .from('profiles')
        .update({ username })
        .eq('id', userId)
        .select()
        .single();
        
      // If direct update succeeded, return the result
      if (!directUpdateError && directUpdateResult) {
        console.log('Direct username update successful:', { 
          userId,
          username,
          updatedUsername: directUpdateResult.username
        });
        return { data: directUpdateResult, error: null };
      }
      
      // If direct update failed, it might be because profile doesn't exist yet
      // Try to get existing profile
      let { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', userId)
        .maybeSingle();

      console.log('Checking for existing profile after direct update failed:', { 
        userId, 
        existing: existingProfile, 
        error: fetchError,
        directUpdateError
      });
      
      // If no profile exists yet or there was an error fetching it, try to create one
      if (fetchError || !existingProfile) {
        console.log('No profile found, creating new profile with custom username');
        const { data, error } = await supabase
          .from('profiles')
          .insert({ id: userId, username })
          .select()
          .single();
        
        if (error) {
          console.error('Error creating profile:', error);
          // If insert failed, it's likely because the profile was created in the meantime
          // by a database trigger or another process. Try updating again with force flag
          console.log('Insert failed, attempting forced update');
          const { data: forcedUpdateData, error: forcedUpdateError } = await supabase
            .from('profiles')
            .update({ username })
            .eq('id', userId)
            .select()
            .single();
            
          if (forcedUpdateError) throw forcedUpdateError;
          return { data: forcedUpdateData, error: null };
        }
        
        return { data, error: null };
      }
      
      // If profile exists with any username, update it
      console.log('Profile exists, updating username:', { 
        userId, 
        oldUsername: existingProfile.username, 
        newUsername: username 
      });
      
      const { data, error } = await supabase
        .from('profiles')
        .update({ username })
        .eq('id', userId)
        .select()
        .single();
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating username after signup:', error);
      return { data: null, error };
    }
  },
}; 