import { Platform } from 'react-native';

import { getMyProfile } from './profiles';
import { supabase } from './supabase';

/** Minimal user shape the app store needs, plus the Supabase access token. */
export interface SupabaseAuthResult {
  name: string;
  email: string;
  username?: string;
  token: string | null;
}

function nameFromMetadata(meta: Record<string, unknown> | undefined, fallback: string): string {
  const full = meta?.full_name;
  return typeof full === 'string' && full.trim() ? full : fallback;
}

/**
 * Build the display user from a session, preferring the editable public.profiles
 * row (full_name + username) so profile edits and relaunches show the right name
 * instead of the email. Falls back to auth metadata / email-local-part.
 */
async function fromProfile(email: string, metaName: string, token: string | null): Promise<SupabaseAuthResult> {
  let name = metaName;
  let username: string | undefined;
  try {
    const p = await getMyProfile();
    if (p?.full_name && p.full_name.trim()) name = p.full_name.trim();
    if (p?.username && p.username.trim()) username = p.username.trim();
  } catch {
    // profiles table may not exist yet — keep the metadata/email fallback
  }
  if (!name.trim()) name = email.split('@')[0] || email;
  return { name, email, username, token };
}

/**
 * Create a new Supabase Auth user (the app's Sign-up screen). full name + phone
 * ride along in user_metadata. With "Confirm email" disabled in Supabase a
 * session comes back immediately; with it enabled there's no session yet, so we
 * surface that as an error the screen can show.
 */
export async function signUpWithSupabase(params: {
  email: string;
  password: string;
  fullName: string;
  phone: string;
}): Promise<SupabaseAuthResult> {
  if (!supabase) throw new Error('Supabase is not configured.');
  const { data, error } = await supabase.auth.signUp({
    email: params.email.trim(),
    password: params.password,
    options: { data: { full_name: params.fullName.trim(), phone: params.phone.trim() } },
  });
  if (error) throw error;
  if (!data.session) {
    throw new Error(
      'Account created — confirm via the email Supabase sent, then sign in. (Or disable “Confirm email” in Supabase → Authentication for instant access.)',
    );
  }
  const email = data.user?.email ?? params.email.trim();
  return { name: params.fullName.trim() || email, email, token: data.session.access_token };
}

/** Authenticate an existing Supabase user (the app's Log-in screen). */
export async function signInWithSupabase(
  email: string,
  password: string,
): Promise<SupabaseAuthResult> {
  if (!supabase) throw new Error('Supabase is not configured.');
  const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
  if (error) throw error;
  const userEmail = data.user?.email ?? email.trim();
  return fromProfile(
    userEmail,
    nameFromMetadata(data.user?.user_metadata, ''),
    data.session?.access_token ?? null,
  );
}

/** Restore a persisted Supabase session on app launch (returning users). */
export async function getSupabaseSessionUser(): Promise<SupabaseAuthResult | null> {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  const session = data.session;
  if (!session) return null;
  const email = session.user.email ?? '';
  return fromProfile(email, nameFromMetadata(session.user.user_metadata, ''), session.access_token);
}

/** Clear the Supabase session (called from the app's sign-out). No-op if unset. */
export async function signOutSupabase(): Promise<void> {
  await supabase?.auth.signOut();
}

/**
 * Real Apple / Google sign-in via Supabase OAuth. Opens the provider's login in
 * a secure browser tab, then exchanges the returned code for a session.
 *
 * Requires the provider to be enabled in the Supabase dashboard (Authentication
 * → Providers) with its OAuth credentials, and the app's redirect URL
 * (automate://auth-callback) added to the allowed redirect URLs.
 */
export async function signInWithProvider(
  provider: 'google' | 'apple',
): Promise<SupabaseAuthResult> {
  if (!supabase) throw new Error('Supabase is not configured.');

  // Web: a full-page redirect. supabase-js (detectSessionInUrl) finishes the
  // sign-in when the browser returns, so this call doesn't resolve to a session
  // (the page navigates away). No native modules involved.
  if (Platform.OS === 'web') {
    const redirectTo = typeof window !== 'undefined' ? window.location.origin : undefined;
    const { error } = await supabase.auth.signInWithOAuth({ provider, options: { redirectTo } });
    if (error) throw error;
    return { name: '', email: '', token: null };
  }

  // Lazy-load the native modules so simply importing this file never crashes a
  // client that hasn't been rebuilt with expo-web-browser/expo-linking yet.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const WebBrowser = require('expo-web-browser') as typeof import('expo-web-browser');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const Linking = require('expo-linking') as typeof import('expo-linking');
  try {
    WebBrowser.maybeCompleteAuthSession();
  } catch {
    // web-only helper; ignore on native
  }
  const redirectTo = Linking.createURL('auth-callback');
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo, skipBrowserRedirect: true },
  });
  if (error) throw error;
  if (!data?.url) throw new Error('Could not start sign-in.');

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  if (result.type === 'cancel' || result.type === 'dismiss') {
    throw new Error('Sign-in was cancelled.');
  }
  if (result.type !== 'success' || !result.url) {
    throw new Error('Sign-in did not complete. Make sure the provider is enabled in Supabase.');
  }

  // PKCE returns ?code=… ; implicit returns tokens in the #fragment. Handle both.
  const returned = result.url;
  const code = new URL(returned).searchParams.get('code');
  if (code) {
    const { error: exErr } = await supabase.auth.exchangeCodeForSession(code);
    if (exErr) throw exErr;
  } else {
    const fragment = returned.includes('#') ? returned.split('#')[1] : '';
    const params = new URLSearchParams(fragment);
    const access_token = params.get('access_token');
    const refresh_token = params.get('refresh_token');
    const errDesc = params.get('error_description') ?? new URL(returned).searchParams.get('error_description');
    if (errDesc) throw new Error(errDesc);
    if (!access_token || !refresh_token) throw new Error('Sign-in did not return a session.');
    const { error: sessErr } = await supabase.auth.setSession({ access_token, refresh_token });
    if (sessErr) throw sessErr;
  }

  const { data: sessionData } = await supabase.auth.getSession();
  const session = sessionData.session;
  const email = session?.user.email ?? '';
  return fromProfile(email, nameFromMetadata(session?.user.user_metadata, ''), session?.access_token ?? null);
}
