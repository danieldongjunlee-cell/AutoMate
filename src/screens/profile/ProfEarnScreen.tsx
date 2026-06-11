import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Screen, SectionLabel } from '../../components/ui';
import { EARN_ACTIONS } from '../../services/mock/data';
import { useAppStore } from '../../store/useAppStore';
import { palette, radii, spacing, useTheme } from '../../theme';

/** Wireframe s-prof-earn: balance + ways to earn points. */
export function ProfEarnScreen() {
  const { colors } = useTheme();
  const points = useAppStore((s) => s.points);

  return (
    <Screen>
      <LinearGradient
        colors={[palette.primary, palette.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          borderRadius: radii.md,
          padding: spacing.md,
          marginBottom: spacing.md,
          alignItems: 'center',
        }}
      >
        <Text style={{ fontSize: 12, color: 'rgba(255,255,255,.65)' }}>BALANCE</Text>
        <Text style={{ fontSize: 36, fontWeight: '700', color: '#fff' }}>
          {points.toLocaleString()} pts
        </Text>
        <Text style={{ fontSize: 15, fontWeight: '500', color: palette.warning }}>
          = ${(points / 100).toFixed(2)} · 100 pts = $1
        </Text>
      </LinearGradient>

      <SectionLabel>Earn points</SectionLabel>
      {EARN_ACTIONS.map((action) => (
        <View
          key={action.title}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.sm,
            paddingVertical: spacing.sm,
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: colors.divider,
          }}
        >
          <Text style={{ fontSize: 18, width: 30, textAlign: 'center' }}>{action.icon}</Text>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 15, fontWeight: '500', color: colors.textPrimary }}>
              {action.title}
            </Text>
            <Text style={{ fontSize: 13, color: colors.textTertiary }}>{action.sub}</Text>
          </View>
          <View
            style={{
              backgroundColor: colors.warningSurface,
              borderRadius: radii.pill,
              paddingHorizontal: 11,
              paddingVertical: 3,
            }}
          >
            <Text style={{ fontSize: 12, color: colors.warningDeep }}>+{action.pts} pts</Text>
          </View>
        </View>
      ))}
    </Screen>
  );
}
