import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Tappable } from '../../components/Tappable';

import { CompareStackParamList } from '../../navigation/types';
import { compareService } from '../../services';
import { dealerById, INSURANCE_POLICY } from '../../services/mock/data';
import { useAcceptedQuote } from '../../hooks/useAcceptedQuote';
import { Screen } from '../../components/ui';
import { palette, radii, spacing, useTheme } from '../../theme';

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

  const { data: comparison } = useQuery({
    queryKey: ['comparison', aq.id, aq.priceLow],
    queryFn: () => compareService.getComparison({ quoteId: aq.id, claimAmount: aq.priceLow }),
  });
  // Wireframe defaults while the model loads (same numbers for seeded data).
  const deductible = comparison?.input.deductible ?? INSURANCE_POLICY.deductible;
  const premiumPerYear = comparison?.input.premiumPerYear ?? INSURANCE_POLICY.premiumPerYear;
  const cashRecommended = (comparison?.result.recommendation ?? 'cash') === 'cash';

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
          <Text style={{ fontSize: 13, fontWeight: '500', color: colors.primaryDark }}>
            Selected quote
          </Text>
          <Text style={{ fontSize: 13, color: colors.primary }}>{dealer.name}</Text>
        </View>
        <Text style={{ fontSize: 24, fontWeight: '700', color: colors.primaryDeep }}>
          ${aq.priceLow}–${aq.priceHigh} est.
        </Text>
        <Text style={{ fontSize: 12, color: colors.textTertiary, marginTop: 2 }}>
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
          <Text style={{ fontSize: 13, fontWeight: '500', color: SALMON_FG }}>
            {INSURANCE_POLICY.carrier} · ${deductible} ded. · ${premiumPerYear.toLocaleString()}
            /yr
          </Text>
          <Text style={{ fontSize: 12, color: '#888' }}>
            Policy #{INSURANCE_POLICY.policyNumber} · from your profile
          </Text>
        </View>
      </View>

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
        <Text style={{ fontSize: 12, color: colors.textSecondary, lineHeight: 19 }}>
          The shop inspects, confirms a{' '}
          <Text style={{ fontWeight: '700' }}>
            final price within ${aq.priceLow}–${aq.priceHigh}
          </Text>
          , then charges your{' '}
          <Text style={{ fontWeight: '700' }}>card on file after the repair</Text> — your refundable
          deposit is released. You only choose how to cover it:
        </Text>
      </View>

      {/* Cash vs insurance */}
      <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md }}>
        <Tappable
          onPress={() => navigation.navigate('CompCashBook', { quoteId: aq.id })}
          style={({ pressed }) => ({
            flex: 1,
            backgroundColor: colors.successSurface,
            borderRadius: radii.md,
            borderWidth: 1.5,
            borderColor: colors.success,
            padding: spacing.md,
            alignItems: 'center',
            opacity: pressed ? 0.8 : 1,
          })}
        >
          <Text style={{ fontSize: 30, marginBottom: 6 }}>💳</Text>
          <Text style={{ fontSize: 14, fontWeight: '600', color: colors.successDeep, marginBottom: 4 }}>
            Pay it yourself
          </Text>
          <Text style={{ fontSize: 27, fontWeight: '700', color: colors.successDark }}>
            ${aq.priceLow}–${aq.priceHigh}
          </Text>
          <Text style={{ fontSize: 12, color: colors.textTertiary, marginBottom: 6 }}>
            final, at the shop
          </Text>
          {cashRecommended ? (
            <View
              style={{
                backgroundColor: colors.success,
                borderRadius: radii.pill,
                paddingHorizontal: 11,
                paddingVertical: 3,
              }}
            >
              <Text style={{ fontSize: 12, fontWeight: '600', color: '#fff' }}>
                ✔ Best for this repair
              </Text>
            </View>
          ) : null}
        </Tappable>

        <Tappable
          onPress={() => navigation.navigate('CompInsurance', { quoteId: aq.id })}
          style={({ pressed }) => ({
            flex: 1,
            backgroundColor: colors.dangerSurface,
            borderRadius: radii.md,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: colors.dangerBorder,
            padding: spacing.md,
            alignItems: 'center',
            opacity: pressed ? 0.8 : 1,
          })}
        >
          <Text style={{ fontSize: 30, marginBottom: 6 }}>🛡️</Text>
          <Text style={{ fontSize: 14, fontWeight: '600', color: colors.dangerDeep, marginBottom: 4 }}>
            Use insurance
          </Text>
          <Text style={{ fontSize: 27, fontWeight: '700', color: colors.textPrimary }}>
            ${deductible}
          </Text>
          <Text style={{ fontSize: 12, color: colors.textTertiary, marginBottom: 6 }}>
            your deductible
          </Text>
          {cashRecommended ? (
            <View
              style={{
                backgroundColor: colors.dangerSurface,
                borderRadius: radii.pill,
                borderWidth: StyleSheet.hairlineWidth,
                borderColor: colors.dangerBorder,
                paddingHorizontal: 11,
                paddingVertical: 3,
              }}
            >
              <Text style={{ fontSize: 12, fontWeight: '600', color: colors.dangerDeep }}>
                ⚠ Premium ↑
              </Text>
            </View>
          ) : (
            <View
              style={{
                backgroundColor: colors.success,
                borderRadius: radii.pill,
                paddingHorizontal: 11,
                paddingVertical: 3,
              }}
            >
              <Text style={{ fontSize: 12, fontWeight: '600', color: '#fff' }}>✔ Recommended</Text>
            </View>
          )}
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
          <Text style={{ flex: 1, fontSize: 12, color: colors.warningDeep, lineHeight: 19 }}>
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
              <Text style={{ fontSize: 12, color: 'rgba(255,255,255,.5)', marginTop: 1 }}>
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
