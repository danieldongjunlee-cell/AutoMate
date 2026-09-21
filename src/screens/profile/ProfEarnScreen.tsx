import { useNavigation } from '@react-navigation/native';
import { Glyph } from '../../components/Icon';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { Text } from '../../components/Text';

import { Tappable } from '../../components/Tappable';
import { Screen, SectionLabel } from '../../components/ui';
import { pointsToUsd } from '../../config/points';
import { ProfileStackParamList } from '../../navigation/types';
import { EARN_ACTIONS } from '../../services/mock/data';
import { useAppStore } from '../../store/useAppStore';
import { palette, radii, spacing, useTheme } from '../../theme';

type Nav = NativeStackNavigationProp<ProfileStackParamList, 'ProfEarn'>;

/** Wireframe s-prof-earn: balance + ways to earn points. */
export function ProfEarnScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<Nav>();
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
        <Text style={{ fontSize: 13, color: 'rgba(255,255,255,.65)' }}>BALANCE</Text>
        <Text style={{ fontSize: 36, fontWeight: '700', color: '#fff' }}>
          {points.toLocaleString()} pts
        </Text>
        <Text style={{ fontSize: 15, fontWeight: '500', color: palette.warning }}>
          = {pointsToUsd(points)} · 100 pts = $1
        </Text>
        <Tappable
          onPress={() => navigation.navigate('ProfPointsHistory')}
          style={{
            marginTop: spacing.sm,
            backgroundColor: 'rgba(255,255,255,.18)',
            borderRadius: radii.pill,
            paddingHorizontal: 14,
            paddingVertical: 6,
          }}
          hitSlop={6}
        >
          <Text style={{ fontSize: 14, fontWeight: '700', color: '#fff' }}>View history →</Text>
        </Tappable>
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
          <View style={{ width: 30, alignItems: 'center' }}>
            <Glyph glyph={action.icon} size={20} color={colors.textSecondary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 15, fontWeight: '500', color: colors.textPrimary }}>
              {action.title}
            </Text>
            <Text style={{ fontSize: 14, color: colors.textTertiary }}>{action.sub}</Text>
          </View>
          <View
            style={{
              backgroundColor: colors.warningSurface,
              borderRadius: radii.pill,
              paddingHorizontal: 11,
              paddingVertical: 3,
            }}
          >
            <Text style={{ fontSize: 13, color: colors.warningDeep }}>+{action.pts} pts</Text>
          </View>
        </View>
      ))}
    </Screen>
  );
}
