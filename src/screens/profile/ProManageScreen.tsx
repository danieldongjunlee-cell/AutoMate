import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Text, View } from 'react-native';

import { PrimaryButton } from '../../components/PrimaryButton';
import { Card, Screen, SectionLabel } from '../../components/ui';
import { navigateCrossTab } from '../../navigation/crossTab';
import { ProfileStackParamList } from '../../navigation/types';
import { PRO_PLANS, useAppStore } from '../../store/useAppStore';
import { palette, radii, spacing, useTheme } from '../../theme';
import { confirmAction } from '../../utils/alerts';

type Nav = NativeStackNavigationProp<ProfileStackParamList, 'ProManage'>;

/** Manage AutoMate Pro: status + cancel / renew. */
export function ProManageScreen() {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();
  const isPro = useAppStore((s) => s.isPro);
  const planKey = useAppStore((s) => s.proPlan) ?? 'annual';
  const cancelPro = useAppStore((s) => s.cancelPro);
  const subscribePro = useAppStore((s) => s.subscribePro);
  const plan = PRO_PLANS[planKey];
  const priceLabel = `$${(plan.priceCents / 100).toFixed(plan.priceCents % 100 ? 2 : 0)}${planKey === 'annual' ? '/yr' : '/mo'}`;

  const onCancel = () =>
    confirmAction(
      'Cancel AutoMate Pro?',
      'You’ll keep Pro perks until the end of the current period, then deposits and DIY guides return to standard.',
      () => cancelPro(),
      'Cancel subscription',
    );

  return (
    <Screen>
      <LinearGradient
        colors={[palette.dark, palette.navyMid]}
        style={{ borderRadius: radii.md, padding: spacing.md, marginBottom: spacing.md }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          <Text style={{ fontSize: 26 }}>⭐</Text>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 18, fontWeight: '800', color: '#fff' }}>AutoMate Pro</Text>
            <Text style={{ fontSize: 12, color: 'rgba(255,255,255,.7)' }}>
              {isPro ? `${plan.label} · ${priceLabel}` : 'Membership cancelled'}
            </Text>
          </View>
          <View
            style={{
              backgroundColor: isPro ? palette.success : 'rgba(255,255,255,.18)',
              borderRadius: radii.pill,
              paddingHorizontal: 11,
              paddingVertical: 5,
            }}
          >
            <Text style={{ fontSize: 12, fontWeight: '800', color: '#fff' }}>
              {isPro ? 'Active' : 'Inactive'}
            </Text>
          </View>
        </View>
      </LinearGradient>

      <SectionLabel>Membership</SectionLabel>
      <Card style={{ padding: spacing.md, marginBottom: spacing.md }}>
        {(
          [
            ['Plan', plan.label],
            ['Price', priceLabel],
            ['Status', isPro ? 'Active' : 'Cancelled'],
            ['Renews', isPro ? (planKey === 'annual' ? 'Jun 15, 2027' : 'Jul 15, 2026') : '—'],
          ] as const
        ).map(([k, v]) => (
          <View
            key={k}
            style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 7 }}
          >
            <Text style={{ fontSize: 13, color: colors.textTertiary }}>{k}</Text>
            <Text style={{ fontSize: 13, fontWeight: '600', color: colors.textPrimary }}>{v}</Text>
          </View>
        ))}
      </Card>

      {isPro ? (
        <PrimaryButton variant="danger" label="Cancel subscription" onPress={onCancel} />
      ) : (
        <>
          <PrimaryButton
            variant="success"
            label={`Renew Pro — ${priceLabel} →`}
            onPress={() => subscribePro(planKey)}
          />
          <View style={{ height: spacing.sm }} />
          <PrimaryButton
            label="Change plan"
            variant="outline"
            onPress={() => navigateCrossTab(navigation, 'HomeTab', 'ProSubscribe')}
          />
        </>
      )}
      <Text style={{ fontSize: 11, color: colors.textTertiary, textAlign: 'center', marginTop: spacing.md }}>
        Manage billing anytime · cancel keeps perks until the period ends.
      </Text>
    </Screen>
  );
}
