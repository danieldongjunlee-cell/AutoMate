import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { ApplePaySheet } from '../../components/ApplePaySheet';
import { ProcessingOverlay } from '../../components/Skeleton';
import { Tappable } from '../../components/Tappable';
import { Card, SectionLabel, Screen } from '../../components/ui';
import { UsePointsRow } from '../../components/UsePointsRow';
import { POINTS_PER_USD, POINT_VALUE_USD, pointsToUsd } from '../../config/points';
import { MaintStackParamList } from '../../navigation/types';
import { PAYMENT_CARD } from '../../services/mock/data';
import { pointsService, proService } from '../../services';
import { useAppStore } from '../../store/useAppStore';
import { palette, radii, spacing, useTheme } from '../../theme';

type Nav = NativeStackNavigationProp<MaintStackParamList, 'DiyPayment'>;

/** AutoMate Pro lifetime price (wireframe s-diy-unlock/payment: $10). */
const PRO_PRICE_USD = 10;

/** Wireframe s-diy-payment: Pro order summary + payment method. */
export function DiyPaymentScreen() {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();
  const points = useAppStore((s) => s.points);
  const [method, setMethod] = useState<'card' | 'apple'>('card');
  const [usePoints, setUsePoints] = useState(false);
  const [paying, setPaying] = useState(false);
  const [applePayOpen, setApplePayOpen] = useState(false);

  // Redemption: up to min(balance, total × 100) points (1 pt = $0.01).
  const maxRedeemable = Math.min(points, Math.round(PRO_PRICE_USD * POINTS_PER_USD));
  const applied = usePoints ? maxRedeemable : 0;
  const payTotal = Math.max(
    0,
    Math.round((PRO_PRICE_USD - applied * POINT_VALUE_USD) * 100) / 100,
  );

  const onPay = async () => {
    setPaying(true);
    try {
      if (applied > 0) {
        await pointsService.redeem(applied, 'Redeemed for AutoMate Pro');
      }
      await proService.unlockPro(); // flips store.isPro
      navigation.navigate('DiyConfirm');
    } finally {
      setPaying(false);
    }
  };

  return (
    <Screen>
      {/* Order summary */}
      <Card style={{ padding: spacing.md, marginBottom: spacing.md }}>
        <SectionLabel>Order summary</SectionLabel>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingVertical: 6,
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: colors.divider,
          }}
        >
          <Text style={{ fontSize: 13, color: colors.textSecondary }}>📚 DIY guides · lifetime</Text>
          <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textPrimary }}>$10.00</Text>
        </View>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingVertical: 6,
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: colors.divider,
          }}
        >
          <Text style={{ fontSize: 13, color: colors.textSecondary }}>
            One-time charge · no subscription
          </Text>
          <Text style={{ fontSize: 12, color: colors.textTertiary }}>Tax incl.</Text>
        </View>
        {applied > 0 ? (
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              paddingVertical: 6,
              borderBottomWidth: StyleSheet.hairlineWidth,
              borderBottomColor: colors.divider,
            }}
          >
            <Text style={{ fontSize: 13, color: colors.successDeep }}>
              ★ Points applied ({applied.toLocaleString()} pts)
            </Text>
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.successDeep }}>
              − {pointsToUsd(applied)}
            </Text>
          </View>
        ) : null}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: spacing.sm,
          }}
        >
          <Text style={{ fontSize: 15, fontWeight: '700', color: colors.textPrimary }}>Total</Text>
          <Text style={{ fontSize: 22, fontWeight: '800', color: colors.textPrimary }}>
            ${payTotal.toFixed(2)}
          </Text>
        </View>
      </Card>

      <UsePointsRow
        balance={points}
        maxRedeemable={maxRedeemable}
        applied={applied}
        onToggle={setUsePoints}
      />

      <SectionLabel>Pay with</SectionLabel>
      <Card style={{ overflow: 'hidden', marginBottom: spacing.md }}>
        <Tappable
          onPress={() => setMethod('card')}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            padding: spacing.md,
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: colors.divider,
            backgroundColor: method === 'card' ? colors.primarySurface : undefined,
            borderLeftWidth: method === 'card' ? 3 : 0,
            borderLeftColor: colors.primary,
          }}
        >
          <Text style={{ fontSize: 20, marginRight: spacing.sm }}>💳</Text>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.primaryDeep }}>
              Visa ending {PAYMENT_CARD.last4}
            </Text>
            <Text style={{ fontSize: 12, color: colors.primaryDark }}>Default card</Text>
          </View>
          {method === 'card' ? (
            <Text style={{ fontSize: 17, color: colors.primary }}>✔</Text>
          ) : (
            <Text style={{ fontSize: 16, color: colors.disabled }}>›</Text>
          )}
        </Tappable>
        <Tappable
          onPress={() => {
            setMethod('apple');
            // Apple Pay option → simulated  Pay sheet; confirming completes
            // the same onPay path.
            setApplePayOpen(true);
          }}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            padding: spacing.md,
            backgroundColor: method === 'apple' ? colors.primarySurface : undefined,
            borderLeftWidth: method === 'apple' ? 3 : 0,
            borderLeftColor: colors.primary,
          }}
        >
          <Text style={{ fontSize: 20, marginRight: spacing.sm }}>💵</Text>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textPrimary }}>
              Apple Pay
            </Text>
            <Text style={{ fontSize: 12, color: colors.textTertiary }}>opens  Pay sheet</Text>
          </View>
          {method === 'apple' ? (
            <Text style={{ fontSize: 17, color: colors.primary }}>✔</Text>
          ) : (
            <Text style={{ fontSize: 16, color: colors.disabled }}>›</Text>
          )}
        </Tappable>
      </Card>

      <Tappable
        onPress={() => (method === 'apple' ? setApplePayOpen(true) : onPay())}
        disabled={paying}
      >
        {({ pressed }) => (
          <LinearGradient
            colors={[palette.warning, '#F5B947']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              borderRadius: radii.md,
              paddingVertical: 15,
              alignItems: 'center',
              opacity: pressed || paying ? 0.85 : 1,
            }}
          >
            {paying ? (
              <ActivityIndicator color={palette.dark} />
            ) : (
              <Text style={{ fontSize: 16, fontWeight: '800', color: palette.dark }}>
                Pay ${payTotal.toFixed(2)}
              </Text>
            )}
          </LinearGradient>
        )}
      </Tappable>
      <ProcessingOverlay visible={paying} label="Processing payment…" />
      <ApplePaySheet
        visible={applePayOpen}
        onClose={() => setApplePayOpen(false)}
        onConfirmed={onPay}
        totalLabel={`$${payTotal.toFixed(2)}`}
      />
    </Screen>
  );
}
