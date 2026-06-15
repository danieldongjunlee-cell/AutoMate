import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { Text, View } from 'react-native';

import { Tappable } from '../../components/Tappable';
import { Badge, Card, Screen, SectionLabel } from '../../components/ui';
import { navigateCrossTab } from '../../navigation/crossTab';
import { BookingsStackParamList } from '../../navigation/types';
import { radii, spacing, useTheme } from '../../theme';

type Nav = NativeStackNavigationProp<BookingsStackParamList, 'Bookings'>;

/** Wireframe s-bookings: scheduled services + pending quotes (new bottom tab). */
export function BookingsScreen() {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();

  const dateBadge = (mon: string, day: string, fg: string, bg: string) => (
    <View style={{ width: 34, height: 34, borderRadius: 9, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: 7, fontWeight: '700', color: fg, textTransform: 'uppercase' }}>{mon}</Text>
      <Text style={{ fontSize: 12, fontWeight: '800', color: fg, lineHeight: 13 }}>{day}</Text>
    </View>
  );

  const serviceRow = (
    badge: React.ReactNode,
    title: string,
    sub: string,
    price: string,
    status: React.ReactNode,
    go: () => void,
  ) => (
    <Tappable
      onPress={go}
      style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: radii.md, padding: spacing.sm, marginBottom: spacing.sm }}
    >
      {badge}
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 13, fontWeight: '600', color: colors.textPrimary }}>{title}</Text>
        <Text style={{ fontSize: 11, color: colors.textTertiary }}>{sub}</Text>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={{ fontSize: 13, fontWeight: '800', color: colors.textPrimary }}>{price}</Text>
        {status}
      </View>
    </Tappable>
  );

  return (
    <Screen>
      <Text style={{ fontSize: 20, fontWeight: '800', color: colors.textPrimary }}>Bookings</Text>
      <Text style={{ fontSize: 12, color: colors.textTertiary, marginBottom: spacing.md }}>
        Scheduled services & pending quotes
      </Text>

      <Card style={{ padding: spacing.md, marginBottom: spacing.md }}>
        <Text style={{ fontSize: 14, fontWeight: '800', color: colors.textPrimary, textAlign: 'center', marginBottom: spacing.sm }}>
          April 2027
        </Text>
        <View style={{ flexDirection: 'row', gap: spacing.md, justifyContent: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: colors.success }} />
            <Text style={{ fontSize: 11, color: colors.textSecondary }}>Oil change · Apr 7</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: colors.warning }} />
            <Text style={{ fontSize: 11, color: colors.textSecondary }}>Rear bumper · Apr 12</Text>
          </View>
        </View>
      </Card>

      <SectionLabel>Scheduled services</SectionLabel>
      {serviceRow(
        dateBadge('Apr', '7', colors.successDeep, colors.successSurface),
        '🛢️ Oil change',
        'Honda Fairfax · Mon 8:00 AM',
        '$49',
        <Badge label="Paid" variant="success" />,
        () => navigateCrossTab(navigation, 'HomeTab', 'MaintScheduleConfirm'),
      )}
      {serviceRow(
        dateBadge('Apr', '12', colors.warningDeep, colors.warningSurface),
        '🚗 Rear bumper repair',
        'Honda Fairfax · Thu 10:30 AM',
        '$320–345',
        <Badge label="Confirmed" variant="warning" />,
        () => navigateCrossTab(navigation, 'HomeTab', 'BookingConfirm'),
      )}

      <SectionLabel style={{ marginTop: spacing.sm }}>Pending quotes</SectionLabel>
      <Card tinted style={{ padding: spacing.md, borderColor: colors.primaryLight, borderWidth: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm }}>
          <View style={{ width: 30, height: 30, borderRadius: 8, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 14 }}>🚗</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, fontWeight: '700', color: colors.textPrimary }}>Rear bumper dent</Text>
            <Text style={{ fontSize: 11, color: colors.textTertiary }}>Requested Apr 3 · 8 dealers invited</Text>
          </View>
          <Badge label="3 new" variant="warning" />
        </View>
        <Tappable
          onPress={() => navigateCrossTab(navigation, 'HomeTab', 'DealerQuotes')}
          style={{ backgroundColor: colors.primary, borderRadius: radii.sm, paddingVertical: 10, alignItems: 'center' }}
        >
          <Text style={{ fontSize: 13, fontWeight: '700', color: colors.onPrimary }}>Review 3 new quotes →</Text>
        </Tappable>
      </Card>
    </Screen>
  );
}
