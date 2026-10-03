// Supabase Configuration Template
// Copy this file to supabase-config.js and replace YOUR_SUPABASE_ANON_KEY with your actual key
// Or use environment variables in Vercel

const supabaseUrl = 'https://vmcnpjqrlqmmsaeygbny.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

window.supabase = supabase.createClient(supabaseUrl, supabaseKey);

console.log('Supabase initialized successfully');
