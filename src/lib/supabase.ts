import { createClient } from '@supabase/supabase-js';

// Production Supabase configuration
const supabaseUrl = "https://fkbmarrbkyshruzwyytn.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZrYm1hcnJia3lzaHJ1end5eXRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIyNTk2ODQsImV4cCI6MjA1NzgzNTY4NH0.gTPBLkYHliyAhlsSZtulf8ud0f1lNx4-dTbxflA_b4U";

console.log('Using production Supabase instance:', supabaseUrl);

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    fetch: (...args) => fetch(...args)
  }
}); 