import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Environment variables exposed to Vite client
const rawSupabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
// Strip trailing slashes and /rest/v1 if inadvertently pasted from dashboard REST docs
const supabaseUrl = rawSupabaseUrl
  .replace(/\/rest\/v1\/?$/i, '')
  .replace(/\/+$/, '');
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

/**
 * Returns true if both the Supabase URL and Anon key have been provided in the environment.
 */
export const isSupabaseConfigured = (): boolean => {
  return (
    typeof supabaseUrl === 'string' &&
    supabaseUrl !== '' &&
    !supabaseUrl.includes('your-project-id') &&
    !supabaseUrl.includes('your-project-ref') &&
    typeof supabaseAnonKey === 'string' &&
    supabaseAnonKey !== '' &&
    !supabaseAnonKey.includes('your-anon-key')
  );
};

/**
 * Singleton instance of Supabase Client.
 * Will be null or non-functional placeholder if environment variables are not yet provided.
 */
export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

/**
 * Supabase configuration metadata for diagnostics/status plaques
 */
export const getSupabaseConfigStatus = () => {
  return {
    configured: isSupabaseConfigured(),
    url: supabaseUrl ? supabaseUrl.replace(/^(https:\/\/[^.]+).*/, '$1.supabase.co') : null,
    hasAnonKey: Boolean(supabaseAnonKey && supabaseAnonKey.length > 20),
  };
};
