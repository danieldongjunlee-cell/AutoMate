import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { AvatarCircle, Card, Screen } from '../../components/ui';
import { HomeStackParamList } from '../../navigation/types';
import { dealerById, QUOTES } from '../../services/mock/data';
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

  const dealer = dealerById(route.params?.dealerId);
  const quote = QUOTES.find((q) => q.dealerId === dealer.id);
  const dateLabel = route.params?.dateLabel ?? 'Thu, Apr 12';
  const time = route.params?.time ?? '10:30 AM';
  const isCash = route.params?.paid === 'cash';
  const priceLabel = quote?.priceHigh ? `$${quote.price} – $${quote.priceHigh}` : `$${quote?.price ?? 330}`;

  const summaryCell = (label: string, value: string, sub?: string, subColor?: string) => (
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
      {sub ? (
        <Text style={{ fontSize: 12, color: subColor ?? colors.textTertiary }}>{sub}</Text>
      ) : null}
    </View>
  );

  return (
    <Screen>
      {/* Success header */}
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
          You're all set!
        </Text>
        <Text style={{ fontSize: 14, color: colors.textTertiary }}>
          Reminder set · We'll notify you 1 day before
        </Text>
      </View>

      {/* Booking summary */}
      <Card style={{ padding: spacing.md, marginBottom: spacing.sm }}>
        <Text
          style={{
            fontSize: 12,
            fontWeight: '700',
            color: colors.textTertiary,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
            marginBottom: spacing.sm,
          }}
        >
          Booking summary
        </Text>
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
            <Text style={{ fontSize: 12, color: colors.textTertiary }}>
              {dealer.distanceMi} mi away · ★ {dealer.rating} ({dealer.reviews} reviews)
            </Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {summaryCell('Date & time', dateLabel, time, colors.primaryDark)}
          {summaryCell('Estimate', priceLabel, isCash ? 'cash payment' : '± after inspection')}
          {summaryCell('Service', 'Rear bumper dent', `${quote?.parts ?? 'OEM'} parts`)}
          {summaryCell('Drop-off', 'Self drop-off', '15 min check-in')}
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
          marginBottom: spacing.sm,
        }}
      >
        <Text style={{ fontSize: 22 }}>🔔</Text>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 14, fontWeight: '500', color: colors.primaryDeep }}>
            Reminder set
          </Text>
          <Text style={{ fontSize: 12, color: colors.textTertiary }}>
            1 day before at 9:00 AM
          </Text>
        </View>
        <Pressable onPress={() => Alert.alert('Reminder', 'Reminder editing comes with the backend.')}>
          <Text style={{ fontSize: 13, color: colors.primary }}>Edit</Text>
        </Pressable>
      </View>

      {/* What to bring */}
      <Card style={{ padding: spacing.md, marginBottom: spacing.md }}>
        <Text
          style={{
            fontSize: 12,
            fontWeight: '600',
            color: colors.textTertiary,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
            marginBottom: spacing.sm,
          }}
        >
          What to bring
        </Text>
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

      {/* Actions — wireframe: "View on map" returns home */}
      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        <Pressable
          onPress={() => Alert.alert('Calendar', 'Calendar export will use the device calendar.')}
          style={({ pressed }) => ({
            flex: 1,
            backgroundColor: colors.primary,
            borderRadius: radii.sm,
            paddingVertical: 12,
            alignItems: 'center',
            opacity: pressed ? 0.8 : 1,
          })}
        >
          <Text style={{ fontSize: 14, fontWeight: '600', color: colors.onPrimary }}>
            Add to calendar
          </Text>
        </Pressable>
        <Pressable
          onPress={() => navigation.popToTop()}
          style={({ pressed }) => ({
            flex: 1,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radii.sm,
            paddingVertical: 12,
            alignItems: 'center',
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Text style={{ fontSize: 14, fontWeight: '500', color: colors.textSecondary }}>
            View on map
          </Text>
        </Pressable>
      </View>
    </Screen>
  );
}
