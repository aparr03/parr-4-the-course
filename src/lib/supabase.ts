import { createClient } from '@supabase/supabase-js';
import { checkEnvironmentVariables } from '../utils/envCheck';

// Run environment checks
const envValid = checkEnvironmentVariables();

if (!envValid) {
  console.error('Supabase initialization failed: Environment variables are invalid or missing');
}

// Check if we're using mock data - add a default value if undefined
export const usingMockData = 
  import.meta.env.VITE_USE_MOCK_DATA === 'true' || 
  import.meta.env.VITE_USE_MOCK_DATA === true;

// Ensure supabaseUrl and supabaseAnonKey have default values to prevent undefined errors
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 
  'https://your-default-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 
  'fallback-anon-key-for-development-only';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper function to check connection
export async function testSupabaseConnection() {
  try {
    const { error } = await supabase.from('recipes').select('count', { count: 'exact', head: true });
    if (error) {
      console.error('Supabase connection test failed:', error);
      return false;
    }
    console.log('Supabase connection successful');
    return true;
  } catch (err) {
    console.error('Supabase connection test exception:', err);
    return false;
  }
}
