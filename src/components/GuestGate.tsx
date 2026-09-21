import React from 'react';
import { View } from 'react-native';

import { IconChip } from './IconChip';
import { IconName } from './Icon';
import { PrimaryButton } from './PrimaryButton';
import { Text } from './Text';
import { Card } from './ui';
import { useRequireAuth } from '../hooks/useRequireAuth';
import { radii, spacing, useTheme } from '../theme';

/**
 * What a guest sees in place of an account-only tab: what the tab holds and
 * the way in. Tapping the button opens the sign-up side of the auth modal
 * with the intent recorded, so the tab resumes once they have joined.
 */
export function GuestGate({
  icon,
  title,
  body,
  intent,
  cta = 'Sign up or log in →',
}: {
  icon: IconName;
  title: string;
  body: string;
  intent: string;
  cta?: string;
}) {
  const { colors } = useTheme();
  const requireAuth = useRequireAuth();
  return (
    <Card style={{ padding: spacing.xl, alignItems: 'center', borderRadius: radii.tile }}>
      <IconChip name={icon} size={64} glyph={34} color={colors.primaryDark} />
      <Text style={{ fontSize: 18, fontWeight: '800', color: colors.textPrimary, marginTop: spacing.md, textAlign: 'center' }}>{title}</Text>
      <Text style={{ fontSize: 14, color: colors.textTertiary, textAlign: 'center', marginTop: 4, marginBottom: spacing.lg, lineHeight: 20 }}>{body}</Text>
      <View style={{ alignSelf: 'stretch' }}>
        <PrimaryButton label={cta} onPress={() => requireAuth(intent, undefined, 'join')} />
      </View>
    </Card>
  );
}
