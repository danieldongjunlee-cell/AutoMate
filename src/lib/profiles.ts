import { supabase } from './supabase';

/** A row of public.profiles (see docs/supabase-profiles.sql). */
export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  username: string | null;
  phone: string | null;
}

const COLS = 'id, email, full_name, username, phone';

/** Fetch the signed-in user's profile row (null if none / not signed in). */
export async function getMyProfile(): Promise<Profile | null> {
  if (!supabase) return null;
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;
  const { data, error } = await supabase
    .from('profiles')
    .select(COLS)
    .eq('id', auth.user.id)
    .maybeSingle();
  if (error) throw error;
  return (data as Profile) ?? null;
}

/** Update the signed-in user's profile (only the fields you pass). */
export async function updateMyProfile(patch: {
  full_name?: string;
  username?: string;
  phone?: string;
}): Promise<void> {
  if (!supabase) throw new Error('Supabase is not configured.');
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error('Not signed in.');
  const { error } = await supabase
    .from('profiles')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', auth.user.id);
  if (error) throw error;
}
