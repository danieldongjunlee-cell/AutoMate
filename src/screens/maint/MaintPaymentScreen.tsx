import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '../../components/PrimaryButton';
import { Card, Screen, SectionLabel } from '../../components/ui';
import { MaintStackParamList } from '../../navigation/types';
import { dealerById } from '../../services/mock/data';
import { maintService } from '../../services';
import { cartTotals, useAppStore } from '../../store/useAppStore';
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
  const dealer = dealerById(cart.dealerId);
  const [method, setMethod] = useState<PayMethod>('visa');
  const [paying, setPaying] = useState(false);

  const { total, totalMin } = cartTotals(cart);

  const onPay = async () => {
    setPaying(true);
    const { pointsEarned } = await maintService.payForBooking(total);
    addPoints(pointsEarned);
    setPaying(false);
    navigation.navigate('MaintScheduleConfirm');
  };

  return (
    <Screen>
      {/* Order summary */}
      <Card style={{ padding: spacing.md, marginBottom: spacing.md }}>
        <SectionLabel>Order summary</SectionLabel>
        {cart.services.map((s) => (
          <View
            key={s.id}
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              paddingVertical: 5,
              borderBottomWidth: StyleSheet.hairlineWidth,
              borderBottomColor: colors.divider,
            }}
          >
            <Text style={{ fontSize: 14, color: colors.textSecondary }}>{s.name}</Text>
            <Text style={{ fontSize: 15, fontWeight: '600', color: colors.textPrimary }}>
              ${s.price}
            </Text>
          </View>
        ))}
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
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingTop: spacing.sm }}>
          <Text style={{ fontSize: 15, fontWeight: '700', color: colors.textPrimary }}>Total</Text>
          <Text style={{ fontSize: 18, fontWeight: '800', color: colors.textPrimary }}>${total}</Text>
        </View>
      </Card>

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
            <Pressable
              key={id}
              onPress={() => setMethod(id)}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                padding: spacing.md,
                backgroundColor: on ? colors.primarySurface : 'transparent',
                borderLeftWidth: 3,
                borderLeftColor: on ? colors.primary : 'transparent',
                borderBottomWidth: i === 0 ? StyleSheet.hairlineWidth : 0,
                borderBottomColor: colors.divider,
                opacity: pressed ? 0.7 : 1,
              })}
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
            </Pressable>
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

      <PrimaryButton label={`Confirm & pay $${total} →`} loading={paying} onPress={onPay} />
    </Screen>
  );
}
