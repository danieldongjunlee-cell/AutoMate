import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Text, View } from 'react-native';

import { PrimaryButton } from '../../components/PrimaryButton';
import { Tappable } from '../../components/Tappable';
import { Card, Screen, SectionLabel } from '../../components/ui';
import { navigateCrossTab } from '../../navigation/crossTab';
import { HomeStackParamList } from '../../navigation/types';
import { useAppStore } from '../../store/useAppStore';
import { palette, radii, spacing, useTheme } from '../../theme';
import { confirmAction } from '../../utils/alerts';

type Nav = NativeStackNavigationProp<HomeStackParamList, 'Reschedule'>;
type Rt = RouteProp<HomeStackParamList, 'Reschedule'>;

const DAYS = [
  ['Thu', '12'],
  ['Fri', '14'],
  ['Sat', '15'],
  ['Mon', '17'],
  ['Tue', '18'],
];
const TIMES = ['9:00 AM', '11:00 AM', '3:30 PM'];

/** Wireframe s-reschedule: reschedule or cancel a booking. */
export function RescheduleScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<Rt>();
  const { colors } = useTheme();
  const [day, setDay] = useState('14');
  const [time, setTime] = useState('11:00 AM');

  const removeBooking = useAppStore((s) => s.removeBooking);
  const acceptProposedTime = useAppStore((s) => s.acceptProposedTime);
  const booking = useAppStore((s) => s.bookings.find((b) => b.id === params?.bookingId));
  const proposedTime = booking?.proposedTime;
  const isMaint = params?.kind === 'maintenance';
  const confirmScreen = isMaint ? 'MaintScheduleConfirm' : 'BookingConfirm';

  const onAcceptProposed = () => {
    if (params?.bookingId) acceptProposedTime(params.bookingId);
    navigateCrossTab(navigation, 'BookingsTab', 'Bookings');
  };

  /** Confirm → drop the booking from the store → land on the Bookings tab. */
  const onCancel = () =>
    confirmAction(
      'Cancel booking?',
      'Your booking will be cancelled. Cancel 12h+ ahead and your deposit is fully refunded.',
      () => {
        removeBooking(params?.bookingId);
        navigateCrossTab(navigation, 'BookingsTab', 'Bookings');
      },
      'Cancel booking',
    );

  const pill = (active: boolean) => ({
    borderWidth: 1,
    borderColor: active ? colors.primary : colors.border,
    backgroundColor: active ? colors.primarySurface : colors.surface,
    borderRadius: radii.sm,
  });

  return (
    <Screen>
      <LinearGradient
        colors={[palette.primary, palette.primaryDark]}
        style={{ borderRadius: radii.md, padding: spacing.md, marginBottom: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}
      >
        <View style={{ width: 38, height: 38, borderRadius: 10, backgroundColor: 'rgba(255,255,255,.2)', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 17, fontWeight: '700', color: '#fff' }}>H</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 14, fontWeight: '700', color: '#fff' }}>
            {booking ? `${booking.dealerName} · ${booking.title}` : 'Honda Fairfax · Rear bumper'}
          </Text>
          <Text style={{ fontSize: 12, color: 'rgba(255,255,255,.82)' }}>
            📅 {booking ? `${booking.dateLabel} · ${booking.time}` : 'Thu, Apr 12 · 10:30 AM'}
          </Text>
        </View>
        <View style={{ backgroundColor: 'rgba(255,255,255,.22)', borderRadius: radii.pill, paddingHorizontal: 8, paddingVertical: 3 }}>
          <Text style={{ fontSize: 11, fontWeight: '700', color: '#fff' }}>
            {proposedTime ? 'New time' : 'Confirmed'}
          </Text>
        </View>
      </LinearGradient>

      {proposedTime ? (
        <Card style={{ padding: spacing.md, marginBottom: spacing.md, borderColor: colors.warning, borderWidth: 1 }}>
          <Text style={{ fontSize: 14, fontWeight: '800', color: colors.warningDeep, marginBottom: 2 }}>
            ⏰ The shop proposed a new time
          </Text>
          <Text style={{ fontSize: 12, color: colors.textSecondary, marginBottom: spacing.sm }}>
            {booking?.dealerName ?? 'The shop'} suggested{' '}
            <Text style={{ fontWeight: '700', color: colors.textPrimary }}>{proposedTime}</Text>. Accept
            it, or pick another time below.
          </Text>
          <PrimaryButton variant="success" label={`Accept ${proposedTime} →`} onPress={onAcceptProposed} />
        </Card>
      ) : null}

      <Card style={{ padding: spacing.md, marginBottom: spacing.md }}>
        <Text style={{ fontSize: 15, fontWeight: '800', color: colors.textPrimary, marginBottom: spacing.sm }}>
          🗓️ Reschedule
        </Text>
        <SectionLabel>Pick a new day</SectionLabel>
        <View style={{ flexDirection: 'row', gap: 6, marginBottom: spacing.md }}>
          {DAYS.map(([d, n]) => (
            <Tappable key={n} onPress={() => setDay(n)} style={{ ...pill(day === n), paddingVertical: 8, paddingHorizontal: 11, alignItems: 'center' }}>
              <Text style={{ fontSize: 10, color: day === n ? colors.primaryDark : colors.textTertiary }}>{d}</Text>
              <Text style={{ fontSize: 14, fontWeight: '800', color: day === n ? colors.primaryDark : colors.textPrimary }}>{n}</Text>
            </Tappable>
          ))}
        </View>
        <SectionLabel>Pick a time</SectionLabel>
        <View style={{ flexDirection: 'row', gap: 6, marginBottom: spacing.md, flexWrap: 'wrap' }}>
          {TIMES.map((t) => (
            <Tappable key={t} onPress={() => setTime(t)} style={{ ...pill(time === t), paddingVertical: 8, paddingHorizontal: 13 }}>
              <Text style={{ fontSize: 13, fontWeight: time === t ? '700' : '400', color: time === t ? colors.primaryDark : colors.textSecondary }}>{t}</Text>
            </Tappable>
          ))}
        </View>
        <PrimaryButton
          label={`Confirm new time — Apr ${day} · ${time} →`}
          onPress={() => navigation.navigate(confirmScreen as never)}
        />
      </Card>

      <View
        style={{
          backgroundColor: colors.dangerSurface,
          borderColor: colors.dangerBorder,
          borderWidth: 1,
          borderRadius: radii.md,
          padding: spacing.md,
        }}
      >
        <Text style={{ fontSize: 15, fontWeight: '800', color: colors.textPrimary, marginBottom: spacing.xs }}>
          🗑️ Need to cancel?
        </Text>
        <Text style={{ fontSize: 12, color: colors.textSecondary, lineHeight: 18, marginBottom: spacing.sm }}>
          Cancel <Text style={{ color: colors.successDark, fontWeight: '700' }}>12+ hours ahead</Text> and
          your deposit is fully refunded. Within 12 hours or a no-show, the deposit is kept and a
          strike is added — 3 strikes removes your account.
        </Text>
        <PrimaryButton variant="danger" label="Cancel booking" onPress={onCancel} />
      </View>
    </Screen>
  );
}
