import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Tappable } from '../../components/Tappable';

import { navigateCrossTab } from '../../navigation/crossTab';
import { CompareStackParamList } from '../../navigation/types';
import { compareService } from '../../services';
import { dealerById, INSURANCE_POLICY } from '../../services/mock/data';
import { useAcceptedQuote } from '../../hooks/useAcceptedQuote';
import { useActiveVehicle } from '../../hooks/useActiveVehicle';
import { useAppStore } from '../../store/useAppStore';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Card, Screen } from '../../components/ui';
import { palette, radii, spacing, useTheme } from '../../theme';

/** Comprehensive (low-surcharge) claims: glass, weather, theft, vandalism. */
const COMPREHENSIVE_KEYWORDS = ['glass', 'windshield', 'shatter', 'hail', 'weather', 'theft', 'vandal', 'lamp'];

type Nav = NativeStackNavigationProp<CompareStackParamList, 'CompCashIns'>;
type Route = RouteProp<CompareStackParamList, 'CompCashIns'>;

/** Salmon insurance-banner surface from the wireframe (#FAECE7 / #4A1B0C). */
const SALMON_BG = '#FAECE7';
const SALMON_FG = '#4A1B0C';

/** Wireframe s-comp-cash-ins: pay cash vs. file insurance side-by-side.
 * Verdict + numbers come from the actuarial model via compareService. */
export function CompCashInsScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { colors } = useTheme();
  const aq = useAcceptedQuote(route.params?.quoteId);
  const dealer = dealerById(aq.dealerId);
  const { active } = useActiveVehicle();
  const damageParts = useAppStore((s) => s.damageParts);

  // The damage type drives the claim type: glass/weather/theft = comprehensive
  // (small surcharge), everything else = collision (larger surcharge).
  const claimType: 'collision' | 'comprehensive' = damageParts.some((p) =>
    COMPREHENSIVE_KEYWORDS.some((k) => p.type.toLowerCase().includes(k)),
  )
    ? 'comprehensive'
    : 'collision';

  const { data: comparison } = useQuery({
    queryKey: ['comparison', aq.id, aq.priceLow, claimType],
    queryFn: () => compareService.getComparison({ quoteId: aq.id, claimAmount: aq.priceLow, claimType }),
  });
  // Wireframe defaults while the model loads (same numbers for seeded data).
  const deductible = comparison?.input.deductible ?? INSURANCE_POLICY.deductible;
  const premiumPerYear = comparison?.input.premiumPerYear ?? INSURANCE_POLICY.premiumPerYear;
  const result = comparison?.result;
  const cashRecommended = (result?.recommendation ?? 'cash') === 'cash';

  // Recommended option is green; the costlier option is red (driven by the model).
  const good = { surface: colors.successSurface, border: colors.success, deep: colors.successDeep, dark: colors.successDark, solid: colors.success };
  const bad = { surface: colors.dangerSurface, border: colors.danger, deep: colors.dangerDeep, dark: colors.danger, solid: colors.danger };
  const cashC = cashRecommended ? good : bad;
  const insC = cashRecommended ? bad : good;

  // The comparison math needs the policy's deductible AND annual premium. If the
  // policy is missing either, gate the comparison and point the user to fill them in.
  const policyIncomplete = !!comparison && (comparison.input.deductible <= 0 || comparison.input.premiumPerYear <= 0);
  if (policyIncomplete) {
    return (
      <Screen>
        <Card style={{ padding: spacing.lg, alignItems: 'center' }}>
          <Text style={{ fontSize: 30, marginBottom: 8 }}>🔒</Text>
          <Text style={{ fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginBottom: 4 }}>
            Add your deductible & premium
          </Text>
          <Text style={{ fontSize: 14, color: colors.textTertiary, textAlign: 'center', marginBottom: spacing.md }}>
            Cash-vs-insurance comparison needs your policy&apos;s deductible and annual premium. Add
            them to your insurance policy to unlock the comparison.
          </Text>
          <PrimaryButton
            label="Update insurance policy →"
            onPress={() => navigateCrossTab(navigation, 'MoreTab', 'ProfInsurance')}
          />
        </Card>
      </Screen>
    );
  }

  return (
    <Screen>
      {/* Selected quote */}
      <View
        style={{
          backgroundColor: colors.primarySurface,
          borderRadius: radii.sm,
          padding: spacing.md,
          marginBottom: spacing.sm,
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 }}>
          <Text style={{ fontSize: 14, fontWeight: '500', color: colors.primaryDark }}>
            Selected quote
          </Text>
          <Text style={{ fontSize: 14, color: colors.primary }}>{dealer.name}</Text>
        </View>
        <Text style={{ fontSize: 24, fontWeight: '700', color: colors.primaryDeep }}>
          ${aq.priceLow}–${aq.priceHigh} est.
        </Text>
        <Text style={{ fontSize: 13, color: colors.textTertiary, marginTop: 2 }}>
          ± may vary after in-person inspection
        </Text>
      </View>

      {/* Policy banner */}
      <View
        style={{
          backgroundColor: SALMON_BG,
          borderRadius: radii.sm,
          padding: spacing.sm,
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.sm,
          marginBottom: spacing.md,
        }}
      >
        <Text style={{ fontSize: 20 }}>🛡️</Text>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 14, fontWeight: '500', color: SALMON_FG }}>
            {INSURANCE_POLICY.carrier} · ${deductible} ded. · ${premiumPerYear.toLocaleString()}
            /yr
          </Text>
          {/* Comparison is run against the registered car (VIN). */}
          <Text style={{ fontSize: 13, color: '#888' }} numberOfLines={1}>
            {active ? `${active.name} · VIN ${active.vin || '—'}` : `Policy #${INSURANCE_POLICY.policyNumber}`}
          </Text>
        </View>
      </View>

      {/* What the insurance model found if you file a claim. */}
      {result ? (
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: radii.md,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: colors.border,
            padding: spacing.md,
            marginBottom: spacing.md,
          }}
        >
          <Text style={{ fontSize: 14, fontWeight: '700', color: colors.textPrimary, marginBottom: 6 }}>
            🧮 If you file a {claimType} claim
          </Text>
          {(
            [
              ['Deductible you pay', `$${deductible}`],
              ['Premium hike', `+${result.surchargePctPerYear}%/yr (+$${result.totalSurcharge} over ${result.surchargeYears} yr)`],
              ['Claim on record', `${result.surchargeYears} years`],
              ['3-yr insurance cost', `$${result.insuranceTotal3yr.toLocaleString()}`],
              ['Pay cash (once)', `$${result.cashTotal3yr.toLocaleString()}`],
            ] as const
          ).map(([label, value], i, arr) => (
            <View
              key={label}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                paddingVertical: 5,
                borderBottomWidth: i < arr.length - 1 ? StyleSheet.hairlineWidth : 0,
                borderBottomColor: colors.divider,
              }}
            >
              <Text style={{ fontSize: 13, color: colors.textTertiary }}>{label}</Text>
              <Text style={{ fontSize: 13, fontWeight: '700', color: colors.textPrimary }}>{value}</Text>
            </View>
          ))}
        </View>
      ) : null}

      {/* No money upfront explainer */}
      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: radii.md,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
          padding: spacing.md,
          marginBottom: spacing.md,
        }}
      >
        <Text style={{ fontSize: 14, fontWeight: '700', color: colors.textPrimary, marginBottom: 4 }}>
          💳 No money upfront — how you pay
        </Text>
        <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 19 }}>
          The shop inspects, confirms a{' '}
          <Text style={{ fontWeight: '700' }}>
            final price within ${aq.priceLow}–${aq.priceHigh}
          </Text>
          , then charges your{' '}
          <Text style={{ fontWeight: '700' }}>card on file after the repair</Text> — your refundable
          deposit is released. You only choose how to cover it:
        </Text>
      </View>

      {/* Cash vs insurance — the recommended option is green, the costlier is red. */}
      <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md }}>
        <Tappable
          onPress={() => navigation.navigate('CompCashBook', { quoteId: aq.id })}
          style={({ pressed }) => ({
            flex: 1,
            backgroundColor: cashC.surface,
            borderRadius: radii.md,
            borderWidth: 1.5,
            borderColor: cashC.border,
            padding: spacing.md,
            alignItems: 'center',
            opacity: pressed ? 0.8 : 1,
          })}
        >
          <Text style={{ fontSize: 30, marginBottom: 6 }}>💳</Text>
          <Text style={{ fontSize: 14, fontWeight: '600', color: cashC.deep, marginBottom: 4 }}>
            Pay it yourself
          </Text>
          <Text style={{ fontSize: 27, fontWeight: '700', color: cashC.dark }}>
            ${aq.priceLow}–${aq.priceHigh}
          </Text>
          <Text style={{ fontSize: 13, color: colors.textTertiary, marginBottom: 6 }}>
            final, at the shop
          </Text>
          <View style={{ backgroundColor: cashRecommended ? cashC.solid : cashC.surface, borderWidth: cashRecommended ? 0 : StyleSheet.hairlineWidth, borderColor: cashC.border, borderRadius: radii.pill, paddingHorizontal: 11, paddingVertical: 3 }}>
            <Text style={{ fontSize: 13, fontWeight: '700', color: cashRecommended ? '#fff' : cashC.deep }}>
              {cashRecommended ? '✔ Recommended' : '✗ Costs more'}
            </Text>
          </View>
        </Tappable>

        <Tappable
          onPress={() => navigation.navigate('CompInsurance', { quoteId: aq.id })}
          style={({ pressed }) => ({
            flex: 1,
            backgroundColor: insC.surface,
            borderRadius: radii.md,
            borderWidth: 1.5,
            borderColor: insC.border,
            padding: spacing.md,
            alignItems: 'center',
            opacity: pressed ? 0.8 : 1,
          })}
        >
          <Text style={{ fontSize: 30, marginBottom: 6 }}>🛡️</Text>
          <Text style={{ fontSize: 14, fontWeight: '600', color: insC.deep, marginBottom: 4 }}>
            Use insurance
          </Text>
          <Text style={{ fontSize: 27, fontWeight: '700', color: insC.dark }}>
            ${deductible}
          </Text>
          <Text style={{ fontSize: 13, color: colors.textTertiary, marginBottom: 6 }}>
            your deductible
          </Text>
          <View style={{ backgroundColor: !cashRecommended ? insC.solid : insC.surface, borderWidth: !cashRecommended ? 0 : StyleSheet.hairlineWidth, borderColor: insC.border, borderRadius: radii.pill, paddingHorizontal: 11, paddingVertical: 3 }}>
            <Text style={{ fontSize: 13, fontWeight: '700', color: !cashRecommended ? '#fff' : insC.deep }}>
              {!cashRecommended ? '✔ Recommended' : '⚠ Costs more'}
            </Text>
          </View>
        </Tappable>
      </View>

      {/* Deductible-exceeds-repair warning */}
      {cashRecommended ? (
        <View
          style={{
            backgroundColor: colors.warningSurface,
            borderRadius: radii.sm,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: colors.warning,
            padding: spacing.sm,
            flexDirection: 'row',
            alignItems: 'flex-start',
            gap: spacing.sm,
            marginBottom: spacing.md,
          }}
        >
          <Text style={{ fontSize: 16 }}>⚠</Text>
          <Text style={{ flex: 1, fontSize: 13, color: colors.warningDeep, lineHeight: 19 }}>
            Your{' '}
            <Text style={{ fontWeight: '700' }}>
              ${deductible} deductible is more than this ${aq.priceLow}–${aq.priceHigh} repair
            </Text>{' '}
            — a claim won't save money here and can raise your premium 12–18%/yr. Paying yourself is
            cheaper.
          </Text>
        </View>
      ) : null}

      {/* Deep dive link */}
      <Tappable onPress={() => navigation.navigate('CompDeepDive', { quoteId: aq.id })}>
        {({ pressed }) => (
          <LinearGradient
            colors={[palette.navy, palette.navyMid]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              borderRadius: radii.md,
              padding: spacing.md,
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.sm,
              opacity: pressed ? 0.85 : 1,
            }}
          >
            <Text style={{ fontSize: 24 }}>📊</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: '700', color: '#fff' }}>
                See full cost breakdown
              </Text>
              <Text style={{ fontSize: 13, color: 'rgba(255,255,255,.5)', marginTop: 1 }}>
                3-yr projection · Break-even · Your verdict
              </Text>
            </View>
            <Text style={{ fontSize: 22, color: palette.primary }}>→</Text>
          </LinearGradient>
        )}
      </Tappable>
    </Screen>
  );
}
