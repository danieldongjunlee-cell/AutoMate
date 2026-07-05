import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
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
        // On web, let supabase-js finish OAuth from the redirect URL itself
        // (native handles the redirect manually via expo-web-browser).
        detectSessionInUrl: Platform.OS === 'web',
        // Use the PKCE code flow so OAuth redirects return ?code= we exchange.
        flowType: 'pkce',
      },
    })
  : null;
