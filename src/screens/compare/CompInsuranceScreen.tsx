import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { Tappable } from '../../components/Tappable';

import { CompareStackParamList } from '../../navigation/types';
import { INSURANCE_POLICY } from '../../services/mock/data';
import { Badge, Screen } from '../../components/ui';
import { radii, spacing, useTheme } from '../../theme';

type Nav = NativeStackNavigationProp<CompareStackParamList, 'CompInsurance'>;

/** Wireframe s-comp-insurance: "File a claim" card with insurer call info. */
export function CompInsuranceScreen() {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();

  return (
    <Screen>
      <View
        style={{
          backgroundColor: colors.card,
          borderRadius: radii.lg,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
          padding: spacing.lg,
          shadowColor: '#000',
          shadowOpacity: 0.15,
          shadowRadius: 20,
          shadowOffset: { width: 0, height: 10 },
          elevation: 6,
        }}
      >
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md }}>
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: radii.md,
              backgroundColor: '#FAECE7',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: 28 }}>🛡️</Text>
          </View>
          <View>
            <Text style={{ fontSize: 19, fontWeight: '700', color: colors.textPrimary }}>
              File a claim
            </Text>
            <Text style={{ fontSize: 14, color: colors.textTertiary }}>
              {INSURANCE_POLICY.carrier} · Policy #{INSURANCE_POLICY.policyNumber}
            </Text>
          </View>
        </View>

        {/* Claims contact */}
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
          <Text
            style={{
              fontSize: 12,
              fontWeight: '700',
              color: colors.textTertiary,
              textTransform: 'uppercase',
              letterSpacing: 0.6,
              marginBottom: spacing.sm,
            }}
          >
            Claims customer service
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm }}>
            <Text style={{ fontSize: 24 }}>📞</Text>
            <View>
              <Text style={{ fontSize: 22, fontWeight: '800', color: colors.textPrimary }}>
                {INSURANCE_POLICY.claimsPhone}
              </Text>
              <Text style={{ fontSize: 14, color: colors.textTertiary }}>
                {INSURANCE_POLICY.claimsPhoneDigits}
              </Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: 6 }}>
            <Badge label="24/7 available" variant="success" />
            <Badge label="Claims dept." variant="neutral" />
          </View>
        </View>

        <Text style={{ fontSize: 14, color: colors.textSecondary, lineHeight: 20, marginBottom: spacing.sm }}>
          Mention your policy and reference:{' '}
          <Text style={{ fontWeight: '700', color: colors.textPrimary }}>
            {INSURANCE_POLICY.claimReference}
          </Text>{' '}
          when you call.
        </Text>

        {/* Warning */}
        <View
          style={{
            backgroundColor: colors.warningSurface,
            borderRadius: radii.sm,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: colors.warning,
            padding: spacing.sm,
            marginBottom: spacing.md,
          }}
        >
          <Text style={{ fontSize: 13, color: colors.warningDeep, lineHeight: 19 }}>
            <Text style={{ fontWeight: '700' }}>⚠ Note:</Text> Filing a claim may raise your premium
            12–18% per year for 2–3 years. Consider paying cash ($320) to avoid ~$750–$960 in future
            hikes.
          </Text>
        </View>

        {/* Actions */}
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          <Tappable
            onPress={() =>
              Alert.alert('Call insurer', 'Calling will be wired to the device dialer.')
            }
            style={({ pressed }) => ({
              flex: 1,
              backgroundColor: colors.primary,
              borderRadius: radii.sm,
              paddingVertical: 12,
              alignItems: 'center',
              opacity: pressed ? 0.8 : 1,
            })}
          >
            <Text style={{ fontSize: 14, fontWeight: '700', color: colors.onPrimary }}>
              📞 Call now
            </Text>
          </Tappable>
          <Tappable
            onPress={() => navigation.goBack()}
            style={({ pressed }) => ({
              flex: 1,
              backgroundColor: colors.surface,
              borderWidth: StyleSheet.hairlineWidth,
              borderColor: colors.border,
              borderRadius: radii.sm,
              paddingVertical: 12,
              alignItems: 'center',
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Text style={{ fontSize: 14, color: colors.textSecondary }}>Dismiss</Text>
          </Tappable>
        </View>
      </View>
    </Screen>
  );
}
