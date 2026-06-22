import { useQuery } from '@tanstack/react-query';
import React, { useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';

import { Dropdown } from '../../components/Dropdown';
import { Badge, Card, Screen, SectionLabel } from '../../components/ui';
import { fetchDamageEstimates, SavedDamageRequest } from '../../lib/damageEstimates';
import { isSupabaseConfigured } from '../../lib/supabase';
import { radii, spacing, useTheme } from '../../theme';

const when = (iso: string) =>
  new Date(iso).toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

const ALL_TYPES = 'All types';
const DATE_OPTS = ['All dates', 'Last 30 days', 'Last 90 days', 'This year'] as const;

/** Does an estimate's timestamp fall inside the chosen date window? */
function withinDateRange(iso: string, range: string): boolean {
  if (range === 'All dates') return true;
  const d = new Date(iso);
  if (range === 'This year') return d.getFullYear() === new Date().getFullYear();
  const days = range === 'Last 30 days' ? 30 : 90;
  return Date.now() - d.getTime() <= days * 24 * 60 * 60 * 1000;
}

/** Past AI damage estimates with their uploaded before-photos (from Supabase). */
export function EstimateHistoryScreen() {
  const { colors } = useTheme();
  // Dropdown filters (damage type + date window).
  const [typeFilter, setTypeFilter] = useState<string>(ALL_TYPES);
  const [dateFilter, setDateFilter] = useState<string>(DATE_OPTS[0]);
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

  // Damage-type options are derived from what the user actually has on file.
  const typeOptions = [
    ALL_TYPES,
    ...Array.from(
      new Set(
        estimates.flatMap((e) => e.parts.map((p) => p.damageType).filter((t): t is string => !!t)),
      ),
    ),
  ];
  const filtered = estimates.filter(
    (est) =>
      (typeFilter === ALL_TYPES || est.parts.some((p) => p.damageType === typeFilter)) &&
      withinDateRange(est.createdAt, dateFilter),
  );

  return (
    <Screen>
      <SectionLabel>Your AI estimates</SectionLabel>

      {/* Filters: damage type + date window */}
      <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md }}>
        <View style={{ flex: 1 }}>
          <Dropdown label="Damage type" value={typeFilter} options={typeOptions} onChange={setTypeFilter} />
        </View>
        <View style={{ flex: 1 }}>
          <Dropdown label="Date" value={dateFilter} options={DATE_OPTS as unknown as string[]} onChange={setDateFilter} />
        </View>
      </View>

      {filtered.length === 0 ? (
        <Text style={{ fontSize: 13, color: colors.textTertiary, textAlign: 'center', paddingVertical: spacing.lg }}>
          No estimates match these filters.
        </Text>
      ) : null}

      {filtered.map((est: SavedDamageRequest) => (
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
