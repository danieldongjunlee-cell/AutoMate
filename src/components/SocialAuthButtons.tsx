import React, { useState } from 'react';
import { Text, View } from 'react-native';

import { AppleLogo, GoogleLogo } from './BrandLogos';
import { SocialProvider, SocialSignInSheet } from './SocialSignInSheet';
import { Tappable } from './Tappable';
import { isSupabaseConfigured } from '../lib/supabase';
import { signInWithProvider } from '../lib/supabaseAuth';
import { useAppStore } from '../store/useAppStore';
import { palette, radii, spacing, useTheme } from '../theme';
import { showAlert } from '../utils/alerts';

/**
 * "or continue with" divider + Apple/Google buttons, wired to the demo social
 * chooser (or real Supabase OAuth). Reused on the log-in and sign-up screens so
 * both offer Google/Apple. `onDark` tints the divider for navy backgrounds.
 */
export function SocialAuthButtons({ onDark = false }: { onDark?: boolean }) {
  const { colors } = useTheme();
  const signIn = useAppStore((s) => s.signIn);
  const setAuth = useAppStore((s) => s.setAuth);
  const [sheetProvider, setSheetProvider] = useState<SocialProvider | null>(null);

  const onSocial = async (provider: SocialProvider) => {
    if (!isSupabaseConfigured) {
      setSheetProvider(provider);
      return;
    }
    try {
      const u = await signInWithProvider(provider);
      setAuth(u.token, { name: u.name, email: u.email, username: u.username, phone: u.phone });
      signIn();
    } catch (e) {
      showAlert('Sign-in failed', e instanceof Error ? e.message : 'Please try again.');
    }
  };

  const lineColor = onDark ? 'rgba(255,255,255,.18)' : colors.border;
  const labelColor = onDark ? 'rgba(255,255,255,.5)' : colors.textTertiary;

  return (
    <>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginVertical: spacing.md }}>
        <View style={{ flex: 1, height: 1, backgroundColor: lineColor }} />
        <Text style={{ fontSize: 13, color: labelColor }}>or continue with</Text>
        <View style={{ flex: 1, height: 1, backgroundColor: lineColor }} />
      </View>

      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        {(
          [
            { provider: 'apple', label: 'Apple' },
            { provider: 'google', label: 'Google' },
          ] as const
        ).map(({ provider, label }) => (
          <Tappable
            key={provider}
            onPress={() => onSocial(provider)}
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: spacing.sm,
              backgroundColor: '#fff',
              borderWidth: 1,
              borderColor: onDark ? '#fff' : colors.border,
              borderRadius: radii.md,
              paddingVertical: 13,
            }}
          >
            {provider === 'apple' ? <AppleLogo size={18} color={palette.textPrimary} /> : <GoogleLogo size={18} />}
            <Text style={{ fontSize: 14, color: palette.textPrimary }}>{label}</Text>
          </Tappable>
        ))}
      </View>

      <SocialSignInSheet
        provider={sheetProvider}
        onClose={() => setSheetProvider(null)}
        onSignedIn={() => {
          setSheetProvider(null);
          signIn();
        }}
      />
    </>
  );
}
