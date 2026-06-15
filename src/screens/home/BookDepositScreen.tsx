import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Text, View } from 'react-native';

import { PrimaryButton } from '../../components/PrimaryButton';
import { Tappable } from '../../components/Tappable';
import { ProcessingOverlay } from '../../components/Skeleton';
import { Card, Screen } from '../../components/ui';
import { HomeStackParamList } from '../../navigation/types';
import { DEPOSIT_CENTS, useAppStore } from '../../store/useAppStore';
import { palette, radii, spacing, useTheme } from '../../theme';

type Nav = NativeStackNavigationProp<HomeStackParamList, 'BookDeposit'>;
type Rt = RouteProp<HomeStackParamList, 'BookDeposit'>;

const usd = (cents: number) => `$${(cents / 100).toFixed(0)}`;

/** Wireframe s-book-deposit: refundable deposit, waived for Pro (crossed $25 → $0). */
export function BookDepositScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<Rt>();
  const { colors } = useTheme();
  const isPro = useAppStore((s) => s.isPro);
  const [booking, setBooking] = useState(false);

  const next = params?.next ?? 'BookingConfirm';
  const nextParams = params?.nextParams;
  const waived = isPro;

  const confirm = async () => {
    setBooking(true);
    await new Promise((r) => setTimeout(r, 600));
    setBooking(false);
    (navigation.navigate as (n: string, p?: object) => void)(next, nextParams);
  };

  const row = (label: string, value: React.ReactNode) => (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3 }}>
      <Text style={{ fontSize: 13, color: colors.textSecondary }}>{label}</Text>
      {typeof value === 'string' ? (
        <Text style={{ fontSize: 13, fontWeight: '600', color: colors.textPrimary }}>{value}</Text>
      ) : (
        value
      )}
    </View>
  );

  return (
    <Screen>
      <View style={{ alignItems: 'center', marginBottom: spacing.md }}>
        <Text style={{ fontSize: 30 }}>🤝</Text>
        <Text style={{ fontSize: 16, fontWeight: '800', color: colors.textPrimary }}>
          Book now, pay the shop later
        </Text>
        <Text style={{ fontSize: 12, color: colors.textTertiary, textAlign: 'center' }}>
          We only hold a refundable deposit to protect the shop's time.
        </Text>
      </View>

      <Card style={{ padding: spacing.md, marginBottom: spacing.sm }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottomWidth: 0.5,
            borderBottomColor: colors.divider,
            paddingBottom: spacing.sm,
            marginBottom: spacing.sm,
          }}
        >
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, fontWeight: '700', color: colors.textPrimary }}>
              Refundable security deposit
            </Text>
            <Text style={{ fontSize: 11, color: colors.textTertiary }}>
              Held, not charged · released after your visit
            </Text>
          </View>
          {waived ? (
            <Text style={{ fontSize: 18, fontWeight: '800' }}>
              <Text style={{ textDecorationLine: 'line-through', color: colors.textTertiary }}>
                {usd(DEPOSIT_CENTS)}
              </Text>{' '}
              <Text style={{ color: colors.successDark }}>$0</Text>
            </Text>
          ) : (
            <Text style={{ fontSize: 18, fontWeight: '800', color: colors.textPrimary }}>
              {usd(DEPOSIT_CENTS)}
            </Text>
          )}
        </View>
        {row('Repair estimate', '$320–$345 · pay shop after')}
        {row(
          'Charged today',
          <Text style={{ fontSize: 13, fontWeight: '700', color: colors.successDark }}>$0.00</Text>,
        )}
      </Card>

      {waived ? (
        <View
          style={{
            flexDirection: 'row',
            gap: spacing.sm,
            backgroundColor: colors.successSurface,
            borderColor: colors.successLight,
            borderWidth: 1,
            borderRadius: radii.sm,
            padding: spacing.sm,
            marginBottom: spacing.sm,
          }}
        >
          <Text>🎉</Text>
          <Text style={{ fontWeight: '700', color: colors.successDeep, fontSize: 13 }}>
            Deposit waived — Pro member
          </Text>
        </View>
      ) : (
        <>
          <Card style={{ padding: spacing.sm, marginBottom: spacing.sm, flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            <Text>💳</Text>
            <Text style={{ flex: 1, fontSize: 13, color: colors.textPrimary }}>
              Visa ••••4242 <Text style={{ color: colors.textTertiary, fontSize: 11 }}>· hold only</Text>
            </Text>
            <Text style={{ color: colors.primary, fontSize: 12 }}>Change</Text>
          </Card>
          <Tappable
            onPress={() => navigation.navigate('ProSubscribe')}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.sm,
              backgroundColor: palette.dark,
              borderRadius: radii.md,
              padding: spacing.md,
              marginBottom: spacing.md,
            }}
          >
            <Text style={{ fontSize: 18 }}>⭐</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: '#fff' }}>
                Skip the deposit with Pro
              </Text>
              <Text style={{ fontSize: 11, color: 'rgba(255,255,255,.6)' }}>
                No deposits, ever · from $3.25/mo
              </Text>
            </View>
            <View style={{ backgroundColor: colors.warning, borderRadius: radii.sm, paddingHorizontal: 11, paddingVertical: 6 }}>
              <Text style={{ fontSize: 12, fontWeight: '800', color: palette.dark }}>Get Pro →</Text>
            </View>
          </Tappable>
        </>
      )}

      <PrimaryButton
        variant="success"
        label={waived ? 'Confirm booking — no deposit →' : `Hold ${usd(DEPOSIT_CENTS)} deposit & confirm →`}
        loading={booking}
        onPress={confirm}
      />
      <ProcessingOverlay visible={booking} label="Confirming booking…" />
      <Text style={{ fontSize: 11, color: colors.textTertiary, textAlign: 'center', marginTop: spacing.sm }}>
        Cancel 12h+ ahead for a full refund · no-show forfeits the deposit.
      </Text>
    </Screen>
  );
}
