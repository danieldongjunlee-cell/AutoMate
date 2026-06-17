import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Text, View } from 'react-native';

import { PrimaryButton } from '../../components/PrimaryButton';
import { TextField } from '../../components/TextField';
import { Tappable } from '../../components/Tappable';
import { Card, Screen, SectionLabel } from '../../components/ui';
import { isSupabaseConfigured, supabase } from '../../lib/supabase';
import { radii, spacing, useTheme } from '../../theme';

interface Note {
  id: string;
  body: string;
  created_at: string;
}

/**
 * Standalone Supabase smoke test (the direct supabase-js path — no Express /
 * Prisma server). Sign up / sign in via Supabase Auth, then read/write a
 * per-user `notes` table guarded by RLS. See docs/supabase-demo.sql for the
 * table + policies to paste into the Supabase SQL editor.
 */
export function SupabaseDemoScreen() {
  const { colors } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  // Track the auth session (and reflect sign-in/out live).
  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setUserEmail(data.session?.user.email ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUserEmail(session?.user.email ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // Whenever we have a logged-in user, load their notes.
  useEffect(() => {
    if (userEmail) void loadNotes();
    else setNotes([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userEmail]);

  const run = async (label: string, fn: () => Promise<void>) => {
    setBusy(true);
    setMsg(null);
    try {
      await fn();
    } catch (e) {
      setMsg(`${label} failed: ${(e as Error).message}`);
    } finally {
      setBusy(false);
    }
  };

  const signUp = () =>
    run('Sign up', async () => {
      const { data, error } = await supabase!.auth.signUp({ email, password });
      if (error) throw error;
      setMsg(
        data.session
          ? 'Signed up & logged in.'
          : 'Account created — confirm via the email Supabase sent, then sign in. (Or disable “Confirm email” in Supabase → Authentication for instant testing.)',
      );
    });

  const signIn = () =>
    run('Sign in', async () => {
      const { error } = await supabase!.auth.signInWithPassword({ email, password });
      if (error) throw error;
      setMsg('Signed in.');
    });

  const signOut = () =>
    run('Sign out', async () => {
      await supabase!.auth.signOut();
      setMsg('Signed out.');
    });

  const loadNotes = () =>
    run('Load notes', async () => {
      const { data, error } = await supabase!
        .from('notes')
        .select('id, body, created_at')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setNotes((data as Note[]) ?? []);
    });

  const addNote = () =>
    run('Add note', async () => {
      if (!draft.trim()) return;
      const { error } = await supabase!.from('notes').insert({ body: draft.trim() });
      if (error) throw error;
      setDraft('');
      await loadNotes();
    });

  const deleteNote = (id: string) =>
    run('Delete note', async () => {
      const { error } = await supabase!.from('notes').delete().eq('id', id);
      if (error) throw error;
      await loadNotes();
    });

  // Env vars not set → tell the user how to fix it instead of crashing.
  if (!isSupabaseConfigured) {
    return (
      <Screen>
        <Card style={{ padding: spacing.lg }}>
          <Text style={{ fontSize: 16, fontWeight: '800', color: colors.textPrimary, marginBottom: 8 }}>
            Supabase isn’t configured
          </Text>
          <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20 }}>
            Add these to a <Text style={{ fontWeight: '700' }}>.env</Text> at the project root, then
            restart Expo:
            {'\n\n'}EXPO_PUBLIC_SUPABASE_URL=…{'\n'}EXPO_PUBLIC_SUPABASE_ANON_KEY=…
            {'\n\n'}Both come from Supabase → Settings → API.
          </Text>
        </Card>
      </Screen>
    );
  }

  const banner = msg ? (
    <View
      style={{
        backgroundColor: colors.primarySurface,
        borderRadius: radii.sm,
        borderWidth: 1,
        borderColor: colors.primaryLight,
        padding: spacing.sm,
        marginBottom: spacing.md,
      }}
    >
      <Text style={{ fontSize: 12, color: colors.primaryDeep, lineHeight: 18 }}>{msg}</Text>
    </View>
  ) : null;

  // Logged out → auth form.
  if (!userEmail) {
    return (
      <Screen>
        <SectionLabel>Supabase Auth</SectionLabel>
        {banner}
        <Card style={{ padding: spacing.md }}>
          <TextField
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextField
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="At least 6 characters"
            secure
            autoCapitalize="none"
          />
          <PrimaryButton label="Sign in" onPress={signIn} loading={busy} style={{ marginBottom: spacing.sm }} />
          <Tappable onPress={signUp} disabled={busy} style={{ alignItems: 'center', paddingVertical: 8 }}>
            <Text style={{ fontSize: 13, color: colors.primary, fontWeight: '700' }}>
              New here? Create an account
            </Text>
          </Tappable>
        </Card>
      </Screen>
    );
  }

  // Logged in → notes CRUD (proves DB + RLS work end to end).
  return (
    <Screen>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 12, color: colors.textTertiary }}>Signed in as</Text>
          <Text style={{ fontSize: 15, fontWeight: '700', color: colors.textPrimary }}>{userEmail}</Text>
        </View>
        <Tappable onPress={signOut} disabled={busy}>
          <Text style={{ fontSize: 13, color: colors.danger, fontWeight: '700' }}>Sign out</Text>
        </Tappable>
      </View>
      {banner}

      <Card style={{ padding: spacing.md, marginBottom: spacing.md }}>
        <TextField label="New note" value={draft} onChangeText={setDraft} placeholder="Type something…" />
        <PrimaryButton label="Add note" onPress={addNote} loading={busy} disabled={!draft.trim()} />
      </Card>

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <SectionLabel>Your notes ({notes.length})</SectionLabel>
        {busy ? <ActivityIndicator color={colors.primary} /> : null}
      </View>
      <FlatList
        data={notes}
        keyExtractor={(n) => n.id}
        scrollEnabled={false}
        ListEmptyComponent={
          <Text style={{ fontSize: 13, color: colors.textTertiary, paddingVertical: spacing.md }}>
            No notes yet — add one above. It’s stored in Supabase and only visible to you (RLS).
          </Text>
        }
        renderItem={({ item }) => (
          <Card style={{ padding: spacing.md, marginBottom: spacing.sm, flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ flex: 1, fontSize: 14, color: colors.textPrimary }}>{item.body}</Text>
            <Tappable onPress={() => deleteNote(item.id)} hitSlop={8}>
              <Text style={{ fontSize: 13, color: colors.danger }}>Delete</Text>
            </Tappable>
          </Card>
        )}
      />
    </Screen>
  );
}
