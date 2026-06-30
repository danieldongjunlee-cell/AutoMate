import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { Text, View } from 'react-native';

import { Tappable } from '../../components/Tappable';
import { Screen } from '../../components/ui';
import { useRequireAuth } from '../../hooks/useRequireAuth';
import { MaintStackParamList } from '../../navigation/types';
import { radii, spacing, useTheme } from '../../theme';

type Nav = NativeStackNavigationProp<MaintStackParamList, 'MaintLanding'>;

/**
 * Maintenance entry from the Home tab: two big choices — book a service, or
 * open the maintenance dashboard. The dashboard is gated for guests.
 */
export function MaintLandingScreen() {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();
  const requireAuth = useRequireAuth();

  const bigButton = (opts: {
    emoji: string;
    title: string;
    sub: string;
    primary?: boolean;
    onPress: () => void;
  }) => (
    <Tappable
      onPress={opts.onPress}
      style={{
        minHeight: 116,
        justifyContent: 'center',
        backgroundColor: opts.primary ? colors.primary : colors.surface,
        borderWidth: opts.primary ? 0 : 1,
        borderColor: colors.border,
        borderRadius: radii.lg,
        padding: spacing.lg,
        marginBottom: spacing.md,
      }}
    >
      <Text style={{ fontSize: 30, marginBottom: 6 }}>{opts.emoji}</Text>
      <Text style={{ fontSize: 19, fontWeight: '800', color: opts.primary ? colors.onPrimary : colors.textPrimary }}>
        {opts.title}
      </Text>
      <Text style={{ fontSize: 14, color: opts.primary ? 'rgba(255,255,255,0.8)' : colors.textTertiary, marginTop: 3 }}>
        {opts.sub}
      </Text>
    </Tappable>
  );

  return (
    <Screen>
      <Text style={{ fontSize: 24, fontWeight: '800', color: colors.textPrimary, marginBottom: 4, marginTop: spacing.sm }}>
        Maintenance
      </Text>
      <Text style={{ fontSize: 15, color: colors.textTertiary, marginBottom: spacing.lg }}>
        Book a service or check on your car&apos;s health.
      </Text>

      {bigButton({
        emoji: '📅',
        title: 'Book a service',
        sub: 'Oil, tires, brakes, inspection & more',
        primary: true,
        onPress: () => navigation.navigate('MaintServiceType'),
      })}
      {bigButton({
        emoji: '📊',
        title: 'View maintenance dashboard',
        sub: 'Health, market value, history & DIY guides',
        onPress: () => requireAuth('maintDashboard', () => navigation.navigate('MaintDashboard')),
      })}
    </Screen>
  );
}
