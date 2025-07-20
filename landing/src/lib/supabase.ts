import { createClient } from '@supabase/supabase-js'
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public'

// Access environment variables using SvelteKit's env imports
const supabaseUrl = PUBLIC_SUPABASE_URL
const supabaseAnonKey = PUBLIC_SUPABASE_ANON_KEY

// Check if environment variables are set
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables. Please set PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_ANON_KEY in your .env file.')
  console.warn('For development, you can use placeholder values:')
  console.warn('PUBLIC_SUPABASE_URL=https://your-project.supabase.co')
  console.warn('PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key')
  console.warn('See GOOGLE_OAUTH_SETUP.md for complete setup instructions.')
}

// Create Supabase client with fallback for development
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder_key',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
)

// Database types for TypeScript
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          created_at: string
          demo_credits: number
          industry_preference: string | null
          total_demos_completed: number
          consultation_booked: boolean
        }
        Insert: {
          id: string
          email: string
          created_at?: string
          demo_credits?: number
          industry_preference?: string | null
          total_demos_completed?: number
          consultation_booked?: boolean
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
          demo_credits?: number
          industry_preference?: string | null
          total_demos_completed?: number
          consultation_booked?: boolean
        }
      }
      demos: {
        Row: {
          id: string
          title: string
          description: string
          industry: string
          credit_cost: number
          estimated_time: number
          difficulty: string
          benefits: string[]
          created_at: string
        }
        Insert: {
          id: string
          title: string
          description: string
          industry: string
          credit_cost: number
          estimated_time: number
          difficulty: string
          benefits: string[]
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          industry?: string
          credit_cost?: number
          estimated_time?: number
          difficulty?: string
          benefits?: string[]
          created_at?: string
        }
      }
      demo_sessions: {
        Row: {
          id: string
          user_id: string
          demo_id: string
          started_at: string
          completed_at: string | null
          credits_used: number
          progress_data: any
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          demo_id: string
          started_at: string
          completed_at?: string | null
          credits_used: number
          progress_data?: any
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          demo_id?: string
          started_at?: string
          completed_at?: string | null
          credits_used?: number
          progress_data?: any
          created_at?: string
        }
      }
      consultations: {
        Row: {
          id: string
          user_id: string
          demo_id: string | null
          scheduled_at: string
          calendly_link: string
          status: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          demo_id?: string | null
          scheduled_at: string
          calendly_link: string
          status?: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          demo_id?: string | null
          scheduled_at?: string
          calendly_link?: string
          status?: string
          notes?: string | null
          created_at?: string
        }
      }
    }
  }
} 