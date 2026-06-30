import React from 'react';
import { Text, View } from 'react-native';

import { Tappable } from './Tappable';
import { useRequireAuth } from '../hooks/useRequireAuth';
import { useAppStore } from '../store/useAppStore';
import { radii, spacing, useTheme } from '../theme';

/**
 * "You're browsing as a guest" banner shown at the top of every tab while the
 * user isn't signed in. Tapping it opens the sign-in chooser. Renders nothing
 * once authenticated, so every screen reflects the live login state.
 */
export function GuestBanner() {
  const { colors } = useTheme();
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const requireAuth = useRequireAuth();
  if (isAuthenticated) return null;
  return (
    <Tappable
      onPress={() => requireAuth('signIn')}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        backgroundColor: colors.primarySurface,
        borderWidth: 1,
        borderColor: colors.primaryLight,
        borderRadius: radii.md,
        paddingHorizontal: spacing.md,
        paddingVertical: 10,
        marginBottom: spacing.md,
      }}
    >
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 14, fontWeight: '800', color: colors.primaryDeep }}>
          You&apos;re browsing as a guest
        </Text>
        <Text style={{ fontSize: 12, color: colors.primaryDark }}>
          Sign in to save your cars, bookings &amp; points
        </Text>
      </View>
      <Text style={{ fontSize: 14, fontWeight: '700', color: colors.primary }}>Sign in →</Text>
    </Tappable>
  );
}
