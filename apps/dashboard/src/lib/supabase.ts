import { createClient } from '@supabase/supabase-js'
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public'

// Access environment variables using SvelteKit's env imports
const supabaseUrl = PUBLIC_SUPABASE_URL
const supabaseAnonKey = PUBLIC_SUPABASE_ANON_KEY

// Enhanced environment variable validation
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing required Supabase environment variables:')
  console.error('   - PUBLIC_SUPABASE_URL')
  console.error('   - PUBLIC_SUPABASE_ANON_KEY')
  console.error('')
  console.error('Please ensure these are set in your .env file:')
  console.error('PUBLIC_SUPABASE_URL=https://your-project.supabase.co')
  console.error('PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key')
  console.error('')
  console.error('See GOOGLE_OAUTH_SETUP.md for complete setup instructions.')
  
  // In production, this should throw an error
  if (import.meta.env.PROD) {
    throw new Error('Missing required Supabase environment variables')
  }
}

// Create Supabase client with enhanced error handling
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder_key',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce'
    }
  }
)

// Helper function to access demo schema
export const demoSupabase = supabase.schema('demo')

// Database types for TypeScript
export interface Database {
  demo: {
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
      services: {
        Row: {
          id: string
          title: string
          description: string
          industry: string
          training_cost: number
          response_cost: number
          action_cost: number
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
          training_cost: number
          response_cost: number
          action_cost: number
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
          training_cost?: number
          response_cost?: number
          action_cost?: number
          estimated_time?: number
          difficulty?: string
          benefits?: string[]
          created_at?: string
        }
      }
      sessions: {
        Row: {
          id: string
          user_id: string
          service_id: string
          started_at: string
          completed_at: string | null
          credits_used: number
          progress_data: any
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          service_id: string
          started_at: string
          completed_at?: string | null
          credits_used: number
          progress_data?: any
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          service_id?: string
          started_at?: string
          completed_at?: string | null
          credits_used?: number
          progress_data?: any
          created_at?: string
        }
      }
      credit_usage: {
        Row: {
          id: string
          session_id: string
          user_id: string
          service_id: string
          action_type: string
          credits_used: number
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          user_id: string
          service_id: string
          action_type: string
          credits_used: number
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          user_id?: string
          service_id?: string
          action_type?: string
          credits_used?: number
          created_at?: string
        }
      }
      consultations: {
        Row: {
          id: string
          user_id: string
          service_id: string | null
          scheduled_at: string
          calendly_link: string
          status: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          service_id?: string | null
          scheduled_at: string
          calendly_link: string
          status?: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          service_id?: string | null
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