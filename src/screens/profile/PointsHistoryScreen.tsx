import { useQuery } from '@tanstack/react-query';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Card, Screen, SectionLabel } from '../../components/ui';
import { fetchLedger } from '../../lib/points';
import { isSupabaseConfigured } from '../../lib/supabase';
import { radii, spacing, useTheme } from '../../theme';

const when = (iso: string) =>
  new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

/** Points ledger from Supabase — every labeled earn / redeem row. */
export function PointsHistoryScreen() {
  const { colors } = useTheme();
  const { data: rows = [], isLoading } = useQuery({
    queryKey: ['points-ledger'],
    queryFn: fetchLedger,
    enabled: isSupabaseConfigured,
  });

  if (!isSupabaseConfigured) {
    return (
      <Screen>
        <Card style={{ padding: spacing.lg }}>
          <Text style={{ fontSize: 14, color: colors.textSecondary, lineHeight: 21 }}>
            Points history is stored in Supabase. Set <Text style={{ fontWeight: '700' }}>EXPO_PUBLIC_SUPABASE_*</Text>{' '}
            and sign in to see your earn / redeem rows here.
          </Text>
        </Card>
      </Screen>
    );
  }

  return (
    <Screen>
      <SectionLabel>Earn & redeem history</SectionLabel>
      {isLoading ? (
        <View style={{ paddingVertical: spacing.xl, alignItems: 'center' }}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : rows.length === 0 ? (
        <Card style={{ padding: spacing.lg, alignItems: 'center' }}>
          <Text style={{ fontSize: 28, marginBottom: 6 }}>✨</Text>
          <Text style={{ fontSize: 15, fontWeight: '600', color: colors.textPrimary }}>No activity yet</Text>
          <Text style={{ fontSize: 14, color: colors.textTertiary, marginTop: 2, textAlign: 'center' }}>
            Check in, book a service, or post in the community to start earning.
          </Text>
        </Card>
      ) : (
        rows.map((r) => {
          const earn = r.delta >= 0;
          return (
            <View
              key={r.id}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.sm,
                backgroundColor: colors.surface,
                borderRadius: radii.sm,
                borderWidth: StyleSheet.hairlineWidth,
                borderColor: colors.border,
                padding: spacing.md,
                marginBottom: spacing.xs,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textPrimary }}>
                  {r.reason ?? 'Points adjustment'}
                </Text>
                <Text style={{ fontSize: 13, color: colors.textTertiary }}>{when(r.created_at)}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ fontSize: 15, fontWeight: '800', color: earn ? colors.success : colors.danger }}>
                  {earn ? '+' : ''}
                  {r.delta} pts
                </Text>
                {r.balance_after != null ? (
                  <Text style={{ fontSize: 12, color: colors.textTertiary }}>
                    balance {r.balance_after}
                  </Text>
                ) : null}
              </View>
            </View>
          );
        })
      )}
    </Screen>
  );
}
