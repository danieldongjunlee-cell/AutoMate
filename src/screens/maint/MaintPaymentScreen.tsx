import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ApplePaySheet } from '../../components/ApplePaySheet';
import { PrimaryButton } from '../../components/PrimaryButton';
import { ProcessingOverlay } from '../../components/Skeleton';
import { Tappable } from '../../components/Tappable';
import { Card, Screen, SectionLabel } from '../../components/ui';
import { UsePointsRow } from '../../components/UsePointsRow';
import { POINTS_PER_USD, POINT_VALUE_USD, pointsToUsd } from '../../config/points';
import { MaintStackParamList } from '../../navigation/types';
import { dealerById } from '../../services/mock/data';
import { maintService, pointsService } from '../../services';
import { useActiveVehicle } from '../../hooks/useActiveVehicle';
import { cartTotals, dateBadgeParts, useAppStore } from '../../store/useAppStore';
import { radii, spacing, useTheme } from '../../theme';
import { formatDayLabel } from '../../utils/dates';

type Nav = NativeStackNavigationProp<MaintStackParamList, 'MaintPayment'>;

type PayMethod = 'visa' | 'applepay';

/** Wireframe s-maint-payment: order summary + payment method → confirm. */
export function MaintPaymentScreen() {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();
  const cart = useAppStore((s) => s.cart);
  const addPoints = useAppStore((s) => s.addPoints);
  const addBooking = useAppStore((s) => s.addBooking);
  const { brand } = useActiveVehicle();
  const points = useAppStore((s) => s.points);
  const dealer = dealerById(cart.dealerId);
  const [method, setMethod] = useState<PayMethod>('visa');
  const [usePoints, setUsePoints] = useState(false);
  const [paying, setPaying] = useState(false);
  const [applePayOpen, setApplePayOpen] = useState(false);

  const { total, totalMin, savings } = cartTotals(cart);

  // Redemption: up to min(balance, total × 100) points (1 pt = $0.01).
  const maxRedeemable = Math.min(points, Math.round(total * POINTS_PER_USD));
  const applied = usePoints ? maxRedeemable : 0;
  const payTotal = Math.max(0, Math.round((total - applied * POINT_VALUE_USD) * 100) / 100);
  const totalLabel = applied > 0 ? payTotal.toFixed(2) : String(total);

  const onPay = async () => {
    setPaying(true);
    try {
      if (applied > 0) {
        await pointsService.redeem(applied, 'Redeemed at service payment');
      }
      const { pointsEarned } = await maintService.payForBooking(payTotal);
      addPoints(pointsEarned, 'Booked a service');
      // Record the paid maintenance booking for the Bookings tab.
      const dateLabel = formatDayLabel(cart.date, 'Mon, Apr 7');
      addBooking({
        kind: 'maintenance',
        brand,
        dealerId: cart.dealerId ?? undefined,
        icon: '🛢️',
        title: cart.services.map((s) => s.name).join(' + ') || 'Service',
        dealerName: dealer.name,
        dateLabel,
        ...dateBadgeParts(dateLabel),
        time: cart.time ?? '8:00 AM',
        priceLabel: `$${total}`,
        status: 'confirmed',
      });
      navigation.navigate('MaintScheduleConfirm');
    } finally {
      setPaying(false);
    }
  };

  return (
    <Screen>
      {/* Order summary */}
      <Card style={{ padding: spacing.md, marginBottom: spacing.md }}>
        <SectionLabel>Order summary</SectionLabel>
        {cart.promo ? (
          <View style={{ alignSelf: 'flex-start', backgroundColor: colors.successSurface, borderRadius: radii.pill, paddingHorizontal: 10, paddingVertical: 3, marginBottom: spacing.xs }}>
            <Text style={{ fontSize: 12, fontWeight: '800', color: colors.successDeep }}>🎉 {cart.promo.label} applied</Text>
          </View>
        ) : null}
        {cart.services.map((s) => (
          <View
            key={s.id}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingVertical: 5,
              borderBottomWidth: StyleSheet.hairlineWidth,
              borderBottomColor: colors.divider,
            }}
          >
            <Text style={{ flex: 1, fontSize: 14, color: colors.textSecondary }} numberOfLines={1}>{s.name}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              {s.originalPrice && s.originalPrice !== s.price ? (
                <Text style={{ fontSize: 12, color: colors.textTertiary, textDecorationLine: 'line-through' }}>
                  ${s.originalPrice}
                </Text>
              ) : null}
              <Text style={{ fontSize: 15, fontWeight: '600', color: colors.textPrimary }}>${s.price}</Text>
            </View>
          </View>
        ))}
        {savings > 0 ? (
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              paddingVertical: 5,
              borderBottomWidth: StyleSheet.hairlineWidth,
              borderBottomColor: colors.divider,
            }}
          >
            <Text style={{ fontSize: 14, fontWeight: '700', color: colors.successDeep }}>Bundle savings</Text>
            <Text style={{ fontSize: 15, fontWeight: '700', color: colors.successDeep }}>− ${savings}</Text>
          </View>
        ) : null}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingVertical: 5,
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: colors.divider,
          }}
        >
          <Text style={{ fontSize: 13, color: colors.textSecondary }}>
            {dealer.name} · {formatDayLabel(cart.date)} {cart.time}
          </Text>
          <Text style={{ fontSize: 12, color: colors.textTertiary }}>~{totalMin} min</Text>
        </View>
        {applied > 0 ? (
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              paddingVertical: 5,
              borderBottomWidth: StyleSheet.hairlineWidth,
              borderBottomColor: colors.divider,
            }}
          >
            <Text style={{ fontSize: 14, color: colors.successDeep }}>
              ★ Points applied ({applied.toLocaleString()} pts)
            </Text>
            <Text style={{ fontSize: 15, fontWeight: '600', color: colors.successDeep }}>
              − {pointsToUsd(applied)}
            </Text>
          </View>
        ) : null}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingTop: spacing.sm }}>
          <Text style={{ fontSize: 15, fontWeight: '700', color: colors.textPrimary }}>Total</Text>
          <Text style={{ fontSize: 18, fontWeight: '800', color: colors.textPrimary }}>
            ${totalLabel}
          </Text>
        </View>
      </Card>

      <UsePointsRow
        balance={points}
        maxRedeemable={maxRedeemable}
        applied={applied}
        onToggle={setUsePoints}
      />

      <SectionLabel>Payment method</SectionLabel>
      <Card style={{ overflow: 'hidden', marginBottom: spacing.sm }}>
        {(
          [
            { id: 'visa', icon: '💳', name: 'Visa ending 4242', sub: 'Default card' },
            { id: 'applepay', icon: '💵', name: 'Apple Pay', sub: 'Touch ID to pay' },
          ] as const
        ).map(({ id, icon, name, sub }, i) => {
          const on = method === id;
          return (
            <Tappable
              key={id}
              onPress={() => {
                setMethod(id);
                // The Apple Pay option opens the simulated  Pay sheet;
                // confirming it completes the same payment path (onPay).
                if (id === 'applepay') setApplePayOpen(true);
              }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: spacing.md,
                backgroundColor: on ? colors.primarySurface : 'transparent',
                borderLeftWidth: 3,
                borderLeftColor: on ? colors.primary : 'transparent',
                borderBottomWidth: i === 0 ? StyleSheet.hairlineWidth : 0,
                borderBottomColor: colors.divider,
              }}
            >
              <Text style={{ fontSize: 20, marginRight: spacing.sm }}>{icon}</Text>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: '600',
                    color: on ? colors.primaryDeep : colors.textPrimary,
                  }}
                >
                  {name}
                </Text>
                <Text style={{ fontSize: 12, color: on ? colors.primaryDark : colors.textTertiary }}>
                  {sub}
                </Text>
              </View>
              <Text style={{ fontSize: 18, color: on ? colors.primary : colors.disabled }}>
                {on ? '✔' : '›'}
              </Text>
            </Tappable>
          );
        })}
      </Card>

      {/* Security note */}
      <View
        style={{
          backgroundColor: colors.successSurface,
          borderRadius: radii.sm,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.success,
          padding: spacing.sm,
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.sm,
          marginBottom: spacing.md,
        }}
      >
        <Text style={{ fontSize: 16 }}>🔒</Text>
        <Text style={{ flex: 1, fontSize: 13, color: colors.successDeep }}>
          Payment processed securely. Charged after service completion.
        </Text>
      </View>

      <PrimaryButton
        label={`Confirm & pay $${totalLabel} →`}
        loading={paying}
        onPress={() => (method === 'applepay' ? setApplePayOpen(true) : onPay())}
      />
      <ProcessingOverlay visible={paying} label="Processing payment…" />
      <ApplePaySheet
        visible={applePayOpen}
        onClose={() => setApplePayOpen(false)}
        onConfirmed={onPay}
        totalLabel={`$${totalLabel}`}
      />
    </Screen>
  );
}
