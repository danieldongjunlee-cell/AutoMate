import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '../../components/PrimaryButton';
import { Tappable } from '../../components/Tappable';

import { ReminderRow, SuccessHeader, SummaryCell } from '../../components/Confirmation';
import { RatingLink } from '../../components/RatingLink';
import { AvatarCircle, Card, Screen, SectionLabel } from '../../components/ui';
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
  const serviceNames = booking.services.map((s) => s.name).join(' + ');
  const reminderPref = useAppStore((s) => s.reminderPref);

  // The summary is snapshotted in `booking` above, so we can clear the live
  // cart immediately — leaving via reschedule/back/tab no longer strands it.
  useEffect(() => {
    clearCart();
  }, [clearCart]);

  /** Real calendar export (pass 2): expo-calendar native / Google Calendar web. */
  const onAddToCalendar = () => {
    const [y, m, d] = (booking.date ?? '2027-04-07').split('-').map(Number);
    const startDate = dateAtTime(y, m, d, booking.time ?? '8:00 AM');
    const endDate = new Date(startDate.getTime() + Math.max(totalMin, 30) * 60 * 1000);
    void addToCalendar({
      title: `${dealer.name} — ${serviceNames}`,
      startDate,
      endDate,
      location: dealer.address,
      notes: `AutoMate booking · Paid $${total}`,
    });
  };

  return (
    <Screen>
      <SuccessHeader
        title="You're booked!"
        subtitle={`Reminder set · We'll notify you ${reminderPref.toLowerCase()}`}
      />

      <Card style={{ padding: spacing.md, marginBottom: spacing.sm }}>
        <SectionLabel>Summary</SectionLabel>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.sm,
            paddingBottom: spacing.sm,
            marginBottom: spacing.sm,
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: colors.divider,
          }}
        >
          <AvatarCircle initial={dealer.initial} color={dealer.color} size={40} />
          <View>
            <Text style={{ fontSize: 15, fontWeight: '600', color: colors.textPrimary }}>
              {dealer.name}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: 12, color: colors.textTertiary }}>
                {dealer.distanceMi} mi ·{' '}
              </Text>
              <RatingLink dealer={dealer} label={`★ ${dealer.rating}`} />
            </View>
            <Text style={{ fontSize: 12, color: colors.textTertiary }}>🕐 {dealer.hours}</Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          <SummaryCell label="Service" value={serviceNames} />
          <SummaryCell
            label="Date & time"
            value={formatDayLabel(booking.date, 'Mon, Apr 7')}
            sub={booking.time ?? '8:00 AM'}
            subColor={colors.primaryDark}
          />
          <SummaryCell label="Paid" value={`$${total}`} subColor={colors.successDark} />
          <SummaryCell label="Duration" value={`~${totalMin} min`} />
        </View>
      </Card>

      <ReminderRow />

      {/* Primary action: manage (reschedule / cancel) the booking. */}
      <PrimaryButton
        label="Reschedule booking"
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
          opacity: pressed ? 0.7 : 1,
        })}
      >
        <Text style={{ fontSize: 13, fontWeight: '500', color: colors.textSecondary }}>
          Add to calendar
        </Text>
      </Tappable>
      <Tappable
        onPress={() => navigation.navigate('Reschedule', { kind: 'maintenance' })}
        style={{ alignItems: 'center', paddingVertical: spacing.sm, marginTop: spacing.xs }}
      >
        <Text style={{ fontSize: 13, fontWeight: '600', color: colors.danger }}>Cancel booking</Text>
      </Tappable>
    </Screen>
  );
}
