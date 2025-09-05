import { createClient } from '@supabase/supabase-js'
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '$env/static/private'

// Validate server-side environment variables
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing required server-side Supabase environment variables:')
  console.error('   - SUPABASE_URL')
  console.error('   - SUPABASE_ANON_KEY')
  console.error('')
  console.error('Please ensure these are set in your .env file:')
  console.error('SUPABASE_URL=https://your-project.supabase.co')
  console.error('SUPABASE_ANON_KEY=your_supabase_anon_key')
  
  // In production, this should throw an error
  if (import.meta.env.PROD) {
    throw new Error('Missing required server-side Supabase environment variables')
  }
}

// Create server-side Supabase client with private environment variables
export const supabaseServer = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
) 