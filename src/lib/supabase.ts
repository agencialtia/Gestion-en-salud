import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Support both Vite (VITE_*) and Next.js (NEXT_PUBLIC_*) environment variable naming conventions
const metaEnv = typeof import.meta !== 'undefined' ? (import.meta as Record<string, any>).env || {} : {};
const procEnv = typeof process !== 'undefined' ? process.env || {} : {};

const supabaseUrl =
  metaEnv.VITE_SUPABASE_URL ||
  metaEnv.NEXT_PUBLIC_SUPABASE_URL ||
  procEnv.NEXT_PUBLIC_SUPABASE_URL ||
  procEnv.VITE_SUPABASE_URL ||
  '';

const supabaseAnonKey =
  metaEnv.VITE_SUPABASE_ANON_KEY ||
  metaEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  procEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  procEnv.VITE_SUPABASE_ANON_KEY ||
  '';

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.trim() !== '' &&
    supabaseAnonKey.trim() !== '' &&
    !supabaseUrl.includes('placeholder') &&
    !supabaseUrl.includes('example.com')
  );
};

// Lazy singleton client creation to avoid crashes if keys are empty during initial setup
let supabaseInstance: SupabaseClient | null = null;

export const getSupabase = (): SupabaseClient => {
  if (!supabaseInstance) {
    const validUrl = isSupabaseConfigured()
      ? supabaseUrl
      : 'https://placeholder-project.supabase.co';
    const validKey = isSupabaseConfigured()
      ? supabaseAnonKey
      : 'placeholder-anon-key-quilicura-salud';

    supabaseInstance = createClient(validUrl, validKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    });
  }
  return supabaseInstance;
};

export const supabase = getSupabase();
