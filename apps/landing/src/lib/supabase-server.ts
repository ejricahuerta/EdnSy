import { createClient } from '@supabase/supabase-js'
import { env } from '$env/dynamic/private'

// Get Supabase environment variables with fallbacks
const getSupabaseUrl = () => env.SUPABASE_URL || 'https://your-project.supabase.co'
const getSupabaseAnonKey = () => env.SUPABASE_ANON_KEY || 'your_supabase_anon_key'

// Create server-side Supabase client with private environment variables
export const supabaseServer = createClient(
  getSupabaseUrl(),
  getSupabaseAnonKey(),
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
) 