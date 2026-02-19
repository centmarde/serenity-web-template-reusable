import { createClient } from '@supabase/supabase-js'

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabaseServiceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY

// Validate environment variables
if (!supabaseUrl) {
  throw new Error('Missing VITE_SUPABASE_URL environment variable')
}

if (!supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_ANON_KEY environment variable')
}

if (!supabaseServiceRoleKey) {
  console.warn('Missing VITE_SUPABASE_SERVICE_ROLE_KEY - Admin operations will not be available')
}

// Create and export the Supabase client (for regular user operations)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Create admin client with service role key (for administrative operations)
export const supabaseAdmin = supabaseServiceRoleKey 
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null

// Export types for better TypeScript support
export type { User, Session, AuthError } from '@supabase/supabase-js'

// Utility functions for common operations
export const auth = {
  signIn: supabase.auth.signInWithPassword.bind(supabase.auth),
  signUp: supabase.auth.signUp.bind(supabase.auth),
  signOut: supabase.auth.signOut.bind(supabase.auth),
  getSession: supabase.auth.getSession.bind(supabase.auth),
  getUser: supabase.auth.getUser.bind(supabase.auth),
  onAuthStateChange: supabase.auth.onAuthStateChange.bind(supabase.auth)
}

// Database helper functions
export const db = {
  from: supabase.from.bind(supabase),
  storage: supabase.storage,
  rpc: supabase.rpc.bind(supabase)
}

// Admin database helper functions (requires service role key)
export const adminDb = supabaseAdmin ? {
  from: supabaseAdmin.from.bind(supabaseAdmin),
  storage: supabaseAdmin.storage,
  rpc: supabaseAdmin.rpc.bind(supabaseAdmin),
  // Admin-specific auth operations
  auth: {
    createUser: supabaseAdmin.auth.admin.createUser.bind(supabaseAdmin.auth.admin),
    deleteUser: supabaseAdmin.auth.admin.deleteUser.bind(supabaseAdmin.auth.admin),
    listUsers: supabaseAdmin.auth.admin.listUsers.bind(supabaseAdmin.auth.admin),
    updateUserById: supabaseAdmin.auth.admin.updateUserById.bind(supabaseAdmin.auth.admin),
    getUserById: supabaseAdmin.auth.admin.getUserById.bind(supabaseAdmin.auth.admin)
  }
} : null

// Utility function to check if admin operations are available
export const isAdminAvailable = () => supabaseAdmin !== null

export default supabase