import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { Glyph } from '../../components/Icon';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '../../components/PrimaryButton';
import { Tappable } from '../../components/Tappable';

import { confirmationCode, ReminderRow, SummaryCell } from '../../components/Confirmation';
import { SuccessReceipt } from '../../components/SuccessReceipt';
import { RatingLink } from '../../components/RatingLink';
import { AvatarCircle, Card, Screen, SectionLabel } from '../../components/ui';
import { HomeStackParamList } from '../../navigation/types';
import { addToCalendar, dateAtTime } from '../../services/calendar';
import { BOOKING_MONTH, dealerById, defaultBookingISO, QUOTES } from '../../services/mock/data';
import { useAppStore } from '../../store/useAppStore';
import { formatDayLabel } from '../../utils/dates';
import { useDistance } from '../../i18n';
import { palette, radii, spacing, useTheme } from '../../theme';

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
  const dist = useDistance();
  const reminderPref = useAppStore((s) => s.reminderPref);
  const damageParts = useAppStore((s) => s.damageParts);
  const serviceLabel = damageParts.length
    ? `${damageParts[0].part} ${damageParts[0].type.split(',')[0].toLowerCase()}${damageParts.length > 1 ? ` +${damageParts.length - 1}` : ''}`
    : 'Rear bumper dent';

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
          { label: 'Parts', value: `${quote?.parts ?? 'OEM'} parts` },
        ]}
        total={priceLabel}
        totalLabel="Estimate"
        method={{ name: 'Pay the shop after the repair', detail: 'Deposit refunded on arrival' }}
        stamp="CONFIRMED"
        reference={confirmation}
      />

      <View style={{ height: spacing.lg }} />

      {/* Booking summary */}
      <Card style={{ padding: spacing.md, marginBottom: spacing.sm }}>
        <SectionLabel>Booking summary</SectionLabel>
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
          <AvatarCircle initial={dealer.initial} color={dealer.color} size={44} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 15, fontWeight: '600', color: colors.textPrimary }}>
              {dealer.name} Service Center
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
              <Text style={{ fontSize: 13, color: colors.textTertiary }}>
                {dist.format(dealer.distanceMi)} away ·{' '}
              </Text>
              <RatingLink dealer={dealer} />
            </View>
          </View>
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          <SummaryCell label="Service" value={serviceLabel} sub={`${quote?.parts ?? 'OEM'} parts`} />
          <SummaryCell label="Date & time" value={`${dateLabel} · ${time}`} />
          <SummaryCell label="Pay at shop" value={priceLabel} sub={isCash ? '$0 today · cash at pickup' : '$0 today · ± after inspection'} subColor={palette.mint} />
          <SummaryCell label="Duration" value="~2 days" sub="Self drop-off · 15 min check-in" />
        </View>
      </Card>

      <ReminderRow />

      {/* What to bring */}
      <Card style={{ padding: spacing.md, marginBottom: spacing.md }}>
        <SectionLabel>What to bring</SectionLabel>
        {BRING_ITEMS.map(({ icon, label }, i) => (
          <View
            key={label}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.sm,
              paddingVertical: 6,
              borderBottomWidth: i < BRING_ITEMS.length - 1 ? StyleSheet.hairlineWidth : 0,
              borderBottomColor: colors.divider,
            }}
          >
            <Glyph glyph={icon} size={18} color={colors.textSecondary} />
            <Text style={{ fontSize: 14, color: colors.textPrimary }}>{label}</Text>
          </View>
        ))}
      </Card>

      {/* Primary action: manage (reschedule / cancel) the booking. */}
      <PrimaryButton
        label="Reschedule"
        onPress={() => navigation.navigate('Reschedule', { kind: 'repair', bookingId: route.params?.bookingId })}
      />
      <Tappable
        onPress={() => navigation.navigate('Reschedule', { kind: 'repair', bookingId: route.params?.bookingId })}
        style={{ alignItems: 'center', paddingVertical: spacing.sm, marginTop: spacing.xs }}
      >
        <Text style={{ fontSize: 14, fontWeight: '600', color: colors.danger }}>Cancel</Text>
      </Tappable>

      {/* Secondary, smaller: add to calendar + view on map (wireframe v15.10). */}
      <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs }}>
        <Tappable
          onPress={onAddToCalendar}
          style={({ pressed }) => ({
            flex: 1,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radii.sm,
            paddingVertical: 9,
            alignItems: 'center',
          })}
        >
          <Text style={{ fontSize: 14, fontWeight: '500', color: colors.textSecondary }}>
            Add to calendar
          </Text>
        </Tappable>
        <Tappable
          onPress={() => navigation.navigate('DealerMap', { dealerId: dealer.id })}
          style={({ pressed }) => ({
            flex: 1,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radii.sm,
            paddingVertical: 9,
            alignItems: 'center',
          })}
        >
          <Text style={{ fontSize: 14, fontWeight: '500', color: colors.textSecondary }}>
            View on map
          </Text>
        </Tappable>
      </View>

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
