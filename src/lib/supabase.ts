import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Project credentials provided for Supabase
export const SUPABASE_PROJECT_ID = 'lpcwfyvlbytpgydpmirx';
export const OFFICIAL_SUPABASE_URL = 'https://lpcwfyvlbytpgydpmirx.supabase.co';
export const OFFICIAL_SUPABASE_REST_URL = 'https://lpcwfyvlbytpgydpmirx.supabase.co/rest/v1';
export const OFFICIAL_SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_IwlcYHYunVmv3gyl_kDITw_II31rY_8';

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

// Strips trailing /rest/v1, /auth/v1, or trailing slashes to ensure standard Supabase client URL
export const sanitizeSupabaseUrl = (rawUrl: string): string => {
  if (!rawUrl) return OFFICIAL_SUPABASE_URL;
  let url = rawUrl.trim();
  url = url.replace(/\/+$/, '');
  url = url.replace(/\/rest\/v1\/?$/, '').replace(/\/auth\/v1\/?$/, '');
  return url || OFFICIAL_SUPABASE_URL;
};

export const getSupabaseUrl = (): string => {
  const envUrl = getEnvVar('VITE_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_URL');
  return sanitizeSupabaseUrl(envUrl || OFFICIAL_SUPABASE_URL);
};

export const getSupabaseAnonKey = (): string => {
  const envKey =
    getEnvVar('VITE_SUPABASE_ANON_KEY', 'NEXT_PUBLIC_SUPABASE_ANON_KEY') ||
    getEnvVar('VITE_SUPABASE_PUBLISHABLE_KEY', 'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY');
  return envKey || OFFICIAL_SUPABASE_PUBLISHABLE_KEY;
};

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
    const key = isConfigured ? getSupabaseAnonKey() : OFFICIAL_SUPABASE_PUBLISHABLE_KEY;

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

/**
 * Checks connectivity to the live Supabase Auth service
 */
export const checkSupabaseHealth = async (): Promise<{ connected: boolean; version?: string; error?: string }> => {
  try {
    const url = getSupabaseUrl();
    const key = getSupabaseAnonKey();
    const response = await fetch(`${url}/auth/v1/health`, {
      headers: {
        apikey: key,
      },
    });
    if (response.ok) {
      const data = await response.json();
      return { connected: true, version: data.version || 'v2' };
    }
    return { connected: false, error: `Status ${response.status}` };
  } catch (err: any) {
    return { connected: false, error: err?.message || 'Error de red' };
  }
};


