import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { profileService } from '../services/profileService';

// Define the shape of the authentication context
type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  username: string | null;
  signUp: (email: string, password: string, username: string) => Promise<{
    error: Error | null;
    user: User | null;
  }>;
  signIn: (email: string, password: string) => Promise<{
    error: Error | null;
    user: User | null;
  }>;
  signOut: () => Promise<void>;
  resetPasswordForEmail: (email: string) => Promise<{ data: any | null; error: Error | null }>;
  updatePassword: (password: string) => Promise<{ data: any | null; error: Error | null }>;
  setUsername: (newUsername: string) => void;
  deleteAccount: () => Promise<{ success: boolean; error: Error | null }>;
};

// Create the authentication context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Define props for the provider component
interface AuthProviderProps {
  children: ReactNode;
}

// Create the authentication provider component
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [username, setUsername] = useState<string | null>(null);

  // Load user's profile (username) when user changes
  useEffect(() => {
    if (user) {
      loadUserProfile(user.id);
    } else {
      setUsername(null);
    }
  }, [user]);

  const loadUserProfile = async (userId: string) => {
    try {
      const { data, error } = await profileService.getProfileByUserId(userId);
      
      if (error) {
        // Set a temporary username based on email if available
        if (user?.email) {
          const emailUsername = user.email.split('@')[0];
          setUsername(emailUsername);
        } else {
          setUsername(null);
        }
        return;
      }
      
      if (data) {
        // Simply use the username as is, no auto-correction
        setUsername(data.username || null);
      } else {
        // If no data but also no error, use email prefix as fallback
        if (user?.email) {
          const emailUsername = user.email.split('@')[0];
          setUsername(emailUsername);
        } else {
          setUsername(null);
        }
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      setUsername(null);
    }
  };

  useEffect(() => {
    // Get the current session when the provider mounts
    const getSession = async () => {
      setIsLoading(true);
      
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting session:', error);
      }
      
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    };

    getSession();

    // Set up the auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
    );

    // Clean up the subscription when the component unmounts
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Handle user sign-up
  const signUp = async (email: string, password: string, username: string) => {
    try {
      // First check if the username is available
      const { available } = await profileService.isUsernameAvailable(username);
      
      if (!available) {
        return { user: null, error: new Error('Username is already taken') };
      }
      
      // Create auth user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) {
        return { user: null, error };
      }
      
      if (!data.user) {
        return { user: null, error: new Error('User creation failed') };
      }

      // Set the username in memory immediately so the UI shows the right username
      setUsername(username);
      
      // Try to get the session
      const { data: { session: _ } } = await supabase.auth.getSession();
      
      // Immediate attempt to create the profile with the provided username
      try {
        const result = await profileService.createProfile(data.user.id, username);
        
        if (result.error) {
          console.error('Failed to create profile with username:', result.error);
          
          // Fallback to updateUsernameAfterSignup for compatibility with existing flows
          const updateResult = await profileService.updateUsernameAfterSignup(data.user.id, username);
          
          if (updateResult.error) {
            console.error('Failed to update username after profile creation:', updateResult.error);
          }
        }
      } catch (profileError) {
        console.error('Error creating profile:', profileError);
      }
      
      return { user: data.user, error: null };
    } catch (error) {
      console.error('Error during sign-up:', error);
      return { user: null, error: error instanceof Error ? error : new Error('Sign-up failed') };
    }
  };

  // Standard email sign in function
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        // Translate Supabase errors to more user-friendly messages
        if (error.message.includes('Invalid login credentials')) {
          return { 
            user: null, 
            error: new Error('Incorrect email or password. Please try again.') 
          };
        }
        
        // Return the original error if it's not one we're handling specifically
        return { user: null, error };
      }
      
      return { user: data?.user || null, error: null };
    } catch (error: any) {
      console.error('Sign in error:', error);
      return { 
        user: null, 
        error: new Error('Failed to sign in. Please check your network connection and try again.') 
      };
    }
  };

  // Sign out function
  const signOut = async () => {
    await supabase.auth.signOut();
  };

  // Reset password for email
  const resetPasswordForEmail = async (email: string) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/reset-password'
      });
      
      if (error) {
        return { data: null, error };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Error in reset password request:', error);
      return { 
        data: null, 
        error: error instanceof Error ? error : new Error('An unexpected error occurred') 
      };
    }
  };

  // Update password
  const updatePassword = async (password: string) => {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password
      });
      
      if (error) {
        return { data: null, error };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Error updating password:', error);
      return { 
        data: null, 
        error: error instanceof Error ? error : new Error('An unexpected error occurred') 
      };
    }
  };

  // Delete user account - completely removes the user from Supabase
  const deleteAccount = async () => {
    try {
      if (!user) {
        return { success: false, error: new Error('No user is logged in') };
      }
      
      // First delete the user's profile data
      const { error: profileDeleteError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id);
      
      if (profileDeleteError) {
        console.error('Error deleting user profile:', profileDeleteError);
        return { success: false, error: profileDeleteError };
      }
      
      // Delete the user's auth data using admin function
      const { error: userDeleteError } = await supabase.rpc('delete_user');
      
      if (userDeleteError) {
        console.error('Error deleting user:', userDeleteError);
        return { success: false, error: userDeleteError };
      }
      
      // Sign out the user after successful deletion
      await signOut();
      
      return { success: true, error: null };
    } catch (error) {
      console.error('Error deleting account:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error : new Error('An unexpected error occurred during account deletion') 
      };
    }
  };

  // Create the context value object
  const value = {
    user,
    session,
    isLoading,
    username,
    signUp,
    signIn,
    signOut,
    resetPasswordForEmail,
    updatePassword,
    setUsername,
    deleteAccount
  };

  // Return the provider with the value
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook for using the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}; 