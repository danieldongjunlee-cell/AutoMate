import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { Tappable } from '../../components/Tappable';

import { AvatarCircle, Screen, SectionLabel } from '../../components/ui';
import { pointsToUsd } from '../../config/points';
import { dealerById, MILESTONE_PARTNERS, MILESTONES } from '../../services/mock/data';
import { useAppStore } from '../../store/useAppStore';
import { palette, radii, spacing, useTheme } from '../../theme';

/** Wireframe s-prof-mile-det: free oil change milestone + partner dealers. */
export function ProfMileDetScreen() {
  const { colors } = useTheme();
  const points = useAppStore((s) => s.points);
  const milestone = MILESTONES[0];
  const pct = Math.min(100, (points / milestone.costPts) * 100);

  return (
    <Screen>
      <LinearGradient
        colors={[palette.primary, palette.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ borderRadius: radii.md, padding: spacing.md, marginBottom: spacing.md }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm }}>
          <Text style={{ fontSize: 32 }}>{milestone.icon}</Text>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 17, fontWeight: '600', color: '#fff' }}>{milestone.title}</Text>
            <Text style={{ fontSize: 13, color: 'rgba(255,255,255,.7)' }}>{milestone.sub}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ fontSize: 14, fontWeight: '700', color: palette.warning }}>
              {milestone.costPts.toLocaleString()} pts
            </Text>
            <Text style={{ fontSize: 11, color: 'rgba(255,255,255,.7)' }}>
              {pointsToUsd(milestone.costPts)} value
            </Text>
          </View>
        </View>
        <View
          style={{ height: 6, backgroundColor: 'rgba(255,255,255,.2)', borderRadius: 3, overflow: 'hidden' }}
        >
          <View
            style={{
              width: `${Math.max(pct, 1.5)}%`,
              height: '100%',
              backgroundColor: palette.warning,
            }}
          />
        </View>
      </LinearGradient>

      <SectionLabel>Partner dealerships</SectionLabel>
      {MILESTONE_PARTNERS.map(({ dealerId, tag }, i) => {
        const dealer = dealerById(dealerId);
        return (
          <View
            key={dealerId}
            style={{
              backgroundColor: colors.surface,
              borderRadius: radii.md,
              borderWidth: i === 0 ? 1.5 : StyleSheet.hairlineWidth,
              borderColor: i === 0 ? colors.primary : colors.border,
              padding: spacing.md,
              marginBottom: spacing.sm,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.sm,
                marginBottom: spacing.sm,
              }}
            >
              <AvatarCircle initial={dealer.initial} color={dealer.color} size={40} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: '500', color: colors.textPrimary }}>
                  {dealer.name}
                </Text>
                <Text style={{ fontSize: 13, color: colors.textTertiary }}>
                  ★ {dealer.rating} · {dealer.distanceMi} mi
                </Text>
              </View>
              <View
                style={{
                  backgroundColor: colors.surfaceAlt,
                  borderRadius: radii.pill,
                  paddingHorizontal: 10,
                  paddingVertical: 3,
                }}
              >
                <Text style={{ fontSize: 12, color: colors.textSecondary }}>{tag}</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', gap: spacing.xs }}>
              <Tappable
                onPress={() => Alert.alert('Directions', 'Opens the device maps app when wired.')}
                style={({ pressed }) => ({
                  flex: 1,
                  backgroundColor: colors.primarySurface,
                  borderRadius: radii.sm,
                  paddingVertical: 9,
                  alignItems: 'center',
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <Text style={{ fontSize: 13, color: colors.primaryDark }}>Get directions</Text>
              </Tappable>
              <Tappable
                onPress={() =>
                  Alert.alert(
                    'Redeem',
                    `You need ${milestone.costPts.toLocaleString()} pts to redeem (you have ${points.toLocaleString()}).`,
                  )
                }
                style={({ pressed }) => ({
                  flex: 1,
                  backgroundColor: colors.primary,
                  borderRadius: radii.sm,
                  paddingVertical: 9,
                  alignItems: 'center',
                  opacity: pressed ? 0.8 : 1,
                })}
              >
                <Text style={{ fontSize: 13, fontWeight: '500', color: colors.onPrimary }}>
                  Redeem here
                </Text>
              </Tappable>
            </View>
          </View>
        );
      })}
    </Screen>
  );
}
