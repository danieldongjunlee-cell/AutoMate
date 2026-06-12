import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Tappable } from '../../components/Tappable';
import Svg, { Circle } from 'react-native-svg';

import { PointsBadge } from '../../components/FilterChips';
import { Select } from '../../components/Select';
import { SkeletonList } from '../../components/Skeleton';
import { Screen, SectionLabel } from '../../components/ui';
import { EARN_RULES } from '../../config/points';
import { MaintStackParamList } from '../../navigation/types';
import {
  HISTORY_TIME_FILTERS,
  HISTORY_TYPE_FILTERS,
  VEHICLE,
} from '../../services/mock/data';
import { maintService } from '../../services';
import { radii, spacing, useTheme } from '../../theme';

type Nav = NativeStackNavigationProp<MaintStackParamList, 'MaintHistory'>;

function HealthRing({ pct }: { pct: number }) {
  const { colors } = useTheme();
  const r = 26;
  const c = 2 * Math.PI * r;
  return (
    <View style={{ width: 64, height: 64 }}>
      <Svg width={64} height={64} viewBox="0 0 64 64">
        <Circle cx={32} cy={32} r={r} fill="none" stroke={colors.surfaceAlt} strokeWidth={6} />
        <Circle
          cx={32}
          cy={32}
          r={r}
          fill="none"
          stroke={colors.success}
          strokeWidth={6}
          strokeDasharray={`${(pct / 100) * c} ${c}`}
          strokeLinecap="round"
          transform="rotate(-90 32 32)"
        />
      </Svg>
      <View style={{ position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: 17, fontWeight: '600', color: colors.successDark }}>{pct}</Text>
      </View>
    </View>
  );
}

export function MaintHistoryScreen() {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();
  const [timeFilter, setTimeFilter] = useState(HISTORY_TIME_FILTERS[0]);
  const [typeFilter, setTypeFilter] = useState(HISTORY_TYPE_FILTERS[0]);
  const { data: records, isLoading } = useQuery({
    queryKey: ['service-history'],
    queryFn: maintService.getServiceHistory,
  });

  // Type-filter chips map to record-type keywords ("Brakes" → "brake service").
  const TYPE_KEYWORDS: Record<string, string> = {
    'Oil change': 'oil',
    Tires: 'tire',
    Brakes: 'brake',
    'Body repair': 'body',
  };
  // The mock "today" is early 2025, so the last six months reach into 2025.
  const matchesTime = (year: number) =>
    timeFilter === 'All time' ||
    (timeFilter === 'Last 6 months' ? year >= 2025 : year === Number(timeFilter));

  const visible = (records ?? []).filter(
    (rec) =>
      matchesTime(rec.year) &&
      (typeFilter === 'All types' || rec.type.toLowerCase().includes(TYPE_KEYWORDS[typeFilter])),
  );

  return (
    <Screen>
      {/* Health summary */}
      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: radii.sm,
          padding: spacing.md,
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.md,
          marginBottom: spacing.sm,
        }}
      >
        <HealthRing pct={VEHICLE.healthPct} />
        <View>
          <Text style={{ fontSize: 16, fontWeight: '500', color: colors.textPrimary }}>
            Good condition
          </Text>
          <Text style={{ fontSize: 13, color: colors.textSecondary }}>
            Oil change due ~{VEHICLE.oilDueInMi} mi
          </Text>
        </View>
      </View>

      {/* Add record */}
      <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md }}>
        <Tappable
          onPress={() => navigation.navigate('MaintScanCam')}
          style={({ pressed }) => ({
            flex: 1,
            backgroundColor: colors.successSurface,
            borderRadius: radii.sm,
            borderWidth: 1.5,
            borderColor: colors.success,
            padding: spacing.md,
            alignItems: 'center',
            gap: 5,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Text style={{ fontSize: 26 }}>📷</Text>
          <Text style={{ fontSize: 14, fontWeight: '500', color: colors.successDeep }}>
            Scan receipt
          </Text>
          <PointsBadge points={EARN_RULES.scanReceipt} usd />
        </Tappable>
        <Tappable
          onPress={() => navigation.navigate('MaintManual')}
          style={({ pressed }) => ({
            flex: 1,
            backgroundColor: colors.surface,
            borderRadius: radii.sm,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: colors.border,
            padding: spacing.md,
            alignItems: 'center',
            gap: 5,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Text style={{ fontSize: 26 }}>✏️</Text>
          <Text style={{ fontSize: 14, fontWeight: '500', color: colors.textSecondary }}>
            Manual input
          </Text>
          <PointsBadge points={EARN_RULES.manualLog} usd />
        </Tappable>
      </View>

      {/* User-feedback pass 1: the two chip rows became two side-by-side dropdowns. */}
      <SectionLabel>Past services</SectionLabel>
      <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm }}>
        <Select
          label="Type"
          value={typeFilter}
          options={HISTORY_TYPE_FILTERS}
          onChange={setTypeFilter}
          style={{ flex: 1 }}
        />
        <Select
          label="Time"
          value={timeFilter}
          options={HISTORY_TIME_FILTERS}
          onChange={setTimeFilter}
          style={{ flex: 1 }}
        />
      </View>
      {isLoading ? (
        <SkeletonList variant="row" count={5} />
      ) : visible.length === 0 ? (
        <Text style={{ fontSize: 13, color: colors.textTertiary, textAlign: 'center', padding: spacing.lg }}>
          No services match this filter.
        </Text>
      ) : (
        visible.map((rec) => (
          <View
            key={rec.id}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.sm,
              paddingVertical: spacing.sm,
              borderBottomWidth: StyleSheet.hairlineWidth,
              borderBottomColor: colors.divider,
            }}
          >
            <View
              style={{
                width: 34,
                height: 34,
                borderRadius: radii.sm,
                backgroundColor: rec.icon === '↺' ? colors.infoSurface : colors.successSurface,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 16 }}>{rec.icon}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: '500', color: colors.textPrimary }}>
                {rec.type}
              </Text>
              {/* Price is primary info — secondary tier, not tertiary (feedback pass 1) */}
              <Text style={{ fontSize: 13, color: colors.textSecondary }}>
                {rec.dateLabel} · {rec.mileage} · ${rec.cost}
              </Text>
            </View>
          </View>
        ))
      )}
    </Screen>
  );
}
