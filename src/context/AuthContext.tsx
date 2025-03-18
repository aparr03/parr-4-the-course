import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
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
  signInWithUsername: (username: string, password: string) => Promise<{
    error: Error | null;
    user: User | null;
  }>;
  signOut: () => Promise<void>;
  resetPasswordForEmail: (email: string) => Promise<{ data: any | null; error: Error | null }>;
  updatePassword: (password: string) => Promise<{ data: any | null; error: Error | null }>;
  setUsername: (newUsername: string) => void;
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
        console.error('Error loading user profile:', error);
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
        // Check if the username is auto-generated and try to correct it
        if (data.username && data.username.startsWith('user_')) {
          console.log('Detected auto-generated username:', data.username);
          
          // If we have a user email, create a better username from it
          if (user?.email) {
            const emailBasedUsername = user.email.split('@')[0];
            console.log('Trying to update to email-based username:', emailBasedUsername);
            
            try {
              // First check if this username is available
              const { available } = await profileService.isUsernameAvailable(emailBasedUsername);
              
              if (available) {
                // Update the username
                const updateResult = await profileService.updateProfile(userId, { 
                  username: emailBasedUsername 
                });
                
                if (!updateResult.error) {
                  console.log('Updated auto-generated username to:', emailBasedUsername);
                  setUsername(emailBasedUsername);
                  return;
                }
              }
            } catch (updateError) {
              console.error('Error updating auto-generated username:', updateError);
            }
          }
        }
        
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

      // Add a longer delay to allow any automatic profile creation to complete
      // This helps us ensure our username update happens after any DB triggers
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Try to get the session
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      
      // Start retry mechanism for updating the username
      let retryCount = 0;
      const maxRetries = 3;
      let updateSuccess = false;
      
      while (retryCount < maxRetries && !updateSuccess) {
        try {
          console.log(`Attempt ${retryCount + 1} to update username to "${username}"`);
          
          // Update profile with chosen username
          const result = await profileService.updateUsernameAfterSignup(data.user.id, username);
          
          if (!result.error) {
            console.log('Username update successful:', result.data);
            updateSuccess = true;
          } else {
            console.error(`Username update failed (attempt ${retryCount + 1}):`, result.error);
            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        } catch (usernameError) {
          console.error(`Error updating username (attempt ${retryCount + 1}):`, usernameError);
        }
        
        retryCount++;
      }
      
      if (!updateSuccess) {
        console.error('Failed to update username after multiple attempts');
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

  // Username-based sign in
  const signInWithUsername = async (username: string, password: string) => {
    try {
      // For now, we'll simplify this and just inform users to use email
      // In a production environment, you would implement a secure way to look up emails
      // from usernames, possibly using a server function or RLS-protected view
      
      return { 
        user: null, 
        error: new Error('Username login is coming soon! Please use your email address to login for now.') 
      };
      
      // The complete implementation would look like:
      // 1. Find user email from username (via secure API or database view)
      // 2. Use that email with the provided password to sign in
    } catch (error) {
      console.error('Error in username sign in:', error);
      return { 
        user: null, 
        error: new Error('An unexpected error occurred. Please try again.') 
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

  // Create the context value object
  const value = {
    user,
    session,
    isLoading,
    username,
    signUp,
    signIn,
    signInWithUsername,
    signOut,
    resetPasswordForEmail,
    updatePassword,
    setUsername
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