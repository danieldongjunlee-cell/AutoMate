import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Tappable } from '../../components/Tappable';

import { PrimaryButton } from '../../components/PrimaryButton';
import { AvatarCircle, Screen, SectionLabel } from '../../components/ui';
import { CompareStackParamList } from '../../navigation/types';
import { compareService } from '../../services';
import { dealerById, INSURANCE_POLICY } from '../../services/mock/data';
import { useAcceptedQuote } from '../../hooks/useAcceptedQuote';
import { radii, spacing, useTheme } from '../../theme';

type Nav = NativeStackNavigationProp<CompareStackParamList, 'CompDeepDive'>;
type Route = RouteProp<CompareStackParamList, 'CompDeepDive'>;

const usd = (n: number) => `$${Math.round(n).toLocaleString('en-US')}`;

/** Wireframe s-comp-deep-dive: 3-year cash vs. insurance cost table + verdict,
 * numbers from the actuarial model via compareService (+ assumptions disclosure). */
export function CompDeepDiveScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { colors } = useTheme();
  const aq = useAcceptedQuote(route.params?.quoteId);
  const dealer = dealerById(aq.dealerId);
  const [assumptionsOpen, setAssumptionsOpen] = useState(false);

  const { data: comparison, isLoading } = useQuery({
    queryKey: ['comparison', aq.id, aq.priceLow],
    queryFn: () => compareService.getComparison({ quoteId: aq.id, claimAmount: aq.priceLow }),
  });

  const headCell = (label: string, color: string, align: 'left' | 'center' = 'center') => (
    <Text
      style={{
        flex: align === 'left' ? 1.5 : 1,
        fontSize: 12,
        fontWeight: '700',
        color,
        textTransform: 'uppercase',
        textAlign: align,
      }}
    >
      {label}
    </Text>
  );

  if (isLoading || !comparison) {
    return (
      <Screen>
        <View style={{ paddingVertical: spacing.xl, alignItems: 'center' }}>
          <ActivityIndicator color={colors.primary} />
          <Text style={{ fontSize: 13, color: colors.textTertiary, marginTop: spacing.sm }}>
            Crunching 3-year costs…
          </Text>
        </View>
      </Screen>
    );
  }

  const { input, result } = comparison;
  const cashWins = result.recommendation === 'cash';
  const savings = Math.abs(result.insuranceTotal3yr - result.cashTotal3yr);

  // Table rows mirror the wireframe, fed by the model output.
  const rows = [
    { item: 'Repair cost', sub: '', cash: usd(result.cashTotal3yr), insure: '$0', risk: false },
    { item: 'Deductible', sub: '', cash: '—', insure: usd(input.deductible), risk: false },
    {
      item: 'Premium hike',
      sub: `Yr 1–${result.surchargeYears} (~${result.surchargePctPerYear}%/yr)`,
      cash: '—',
      insure: `+${usd(result.totalSurcharge)}`,
      risk: true,
    },
    { item: 'Claim on record', sub: '', cash: '—', insure: `${result.surchargeYears} yrs`, risk: false },
  ];

  const breakEvenTitle =
    result.breakEvenMonth === null ? 'Break-even: Never' : `Break-even: Month ${result.breakEvenMonth}`;
  const breakEvenSub =
    result.breakEvenMonth === 1
      ? `${usd(input.deductible)} deductible alone exceeds the repair cost — cash wins immediately`
      : result.breakEvenMonth === null
        ? 'The insurance path stays below the cash cost for the whole 3-year window'
        : `Deductible + monthly premium hikes pass the cash cost in month ${result.breakEvenMonth}`;

  return (
    <Screen>
      {/* Context banner */}
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
          marginBottom: spacing.md,
        }}
      >
        <AvatarCircle initial={dealer.initial} color={dealer.color} size={34} />
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: colors.primaryDeep }}>
            {dealer.name} — Rear bumper
          </Text>
          {/* Price range is primary info — secondary tier (feedback pass 1) */}
          <Text style={{ fontSize: 13, color: colors.textSecondary }}>
            ${aq.priceLow}–${aq.priceHigh} est. · {INSURANCE_POLICY.carrier} {usd(input.deductible)}{' '}
            ded.
          </Text>
        </View>
      </View>

      <SectionLabel>3-year cost breakdown</SectionLabel>
      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: radii.md,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
          overflow: 'hidden',
          marginBottom: spacing.sm,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            paddingHorizontal: spacing.sm,
            paddingVertical: 8,
            backgroundColor: colors.surfaceAlt,
          }}
        >
          {headCell('Item', colors.textTertiary, 'left')}
          {headCell('Cash', colors.success)}
          {headCell('Insure', colors.danger)}
        </View>
        {rows.map((row) => (
          <View
            key={row.item}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: spacing.sm,
              paddingVertical: 9,
              borderBottomWidth: StyleSheet.hairlineWidth,
              borderBottomColor: colors.divider,
              backgroundColor: row.risk ? 'rgba(226,75,74,.04)' : undefined,
            }}
          >
            <View style={{ flex: 1.5 }}>
              <Text style={{ fontSize: 14, color: colors.textSecondary }}>{row.item}</Text>
              {row.sub ? (
                <Text style={{ fontSize: 11, color: colors.textPlaceholder }}>{row.sub}</Text>
              ) : null}
            </View>
            <Text
              style={{
                flex: 1,
                fontSize: 14,
                fontWeight: '700',
                textAlign: 'center',
                color: row.cash === '—' ? colors.textTertiary : colors.successDark,
              }}
            >
              {row.cash}
            </Text>
            <Text
              style={{
                flex: 1,
                fontSize: 14,
                fontWeight: '700',
                textAlign: 'center',
                color: row.insure === '$0' ? colors.textTertiary : colors.danger,
              }}
            >
              {row.insure}
            </Text>
          </View>
        ))}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: spacing.sm,
            paddingVertical: 11,
            backgroundColor: colors.card,
          }}
        >
          <Text style={{ flex: 1.5, fontSize: 14, fontWeight: '700', color: colors.textPrimary }}>
            3-yr total
          </Text>
          <Text
            style={{ flex: 1, fontSize: 18, fontWeight: '800', textAlign: 'center', color: colors.successDark }}
          >
            {usd(result.cashTotal3yr)}
          </Text>
          <Text
            style={{ flex: 1, fontSize: 18, fontWeight: '800', textAlign: 'center', color: colors.danger }}
          >
            {usd(result.insuranceTotal3yr)}
          </Text>
        </View>
      </View>

      {/* Break-even */}
      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: radii.sm,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
          padding: spacing.sm,
          flexDirection: 'row',
          gap: spacing.sm,
          marginBottom: spacing.sm,
        }}
      >
        <Text style={{ fontSize: 16 }}>📊</Text>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textPrimary, marginBottom: 1 }}>
            {breakEvenTitle}
          </Text>
          <Text style={{ fontSize: 13, color: colors.textTertiary }}>{breakEvenSub}</Text>
        </View>
      </View>

      {/* Verdict */}
      <View style={{ flexDirection: 'row', gap: spacing.xs, marginBottom: spacing.sm }}>
        <View
          style={{
            flex: 1,
            backgroundColor: colors.successSurface,
            borderRadius: radii.sm,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: colors.success,
            padding: spacing.sm,
          }}
        >
          <Text
            style={{
              fontSize: 12,
              fontWeight: '700',
              color: colors.successDeep,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
              marginBottom: 3,
            }}
          >
            Verdict
          </Text>
          <Text style={{ fontSize: 15, fontWeight: '700', color: colors.successDeep }}>
            {cashWins ? 'Pay cash ✔' : 'File insurance'}
          </Text>
          <Text style={{ fontSize: 12, color: colors.successDark, marginTop: 3, lineHeight: 15 }}>
            {cashWins
              ? `Saves ${usd(savings)} · No rate hike · No claim`
              : `Saves ${usd(savings)} vs paying cash`}
          </Text>
        </View>
        <View
          style={{
            flex: 1,
            backgroundColor: colors.dangerSurface,
            borderRadius: radii.sm,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: colors.dangerBorder,
            padding: spacing.sm,
          }}
        >
          <Text
            style={{
              fontSize: 12,
              fontWeight: '700',
              color: colors.dangerDeep,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
              marginBottom: 3,
            }}
          >
            Filing risk
          </Text>
          <Text style={{ fontSize: 15, fontWeight: '700', color: colors.danger }}>
            {cashWins ? 'High ⚠' : 'Moderate'}
          </Text>
          <Text style={{ fontSize: 12, color: colors.dangerDeep, marginTop: 3, lineHeight: 15 }}>
            {input.deductible >= result.cashTotal3yr
              ? `${usd(input.deductible)} ded. > repair · ${result.surchargeYears}-yr hike`
              : `+${usd(result.totalSurcharge)} hikes over ${result.surchargeYears} yrs`}
          </Text>
        </View>
      </View>

      {/* Assumptions disclosure */}
      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: radii.sm,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
          marginBottom: spacing.md,
          overflow: 'hidden',
        }}
      >
        <Tappable
          onPress={() => setAssumptionsOpen((open) => !open)}
          style={({ pressed }) => ({
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.xs,
            padding: spacing.sm,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Text style={{ fontSize: 14 }}>ⓘ</Text>
          <Text style={{ flex: 1, fontSize: 14, fontWeight: '600', color: colors.textPrimary }}>
            Assumptions behind these numbers
          </Text>
          <Text style={{ fontSize: 13, color: colors.textTertiary }}>
            {assumptionsOpen ? '▾' : '▸'}
          </Text>
        </Tappable>
        {assumptionsOpen ? (
          <View
            style={{
              paddingHorizontal: spacing.sm,
              paddingBottom: spacing.sm,
              gap: 5,
            }}
          >
            {result.assumptions.map((line) => (
              <View key={line} style={{ flexDirection: 'row', gap: 6 }}>
                <Text style={{ fontSize: 12, color: colors.textPlaceholder }}>•</Text>
                <Text style={{ flex: 1, fontSize: 12, color: colors.textTertiary, lineHeight: 15 }}>
                  {line}
                </Text>
              </View>
            ))}
          </View>
        ) : null}
      </View>

      {/* CTA follows the verdict: cash wins → book & pay cash; insurance wins
          → start the claim with the insurer instead of offering a cash path. */}
      {cashWins ? (
        <PrimaryButton
          label={`Book ${dealer.name} · Pay cash →`}
          onPress={() => navigation.navigate('CompCashBook', { quoteId: aq.id })}
        />
      ) : (
        <PrimaryButton
          label={`Call ${INSURANCE_POLICY.carrier} · Start your claim →`}
          onPress={() => navigation.navigate('CompInsurance', { quoteId: aq.id })}
        />
      )}
    </Screen>
  );
}
