import { CommonActions, useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { Screen, SectionLabel } from '../../components/ui';
import { INSURANCE_POLICY } from '../../services/mock/data';
import { radii, spacing, useTheme } from '../../theme';

const DETAILS = [
  ['Policy number', INSURANCE_POLICY.accountNumber],
  ['Deductible', `$${INSURANCE_POLICY.deductible} (collision)`],
  ['Annual premium', `$${INSURANCE_POLICY.premiumPerYear.toLocaleString()}/yr`],
  ['Covers', INSURANCE_POLICY.covers],
  ['Renewal date', INSURANCE_POLICY.renewal],
] as const;

/** Wireframe s-prof-insurance: policy card + compare cash-vs-insurance link. */
export function ProfInsuranceScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme();

  return (
    <Screen>
      <SectionLabel>Your policies</SectionLabel>
      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: radii.md,
          borderWidth: 1.5,
          borderColor: colors.warning,
          overflow: 'hidden',
          marginBottom: spacing.sm,
        }}
      >
        <LinearGradient
          colors={['#633806', '#854F0B']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            padding: spacing.md,
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.sm,
          }}
        >
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: radii.sm,
              backgroundColor: 'rgba(255,255,255,.2)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: 22 }}>🛡️</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#fff' }}>
              {INSURANCE_POLICY.carrier}
            </Text>
            <Text style={{ fontSize: 12, color: 'rgba(255,255,255,.65)' }}>
              {INSURANCE_POLICY.coverage}
            </Text>
          </View>
          <View
            style={{
              backgroundColor: 'rgba(29,158,117,.3)',
              borderRadius: radii.pill,
              borderWidth: StyleSheet.hairlineWidth,
              borderColor: 'rgba(29,158,117,.5)',
              paddingHorizontal: 10,
              paddingVertical: 3,
            }}
          >
            <Text style={{ fontSize: 12, color: '#5DCFAA' }}>Active</Text>
          </View>
        </LinearGradient>
        <View style={{ paddingHorizontal: spacing.md, paddingVertical: spacing.xs }}>
          {DETAILS.map(([label, value]) => (
            <View
              key={label}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                paddingVertical: 7,
                borderBottomWidth: StyleSheet.hairlineWidth,
                borderBottomColor: colors.divider,
              }}
            >
              <Text style={{ fontSize: 13, color: colors.textTertiary }}>{label}</Text>
              <Text style={{ fontSize: 13, fontWeight: '500', color: colors.textPrimary }}>
                {value}
              </Text>
            </View>
          ))}
        </View>
        <View
          style={{
            padding: spacing.sm,
            borderTopWidth: StyleSheet.hairlineWidth,
            borderTopColor: colors.divider,
          }}
        >
          <Pressable
            onPress={() => Alert.alert('Edit policy', 'Policy editing comes with the backend.')}
            style={({ pressed }) => ({
              backgroundColor: colors.warningSurface,
              borderRadius: radii.sm,
              borderWidth: StyleSheet.hairlineWidth,
              borderColor: colors.warning,
              paddingVertical: 9,
              alignItems: 'center',
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Text style={{ fontSize: 13, fontWeight: '500', color: colors.warningDeep }}>
              ✎ Edit policy details
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Add policy */}
      <Pressable
        onPress={() => Alert.alert('Add policy', 'Policy linking comes with the backend.')}
        style={({ pressed }) => ({
          backgroundColor: colors.surface,
          borderRadius: radii.md,
          borderWidth: 1.5,
          borderStyle: 'dashed',
          borderColor: colors.warning,
          padding: spacing.lg,
          alignItems: 'center',
          marginBottom: spacing.md,
          opacity: pressed ? 0.7 : 1,
        })}
      >
        <Text style={{ fontSize: 28, marginBottom: 6 }}>➕</Text>
        <Text style={{ fontSize: 15, fontWeight: '500', color: colors.warningDeep, marginBottom: 2 }}>
          Add another policy
        </Text>
        <Text style={{ fontSize: 13, color: colors.textTertiary }}>Geico, Progressive, USAA...</Text>
      </Pressable>

      {/* Compare link (cross-tab → Compare) */}
      <Pressable
        onPress={() =>
          navigation.dispatch(CommonActions.navigate('CompareTab', { screen: 'CompSelect' }))
        }
        style={({ pressed }) => ({
          backgroundColor: colors.successSurface,
          borderRadius: radii.sm,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.success,
          padding: spacing.sm,
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.sm,
          opacity: pressed ? 0.7 : 1,
        })}
      >
        <Text style={{ fontSize: 16 }}>⚖</Text>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 14, fontWeight: '500', color: colors.successDeep }}>
            Compare cash vs. insurance →
          </Text>
          <Text style={{ fontSize: 12, color: colors.successDark }}>
            See if filing a claim is worth it
          </Text>
        </View>
      </Pressable>
    </Screen>
  );
}
