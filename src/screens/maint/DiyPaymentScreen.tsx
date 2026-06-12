import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { Card, SectionLabel, Screen } from '../../components/ui';
import { MaintStackParamList } from '../../navigation/types';
import { PAYMENT_CARD } from '../../services/mock/data';
import { proService } from '../../services';
import { palette, radii, spacing, useTheme } from '../../theme';

type Nav = NativeStackNavigationProp<MaintStackParamList, 'DiyPayment'>;

/** Wireframe s-diy-payment: Pro order summary + payment method. */
export function DiyPaymentScreen() {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();
  const [method, setMethod] = useState<'card' | 'apple'>('card');
  const [paying, setPaying] = useState(false);

  const onPay = async () => {
    setPaying(true);
    await proService.unlockPro(); // flips store.isPro
    setPaying(false);
    navigation.navigate('DiyConfirm');
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
          <Text style={{ fontSize: 13, color: colors.textSecondary }}>🔓 AutoMate Pro · lifetime</Text>
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
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: spacing.sm,
          }}
        >
          <Text style={{ fontSize: 15, fontWeight: '700', color: colors.textPrimary }}>Total</Text>
          <Text style={{ fontSize: 22, fontWeight: '800', color: colors.textPrimary }}>$10.00</Text>
        </View>
      </Card>

      <SectionLabel>Pay with</SectionLabel>
      <Card style={{ overflow: 'hidden', marginBottom: spacing.md }}>
        <Pressable
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
        </Pressable>
        <Pressable
          onPress={() => setMethod('apple')}
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
            <Text style={{ fontSize: 12, color: colors.textTertiary }}>Touch ID to pay</Text>
          </View>
          {method === 'apple' ? (
            <Text style={{ fontSize: 17, color: colors.primary }}>✔</Text>
          ) : (
            <Text style={{ fontSize: 16, color: colors.disabled }}>›</Text>
          )}
        </Pressable>
      </Card>

      <Pressable onPress={onPay} disabled={paying}>
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
              <Text style={{ fontSize: 16, fontWeight: '800', color: palette.dark }}>Pay $10.00</Text>
            )}
          </LinearGradient>
        )}
      </Pressable>
    </Screen>
  );
}
