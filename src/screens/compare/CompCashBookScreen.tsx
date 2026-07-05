import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Tappable } from '../../components/Tappable';

import { CalendarMonth, TimeSlots } from '../../components/CalendarMonth';
import { PrimaryButton } from '../../components/PrimaryButton';
import { ProcessingOverlay } from '../../components/Skeleton';
import { AvatarCircle, Badge, Screen, SectionLabel } from '../../components/ui';
import { navigateCrossTab } from '../../navigation/crossTab';
import { CompareStackParamList } from '../../navigation/types';
import {
  BOOKING_MONTH,
  COMP_TIME_SLOTS,
  dealerById,
  PAYMENT_CARD,
} from '../../services/mock/data';
import { useAcceptedQuote } from '../../hooks/useAcceptedQuote';
import { quoteService } from '../../services';
import { useAppStore } from '../../store/useAppStore';
import { radii, spacing, useTheme } from '../../theme';
import { weekdayOf } from '../../utils/dates';

type Nav = NativeStackNavigationProp<CompareStackParamList, 'CompCashBook'>;
type Route = RouteProp<CompareStackParamList, 'CompCashBook'>;

/** Wireframe s-comp-cash-book: cash booking → home-tab BookingConfirm (cross-tab). */
export function CompCashBookScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { colors } = useTheme();
  const addPoints = useAppStore((s) => s.addPoints);
  const aq = useAcceptedQuote(route.params?.quoteId);
  const dealer = dealerById(aq.dealerId);

  // Default the picker to tomorrow (the current booking month).
  const [day, setDay] = useState<number | null>(BOOKING_MONTH.defaultDay);
  const [time, setTime] = useState<string | null>('10:30 AM');
  const [booking, setBooking] = useState(false);

  const dateLabel = day ? `${weekdayOf(day)}, ${BOOKING_MONTH.monthAbbr} ${day}` : null;

  const onConfirm = async () => {
    if (!day || !time) return;
    setBooking(true);
    const { pointsEarned } = await quoteService.bookAppointment(dealer.id, dateLabel!, time);
    addPoints(pointsEarned, 'Booked a repair');
    setBooking(false);
    // v17: consent + (non-Pro) deposit on the Home tab before the confirmation.
    navigateCrossTab(navigation, 'HomeTab', 'BookAgreement', {
      kind: 'repair',
      dealerId: dealer.id,
      next: 'BookingConfirm',
      nextParams: {
        dealerId: dealer.id,
        dateLabel: dateLabel ?? undefined,
        time: time ?? undefined,
        paid: 'cash',
        priceLabel: `$${aq.priceLow} – $${aq.priceHigh}`,
      },
    });
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
          <Text style={{ fontSize: 13, color: colors.primaryDark }}>
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
        <TimeSlots slots={COMP_TIME_SLOTS} selected={time} onSelect={setTime} />
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
        <Tappable
          onPress={() => navigateCrossTab(navigation, 'MoreTab', 'ProfPayment')}
          hitSlop={8}
        >
          <Text style={{ fontSize: 14, color: colors.primaryDark }}>Change</Text>
        </Tappable>
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
