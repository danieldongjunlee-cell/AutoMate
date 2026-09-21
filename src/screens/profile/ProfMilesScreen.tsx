import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Glyph, Icon, subjectColor } from '../../components/Icon';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { Text } from '../../components/Text';

import { Tappable } from '../../components/Tappable';

import { Screen } from '../../components/ui';
import { useRequireAuth } from '../../hooks/useRequireAuth';
import { pointsToUsd } from '../../config/points';
import { ProfileStackParamList } from '../../navigation/types';
import { MILESTONES } from '../../services/mock/data';
import { useAppStore } from '../../store/useAppStore';
import { palette, radii, spacing, useTheme } from '../../theme';

type Nav = NativeStackNavigationProp<ProfileStackParamList, 'ProfMiles'>;

const NEXT_REWARD_PTS = 6000;

/** Rewards: daily check-in, points balance and the milestone progress cards. */
export function ProfMilesScreen() {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();
  const storePoints = useAppStore((s) => s.points);
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const storeCheckedIn = useAppStore((s) => s.dailyCheckedIn);
  const claimCheckIn = useAppStore((s) => s.claimDailyCheckIn);
  const requireAuth = useRequireAuth();
  // Guests have no account yet, points, streak and check-in all read zero.
  const points = isAuthenticated ? storePoints : 0;
  const checkedIn = isAuthenticated ? storeCheckedIn : false;

  return (
    <Screen>
      {/* Daily check-in */}
      <Tappable
        onPress={checkedIn ? undefined : () => requireAuth('checkIn', claimCheckIn)}
        disabled={checkedIn}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.sm,
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderWidth: 1,
          borderRadius: radii.lg,
          padding: spacing.md,
          marginBottom: spacing.md,
        }}
      >
        <Icon name={checkedIn ? 'sparkle' : 'check'} size={22} color={checkedIn ? palette.amber : palette.mint} />
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 14, fontWeight: '700', color: colors.textPrimary }}>{checkedIn ? 'Checked in today' : 'Daily check-in'}</Text>
          <Text style={{ fontSize: 12, color: colors.textTertiary }}>
            {isAuthenticated ? `Day ${checkedIn ? 6 : 5} streak · +10 pts` : 'Day 0 streak · 0 pts'}
          </Text>
        </View>
        <View
          style={{
            backgroundColor: checkedIn ? 'transparent' : colors.success,
            borderWidth: checkedIn ? 1.5 : 0,
            borderColor: colors.success,
            borderRadius: radii.pill,
            paddingHorizontal: 14,
            paddingVertical: 6,
          }}
        >
          <Text style={{ fontSize: 13, fontWeight: '800', color: checkedIn ? colors.successDark : '#fff' }}>{checkedIn ? 'Claimed' : 'Claim'}</Text>
        </View>
      </Tappable>

      {/* Points card */}
      <View style={{ backgroundColor: colors.warningSurface, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.warning, padding: spacing.md, marginBottom: spacing.section }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.xs }}>
          <View>
            <Text style={{ fontSize: 13, fontWeight: '700', color: colors.warningDeep }}>YOUR POINTS</Text>
            <Text style={{ fontSize: 26, fontWeight: '800', color: colors.warningDeep }}>
              {points.toLocaleString()} pts{' '}
              <Text style={{ fontSize: 14, fontWeight: '700', color: palette.mint }}>= {pointsToUsd(points)}</Text>
            </Text>
          </View>
          <View style={{ backgroundColor: colors.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.warning, borderRadius: radii.sm, paddingHorizontal: 12, paddingVertical: 8, alignItems: 'center' }}>
            <Text style={{ fontSize: 13, color: colors.warningDeep }}>Next reward</Text>
            <Text style={{ fontSize: 14, fontWeight: '700', color: colors.warningDeep }}>{NEXT_REWARD_PTS.toLocaleString()} pts</Text>
          </View>
        </View>
        <View style={{ height: 6, backgroundColor: 'rgba(240,180,78,.25)', borderRadius: 3, overflow: 'hidden', marginBottom: 6 }}>
          <View style={{ width: `${Math.min(100, (points / NEXT_REWARD_PTS) * 100)}%`, height: '100%', backgroundColor: colors.warning }} />
        </View>
        <Text style={{ fontSize: 12, color: colors.warningDeep }}>100 pts = $1 · redeem on any milestone below</Text>
      </View>

      <Text style={{ fontSize: 12, fontWeight: '700', letterSpacing: 0.6, textTransform: 'uppercase', color: colors.textTertiary, marginBottom: spacing.md }}>Milestones</Text>
      {MILESTONES.map((m) => {
        const pct = Math.min(100, (points / m.costPts) * 100);
        return (
          <Tappable
            key={m.id}
            onPress={() => navigation.navigate('ProfMileDet', { id: m.id })}
            style={({ pressed }) => ({
              backgroundColor: colors.surface,
              borderRadius: radii.sm,
              borderWidth: StyleSheet.hairlineWidth,
              borderColor: colors.border,
              padding: spacing.md,
              marginBottom: spacing.sm,
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
                <Glyph glyph={m.icon} size={26} color={subjectColor(m.icon)} />
                <View>
                  <Text style={{ fontSize: 15, fontWeight: '500', color: colors.textPrimary }}>
                    {m.title}
                  </Text>
                  <Text style={{ fontSize: 13, color: colors.textTertiary }}>{m.sub}</Text>
                </View>
              </View>
              <Text style={{ fontSize: 14, fontWeight: '700', color: colors.primary }}>
                {m.costPts.toLocaleString()} pts
              </Text>
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
