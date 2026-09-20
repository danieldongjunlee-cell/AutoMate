import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '../../components/PrimaryButton';
import { Tappable } from '../../components/Tappable';

import { confirmationCode, ReminderRow } from '../../components/Confirmation';
import { SuccessReceipt } from '../../components/SuccessReceipt';
import { Screen } from '../../components/ui';
import { HomeStackParamList } from '../../navigation/types';
import { addToCalendar, dateAtTime } from '../../services/calendar';
import { BOOKED_APPOINTMENT, dealerById } from '../../services/mock/data';
import { cartTotals, useAppStore } from '../../store/useAppStore';
import { radii, spacing, useTheme } from '../../theme';
import { formatDayLabel } from '../../utils/dates';

type Nav = NativeStackNavigationProp<HomeStackParamList, 'MaintScheduleConfirm'>;

/** Wireframe s-maint-schedule-confirm: paid-booking success summary. */
export function MaintScheduleConfirmScreen() {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();
  const clearCart = useAppStore((s) => s.clearCart);

  // Snapshot once on mount: keeps the summary stable while Done clears the
  // cart (no fallback flash during the pop animation), and renders the
  // confirmed mock appointment when deep-linked from the "Upcoming"
  // notification with no live cart.
  const booking = useRef(
    (() => {
      const cart = useAppStore.getState().cart;
      return cart.services.length > 0 ? cart : BOOKED_APPOINTMENT;
    })(),
  ).current;

  const dealer = dealerById(booking.dealerId);
  const { total, totalMin } = cartTotals(booking);
  const promoLabel = (booking as { promo?: { label: string } }).promo?.label;
  const serviceNames = booking.services.map((s) => s.name).join(' + ');
  const reminderPref = useAppStore((s) => s.reminderPref);
  const confirmation = confirmationCode(
    `${booking.dealerId ?? ''}-${booking.date ?? ''}-${booking.time ?? ''}-${serviceNames}`,
  );

  // The summary is snapshotted in `booking` above, so we can clear the live
  // cart immediately, leaving via reschedule/back/tab no longer strands it.
  useEffect(() => {
    clearCart();
  }, [clearCart]);

  /** Real calendar export (pass 2): expo-calendar native / Google Calendar web. */
  const onAddToCalendar = () => {
    const [y, m, d] = (booking.date ?? '2027-04-07').split('-').map(Number);
    const startDate = dateAtTime(y, m, d, booking.time ?? '8:00 AM');
    const endDate = new Date(startDate.getTime() + Math.max(totalMin, 30) * 60 * 1000);
    void addToCalendar({
      title: `${dealer.name} · ${serviceNames}`,
      startDate,
      endDate,
      location: dealer.address,
      notes: `AutoMate booking · Paid $${total}`,
    });
  };

  return (
    <Screen>
      {/* Receipt-style confirmation: tick, the booking's facts, total and stub. */}
      <SuccessReceipt
        title="Thank you!"
        subtitle={`Your booking is confirmed · we'll remind you ${reminderPref.toLowerCase()}`}
        rows={[
          { label: 'Date', value: formatDayLabel(booking.date, 'Tomorrow') },
          { label: 'Time', value: booking.time ?? '8:00 AM' },
          { label: 'Shop', value: dealer.name },
          { label: 'Service', value: serviceNames },
          ...(promoLabel ? [{ label: 'Deal', value: promoLabel }] : []),
        ]}
        total={`$${total}`}
        totalLabel={`Total · ~${totalMin} min`}
        method={{ name: 'Pay at the shop', detail: 'No deposit taken' }}
        stamp="CONFIRMED"
        reference={confirmation}
      />

      <View style={{ height: spacing.lg }} />

      <ReminderRow />

      {/* Primary action: manage (reschedule / cancel) the booking. */}
      <PrimaryButton
        label="Reschedule"
        onPress={() => navigation.navigate('Reschedule', { kind: 'maintenance' })}
      />

      {/* Secondary, smaller: add to calendar. */}
      <Tappable
        onPress={onAddToCalendar}
        style={({ pressed }) => ({
          backgroundColor: colors.surface,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
          borderRadius: radii.sm,
          paddingVertical: 9,
          alignItems: 'center',
          marginTop: spacing.sm,
        })}
      >
        <Text style={{ fontSize: 14, fontWeight: '500', color: colors.textSecondary }}>
          Add to calendar
        </Text>
      </Tappable>
      <Tappable
        onPress={() => navigation.navigate('Reschedule', { kind: 'maintenance' })}
        style={{ alignItems: 'center', paddingVertical: spacing.sm, marginTop: spacing.xs }}
      >
        <Text style={{ fontSize: 14, fontWeight: '600', color: colors.danger }}>Cancel booking</Text>
      </Tappable>
    </Screen>
  );
}
