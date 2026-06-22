import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Text, View } from 'react-native';

import { CalendarMonth, TimeSlots } from '../../components/CalendarMonth';
import { PrimaryButton } from '../../components/PrimaryButton';
import { ProcessingOverlay } from '../../components/Skeleton';
import { AvatarCircle, Badge, Screen, SectionLabel } from '../../components/ui';
import { HomeStackParamList } from '../../navigation/types';
import { BOOKING_MONTH, dealerById, QUOTES, TIME_SLOTS } from '../../services/mock/data';
import { quoteService } from '../../services';
import { useAppStore } from '../../store/useAppStore';
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

  const dealer = dealerById(route.params?.dealerId);
  const quote = QUOTES.find((q) => q.dealerId === dealer.id);
  const priceLabel = quote?.priceHigh ? `$${quote.price}–$${quote.priceHigh}` : `$${quote?.price ?? 330}`;

  // Default the picker to tomorrow (the current booking month).
  const [day, setDay] = useState<number | null>(BOOKING_MONTH.defaultDay);
  const [time, setTime] = useState<string | null>('10:30 AM');
  const [booking, setBooking] = useState(false);

  const dateLabel = day ? `${weekdayOf(day)}, ${BOOKING_MONTH.monthAbbr} ${day}` : null;

  const onConfirm = async () => {
    if (!day || !time) return;
    setBooking(true);
    // Independent mock calls — run in parallel so the CTA doesn't stall.
    const [, { pointsEarned }] = await Promise.all([
      quote ? quoteService.acceptQuote(quote.id) : Promise.resolve(null),
      quoteService.bookAppointment(dealer.id, dateLabel!, time),
    ]);
    addPoints(pointsEarned, 'Booked a repair');
    setBooking(false);
    // v17: consent + (non-Pro) refundable deposit before the confirmation.
    navigation.navigate('BookAgreement', {
      kind: 'repair',
      dealerId: dealer.id,
      next: 'BookingConfirm',
      nextParams: { dealerId: dealer.id, dateLabel: dateLabel!, time },
    });
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
          <Text style={{ fontSize: 12, color: colors.primaryDark }}>
            Rear bumper dent · {quote?.parts ?? 'OEM'} parts · {priceLabel} est.
          </Text>
          <Text style={{ fontSize: 12, color: colors.primaryDark }}>🕐 {dealer.hours}</Text>
        </View>
        <Badge label="Accepted" variant="primary" />
      </View>

      <SectionLabel>Select date</SectionLabel>
      <View style={{ marginBottom: spacing.md }}>
        <CalendarMonth selectedDay={day} onSelectDay={setDay} />
      </View>

      <SectionLabel>{day ? `Select time — ${dateLabel}` : 'Select time'}</SectionLabel>
      <View style={{ marginBottom: spacing.lg }}>
        <TimeSlots slots={TIME_SLOTS} selected={time} onSelect={setTime} />
      </View>

      <PrimaryButton
        label={day && time ? `Continue — ${BOOKING_MONTH.monthAbbr} ${day} · ${time} →` : 'Select a date and time'}
        disabled={!day || !time}
        loading={booking}
        onPress={onConfirm}
      />
      <ProcessingOverlay visible={booking} label="Booking appointment…" />
    </Screen>
  );
}
