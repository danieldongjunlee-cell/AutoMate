import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '../../components/PrimaryButton';
import { Tappable } from '../../components/Tappable';

import { ReminderRow, SuccessHeader, SummaryCell } from '../../components/Confirmation';
import { RatingLink } from '../../components/RatingLink';
import { AvatarCircle, Card, Screen, SectionLabel } from '../../components/ui';
import { HomeStackParamList } from '../../navigation/types';
import { addToCalendar, dateAtTime } from '../../services/calendar';
import { BOOKING_MONTH, dealerById, QUOTES } from '../../services/mock/data';
import { useAppStore } from '../../store/useAppStore';
import { radii, spacing, useTheme } from '../../theme';

type Nav = NativeStackNavigationProp<HomeStackParamList, 'BookingConfirm'>;
type Route = RouteProp<HomeStackParamList, 'BookingConfirm'>;

const BRING_ITEMS = [
  { icon: '📄', label: "Insurance card & driver's license" },
  { icon: '🔑', label: 'Vehicle keys' },
  { icon: '📱', label: 'AutoMate app for check-in QR' },
];

/** Wireframe s-booking-confirm: success summary after accepting a quote. */
export function BookingConfirmScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { colors } = useTheme();
  const reminderPref = useAppStore((s) => s.reminderPref);

  const dealer = dealerById(route.params?.dealerId);
  const quote = QUOTES.find((q) => q.dealerId === dealer.id);
  const dateLabel = route.params?.dateLabel ?? 'Thu, Apr 12';
  const time = route.params?.time ?? '10:30 AM';
  const isCash = route.params?.paid === 'cash';
  // Cross-tab cash bookings price from ACCEPTED_QUOTES and pass their label.
  const priceLabel =
    route.params?.priceLabel ??
    (quote?.priceHigh ? `$${quote.price} – $${quote.priceHigh}` : `$${quote?.price ?? 330}`);

  /** Real calendar export (pass 2): expo-calendar native / Google Calendar web. */
  const onAddToCalendar = () => {
    const day = parseInt(dateLabel.replace(/[^0-9]/g, ''), 10) || 12;
    const startDate = dateAtTime(BOOKING_MONTH.year, BOOKING_MONTH.month, day, time);
    const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);
    void addToCalendar({
      title: `${dealer.name} — Rear bumper dent repair`,
      startDate,
      endDate,
      location: dealer.address,
      notes: `AutoMate booking · Estimate ${priceLabel} · ${quote?.parts ?? 'OEM'} parts`,
    });
  };

  return (
    <Screen>
      <SuccessHeader
        title="You're all set!"
        subtitle={`Reminder set · We'll notify you ${reminderPref.toLowerCase()}`}
      />

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
              <Text style={{ fontSize: 12, color: colors.textTertiary }}>
                {dealer.distanceMi} mi away ·{' '}
              </Text>
              <RatingLink dealer={dealer} />
            </View>
            <Text style={{ fontSize: 12, color: colors.textTertiary }}>🕐 {dealer.hours}</Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          <SummaryCell label="Date & time" value={dateLabel} sub={time} subColor={colors.primaryDark} />
          <SummaryCell label="Estimate" value={priceLabel} sub={isCash ? 'cash payment' : '± after inspection'} />
          <SummaryCell label="Service" value="Rear bumper dent" sub={`${quote?.parts ?? 'OEM'} parts`} />
          <SummaryCell label="Drop-off" value="Self drop-off" sub="15 min check-in" />
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
            <Text style={{ fontSize: 18 }}>{icon}</Text>
            <Text style={{ fontSize: 14, color: colors.textPrimary }}>{label}</Text>
          </View>
        ))}
      </Card>

      {/* Primary action: manage (reschedule / cancel) the booking. */}
      <PrimaryButton
        label="🗓 Reschedule"
        onPress={() => navigation.navigate('Reschedule', { kind: 'repair' })}
      />
      <Tappable
        onPress={() => navigation.navigate('Reschedule', { kind: 'repair' })}
        style={{ alignItems: 'center', paddingVertical: spacing.sm, marginTop: spacing.xs }}
      >
        <Text style={{ fontSize: 13, fontWeight: '600', color: colors.danger }}>Cancel</Text>
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
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Text style={{ fontSize: 13, fontWeight: '500', color: colors.textSecondary }}>
            📅 Add to calendar
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
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Text style={{ fontSize: 13, fontWeight: '500', color: colors.textSecondary }}>
            📍 View on map
          </Text>
        </Tappable>
      </View>

      <Tappable
        onPress={() => navigation.navigate('WriteReview', { dealerId: dealer.id })}
        style={{ alignItems: 'center', paddingVertical: spacing.md, marginTop: spacing.xs }}
      >
        <Text style={{ fontSize: 13, fontWeight: '600', color: colors.primary }}>
          ★ Leave a review after your visit
        </Text>
      </Tappable>
    </Screen>
  );
}
