import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL or Anon Key is missing! Check your .env file.')
}

// Ensure the client is always exportable even if keys are missing to prevent import errors, 
// but it will fail on actual calls.
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : {
      auth: { 
        getSession: async () => ({ data: { session: null }, error: new Error('Supabase not configured') }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        signInWithPassword: async () => ({ error: new Error('Supabase not configured') }),
        signUp: async () => ({ error: new Error('Supabase not configured') }),
        signOut: async () => ({ error: new Error('Supabase not configured') })
      },
      from: () => ({ select: () => ({ order: () => Promise.resolve({ data: [], error: new Error('Supabase not configured') }) }) }),
      storage: { from: () => ({ upload: async () => ({ error: new Error('Supabase not configured') }), getPublicUrl: () => ({ data: { publicUrl: '' } }) }) }
    };
