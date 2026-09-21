import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useLayoutEffect } from 'react';
import { View } from 'react-native';

import { Text } from '../../components/Text';

import { PrimaryButton } from '../../components/PrimaryButton';
import { Tappable } from '../../components/Tappable';

import { ConfirmActions, confirmationCode } from '../../components/Confirmation';
import { SuccessReceipt } from '../../components/SuccessReceipt';
import { Screen } from '../../components/ui';
import { HomeStackParamList } from '../../navigation/types';
import { addToCalendar, dateAtTime } from '../../services/calendar';
import { BOOKING_MONTH, dealerById, defaultBookingISO, QUOTES } from '../../services/mock/data';
import { useAppStore } from '../../store/useAppStore';
import { formatDayLabel } from '../../utils/dates';
import { spacing, useTheme } from '../../theme';

type Nav = NativeStackNavigationProp<HomeStackParamList, 'BookingConfirm'>;
type Route = RouteProp<HomeStackParamList, 'BookingConfirm'>;

const BRING_ITEMS = [
  { icon: 'file', label: "Insurance card & driver's license" },
  { icon: 'key', label: 'Vehicle keys' },
];

/** Wireframe s-booking-confirm: success summary after accepting a quote. */
export function BookingConfirmScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { colors } = useTheme();
  const reminderPref = useAppStore((s) => s.reminderPref);
  const damageParts = useAppStore((s) => s.damageParts);
  const serviceLabel = damageParts.length
    ? `${damageParts[0].part} ${damageParts[0].type.split(',')[0].toLowerCase()}${damageParts.length > 1 ? ` +${damageParts.length - 1}` : ''}`
    : 'Rear bumper dent';

  // Confirmed: there is nothing to go back to, the header's back button goes.
  useLayoutEffect(() => {
    navigation.setOptions({ headerBackVisible: false, headerLeft: () => null, gestureEnabled: false });
  }, [navigation]);

  const dealer = dealerById(route.params?.dealerId);
  const quote = QUOTES.find((q) => q.dealerId === dealer.id);
  const dateLabel = route.params?.dateLabel ?? formatDayLabel(defaultBookingISO());
  const time = route.params?.time ?? '10:30 AM';
  const isCash = route.params?.paid === 'cash';
  const confirmation = confirmationCode(
    route.params?.bookingId ?? `${dealer.id}-${route.params?.dateLabel ?? ''}-${route.params?.time ?? ''}`,
  );
  // Cross-tab cash bookings price from ACCEPTED_QUOTES and pass their label.
  const priceLabel =
    route.params?.priceLabel ??
    (quote?.priceHigh ? `$${quote.price} – $${quote.priceHigh}` : `$${quote?.price ?? 330}`);

  /** Real calendar export (pass 2): expo-calendar native / Google Calendar web. */
  const onAddToCalendar = () => {
    const day = parseInt(dateLabel.replace(/[^0-9]/g, ''), 10) || BOOKING_MONTH.defaultDay;
    const startDate = dateAtTime(BOOKING_MONTH.year, BOOKING_MONTH.month, day, time);
    const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);
    void addToCalendar({
      title: `${dealer.name} · Rear bumper dent repair`,
      startDate,
      endDate,
      location: dealer.address,
      notes: `AutoMate booking · Estimate ${priceLabel} · ${quote?.parts ?? 'OEM'} parts`,
    });
  };

  return (
    <Screen>
      {/* Receipt-style confirmation: tick, the booking's facts, estimate and stub. */}
      <SuccessReceipt
        title="Thank you!"
        subtitle={`Your booking is confirmed · we'll remind you ${reminderPref.toLowerCase()}`}
        rows={[
          { label: 'Date', value: route.params?.dateLabel ?? 'Thu, Apr 12' },
          { label: 'Time', value: route.params?.time ?? '10:30 AM' },
          { label: 'Shop', value: dealer.name },
          { label: 'Service', value: serviceLabel },
          { label: 'Parts', value: `${quote?.parts ?? 'OEM'} parts` },
        ]}
        total={priceLabel}
        totalLabel="Estimate · ~2 days"
        method={{ name: 'Pay the shop after the repair', detail: 'Deposit refunded on arrival' }}
        stamp="CONFIRMED"
        reference={confirmation}
      />

      <View style={{ height: spacing.lg }} />

      {/* What to bring, the reminder, the calendar and the map, as icons. */}
      <ConfirmActions
        bring={BRING_ITEMS}
        onAddToCalendar={onAddToCalendar}
        onViewMap={() => navigation.navigate('DealerMap', { dealerId: dealer.id })}
      />

      {/* Manage the booking: reschedule or cancel side by side, then home. */}
      <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg }}>
        <PrimaryButton
          label="Reschedule"
          style={{ flex: 1 }}
          onPress={() => navigation.navigate('Reschedule', { kind: 'repair', bookingId: route.params?.bookingId })}
        />
        <PrimaryButton
          label="Cancel"
          variant="outline"
          style={{ flex: 1, borderColor: colors.dangerBorder }}
          textStyle={{ color: colors.danger }}
          onPress={() => navigation.navigate('Reschedule', { kind: 'repair', bookingId: route.params?.bookingId })}
        />
      </View>
      <PrimaryButton
        label="Back to home"
        variant="muted"
        style={{ marginTop: spacing.sm }}
        onPress={() => navigation.popToTop()}
      />

      <Tappable
        onPress={() => navigation.navigate('Reviews', { dealerId: dealer.id })}
        style={{ alignItems: 'center', paddingVertical: spacing.md, marginTop: spacing.xs }}
      >
        <Text style={{ fontSize: 14, fontWeight: '600', color: colors.primary }}>
          ★ Leave a review after your visit
        </Text>
      </Tappable>
    </Screen>
  );
}
