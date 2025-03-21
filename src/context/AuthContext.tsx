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

  /**
   * Check if an email is in the banned list
   */
  const isEmailBanned = async (email: string): Promise<boolean> => {
    try {
      // Try to query the banned_emails table
      try {
        const { data, error } = await supabase
          .from('banned_emails')
          .select('email')
          .eq('email', email)
          .single();

        // If there's a 406 error (typically means table doesn't exist), silently handle it
        if (error && error.code === '406') {
          return false; // Skip the check if the table doesn't exist
        }
        
        // For other errors, log but don't break the flow
        if (error) {
          console.log('Non-critical error checking banned emails:', error);
          return false;
        }

        return !!data;
      } catch (innerError: any) {
        // Silently handle any other errors that might occur
        return false;
      }
    } catch (err) {
      console.error('Unexpected error in isEmailBanned:', err);
      return false; // Default to not banned on error
    }
  };

  /**
   * Sign up with email and password
   */
  const signUp = async (email: string, password: string, username: string): Promise<{ user: User | null; error: Error | null }> => {
    // Input validation
    if (!email || !password || !username) {
      return { user: null, error: new Error('Email, password, and username are required') };
    }
    
    try {
      // First check if the email is banned
      const isBanned = await isEmailBanned(email);
      
      if (isBanned) {
        return { 
          user: null, 
          error: new Error('Registration blocked: This email address is not allowed') 
        };
      }
      
      // Then check if the username is available
      const isAvailable = await profileService.isUsernameAvailable(username);
      
      if (!isAvailable) {
        return { user: null, error: new Error('Username is already taken') };
      }
      
      // Try to sign up the user with Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: {
            username // Store username in auth metadata
          }
        }
      });
      
      // Handle errors from Supabase Auth
      if (error) {
        return { user: null, error };
      }
      
      // If we get here, the user was created successfully
      if (data.user) {
        // CRITICAL IMPROVEMENT: Direct profile creation without checking first
        // This bypasses potential race conditions with the auth system
        console.log(`[AUTH_DEBUG] Creating user profile immediately with username: ${username}`);
        
        let profileCreated = false;
        
        // Wait for 1 second to ensure the database trigger has executed
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Try using our secure RPC function first - this is the most reliable way
        try {
          const { success, error } = await profileService.setUsernameSecurely(data.user.id, username);
          
          if (success) {
            console.log(`[AUTH_DEBUG] Username set securely via RPC function: ${username}`);
            profileCreated = true;
          } else if (error) {
            // Only log if there's an actual error object
            console.log(`[AUTH_DEBUG] Secure username setting failed:`, error);
          }
        } catch (secureError) {
          // Silently catch errors from the RPC function - it may not exist yet
        }
        
        // If that failed, try the other approaches as fallback
        if (!profileCreated) {
          // Try inserting the profile directly - silently catch 401/42501 errors (RLS policy violations) 
          try {
            const { error: insertError } = await supabase
              .from('profiles')
              .insert({ 
                id: data.user.id, 
                username,
                created_at: new Date().toISOString()
              });
            
            if (!insertError) {
              console.log(`[AUTH_DEBUG] Profile created successfully with username: ${username}`);
              profileCreated = true;
            } else if (insertError.code !== '42501' && insertError.code !== '401') {
              // Only log errors other than RLS violations
              console.log(`[AUTH_DEBUG] Profile creation failed:`, insertError);
            }
          } catch (profileError) {
            // Silently catch direct insert errors
          }
        }
        
        // As a final fallback, use the update function from profileService
        if (!profileCreated) {
          try {
            console.log(`[AUTH_DEBUG] Final fallback: using updateUsernameAfterSignup`);
            await profileService.updateUsernameAfterSignup(data.user.id, username);
          } catch (error) {
            console.error(`[AUTH_DEBUG] Error during username update fallback:`, error);
          }
        }
        
        return { user: data.user, error: null };
      }
      
      return { user: null, error: new Error('Unknown error during signup') };
    } catch (error) {
      console.error('Unexpected error during signup:', error);
      return { user: null, error: error instanceof Error ? error : new Error('Unknown error during signup') };
    }
  };

  /**
   * Sign in with email and password
   */
  const signIn = async (email: string, password: string): Promise<{ user: User | null; error: Error | null }> => {
    try {
      // First check if the email is banned
      const isBanned = await isEmailBanned(email);
      
      if (isBanned) {
        return { 
          user: null, 
          error: new Error('Sign-in blocked: This email address is not allowed') 
        };
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) return { user: null, error };
      
      return { user: data.user, error: null };
    } catch (error) {
      return { 
        user: null, 
        error: error instanceof Error ? error : new Error('Unknown error during sign in')
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