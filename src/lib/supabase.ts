import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Environment variable retrieval with support for Vite (VITE_*) and Next.js (NEXT_PUBLIC_*)
const getEnvVar = (viteKey: string, nextKey: string): string => {
  if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
    const metaVal = (import.meta as any).env[viteKey] || (import.meta as any).env[nextKey];
    if (metaVal) return String(metaVal).trim();
  }
  if (typeof process !== 'undefined' && process.env) {
    const procVal = process.env[viteKey] || process.env[nextKey];
    if (procVal) return String(procVal).trim();
  }
  return '';
};

const OFFICIAL_SUPABASE_URL = 'https://lpcwfyvlbytpgydpmirx.supabase.co';

export const getSupabaseUrl = (): string => {
  const envUrl = getEnvVar('VITE_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_URL');
  return envUrl || OFFICIAL_SUPABASE_URL;
};

export const getSupabaseAnonKey = (): string => getEnvVar('VITE_SUPABASE_ANON_KEY', 'NEXT_PUBLIC_SUPABASE_ANON_KEY');

export const isSupabaseConfigured = (): boolean => {
  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey();
  return Boolean(
    url &&
    key &&
    (url.startsWith('https://') || url.startsWith('http://')) &&
    !url.includes('placeholder') &&
    !url.includes('example.com') &&
    key.length > 20 &&
    !key.includes('placeholder')
  );
};

// Singleton Supabase Client with persistent session and auto-refresh
let supabaseInstance: SupabaseClient | null = null;

export const getSupabase = (): SupabaseClient => {
  if (!supabaseInstance) {
    const isConfigured = isSupabaseConfigured();
    const url = getSupabaseUrl();
    const key = isConfigured ? getSupabaseAnonKey() : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.placeholder';

    supabaseInstance = createClient(url, key, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        flowType: 'pkce',
      },
    });
  }
  return supabaseInstance;
};

export const supabase = getSupabase();

