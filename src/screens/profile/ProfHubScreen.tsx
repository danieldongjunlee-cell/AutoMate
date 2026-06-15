import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Tappable } from '../../components/Tappable';

import { CarSwitchHeader } from '../../components/CarSwitchHeader';
import { AvatarCircle, Screen, SectionLabel } from '../../components/ui';
import { pointsToUsd } from '../../config/points';
import { navigateCrossTab } from '../../navigation/crossTab';
import { ProfileStackParamList } from '../../navigation/types';
import { insuranceService } from '../../services';
import { INSURANCE_POLICY, PAYMENT_CARD, USER, VEHICLE } from '../../services/mock/data';
import { useAppStore } from '../../store/useAppStore';
import { palette, radii, spacing, useTheme } from '../../theme';

type Nav = NativeStackNavigationProp<ProfileStackParamList, 'ProfHub'>;

const NEXT_REWARD_PTS = 6000;

/** Wireframe s-prof-hub: identity, points card, account rows. */
export function ProfHubScreen() {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();
  const points = useAppStore((s) => s.points);
  const isPro = useAppStore((s) => s.isPro);
  // Authenticated user context (set after the demo login); falls back to the
  // wireframe USER constant until someone signs in.
  const authedUser = useAppStore((s) => s.user);
  const displayName = authedUser?.name ?? USER.name;
  const displayEmail = authedUser?.email ?? USER.email;
  const displayInitial = displayName.trim().charAt(0).toUpperCase() || USER.initial;

  // Live primary policy for the insurance row (falls back to the wireframe
  // constant while loading) — stays in sync with prof-ins-edit changes.
  const { data: policies } = useQuery({
    queryKey: ['policies'],
    queryFn: () => insuranceService.listPolicies(),
  });
  const policy = policies?.[0];
  const insuranceSub = policy
    ? `${policy.carrier} · $${policy.deductible} deductible`
    : `${INSURANCE_POLICY.carrier} · $${INSURANCE_POLICY.deductible} deductible`;

  const accountRow = (
    icon: string,
    iconBg: string,
    title: string,
    sub: string,
    to: keyof ProfileStackParamList,
    extra?: React.ReactNode,
  ) => (
    <Tappable
      key={title}
      onPress={() => navigation.navigate(to as never)}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        backgroundColor: colors.surface,
        borderRadius: radii.sm,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.border,
        padding: spacing.sm,
        marginBottom: spacing.sm,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <View
        style={{
          width: 34,
          height: 34,
          borderRadius: radii.sm,
          backgroundColor: iconBg,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ fontSize: 17 }}>{icon}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 15, fontWeight: '500', color: colors.textPrimary }}>{title}</Text>
        <Text style={{ fontSize: 12, color: colors.textTertiary }}>{sub}</Text>
      </View>
      {extra}
      <Text style={{ fontSize: 18, color: colors.textTertiary }}>›</Text>
    </Tappable>
  );

  return (
    <Screen safeTop>
      <CarSwitchHeader />
      {/* Identity */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm }}>
        <AvatarCircle initial={displayInitial} color={colors.primary} size={52} />
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={{ fontSize: 18, fontWeight: '500', color: colors.textPrimary }}>
              {displayName}
            </Text>
            {isPro ? (
              <View style={{ backgroundColor: palette.dark, borderRadius: radii.pill, paddingHorizontal: 8, paddingVertical: 2 }}>
                <Text style={{ fontSize: 10, fontWeight: '800', color: palette.warning }}>★ PRO</Text>
              </View>
            ) : null}
          </View>
          <Text style={{ fontSize: 13, color: colors.textTertiary }}>{displayEmail}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={{ fontSize: 13, color: colors.textTertiary }}>Completion</Text>
          <Text style={{ fontSize: 18, fontWeight: '500', color: colors.successDark }}>
            {USER.completionPct}%
          </Text>
        </View>
      </View>
      <View
        style={{
          height: 7,
          backgroundColor: colors.surfaceAlt,
          borderRadius: 4,
          overflow: 'hidden',
          marginBottom: spacing.md,
        }}
      >
        <View
          style={{
            width: `${USER.completionPct}%`,
            height: '100%',
            backgroundColor: colors.primary,
          }}
        />
      </View>

      {/* Points card */}
      <Tappable onPress={() => navigation.navigate('ProfMiles')}>
        {({ pressed }) => (
          <LinearGradient
            colors={[palette.primary, palette.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              borderRadius: radii.md,
              padding: spacing.md,
              marginBottom: spacing.md,
              opacity: pressed ? 0.9 : 1,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: spacing.xs,
              }}
            >
              <View>
                <Text style={{ fontSize: 12, color: 'rgba(255,255,255,.65)' }}>YOUR POINTS</Text>
                <Text style={{ fontSize: 26, fontWeight: '700', color: '#fff' }}>
                  {points.toLocaleString()} pts{' '}
                  <Text style={{ fontSize: 14, fontWeight: '400', color: palette.warning }}>
                    = {pointsToUsd(points)}
                  </Text>
                </Text>
              </View>
              <View
                style={{
                  backgroundColor: 'rgba(255,255,255,.18)',
                  borderRadius: radii.sm,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: 12, color: 'rgba(255,255,255,.7)' }}>Next reward</Text>
                <Text style={{ fontSize: 14, fontWeight: '700', color: palette.warning }}>
                  {NEXT_REWARD_PTS.toLocaleString()} pts
                </Text>
              </View>
            </View>
            <View
              style={{
                height: 6,
                backgroundColor: 'rgba(255,255,255,.2)',
                borderRadius: 3,
                overflow: 'hidden',
                marginBottom: spacing.sm,
              }}
            >
              <View
                style={{
                  width: `${Math.min(100, (points / NEXT_REWARD_PTS) * 100)}%`,
                  height: '100%',
                  backgroundColor: palette.warning,
                }}
              />
            </View>
            <View
              style={{
                backgroundColor: 'rgba(255,255,255,.18)',
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,.3)',
                borderRadius: radii.sm,
                paddingVertical: 9,
                alignItems: 'center',
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: '500', color: '#fff' }}>
                🏆 Explore reward milestones →
              </Text>
            </View>
          </LinearGradient>
        )}
      </Tappable>

      {/* Pro membership upsell / status → AutoMate Pro (Home stack) */}
      <Tappable
        onPress={() =>
          isPro
            ? navigation.navigate('ProManage')
            : navigateCrossTab(navigation, 'HomeTab', 'ProSubscribe')
        }
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.sm,
          backgroundColor: palette.dark,
          borderRadius: radii.md,
          padding: spacing.md,
          marginBottom: spacing.md,
        }}
      >
        <Text style={{ fontSize: 20 }}>⭐</Text>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 14, fontWeight: '700', color: '#fff' }}>
            {isPro ? 'AutoMate Pro — active' : 'Go Pro — skip deposits + DIY guides'}
          </Text>
          <Text style={{ fontSize: 11, color: 'rgba(255,255,255,.65)' }}>
            {isPro
              ? 'Manage your membership'
              : 'No security deposits · all DIY guides · priority quotes · from $4/mo'}
          </Text>
        </View>
        <View
          style={{
            backgroundColor: palette.warning,
            borderRadius: radii.sm,
            paddingHorizontal: 11,
            paddingVertical: 6,
          }}
        >
          <Text style={{ fontSize: 12, fontWeight: '800', color: palette.dark }}>
            {isPro ? 'Manage' : 'Get Pro'}
          </Text>
        </View>
      </Tappable>

      <SectionLabel>Account details</SectionLabel>
      {accountRow('🚗', colors.primarySurface, 'My cars', VEHICLE.name, 'ProfCars')}
      {accountRow(
        '🛡️',
        '#FAECE7',
        'Insurance policy',
        insuranceSub,
        'ProfInsurance',
        <View
          style={{
            backgroundColor: colors.warningSurface,
            borderRadius: radii.pill,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: colors.warning,
            paddingHorizontal: 8,
            paddingVertical: 2,
            marginRight: 4,
          }}
        >
          <Text style={{ fontSize: 11, color: colors.warningDeep }}>Check</Text>
        </View>,
      )}
      {accountRow('💳', colors.infoSurface, 'Payment method', `Visa ••••${PAYMENT_CARD.last4}`, 'ProfPayment')}
      {accountRow('⚙️', colors.surfaceAlt, 'Settings', 'Notifications · Privacy · Account', 'ProfSettings')}
    </Screen>
  );
}
