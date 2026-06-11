import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { AvatarCircle, Card, Screen, SectionLabel } from '../../components/ui';
import { MaintStackParamList } from '../../navigation/types';
import { dealerById } from '../../services/mock/data';
import { useAppStore } from '../../store/useAppStore';
import { radii, spacing, useTheme } from '../../theme';

type Nav = NativeStackNavigationProp<MaintStackParamList, 'MaintScheduleConfirm'>;

const dayLabel = (iso: string | null) => {
  if (!iso) return 'Mon, Apr 7';
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
};

/** Wireframe s-maint-schedule-confirm: paid-booking success summary. */
export function MaintScheduleConfirmScreen() {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();
  const cart = useAppStore((s) => s.cart);
  const clearCart = useAppStore((s) => s.clearCart);

  const dealer = dealerById(cart.dealerId);
  const total = cart.services.reduce((sum, s) => sum + s.price, 0);
  const totalMin = cart.services.reduce((sum, s) => sum + s.durationMin, 0);
  const serviceNames = cart.services.map((s) => s.name).join(' + ') || 'Oil change';

  const onDone = () => {
    clearCart();
    navigation.navigate('MaintDashboard');
  };

  const cell = (label: string, value: string, sub?: string, subColor?: string) => (
    <View style={{ width: '50%', paddingVertical: spacing.xs }}>
      <Text
        style={{
          fontSize: 11,
          fontWeight: '600',
          color: colors.textTertiary,
          textTransform: 'uppercase',
          marginBottom: 2,
        }}
      >
        {label}
      </Text>
      <Text style={{ fontSize: 15, fontWeight: '600', color: colors.textPrimary }}>{value}</Text>
      {sub ? <Text style={{ fontSize: 13, color: subColor ?? colors.textTertiary }}>{sub}</Text> : null}
    </View>
  );

  return (
    <Screen>
      <View style={{ alignItems: 'center', paddingVertical: spacing.lg }}>
        <View
          style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: colors.successSurface,
            borderWidth: 2.5,
            borderColor: colors.success,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: spacing.sm,
          }}
        >
          <Text style={{ fontSize: 36 }}>✅</Text>
        </View>
        <Text style={{ fontSize: 24, fontWeight: '700', color: colors.successDeep, marginBottom: 2 }}>
          You're booked!
        </Text>
        <Text style={{ fontSize: 14, color: colors.textTertiary }}>
          Reminder set for the day before
        </Text>
      </View>

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
          {cell('Service', serviceNames)}
          {cell('Date & time', dayLabel(cart.date), cart.time ?? '8:00 AM', colors.primaryDark)}
          {cell('Paid', `$${total}`, undefined, colors.successDark)}
          {cell('Duration', `~${totalMin} min`)}
        </View>
      </Card>

      {/* Reminder */}
      <View
        style={{
          backgroundColor: colors.primarySurface,
          borderRadius: radii.sm,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.primaryLight,
          padding: spacing.sm,
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.sm,
          marginBottom: spacing.md,
        }}
      >
        <Text style={{ fontSize: 20 }}>🔔</Text>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 14, fontWeight: '500', color: colors.primaryDeep }}>
            Reminder set
          </Text>
          <Text style={{ fontSize: 12, color: colors.textTertiary }}>Day before at 9:00 AM</Text>
        </View>
        <Pressable onPress={() => Alert.alert('Reminder', 'Reminder editing comes with the backend.')}>
          <Text style={{ fontSize: 13, color: colors.primary }}>Edit</Text>
        </Pressable>
      </View>

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
