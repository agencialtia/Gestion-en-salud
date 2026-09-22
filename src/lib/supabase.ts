import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Safe fallbacks only used to prevent client initialization crashes if env vars are missing
const FALLBACK_URL = 'https://placeholder.supabase.co';
const FALLBACK_KEY = 'placeholder_key_not_configured';

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
  if (!rawUrl) return '';
  let url = rawUrl.trim();
  url = url.replace(/\/+$/, '');
  url = url.replace(/\/rest\/v1\/?$/, '').replace(/\/auth\/v1\/?$/, '');
  return url;
};

export const getSupabaseUrl = (): string => {
  const envUrl = getEnvVar('VITE_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_URL');
  if (envUrl && envUrl.trim().length > 0) {
    return sanitizeSupabaseUrl(envUrl);
  }
  return '';
};

export const getSupabaseAnonKey = (): string => {
  const envKey =
    getEnvVar('VITE_SUPABASE_ANON_KEY', 'NEXT_PUBLIC_SUPABASE_ANON_KEY') ||
    getEnvVar('VITE_SUPABASE_PUBLISHABLE_KEY', 'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY');
  if (envKey && envKey.trim().length > 0) {
    return envKey.trim();
  }
  return '';
};

export const SUPABASE_PROJECT_ID = (() => {
  const url = getSupabaseUrl();
  const match = url.match(/https?:\/\/([^.]+)\.supabase\.co/);
  return match ? match[1] : '';
})();

export const OFFICIAL_SUPABASE_URL = getSupabaseUrl();
export const OFFICIAL_SUPABASE_REST_URL = getSupabaseUrl() ? `${getSupabaseUrl()}/rest/v1` : '';
export const OFFICIAL_SUPABASE_PUBLISHABLE_KEY = getSupabaseAnonKey();

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
    const url = isConfigured ? getSupabaseUrl() : FALLBACK_URL;
    const key = isConfigured ? getSupabaseAnonKey() : FALLBACK_KEY;

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
  if (!isSupabaseConfigured()) {
    return { connected: false, error: 'Supabase no está configurado con credenciales en este entorno.' };
  }
  try {
    const url = getSupabaseUrl();
    const key = getSupabaseAnonKey();
    if (!url || !key) {
      return { connected: false, error: 'Credenciales incompletas' };
    }
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


