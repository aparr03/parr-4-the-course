import { createClient } from '@supabase/supabase-js';

// Hardcoded values as a temporary solution - should be replaced with environment variables
// when the environment configuration is fixed
const supabaseUrl = "https://fkbmarrbkyshruzwyytn.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZrYm1hcnJia3lzaHJ1end5eXRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIyNTk2ODQsImV4cCI6MjA1NzgzNTY4NH0.gTPBLkYHliyAhlsSZtulf8ud0f1lNx4-dTbxflA_b4U";

// Debug environment variables
console.log('Using hardcoded Supabase URL and key as a temporary fix');
console.log('Environment variables would be:', import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY);

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey); 