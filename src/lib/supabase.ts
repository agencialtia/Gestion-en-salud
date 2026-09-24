import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Safe fallbacks to prevent runtime crashes if environment variables are not yet loaded
const FALLBACK_URL = 'https://placeholder.supabase.co';
const FALLBACK_KEY = 'placeholder_key_not_configured';

/**
 * Retrieves environment variables in a platform-agnostic way (Vite import.meta.env, process.env, or localStorage override)
 * Configured according to .env.example:
 * - VITE_SUPABASE_URL
 * - VITE_SUPABASE_ANON_KEY
 * - VITE_SUPABASE_PROJECT_ID
 */
const getEnvVar = (viteKey: string, nextKey?: string): string => {
  // 1. Vite import.meta.env (Primary for Vite client)
  if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
    const metaVal = (import.meta as any).env[viteKey] || (nextKey ? (import.meta as any).env[nextKey] : undefined);
    if (metaVal) return String(metaVal).trim();
  }

  // 2. Node / SSR / Testing process.env
  if (typeof process !== 'undefined' && process.env) {
    const procVal = process.env[viteKey] || (nextKey ? process.env[nextKey] : undefined);
    if (procVal) return String(procVal).trim();
  }

  // 3. Browser localStorage override (useful for runtime testing or custom credentials)
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const localVal =
        window.localStorage.getItem(viteKey) ||
        (nextKey ? window.localStorage.getItem(nextKey) : null) ||
        (viteKey.includes('URL') ? window.localStorage.getItem('CUSTOM_SUPABASE_URL') : null) ||
        (viteKey.includes('KEY') ? window.localStorage.getItem('CUSTOM_SUPABASE_KEY') : null);
      if (localVal) return String(localVal).trim();
    } catch {
      // localStorage restricted
    }
  }

  return '';
};

/**
 * Strips trailing slashes, /rest/v1, or /auth/v1 to produce a clean base Supabase URL
 */
export const sanitizeSupabaseUrl = (rawUrl: string): string => {
  if (!rawUrl) return '';
  let url = rawUrl.trim();
  url = url.replace(/\/+$/, '');
  url = url.replace(/\/rest\/v1\/?$/, '').replace(/\/auth\/v1\/?$/, '');
  return url;
};

/**
 * Returns the Supabase URL from VITE_SUPABASE_URL (.env.example)
 */
export const getSupabaseUrl = (): string => {
  const envUrl = getEnvVar('VITE_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_URL');
  if (envUrl && envUrl.trim().length > 0) {
    return sanitizeSupabaseUrl(envUrl);
  }
  return '';
};

/**
 * Returns the Supabase Anonymous / Publishable Key from VITE_SUPABASE_ANON_KEY (.env.example)
 */
export const getSupabaseAnonKey = (): string => {
  const envKey =
    getEnvVar('VITE_SUPABASE_ANON_KEY', 'NEXT_PUBLIC_SUPABASE_ANON_KEY') ||
    getEnvVar('VITE_SUPABASE_PUBLISHABLE_KEY', 'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY');
  if (envKey && envKey.trim().length > 0) {
    return envKey.trim();
  }
  return '';
};

/**
 * Returns the Supabase Project ID from VITE_SUPABASE_PROJECT_ID (.env.example) or extracts it from the URL
 */
export const getSupabaseProjectId = (): string => {
  const envProjId = getEnvVar('VITE_SUPABASE_PROJECT_ID');
  if (envProjId && envProjId.trim().length > 0) {
    return envProjId.trim();
  }
  const url = getSupabaseUrl();
  const match = url.match(/https?:\/\/([^.]+)\.supabase\.co/);
  return match ? match[1] : '';
};

export const SUPABASE_PROJECT_ID = getSupabaseProjectId();
export const OFFICIAL_SUPABASE_URL = getSupabaseUrl();
export const OFFICIAL_SUPABASE_REST_URL = getSupabaseUrl() ? `${getSupabaseUrl()}/rest/v1` : '';
export const OFFICIAL_SUPABASE_PUBLISHABLE_KEY = getSupabaseAnonKey();

/**
 * Checks whether Supabase is properly configured with valid credentials
 */
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

// Singleton Supabase Client instance with persistent session and auto-refresh
let supabaseInstance: SupabaseClient | null = null;

/**
 * Returns or initializes the singleton Supabase client
 */
export const getSupabase = (): SupabaseClient => {
  if (!supabaseInstance) {
    const configured = isSupabaseConfigured();
    const url = configured ? getSupabaseUrl() : FALLBACK_URL;
    const key = configured ? getSupabaseAnonKey() : FALLBACK_KEY;

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

/**
 * The initialized Supabase Client instance ready for consumption
 */
export const supabase: SupabaseClient = getSupabase();

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

export { createClient };
export type { SupabaseClient };
