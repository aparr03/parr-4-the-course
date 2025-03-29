import { useState, useEffect } from 'react';
import { profileService } from '../services/profileService';
import { adminService } from '../services/adminService';
import { User } from '@supabase/supabase-js';

interface UserProfile {
  avatarUrl: string | null;
  isAdmin: boolean;
  isLoading: boolean;
}

export const useUserProfile = (user: User | null) => {
  const [profile, setProfile] = useState<UserProfile>({
    avatarUrl: null,
    isAdmin: false,
    isLoading: true
  });

  useEffect(() => {
    if (!user) {
      setProfile({
        avatarUrl: null,
        isAdmin: false,
        isLoading: false
      });
      return;
    }

    const loadProfile = async () => {
      try {
        // Load avatar URL
        const { data: profileData } = await profileService.getProfileByUserId(user.id);
        const avatarUrl = profileData?.avatar_url || null;

        // Check admin status
        const { isAdmin } = await adminService.isAdmin();

        setProfile({
          avatarUrl,
          isAdmin,
          isLoading: false
        });
      } catch (error) {
        console.error('Error loading user profile:', error);
        setProfile({
          avatarUrl: null,
          isAdmin: false,
          isLoading: false
        });
      }
    };

    loadProfile();
  }, [user]);

  return profile;
}; 