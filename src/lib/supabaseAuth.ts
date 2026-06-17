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
