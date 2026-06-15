import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { Text, View } from 'react-native';

import { Tappable } from '../../components/Tappable';
import { Badge, Card, Screen, SectionLabel } from '../../components/ui';
import { navigateCrossTab } from '../../navigation/crossTab';
import { BookingsStackParamList } from '../../navigation/types';
import { AppBooking, useAppStore } from '../../store/useAppStore';
import { radii, spacing, useTheme } from '../../theme';

type Nav = NativeStackNavigationProp<BookingsStackParamList, 'Bookings'>;

/** Wireframe s-bookings: scheduled services + pending quotes (new bottom tab). */
export function BookingsScreen() {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();
  const bookings = useAppStore((s) => s.bookings);

  const openBooking = (b: AppBooking) => {
    if (b.kind === 'maintenance') {
      navigateCrossTab(navigation, 'HomeTab', 'MaintScheduleConfirm');
    } else {
      navigateCrossTab(navigation, 'HomeTab', 'BookingConfirm', {
        dealerId: b.dealerId,
        dateLabel: b.dateLabel,
        time: b.time,
        priceLabel: b.priceLabel,
      });
    }
  };

  const dateBadge = (b: AppBooking) => {
    const paid = b.status === 'paid';
    return (
      <View
        style={{
          width: 34,
          height: 34,
          borderRadius: 9,
          backgroundColor: paid ? colors.successSurface : colors.warningSurface,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text
          style={{
            fontSize: 7,
            fontWeight: '700',
            color: paid ? colors.successDeep : colors.warningDeep,
            textTransform: 'uppercase',
          }}
        >
          {b.mon}
        </Text>
        <Text
          style={{
            fontSize: 12,
            fontWeight: '800',
            color: paid ? colors.successDeep : colors.warningDeep,
            lineHeight: 13,
          }}
        >
          {b.day}
        </Text>
      </View>
    );
  };

  return (
    <Screen>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: spacing.md,
        }}
      >
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 20, fontWeight: '800', color: colors.textPrimary }}>Bookings</Text>
          <Text style={{ fontSize: 12, color: colors.textTertiary }}>
            Scheduled services & pending quotes
          </Text>
        </View>
        <Tappable
          onPress={() => navigateCrossTab(navigation, 'HomeTab', 'MaintSchedule')}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 5,
            backgroundColor: colors.primary,
            borderRadius: radii.pill,
            paddingHorizontal: 12,
            paddingVertical: 6,
          }}
        >
          <Text style={{ fontSize: 14, color: colors.onPrimary }}>＋</Text>
          <Text style={{ fontSize: 13, fontWeight: '700', color: colors.onPrimary }}>Book</Text>
        </Tappable>
      </View>

      <SectionLabel>Scheduled services</SectionLabel>
      {bookings.length === 0 ? (
        <Card style={{ padding: spacing.xl, alignItems: 'center', marginBottom: spacing.md }}>
          <Text style={{ fontSize: 28, marginBottom: 6 }}>📅</Text>
          <Text style={{ fontSize: 15, fontWeight: '600', color: colors.textPrimary }}>
            No bookings yet
          </Text>
          <Text style={{ fontSize: 13, color: colors.textSecondary, marginTop: 2, textAlign: 'center' }}>
            Book a repair or schedule a service and it will show up here.
          </Text>
        </Card>
      ) : (
        bookings.map((b) => (
          <Tappable
            key={b.id}
            onPress={() => openBooking(b)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.sm,
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderWidth: 1,
              borderRadius: radii.md,
              padding: spacing.sm,
              marginBottom: spacing.sm,
            }}
          >
            {dateBadge(b)}
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: colors.textPrimary }}>
                {b.icon} {b.title}
              </Text>
              <Text style={{ fontSize: 11, color: colors.textTertiary }}>
                {b.dealerName} · {b.dateLabel} · {b.time}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end', gap: 3 }}>
              <Text style={{ fontSize: 13, fontWeight: '800', color: colors.textPrimary }}>
                {b.priceLabel}
              </Text>
              <Badge
                label={b.status === 'paid' ? 'Paid' : 'Confirmed'}
                variant={b.status === 'paid' ? 'success' : 'warning'}
              />
            </View>
          </Tappable>
        ))
      )}

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: spacing.sm,
        }}
      >
        <SectionLabel>Pending quotes</SectionLabel>
        <Text style={{ fontSize: 11, fontWeight: '700', color: colors.primaryDark }}>1 active</Text>
      </View>
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
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: spacing.sm }}>
          <View style={{ flex: 1, height: 5, backgroundColor: colors.surfaceAlt, borderRadius: 3, overflow: 'hidden' }}>
            <View style={{ width: '38%', height: '100%', backgroundColor: colors.primary }} />
          </View>
          <Text style={{ fontSize: 11, color: colors.textTertiary }}>3 of 8 quoted</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          <Tappable
            onPress={() => navigateCrossTab(navigation, 'HomeTab', 'DealerQuotes')}
            style={{ flex: 2, backgroundColor: colors.primary, borderRadius: radii.sm, paddingVertical: 10, alignItems: 'center' }}
          >
            <Text style={{ fontSize: 13, fontWeight: '700', color: colors.onPrimary }}>Review 3 new quotes →</Text>
          </Tappable>
          <Tappable
            onPress={() => navigateCrossTab(navigation, 'HomeTab', 'AllQuotesMap')}
            style={{ flex: 1, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radii.sm, paddingVertical: 10, alignItems: 'center' }}
          >
            <Text style={{ fontSize: 13, color: colors.textSecondary }}>Map</Text>
          </Tappable>
        </View>
      </Card>
    </Screen>
  );
}
