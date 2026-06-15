import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { Text, View } from 'react-native';

import { PrimaryButton } from '../../components/PrimaryButton';
import { Card, Screen } from '../../components/ui';
import { HomeStackParamList } from '../../navigation/types';
import { radii, spacing, useTheme } from '../../theme';

type Nav = NativeStackNavigationProp<HomeStackParamList, 'TosBooking'>;

const SECTIONS: [string, string, string][] = [
  ['1 · Book in good faith', 'success', 'Show up for your appointment, or reschedule / cancel at least 12 hours ahead.'],
  ['2 · No-show policy', 'danger', 'Missing an appointment without 12h notice forfeits your deposit and adds a strike. 3 strikes permanently removes your account.'],
  ['3 · Security deposit', 'primary', 'A small refundable hold reserves your slot and is released after you show up. Pro members are exempt.'],
  ['4 · Estimates, not final bills', 'warning', 'Quotes are honest estimates ± genuine in-person inspection findings, which the shop must message before charging.'],
  ['5 · Keep it on AutoMate', 'primary', "Don't accept off-platform 'cash discount' or '10% below quote' offers to bypass AutoMate. Shops sign a matching no-poaching Partner Agreement."],
  ['6 · Honest reviews', 'info', 'Only verified bookings can review, and reviews must reflect a genuine experience.'],
];

/** Wireframe s-tos-booking: the booking Terms of Service. */
export function TosBookingScreen() {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();
  const bar: Record<string, string> = {
    success: colors.success,
    danger: colors.danger,
    primary: colors.primary,
    warning: colors.warning,
    info: colors.info,
  };
  return (
    <Screen>
      <Text style={{ fontSize: 12, color: colors.textTertiary, lineHeight: 18, marginBottom: spacing.md }}>
        By booking through AutoMate you agree to the following. These keep pricing honest and the
        marketplace fair for customers and shops.
      </Text>
      {SECTIONS.map(([title, tone, body]) => (
        <Card
          key={title}
          style={{ padding: spacing.md, marginBottom: spacing.sm, borderLeftWidth: 3, borderLeftColor: bar[tone] }}
        >
          <Text style={{ fontSize: 14, fontWeight: '700', color: colors.textPrimary, marginBottom: 3 }}>
            {title}
          </Text>
          <Text style={{ fontSize: 12, color: colors.textSecondary, lineHeight: 18 }}>{body}</Text>
        </Card>
      ))}
      <View style={{ marginTop: spacing.sm }}>
        <PrimaryButton label="Got it — back to booking" onPress={() => navigation.goBack()} />
      </View>
    </Screen>
  );
}
