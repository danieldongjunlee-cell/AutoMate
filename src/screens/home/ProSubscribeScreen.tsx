import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Text, View } from 'react-native';

import { PaymentMethodSheet } from '../../components/PaymentMethodSheet';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Tappable } from '../../components/Tappable';
import { ProcessingOverlay } from '../../components/Skeleton';
import { Badge, Card, Screen, SectionLabel } from '../../components/ui';
import { HomeStackParamList } from '../../navigation/types';
import { PaymentCard, paymentMethodsService, proService } from '../../services';
import { palette, radii, spacing, useTheme } from '../../theme';

type Nav = NativeStackNavigationProp<HomeStackParamList, 'ProSubscribe'>;
type Plan = 'annual' | 'monthly';

const BENEFITS = [
  'No security deposits, ever',
  'All DIY repair guides included (worth $10)',
  'Priority dealer quotes',
  '2× points on every booking',
];

/** Wireframe s-pro-subscribe: plan picker for AutoMate Pro. */
export function ProSubscribeScreen() {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();
  const [plan, setPlan] = useState<Plan>('annual');
  const [busy, setBusy] = useState(false);
  const [picked, setPicked] = useState<PaymentCard | null>(null);
  const [cardSheet, setCardSheet] = useState(false);
  const { data: cards } = useQuery({ queryKey: ['cards'], queryFn: paymentMethodsService.listCards });
  const card = picked ?? cards?.[0];
  const cardLabel = card ? `${card.brand} ••••${card.last4}` : 'Visa ••••4242';

  // v17: the plan-pick screen is the commit point — subscribe → success (no
  // separate payment screen). Tapping the priced button is the confirmation,
  // so the charge goes through directly for either plan (annual or monthly).
  // Real IAP billing is wired at store launch.
  const startPro = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await proService.subscribe(plan);
      navigation.navigate('ProSuccess');
    } finally {
      setBusy(false);
    }
  };

  const planRow = (id: Plan, title: string, sub: string, badge?: string) => {
    const active = plan === id;
    return (
      <Tappable
        key={id}
        onPress={() => setPlan(id)}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.sm,
          borderWidth: active ? 1.5 : 1,
          borderColor: active ? colors.primary : colors.border,
          backgroundColor: active ? colors.primarySurface : colors.surface,
          borderRadius: radii.md,
          padding: spacing.md,
          marginBottom: spacing.sm,
        }}
      >
        <View
          style={{
            width: 18,
            height: 18,
            borderRadius: 9,
            borderWidth: 1.5,
            borderColor: active ? colors.primary : colors.border,
            backgroundColor: active ? colors.primary : 'transparent',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {active && <Text style={{ color: '#fff', fontSize: 10 }}>✓</Text>}
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 15, fontWeight: '700', color: colors.textPrimary }}>{title}</Text>
          <Text style={{ fontSize: 11, color: colors.textTertiary }}>{sub}</Text>
        </View>
        {badge && <Badge label={badge} variant="success" />}
      </Tappable>
    );
  };

  return (
    <Screen>
      <LinearGradient
        colors={[palette.dark, palette.navyMid]}
        style={{ borderRadius: radii.md, padding: spacing.md, marginBottom: spacing.md }}
      >
        <Text style={{ fontSize: 26 }}>⭐</Text>
        <Text style={{ fontSize: 18, fontWeight: '800', color: '#fff' }}>AutoMate Pro</Text>
        <Text style={{ fontSize: 12, color: 'rgba(255,255,255,.7)' }}>
          Skip every security deposit — and more.
        </Text>
      </LinearGradient>

      <Card style={{ padding: spacing.md, marginBottom: spacing.md }}>
        {BENEFITS.map((b) => (
          <View key={b} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: 4 }}>
            <Text style={{ color: colors.success, fontWeight: '800' }}>✓</Text>
            <Text style={{ fontSize: 13, color: colors.textSecondary }}>{b}</Text>
          </View>
        ))}
      </Card>

      <View
        style={{
          backgroundColor: colors.successSurface,
          borderColor: colors.successLight,
          borderWidth: 1,
          borderRadius: radii.sm,
          padding: spacing.sm,
          marginBottom: spacing.md,
          alignItems: 'center',
        }}
      >
        <Text style={{ fontSize: 13, fontWeight: '700', color: colors.successDark }}>
          💚 Just $4 a month — cheaper than one coffee
        </Text>
      </View>

      <SectionLabel>Choose a plan</SectionLabel>
      {planRow('annual', 'Annual', '$48/yr — just $4/mo', 'SAVE 60%')}
      {planRow('monthly', 'Monthly', '$9.99 / month')}

      <SectionLabel>Payment method</SectionLabel>
      <Card
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.sm,
          padding: spacing.md,
          marginBottom: spacing.md,
        }}
      >
        <Text style={{ fontSize: 20 }}>💳</Text>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 14, fontWeight: '700', color: colors.textPrimary }}>
            {cardLabel}
          </Text>
          <Text style={{ fontSize: 11, color: colors.textTertiary }}>default</Text>
        </View>
        <Tappable onPress={() => setCardSheet(true)} hitSlop={8}>
          <Text style={{ fontSize: 13, fontWeight: '700', color: colors.primary }}>Change</Text>
        </Tappable>
      </Card>
      <PaymentMethodSheet
        visible={cardSheet}
        selectedId={card?.id}
        onSelect={setPicked}
        onClose={() => setCardSheet(false)}
      />

      <View style={{ marginTop: spacing.xs }}>
        <PrimaryButton
          variant="success"
          label={`Start Pro — ${plan === 'annual' ? '$48/yr' : '$9.99/mo'} →`}
          loading={busy}
          onPress={startPro}
        />
      </View>
      <ProcessingOverlay visible={busy} label="Activating Pro…" />
      <Text style={{ fontSize: 11, color: colors.textTertiary, textAlign: 'center', marginTop: spacing.sm }}>
        Cancel anytime · used here to waive your booking deposit.
      </Text>
    </Screen>
  );
}
