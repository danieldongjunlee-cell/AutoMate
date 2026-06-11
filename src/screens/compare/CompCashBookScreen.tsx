import { CommonActions, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CalendarMonth, TimeSlots } from '../../components/CalendarMonth';
import { PrimaryButton } from '../../components/PrimaryButton';
import { AvatarCircle, Badge, Screen, SectionLabel } from '../../components/ui';
import { CompareStackParamList } from '../../navigation/types';
import { ACCEPTED_QUOTES, BOOKING_MONTH, dealerById, PAYMENT_CARD } from '../../services/mock/data';
import { quoteService } from '../../services/mock/quoteService';
import { radii, spacing, useTheme } from '../../theme';

type Nav = NativeStackNavigationProp<CompareStackParamList, 'CompCashBook'>;

const SLOTS = ['9:00 AM', '10:30 AM', '2:00 PM'];

const weekdayOf = (day: number) =>
  new Date(BOOKING_MONTH.year, BOOKING_MONTH.month - 1, day).toLocaleDateString('en-US', {
    weekday: 'short',
  });

/** Wireframe s-comp-cash-book: cash booking → home-tab BookingConfirm (cross-tab). */
export function CompCashBookScreen() {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();
  const aq = ACCEPTED_QUOTES[0];
  const dealer = dealerById(aq.dealerId);

  // Wireframe defaults: Apr 8 (selected day) · 10:30 AM
  const [day, setDay] = useState<number | null>(8);
  const [time, setTime] = useState<string | null>('10:30 AM');
  const [booking, setBooking] = useState(false);

  const dateLabel = day ? `${weekdayOf(day)}, Apr ${day}` : null;

  const onConfirm = async () => {
    if (!day || !time) return;
    setBooking(true);
    await quoteService.bookAppointment(dealer.id, dateLabel!, time);
    setBooking(false);
    // Booking confirmation lives on the Home tab (wireframe ⤴ edge).
    navigation.dispatch(
      CommonActions.navigate('HomeTab', {
        screen: 'BookingConfirm',
        initial: false,
        params: { dealerId: dealer.id, dateLabel, time, paid: 'cash' },
      }),
    );
  };

  return (
    <Screen>
      {/* Cash banner */}
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
        <AvatarCircle initial={dealer.initial} color={dealer.color} size={34} />
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 15, fontWeight: '500', color: colors.primaryDeep }}>
            {dealer.name}
          </Text>
          <Text style={{ fontSize: 12, color: colors.primaryDark }}>
            Rear bumper · Cash · ${aq.priceLow}–${aq.priceHigh} est.
          </Text>
        </View>
        <Badge label="Cash" variant="success" />
      </View>

      <SectionLabel>Select date</SectionLabel>
      <View style={{ marginBottom: spacing.md }}>
        <CalendarMonth selectedDay={day} onSelectDay={setDay} />
      </View>

      <SectionLabel>{day ? `Select time — ${dateLabel}` : 'Select time'}</SectionLabel>
      <View style={{ marginBottom: spacing.md }}>
        <TimeSlots slots={SLOTS} selected={time} onSelect={setTime} />
      </View>

      {/* Card on file */}
      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: radii.sm,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
          padding: spacing.sm,
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.sm,
          marginBottom: spacing.md,
        }}
      >
        <Text style={{ fontSize: 16 }}>💳</Text>
        <Text style={{ flex: 1, fontSize: 14, color: colors.textPrimary }}>
          Visa ••••{PAYMENT_CARD.last4}
        </Text>
        <Pressable hitSlop={8}>
          <Text style={{ fontSize: 13, color: colors.primaryDark }}>Change</Text>
        </Pressable>
      </View>

      <PrimaryButton
        label={day && time ? `Confirm booking — Apr ${day} at ${time}` : 'Select a date and time'}
        disabled={!day || !time}
        loading={booking}
        onPress={onConfirm}
      />
    </Screen>
  );
}
