/**
 * Google OAuth Authentication and Account Helpers using Supabase
 */
import { supabase } from './supabase';

export interface GoogleUserProfile {
  email: string;
  name: string;
  photoUrl?: string;
  id?: string;
}

/**
 * Initiates Google OAuth Sign-In via standard Supabase redirect
 */
export const signInWithGoogleOAuth = async (redirectTo?: string) => {
  const targetRedirect = redirectTo || (typeof window !== 'undefined' ? window.location.origin : undefined);
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: targetRedirect,
    },
  });

  if (error) {
    console.error('Error al autenticar con Google:', error.message);
    return { data: null, error };
  }

  return { data, error: null };
};


