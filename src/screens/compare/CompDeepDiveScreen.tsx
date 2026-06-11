import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '../../components/PrimaryButton';
import { AvatarCircle, Screen, SectionLabel } from '../../components/ui';
import { CompareStackParamList } from '../../navigation/types';
import {
  acceptedQuoteById,
  dealerById,
  DEEP_DIVE_ROWS,
  INSURANCE_POLICY,
} from '../../services/mock/data';
import { radii, spacing, useTheme } from '../../theme';

type Nav = NativeStackNavigationProp<CompareStackParamList, 'CompDeepDive'>;
type Route = RouteProp<CompareStackParamList, 'CompDeepDive'>;

/** Wireframe s-comp-deep-dive: 3-year cash vs. insurance cost table + verdict. */
export function CompDeepDiveScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { colors } = useTheme();
  const aq = acceptedQuoteById(route.params?.quoteId);
  const dealer = dealerById(aq.dealerId);

  const headCell = (label: string, color: string, align: 'left' | 'center' = 'center') => (
    <Text
      style={{
        flex: align === 'left' ? 1.5 : 1,
        fontSize: 11,
        fontWeight: '700',
        color,
        textTransform: 'uppercase',
        textAlign: align,
      }}
    >
      {label}
    </Text>
  );

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
          <Text style={{ fontSize: 12, color: colors.textTertiary }}>
            ${aq.priceLow}–${aq.priceHigh} est. · {INSURANCE_POLICY.carrier} $
            {INSURANCE_POLICY.deductible} ded.
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
        {DEEP_DIVE_ROWS.map((row) => (
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
              <Text style={{ fontSize: 13, color: colors.textSecondary }}>{row.item}</Text>
              {row.sub ? (
                <Text style={{ fontSize: 10, color: colors.textPlaceholder }}>{row.sub}</Text>
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
            $320
          </Text>
          <Text
            style={{ flex: 1, fontSize: 18, fontWeight: '800', textAlign: 'center', color: colors.danger }}
          >
            $1,040
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
          <Text style={{ fontSize: 13, fontWeight: '600', color: colors.textPrimary, marginBottom: 1 }}>
            Break-even: Month 1
          </Text>
          <Text style={{ fontSize: 12, color: colors.textTertiary }}>
            ${INSURANCE_POLICY.deductible} deductible alone exceeds the repair cost — cash wins
            immediately
          </Text>
        </View>
      </View>

      {/* Verdict */}
      <View style={{ flexDirection: 'row', gap: spacing.xs, marginBottom: spacing.md }}>
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
              fontSize: 11,
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
            Pay cash ✔
          </Text>
          <Text style={{ fontSize: 11, color: colors.successDark, marginTop: 3, lineHeight: 15 }}>
            Saves $720 · No rate hike · No claim
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
              fontSize: 11,
              fontWeight: '700',
              color: colors.dangerDeep,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
              marginBottom: 3,
            }}
          >
            Filing risk
          </Text>
          <Text style={{ fontSize: 15, fontWeight: '700', color: colors.danger }}>High ⚠</Text>
          <Text style={{ fontSize: 11, color: colors.dangerDeep, marginTop: 3, lineHeight: 15 }}>
            ${INSURANCE_POLICY.deductible} ded. {'>'} repair · 3-yr hike
          </Text>
        </View>
      </View>

      <PrimaryButton
        label={`Book ${dealer.name} · Pay cash →`}
        onPress={() => navigation.navigate('CompCashBook', { quoteId: aq.id })}
      />
    </Screen>
  );
}
