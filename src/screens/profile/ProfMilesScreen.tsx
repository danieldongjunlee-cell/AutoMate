import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Tappable } from '../../components/Tappable';

import { Screen } from '../../components/ui';
import { pointsToUsd } from '../../config/points';
import { ProfileStackParamList } from '../../navigation/types';
import { MILESTONES } from '../../services/mock/data';
import { useAppStore } from '../../store/useAppStore';
import { palette, radii, spacing, useTheme } from '../../theme';

type Nav = NativeStackNavigationProp<ProfileStackParamList, 'ProfMiles'>;

/** Wireframe s-prof-miles: balance + milestone progress cards. */
export function ProfMilesScreen() {
  const navigation = useNavigation<Nav>();
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
        <Text style={{ fontSize: 12, color: 'rgba(255,255,255,.65)' }}>CURRENT BALANCE</Text>
        <Text style={{ fontSize: 32, fontWeight: '700', color: '#fff' }}>
          {points.toLocaleString()} pts
        </Text>
        <Text style={{ fontSize: 14, fontWeight: '500', color: palette.warning }}>
          = {pointsToUsd(points)} · 100 pts = $1
        </Text>
      </LinearGradient>

      {MILESTONES.map((m) => {
        const pct = Math.min(100, (points / m.costPts) * 100);
        return (
          <Tappable
            key={m.id}
            onPress={() => navigation.navigate('ProfMileDet')}
            style={({ pressed }) => ({
              backgroundColor: colors.surface,
              borderRadius: radii.sm,
              borderWidth: StyleSheet.hairlineWidth,
              borderColor: colors.border,
              padding: spacing.md,
              marginBottom: spacing.sm,
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: spacing.sm,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                <Text style={{ fontSize: 24 }}>{m.icon}</Text>
                <View>
                  <Text style={{ fontSize: 15, fontWeight: '500', color: colors.textPrimary }}>
                    {m.title}
                  </Text>
                  <Text style={{ fontSize: 12, color: colors.textTertiary }}>{m.sub}</Text>
                </View>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: colors.primary }}>
                  {m.costPts.toLocaleString()} pts
                </Text>
                <Text style={{ fontSize: 11, color: colors.textTertiary }}>
                  {pointsToUsd(m.costPts)} value
                </Text>
              </View>
            </View>
            <View
              style={{
                height: 9,
                backgroundColor: colors.border,
                borderRadius: 5,
                overflow: 'hidden',
              }}
            >
              <LinearGradient
                colors={[palette.primary, palette.primaryDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ width: `${Math.max(pct, 1.5)}%`, height: '100%', borderRadius: 5 }}
              />
            </View>
          </Tappable>
        );
      })}
    </Screen>
  );
}
