import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useRef } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { ReminderRow, SuccessHeader, SummaryCell } from '../../components/Confirmation';
import { AvatarCircle, Card, Screen, SectionLabel } from '../../components/ui';
import { MaintStackParamList } from '../../navigation/types';
import { BOOKED_APPOINTMENT, dealerById } from '../../services/mock/data';
import { cartTotals, useAppStore } from '../../store/useAppStore';
import { radii, spacing, useTheme } from '../../theme';
import { formatDayLabel } from '../../utils/dates';

type Nav = NativeStackNavigationProp<MaintStackParamList, 'MaintScheduleConfirm'>;

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

  const onDone = () => {
    navigation.navigate('MaintDashboard');
    clearCart();
  };

  return (
    <Screen>
      <SuccessHeader title="You're booked!" subtitle="Reminder set for the day before" />

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
            <Text style={{ fontSize: 12, color: colors.textTertiary }}>
              {dealer.distanceMi} mi · ★ {dealer.rating}
            </Text>
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

      <ReminderRow sub="Day before at 9:00 AM" />

      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        <Pressable
          onPress={onDone}
          style={({ pressed }) => ({
            flex: 1,
            backgroundColor: colors.primary,
            borderRadius: radii.sm,
            paddingVertical: 12,
            alignItems: 'center',
            opacity: pressed ? 0.8 : 1,
          })}
        >
          <Text style={{ fontSize: 14, fontWeight: '600', color: colors.onPrimary }}>Done</Text>
        </Pressable>
        <Pressable
          onPress={() => Alert.alert('Calendar', 'Calendar export will use the device calendar.')}
          style={({ pressed }) => ({
            flex: 1,
            backgroundColor: colors.surface,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: colors.border,
            borderRadius: radii.sm,
            paddingVertical: 12,
            alignItems: 'center',
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Text style={{ fontSize: 14, color: colors.textSecondary }}>Add to calendar</Text>
        </Pressable>
      </View>
    </Screen>
  );
}
