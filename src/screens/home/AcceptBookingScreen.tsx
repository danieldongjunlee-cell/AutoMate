import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { CalendarMonth, TimeSlots } from '../../components/CalendarMonth';
import { PrimaryButton } from '../../components/PrimaryButton';
import { ProcessingOverlay } from '../../components/Skeleton';
import { Tappable } from '../../components/Tappable';
import { AvatarCircle, Badge, Screen, SectionLabel } from '../../components/ui';
import { useActiveVehicle } from '../../hooks/useActiveVehicle';
import { HomeStackParamList } from '../../navigation/types';
import {
  BOOKING_MONTH,
  dealerById,
  dealerClosedWeekdays,
  dealerWeeklyHours,
  QUOTES,
  TIME_SLOTS,
  WEEKDAY_NAMES,
} from '../../services/mock/data';
import { quoteService } from '../../services';
import { dateBadgeParts, depositForBooking, useAppStore } from '../../store/useAppStore';
import { radii, spacing, useTheme } from '../../theme';
import { weekdayOf } from '../../utils/dates';

type Nav = NativeStackNavigationProp<HomeStackParamList, 'AcceptBooking'>;
type Route = RouteProp<HomeStackParamList, 'AcceptBooking'>;

/** Wireframe s-accept-booking: accepted-quote banner + date/time picker. */
export function AcceptBookingScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { colors } = useTheme();
  const addPoints = useAppStore((s) => s.addPoints);
  const addBooking = useAppStore((s) => s.addBooking);
  const isPro = useAppStore((s) => s.isPro);
  const { brand } = useActiveVehicle();

  const dealer = dealerById(route.params?.dealerId);
  const quote = QUOTES.find((q) => q.dealerId === dealer.id);
  const priceLabel = quote?.priceHigh ? `$${quote.price}–$${quote.priceHigh}` : `$${quote?.price ?? 330}`;

  // The calendar only offers days this shop is actually open.
  const weeklyHours = dealerWeeklyHours(dealer.id);
  const closedWeekdays = dealerClosedWeekdays(dealer.id);
  const todayWeekday = new Date().getDay();

  // Default to the first open, non-past day from tomorrow onward.
  const firstOpenDay = (() => {
    const { year, month, daysInMonth, defaultDay, unavailable } = BOOKING_MONTH;
    for (let d = defaultDay; d <= daysInMonth; d++) {
      if (!unavailable.includes(d) && !closedWeekdays.includes(new Date(year, month - 1, d).getDay())) return d;
    }
    return defaultDay;
  })();

  const [day, setDay] = useState<number | null>(firstOpenDay);
  const [time, setTime] = useState<string | null>('10:30 AM');
  const [agreed, setAgreed] = useState(false);
  const [booking, setBooking] = useState(false);

  const dateLabel = day ? `${weekdayOf(day)}, ${BOOKING_MONTH.monthAbbr} ${day}` : null;

  const onConfirm = async () => {
    if (!day || !time || !agreed) return;
    setBooking(true);
    // Independent mock calls — run in parallel so the CTA doesn't stall.
    const [, { pointsEarned }] = await Promise.all([
      quote ? quoteService.acceptQuote(quote.id) : Promise.resolve(null),
      quoteService.bookAppointment(dealer.id, dateLabel!, time),
    ]);
    addPoints(pointsEarned, 'Booked a repair');
    setBooking(false);

    // The booking agreement is now part of this screen, so go straight to the
    // (non-Pro) refundable deposit, or to the confirmation when it's waived.
    const nextParams = { dealerId: dealer.id, dateLabel: dateLabel!, time, priceLabel };
    if (depositForBooking('repair', isPro) > 0) {
      navigation.navigate('BookDeposit', { kind: 'repair', dealerId: dealer.id, next: 'BookingConfirm', nextParams });
      return;
    }
    // Pro → deposit waived: record the confirmed booking and confirm.
    addBooking({
      kind: 'repair',
      brand,
      dealerId: dealer.id,
      icon: '🚗',
      title: 'Rear bumper repair',
      dealerName: dealer.name,
      dateLabel: dateLabel!,
      ...dateBadgeParts(dateLabel!),
      time,
      priceLabel,
      status: 'confirmed',
    });
    navigation.navigate('BookingConfirm', nextParams);
  };

  return (
    <Screen>
      {/* Accepted quote banner */}
      <View
        style={{
          backgroundColor: colors.primarySurface,
          borderRadius: radii.sm,
          borderWidth: 1,
          borderColor: colors.primaryLight,
          padding: spacing.sm,
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.sm,
          marginBottom: spacing.md,
        }}
      >
        <AvatarCircle initial={dealer.initial} color={dealer.color} size={36} />
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 15, fontWeight: '500', color: colors.primaryDeep }}>
            {dealer.name}
          </Text>
          <Text style={{ fontSize: 13, color: colors.primaryDark }}>
            Rear bumper dent · {quote?.parts ?? 'OEM'} parts · {priceLabel} est.
          </Text>
        </View>
        <Badge label="Accepted" variant="primary" />
      </View>

      {/* Shop hours — full week, sourced from the shop's Google listing. The
          calendar below only opens days the shop is actually open. */}
      <SectionLabel>{dealer.name} hours</SectionLabel>
      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: radii.md,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.xs,
          marginBottom: spacing.xxxl,
        }}
      >
        {WEEKDAY_NAMES.map((name, i) => {
          const hrs = weeklyHours[i];
          const isClosed = hrs === 'Closed';
          const isToday = i === todayWeekday;
          return (
            <View
              key={name}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                paddingVertical: 7,
                borderBottomWidth: i < WEEKDAY_NAMES.length - 1 ? StyleSheet.hairlineWidth : 0,
                borderBottomColor: colors.divider,
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: isToday ? '800' : '500', color: isToday ? colors.primary : colors.textSecondary }}>
                {name}
                {isToday ? ' · Today' : ''}
              </Text>
              <Text style={{ fontSize: 14, fontWeight: isToday ? '700' : '500', color: isClosed ? colors.danger : colors.textPrimary }}>
                {hrs}
              </Text>
            </View>
          );
        })}
      </View>

      <SectionLabel>Select date</SectionLabel>
      <View style={{ marginBottom: spacing.xxxl }}>
        <CalendarMonth selectedDay={day} onSelectDay={setDay} closedWeekdays={closedWeekdays} />
      </View>

      <SectionLabel>{day ? `Select time — ${dateLabel}` : 'Select time'}</SectionLabel>
      <View style={{ marginBottom: spacing.lg }}>
        <TimeSlots slots={TIME_SLOTS} selected={time} onSelect={setTime} />
      </View>

      {/* Booking agreement — folded into this screen as a compact consent. */}
      <View
        style={{
          backgroundColor: colors.surface,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
          borderRadius: radii.md,
          padding: spacing.md,
          marginBottom: spacing.md,
        }}
      >
        <Text style={{ fontSize: 13, fontWeight: '700', color: colors.successDeep, marginBottom: 6 }}>
          No payment today — you pay the shop after the work.
        </Text>
        <Tappable onPress={() => setAgreed((v) => !v)} style={{ flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' }}>
          <View
            style={{
              width: 20,
              height: 20,
              borderRadius: 5,
              borderWidth: 1.5,
              borderColor: agreed ? colors.success : colors.border,
              backgroundColor: agreed ? colors.success : 'transparent',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: 1,
            }}
          >
            {agreed ? <Text style={{ color: '#fff', fontSize: 13 }}>✓</Text> : null}
          </View>
          <Text style={{ flex: 1, fontSize: 13, color: colors.textSecondary, lineHeight: 18 }}>
            I agree to AutoMate&apos;s{' '}
            <Text style={{ color: colors.primary, fontWeight: '700' }} onPress={() => navigation.navigate('TosBooking')}>
              Terms of Service
            </Text>{' '}
            — show up or reschedule/cancel 12h+ ahead, the 3-no-show limit, and booking only through AutoMate.
          </Text>
        </Tappable>
      </View>

      <PrimaryButton
        label={day && time ? `Confirm booking — ${BOOKING_MONTH.monthAbbr} ${day} · ${time} →` : 'Select a date and time'}
        disabled={!day || !time || !agreed}
        loading={booking}
        onPress={onConfirm}
      />
      <ProcessingOverlay visible={booking} label="Booking appointment…" />
    </Screen>
  );
}
