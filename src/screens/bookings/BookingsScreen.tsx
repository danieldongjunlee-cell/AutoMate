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
import { showAlert } from '../../utils/alerts';

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
    if (b.status === 'cancelled') {
      // Shop cancelled → show the reason why.
      showAlert(
        'Booking cancelled by the shop',
        b.reason ?? 'This booking was cancelled by the shop.',
      );
      return;
    }
    if (b.status === 'reschedule_proposed') {
      // Shop proposed a new time → open reschedule (shows the reason) to accept or pick another.
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

  // Days with a scheduled booking → mark color by kind (derived from filtered list).
  const markedDays = new Map<number, string>();
  bookings.forEach((b) => {
    if (b.status === 'cancelled') return; // cancelled → not on the calendar
    const d = parseInt(b.day, 10);
    if (!Number.isNaN(d)) markedDays.set(d, b.kind === 'repair' ? colors.warning : colors.primary);
  });

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

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
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

      <View style={{ marginTop: spacing.md }}>
        <SectionLabel>{t('Calendar')}</SectionLabel>
      </View>
      <Card style={{ padding: spacing.md, marginBottom: spacing.md }}>
        <Text style={{ fontSize: 14, fontWeight: '800', color: colors.textPrimary, marginBottom: spacing.sm }}>
          April 2027
        </Text>
        <View style={{ flexDirection: 'row', marginBottom: 4 }}>
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
            <Text
              key={`h${i}`}
              style={{ flex: 1, textAlign: 'center', fontSize: 10, fontWeight: '700', color: colors.textTertiary }}
            >
              {d}
            </Text>
          ))}
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {Array.from({ length: 30 }, (_, i) => i + 1).map((day) => {
            const mark = markedDays.get(day);
            return (
              <View
                key={`d${day}`}
                style={{ width: `${100 / 7}%`, alignItems: 'center', paddingVertical: 3 }}
              >
                <View
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 13,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: mark ?? 'transparent',
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: mark ? '800' : '500',
                      color: mark ? colors.onPrimary : colors.textSecondary,
                    }}
                  >
                    {day}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
        <View style={{ flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: colors.warning }} />
            <Text style={{ fontSize: 11, color: colors.textTertiary }}>{t('Repair')}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: colors.primary }} />
            <Text style={{ fontSize: 11, color: colors.textTertiary }}>{t('Maintenance')}</Text>
          </View>
        </View>
      </Card>

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
              {(b.status === 'reschedule_proposed' || b.status === 'cancelled') && b.reason ? (
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: '700',
                    color: b.status === 'cancelled' ? colors.danger : colors.warningDeep,
                    marginTop: 2,
                  }}
                >
                  ⓘ Tap to see why
                </Text>
              ) : null}
            </View>
            <View style={{ alignItems: 'flex-end', gap: 3 }}>
              <Text style={{ fontSize: 13, fontWeight: '800', color: colors.textPrimary }}>
                {b.priceLabel}
              </Text>
              {b.status === 'reschedule_proposed' ? (
                <Badge label="New time proposed" variant="warning" />
              ) : b.status === 'cancelled' ? (
                <Badge label="Cancelled" variant="danger" />
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
    </Screen>
  );
}
