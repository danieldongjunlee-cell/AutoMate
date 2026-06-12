import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { SkeletonList } from '../../components/Skeleton';
import { Tappable } from '../../components/Tappable';
import { Screen, SectionLabel } from '../../components/ui';
import { navigateCrossTab } from '../../navigation/crossTab';
import { ProfileStackParamList } from '../../navigation/types';
import { insuranceService, Policy } from '../../services';
import { palette, radii, spacing, useTheme } from '../../theme';
import { confirmAction } from '../../utils/alerts';

type Nav = NativeStackNavigationProp<ProfileStackParamList, 'ProfInsurance'>;

function PolicyCard({
  policy,
  onEdit,
  onRemove,
}: {
  policy: Policy;
  onEdit: () => void;
  onRemove: () => void;
}) {
  const { colors } = useTheme();
  const details = [
    ['Policy number', policy.policyNumber],
    ['Deductible', `$${policy.deductible} (collision)`],
    ['Annual premium', `$${policy.premiumPerYear.toLocaleString()}/yr`],
    ['Covers', policy.covers],
    ['Renewal date', policy.renewal],
  ] as const;

  return (
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
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#fff' }}>{policy.carrier}</Text>
          <Text style={{ fontSize: 12, color: 'rgba(255,255,255,.65)' }}>{policy.coverage}</Text>
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
          <Text style={{ fontSize: 12, color: palette.successLight }}>{policy.status}</Text>
        </View>
      </LinearGradient>
      <View style={{ paddingHorizontal: spacing.md, paddingVertical: spacing.xs }}>
        {details.map(([label, value]) => (
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
          flexDirection: 'row',
          gap: spacing.xs,
        }}
      >
        <Tappable
          onPress={onEdit}
          style={{
            flex: 2,
            backgroundColor: colors.primary,
            borderRadius: radii.sm,
            paddingVertical: 11,
            alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: 14, fontWeight: '700', color: colors.onPrimary }}>
            ✎ Edit policy details
          </Text>
        </Tappable>
        <Tappable
          onPress={onRemove}
          style={{
            flex: 1,
            backgroundColor: colors.surface,
            borderRadius: radii.sm,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: colors.dangerBorder,
            paddingVertical: 11,
            alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: 14, fontWeight: '600', color: colors.danger }}>Remove</Text>
        </Tappable>
      </View>
    </View>
  );
}

/** Wireframe s-prof-insurance: live policy cards + compare cash-vs-insurance link. */
export function ProfInsuranceScreen() {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();
  const queryClient = useQueryClient();

  const { data: policies, isLoading } = useQuery({
    queryKey: ['policies'],
    queryFn: () => insuranceService.listPolicies(),
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => insuranceService.removePolicy(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['policies'] }),
  });

  return (
    <Screen>
      <SectionLabel>Your policies</SectionLabel>
      {isLoading ? (
        <SkeletonList variant="card" count={1} tall />
      ) : (policies ?? []).length === 0 ? (
        <Text
          style={{
            fontSize: 13,
            color: colors.textSecondary,
            textAlign: 'center',
            padding: spacing.lg,
          }}
        >
          No policies on file — add one below.
        </Text>
      ) : (
        (policies ?? []).map((policy) => (
          <PolicyCard
            key={policy.id}
            policy={policy}
            onEdit={() => navigation.navigate('ProfInsEdit', { policyId: policy.id })}
            onRemove={() =>
              confirmAction(
                'Remove policy',
                `Remove the ${policy.carrier} policy ${policy.policyNumber}?`,
                () => removeMutation.mutate(policy.id),
              )
            }
          />
        ))
      )}

      {/* Add policy */}
      <Tappable
        onPress={() => navigation.navigate('ProfInsAdd')}
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
      </Tappable>

      {/* Compare link (cross-tab → Compare) */}
      <Tappable
        onPress={() => navigateCrossTab(navigation, 'CompareTab', 'CompSelect')}
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
      </Tappable>
    </Screen>
  );
}
