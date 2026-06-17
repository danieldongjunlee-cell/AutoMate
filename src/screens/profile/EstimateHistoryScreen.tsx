import { useQuery } from '@tanstack/react-query';
import React from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';

import { Badge, Card, Screen, SectionLabel } from '../../components/ui';
import { fetchDamageEstimates, SavedDamageRequest } from '../../lib/damageEstimates';
import { isSupabaseConfigured } from '../../lib/supabase';
import { radii, spacing, useTheme } from '../../theme';

const when = (iso: string) =>
  new Date(iso).toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

/** Past AI damage estimates with their uploaded before-photos (from Supabase). */
export function EstimateHistoryScreen() {
  const { colors } = useTheme();
  const { data: estimates = [], isLoading } = useQuery({
    queryKey: ['damage-estimates'],
    queryFn: fetchDamageEstimates,
    enabled: isSupabaseConfigured,
  });

  if (!isSupabaseConfigured) {
    return (
      <Screen>
        <Card style={{ padding: spacing.lg }}>
          <Text style={{ fontSize: 14, color: colors.textSecondary, lineHeight: 21 }}>
            Estimate history is stored in Supabase. Set{' '}
            <Text style={{ fontWeight: '700' }}>EXPO_PUBLIC_SUPABASE_*</Text> and sign in to see your
            past estimates and photos here.
          </Text>
        </Card>
      </Screen>
    );
  }

  if (isLoading) {
    return (
      <Screen>
        <View style={{ paddingVertical: spacing.xxxl, alignItems: 'center' }}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </Screen>
    );
  }

  if (estimates.length === 0) {
    return (
      <Screen>
        <Card style={{ padding: spacing.lg, alignItems: 'center' }}>
          <Text style={{ fontSize: 28, marginBottom: 6 }}>🔍</Text>
          <Text style={{ fontSize: 15, fontWeight: '600', color: colors.textPrimary }}>No estimates yet</Text>
          <Text style={{ fontSize: 13, color: colors.textTertiary, marginTop: 2, textAlign: 'center' }}>
            Submit a damaged part for an AI estimate and it’ll show up here with your photos.
          </Text>
        </Card>
      </Screen>
    );
  }

  return (
    <Screen>
      <SectionLabel>Your AI estimates</SectionLabel>
      {estimates.map((est: SavedDamageRequest) => (
        <Card key={est.id} style={{ padding: spacing.md, marginBottom: spacing.md }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: '800', color: colors.textPrimary }}>
                {est.priceLow != null && est.priceHigh != null
                  ? `$${est.priceLow}–$${est.priceHigh}`
                  : 'Estimate'}
              </Text>
              <Text style={{ fontSize: 12, color: colors.textTertiary }}>{when(est.createdAt)}</Text>
            </View>
            {est.confidencePct != null ? (
              <Badge label={`${est.confidencePct}% confidence`} variant="success" />
            ) : null}
          </View>

          {est.parts.map((p, i) => (
            <View
              key={`${est.id}-${i}`}
              style={{
                borderTopWidth: StyleSheet.hairlineWidth,
                borderTopColor: colors.divider,
                paddingTop: spacing.sm,
                marginTop: i === 0 ? 0 : spacing.xs,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: colors.primaryDeep }}>{p.part}</Text>
                {p.damageType ? <Badge label={p.damageType} variant="primary" /> : null}
              </View>
              {p.note ? (
                <Text style={{ fontSize: 12, color: colors.textSecondary, fontStyle: 'italic', marginBottom: 6 }}>
                  “{p.note}”
                </Text>
              ) : null}
              {p.photoUrls.length ? (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                  {p.photoUrls.map((uri) => (
                    <Image
                      key={uri}
                      source={{ uri }}
                      style={{ width: 76, height: 64, borderRadius: radii.sm, backgroundColor: colors.surfaceAlt }}
                      resizeMode="cover"
                    />
                  ))}
                </View>
              ) : (
                <Text style={{ fontSize: 12, color: colors.textTertiary }}>No photos</Text>
              )}
            </View>
          ))}
        </Card>
      ))}
    </Screen>
  );
}
