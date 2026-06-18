import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Direct Supabase client (the "no server / no Prisma" path). Reads the project
 * URL + anon (publishable) key from EXPO_PUBLIC_* env vars — put them in a root
 * `.env` and restart Expo. If they're missing the client is `null` so the app
 * still runs on mocks instead of crashing at startup.
 */
const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url as string, anonKey as string, {
      auth: {
        storage: AsyncStorage,
        persistSession: true,
        autoRefreshToken: true,
        // RN has no URL-based auth callback like the web does.
        detectSessionInUrl: false,
        // Use the PKCE code flow so OAuth redirects return ?code= we exchange.
        flowType: 'pkce',
      },
    })
  : null;
