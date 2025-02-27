import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';
import { mockSupabase } from './mockService';
import { checkEnvironmentVariables } from '../utils/envCheck';

// Run environment checks
const envValid = checkEnvironmentVariables();

if (!envValid) {
  console.error('Supabase initialization failed: Environment variables are invalid or missing');
}

// Check if we're using mock data
export const usingMockData = import.meta.env.VITE_USE_MOCK_DATA === 'true';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

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
