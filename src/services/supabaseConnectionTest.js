import { isSupabaseConfigured, supabase } from './supabaseClient'

/**
 * Performs a non-destructive Supabase client check without reading or writing
 * any PlacePulse data.
 */
export async function testSupabaseConnection() {
  if (!isSupabaseConfigured || !supabase) {
    return {
      success: false,
      message: 'Supabase environment variables are not configured.',
    }
  }

  const { error } = await supabase.auth.getSession()

  if (error) {
    return {
      success: false,
      message: error.message,
      error,
    }
  }

  return {
    success: true,
    message: 'Supabase client initialized and responded successfully.',
  }
}
