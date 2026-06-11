import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CompareStackParamList } from '../../navigation/types';
import { ACCEPTED_QUOTES, dealerById, INSURANCE_POLICY } from '../../services/mock/data';
import { Screen } from '../../components/ui';
import { palette, radii, spacing, useTheme } from '../../theme';

type Nav = NativeStackNavigationProp<CompareStackParamList, 'CompCashIns'>;

/** Salmon insurance-banner surface from the wireframe (#FAECE7 / #4A1B0C). */
const SALMON_BG = '#FAECE7';
const SALMON_FG = '#4A1B0C';

/** Wireframe s-comp-cash-ins: pay cash vs. file insurance side-by-side. */
export function CompCashInsScreen() {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();
  const aq = ACCEPTED_QUOTES[0];
  const dealer = dealerById(aq.dealerId);

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
            {INSURANCE_POLICY.carrier} · ${INSURANCE_POLICY.deductible} ded. · $
            {INSURANCE_POLICY.premiumPerYear.toLocaleString()}/yr
          </Text>
          <Text style={{ fontSize: 12, color: '#888' }}>
            Policy #{INSURANCE_POLICY.policyNumber} · from your profile
          </Text>
        </View>
      </View>

      {/* Cash vs insurance */}
      <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md }}>
        <Pressable
          onPress={() => navigation.navigate('CompCashBook')}
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
          <Text style={{ fontSize: 30, marginBottom: 6 }}>💰</Text>
          <Text style={{ fontSize: 14, fontWeight: '600', color: colors.successDeep, marginBottom: 4 }}>
            Pay cash
          </Text>
          <Text style={{ fontSize: 27, fontWeight: '700', color: colors.successDark }}>
            ${aq.priceLow}
          </Text>
          <Text style={{ fontSize: 12, color: colors.textTertiary, marginBottom: 6 }}>est.</Text>
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
        </Pressable>

        <Pressable
          onPress={() => navigation.navigate('CompInsurance')}
          style={({ pressed }) => ({
            flex: 1,
            backgroundColor: colors.dangerSurface,
            borderRadius: radii.md,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: '#F09595',
            padding: spacing.md,
            alignItems: 'center',
            opacity: pressed ? 0.8 : 1,
          })}
        >
          <Text style={{ fontSize: 30, marginBottom: 6 }}>🛡️</Text>
          <Text style={{ fontSize: 14, fontWeight: '600', color: '#791F1F', marginBottom: 4 }}>
            File insurance
          </Text>
          <Text style={{ fontSize: 27, fontWeight: '700', color: colors.success }}>$0</Text>
          <Text style={{ fontSize: 12, color: colors.textTertiary, marginBottom: 6 }}>today</Text>
          <View
            style={{
              backgroundColor: colors.dangerSurface,
              borderRadius: radii.pill,
              borderWidth: StyleSheet.hairlineWidth,
              borderColor: '#F09595',
              paddingHorizontal: 11,
              paddingVertical: 3,
            }}
          >
            <Text style={{ fontSize: 12, fontWeight: '600', color: colors.dangerDeep }}>
              ⚠ Rate hike
            </Text>
          </View>
        </Pressable>
      </View>

      {/* Deep dive link */}
      <Pressable onPress={() => navigation.navigate('CompDeepDive')}>
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
      </Pressable>
    </Screen>
  );
}
