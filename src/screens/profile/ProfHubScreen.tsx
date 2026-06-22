import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { Tappable } from '../../components/Tappable';

import { CarSwitchChip } from '../../components/CarSwitchChip';
import { AvatarCircle, Screen, SectionLabel } from '../../components/ui';
import { pointsToUsd } from '../../config/points';
import { navigateCrossTab } from '../../navigation/crossTab';
import { ProfileStackParamList } from '../../navigation/types';
import { insuranceService, vehiclesService } from '../../services';
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
  const checkedIn = useAppStore((s) => s.dailyCheckedIn);
  const claimCheckIn = useAppStore((s) => s.claimDailyCheckIn);
  // Authenticated user context (set after the demo login); falls back to the
  // wireframe USER constant until someone signs in.
  const authedUser = useAppStore((s) => s.user);
  const displayName = authedUser?.name ?? USER.name;
  // Secondary line: the @username (never the email). Falls back to a handle
  // derived from the name until the user sets a username in Edit profile.
  const handleFromName = displayName.trim().toLowerCase().replace(/\s+/g, '');
  const displayHandle = authedUser?.username
    ? `@${authedUser.username}`
    : handleFromName
      ? `@${handleFromName}`
      : '@user';
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

  // Live cars for the "My cars" row — drives the same "Check" prompt logic.
  const { data: vehicles } = useQuery({ queryKey: ['vehicles'], queryFn: vehiclesService.listVehicles });
  const hasCar = (vehicles?.length ?? 0) > 0;
  const carSub = hasCar ? (vehicles?.find((v) => v.isPrimary)?.name ?? vehicles?.[0]?.name ?? VEHICLE.name) : 'Add your car to get started';

  // "Check" prompt — shown only until the item is set up, then removed.
  const checkBadge = (
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
      <Text style={{ fontSize: 12, color: colors.warningDeep }}>Check</Text>
    </View>
  );

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
        <Text style={{ fontSize: 13, color: colors.textTertiary }}>{sub}</Text>
      </View>
      {extra}
      <Text style={{ fontSize: 18, color: colors.textTertiary }}>›</Text>
    </Tappable>
  );

  return (
    <Screen safeTop>
      {/* Identity */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm }}>
        {authedUser?.avatarUri ? (
          <Image source={{ uri: authedUser.avatarUri }} style={{ width: 52, height: 52, borderRadius: 26 }} />
        ) : (
          <AvatarCircle initial={displayInitial} color={colors.primary} size={52} />
        )}
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={{ fontSize: 24, fontWeight: '800', color: colors.textPrimary }}>
              {displayName}
            </Text>
            {isPro ? (
              <View style={{ backgroundColor: palette.dark, borderRadius: radii.pill, paddingHorizontal: 8, paddingVertical: 2 }}>
                <Text style={{ fontSize: 11, fontWeight: '800', color: palette.warning }}>★ PRO</Text>
              </View>
            ) : null}
          </View>
          <Text style={{ fontSize: 14, color: colors.textTertiary }}>{displayHandle}</Text>
        </View>
        <CarSwitchChip />
      </View>

      {/* Daily check-in */}
      <Tappable
        onPress={checkedIn ? undefined : claimCheckIn}
        disabled={checkedIn}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.sm,
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderWidth: 1,
          borderRadius: radii.md,
          padding: spacing.md,
          marginBottom: spacing.md,
        }}
      >
        <Text style={{ fontSize: 18 }}>{checkedIn ? '🎉' : '✅'}</Text>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 14, fontWeight: '700', color: colors.textPrimary }}>
            {checkedIn ? 'Checked in today' : 'Daily check-in'}
          </Text>
          <Text style={{ fontSize: 12, color: colors.textTertiary }}>
            🔥 Day {checkedIn ? 6 : 5} streak · +10 pts
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
          <Text style={{ fontSize: 13, fontWeight: '800', color: checkedIn ? colors.successDark : '#fff' }}>
            {checkedIn ? '✓ Claimed' : 'Claim'}
          </Text>
        </View>
      </Tappable>

      {/* Points card — light-yellow surface + gold border (mirrors the quote-tab
          "AI estimated repair cost" card, in yellow instead of green). */}
      <View
        style={{
          backgroundColor: colors.warningSurface,
          borderRadius: radii.md,
          borderWidth: 1,
          borderColor: colors.warning,
          padding: spacing.md,
          marginBottom: spacing.md,
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
            <Text style={{ fontSize: 13, fontWeight: '700', color: colors.warningDeep }}>YOUR POINTS</Text>
            <Text style={{ fontSize: 26, fontWeight: '800', color: colors.warningDeep }}>
              {points.toLocaleString()} pts{' '}
              <Text style={{ fontSize: 14, fontWeight: '500', color: colors.warning }}>
                = {pointsToUsd(points)}
              </Text>
            </Text>
          </View>
          <View
            style={{
              backgroundColor: colors.surface,
              borderWidth: StyleSheet.hairlineWidth,
              borderColor: colors.warning,
              borderRadius: radii.sm,
              paddingHorizontal: 12,
              paddingVertical: 8,
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: 13, color: colors.warningDeep }}>Next reward</Text>
            <Text style={{ fontSize: 14, fontWeight: '700', color: colors.warningDeep }}>
              {NEXT_REWARD_PTS.toLocaleString()} pts
            </Text>
          </View>
        </View>
        <View
          style={{
            height: 6,
            backgroundColor: 'rgba(240,180,78,.25)',
            borderRadius: 3,
            overflow: 'hidden',
            marginBottom: spacing.sm,
          }}
        >
          <View
            style={{
              width: `${Math.min(100, (points / NEXT_REWARD_PTS) * 100)}%`,
              height: '100%',
              backgroundColor: colors.warning,
            }}
          />
        </View>
        {/* Two actions side by side: milestones + points history */}
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          {(
            [
              { label: '🏆 Milestones', to: 'ProfMiles' as const },
              { label: '📊 Points history', to: 'ProfPointsHistory' as const },
            ]
          ).map(({ label, to }) => (
            <Tappable
              key={to}
              onPress={() => navigation.navigate(to)}
              style={({ pressed }) => ({
                flex: 1,
                backgroundColor: colors.surface,
                borderWidth: StyleSheet.hairlineWidth,
                borderColor: colors.warning,
                borderRadius: radii.sm,
                paddingVertical: 9,
                alignItems: 'center',
                opacity: pressed ? 0.8 : 1,
              })}
            >
              <Text style={{ fontSize: 14, fontWeight: '700', color: colors.warningDeep }}>{label}</Text>
            </Tappable>
          ))}
        </View>
      </View>

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
          <Text style={{ fontSize: 12, color: 'rgba(255,255,255,.65)' }}>
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
          <Text style={{ fontSize: 13, fontWeight: '800', color: palette.dark }}>
            {isPro ? 'Manage' : 'Get Pro'}
          </Text>
        </View>
      </Tappable>

      <SectionLabel>Account details</SectionLabel>
      {accountRow('🚗', colors.primarySurface, 'My cars', carSub, 'ProfCars', hasCar ? undefined : checkBadge)}
      {accountRow(
        '🛡️',
        '#FAECE7',
        'Insurance policy',
        insuranceSub,
        'ProfInsurance',
        policy ? undefined : checkBadge,
      )}
      {accountRow('💳', colors.infoSurface, 'Payment method', `Visa ••••${PAYMENT_CARD.last4}`, 'ProfPayment')}
      {accountRow('🔍', colors.primarySurface, 'AI estimate history', 'Past damage estimates & photos', 'ProfEstimates')}
      {accountRow('⚙️', colors.surfaceAlt, 'Settings', 'Notifications · Privacy · Account', 'ProfSettings')}
    </Screen>
  );
}
