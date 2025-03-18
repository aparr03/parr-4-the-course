// Note: This won't work directly in Node.js as import.meta is specific to ES modules in browsers
// This is for demonstration purposes to match what's in the app
console.log('Process env:', process.env.VITE_SUPABASE_URL);
console.log('import.meta.env is a Vite-specific feature during development'); 