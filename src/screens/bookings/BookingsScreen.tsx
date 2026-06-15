import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { Text, View } from 'react-native';

import { CarSwitchChip } from '../../components/CarSwitchChip';
import { Tappable } from '../../components/Tappable';
import { Badge, Card, Screen, SectionLabel } from '../../components/ui';
import { useActiveVehicle } from '../../hooks/useActiveVehicle';
import { navigateCrossTab } from '../../navigation/crossTab';
import { BookingsStackParamList } from '../../navigation/types';
import { QUOTE_REQUEST, QUOTES } from '../../services/mock/data';
import { AppBooking, useAppStore } from '../../store/useAppStore';
import { radii, spacing, useTheme } from '../../theme';
import { useT } from '../../i18n';

type Nav = NativeStackNavigationProp<BookingsStackParamList, 'Bookings'>;

/** Wireframe s-bookings: scheduled services + pending quotes (new bottom tab). */
export function BookingsScreen() {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();
  const t = useT();
  const { brand } = useActiveVehicle();
  const allBookings = useAppStore((s) => s.bookings);
  // Only the active car's bookings (switching cars shows a different list).
  const bookings = allBookings.filter((b) => b.brand === brand);
  // Pending-quotes counts reflect the actual received quotes / dealers invited.
  const quotesReceived = QUOTES.length;
  const dealersInvited = QUOTE_REQUEST.shopsNotified;

  const openBooking = (b: AppBooking) => {
    if (b.status === 'reschedule_proposed') {
      // Shop proposed a new time → open reschedule to accept or pick another.
      navigateCrossTab(navigation, 'HomeTab', 'Reschedule', { kind: b.kind, bookingId: b.id });
      return;
    }
    if (b.kind === 'maintenance') {
      navigateCrossTab(navigation, 'HomeTab', 'MaintScheduleConfirm');
    } else {
      navigateCrossTab(navigation, 'HomeTab', 'BookingConfirm', {
        dealerId: b.dealerId,
        dateLabel: b.dateLabel,
        time: b.time,
        priceLabel: b.priceLabel,
        bookingId: b.id,
      });
    }
  };

  // Repair vs maintenance differentiated by color (no icons).
  const REPAIR = { surface: colors.warningSurface, deep: colors.warningDeep, accent: colors.warning };
  const MAINT = { surface: colors.primarySurface, deep: colors.primaryDeep, accent: colors.primary };
  const kindStyle = (b: AppBooking) => (b.kind === 'repair' ? REPAIR : MAINT);

  const dateBadge = (b: AppBooking) => {
    const k = kindStyle(b);
    return (
      <View
        style={{
          width: 34,
          height: 34,
          borderRadius: 9,
          backgroundColor: k.surface,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ fontSize: 7, fontWeight: '700', color: k.deep, textTransform: 'uppercase' }}>
          {b.mon}
        </Text>
        <Text style={{ fontSize: 12, fontWeight: '800', color: k.deep, lineHeight: 13 }}>{b.day}</Text>
      </View>
    );
  };

  return (
    <Screen safeTop>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: spacing.sm,
          marginBottom: spacing.md,
        }}
      >
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 20, fontWeight: '800', color: colors.textPrimary }}>{t('Bookings')}</Text>
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
        <CarSwitchChip />
      </View>

      <SectionLabel>{t('Scheduled services')}</SectionLabel>
      {bookings.length === 0 ? (
        <Card style={{ padding: spacing.xl, alignItems: 'center', marginBottom: spacing.md }}>
          <Text style={{ fontSize: 28, marginBottom: 6 }}>📅</Text>
          <Text style={{ fontSize: 15, fontWeight: '600', color: colors.textPrimary }}>
            {t('No bookings yet')}
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
              borderLeftWidth: 4,
              borderLeftColor: kindStyle(b).accent,
              borderRadius: radii.md,
              padding: spacing.sm,
              marginBottom: spacing.sm,
            }}
          >
            {dateBadge(b)}
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: colors.textPrimary }}>
                {b.title}
              </Text>
              <Text style={{ fontSize: 10, fontWeight: '700', color: kindStyle(b).accent, textTransform: 'uppercase', letterSpacing: 0.4, marginTop: 1 }}>
                {b.kind === 'repair' ? 'Repair' : 'Maintenance'}
              </Text>
              <Text style={{ fontSize: 11, color: colors.textTertiary }}>
                {b.dealerName} · {b.dateLabel} · {b.time}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end', gap: 3 }}>
              <Text style={{ fontSize: 13, fontWeight: '800', color: colors.textPrimary }}>
                {b.priceLabel}
              </Text>
              {b.status === 'reschedule_proposed' ? (
                <Badge label="New time proposed" variant="warning" />
              ) : (
                <Badge
                  label={b.status === 'paid' ? 'Paid' : 'Confirmed'}
                  variant={b.status === 'paid' ? 'success' : 'primarySoft'}
                />
              )}
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
        <SectionLabel>{t('Pending quotes')}</SectionLabel>
        <Text style={{ fontSize: 11, fontWeight: '700', color: colors.primaryDark }}>1 active</Text>
      </View>
      <Card tinted style={{ padding: spacing.md, borderColor: colors.primaryLight, borderWidth: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm }}>
          <View style={{ width: 30, height: 30, borderRadius: 8, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 14 }}>🚗</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, fontWeight: '700', color: colors.textPrimary }}>Rear bumper dent</Text>
            <Text style={{ fontSize: 11, color: colors.textTertiary }}>Requested Apr 3 · {dealersInvited} dealers invited</Text>
          </View>
          <Badge label={`${quotesReceived} new`} variant="warning" />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: spacing.sm }}>
          <View style={{ flex: 1, height: 5, backgroundColor: colors.surfaceAlt, borderRadius: 3, overflow: 'hidden' }}>
            <View style={{ width: `${Math.round((quotesReceived / dealersInvited) * 100)}%`, height: '100%', backgroundColor: colors.primary }} />
          </View>
          <Text style={{ fontSize: 11, color: colors.textTertiary }}>{quotesReceived} of {dealersInvited} quoted</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          <Tappable
            onPress={() => navigateCrossTab(navigation, 'HomeTab', 'DealerQuotes')}
            style={{ flex: 2, backgroundColor: colors.primary, borderRadius: radii.sm, paddingVertical: 10, alignItems: 'center' }}
          >
            <Text style={{ fontSize: 13, fontWeight: '700', color: colors.onPrimary }}>Review {quotesReceived} new quotes →</Text>
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
