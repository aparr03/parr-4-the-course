export function checkEnvironmentVariables() {
  console.log('Environment Variables Check');
  
  const vars = {
    SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
    SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY
  };
  
  console.log(vars);
  
  // Check if SUPABASE_URL is a placeholder
  if (vars.SUPABASE_URL.includes('your-project-id')) {
    console.error('ERROR: VITE_SUPABASE_URL contains placeholder value. Please set your actual Supabase URL.');
    return false;
  }
  
  // Check if SUPABASE_URL is a valid URL format
  try {
    new URL(vars.SUPABASE_URL);
    console.log('VITE_SUPABASE_URL is a valid URL format');
  } catch (e) {
    console.error('ERROR: VITE_SUPABASE_URL is not a valid URL format');
    return false;
  }
  
  // Check if SUPABASE_ANON_KEY is empty or default
  if (!vars.SUPABASE_ANON_KEY || vars.SUPABASE_ANON_KEY === 'your-anon-key') {
    console.error('ERROR: VITE_SUPABASE_ANON_KEY is missing or contains placeholder value');
    return false;
  }
  
  return true;
}
