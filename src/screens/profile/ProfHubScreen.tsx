import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

import { Text } from '../../components/Text';

import { Tappable } from '../../components/Tappable';

import { CarBrandLogo } from '../../components/CarBrandLogo';
import { Icon, IconName } from '../../components/Icon';
import { CarSwitchChip } from '../../components/CarSwitchChip';
import { AvatarCircle, Screen } from '../../components/ui';
import { useActiveVehicle } from '../../hooks/useActiveVehicle';
import { navigateCrossTab } from '../../navigation/crossTab';
import { MainTabParamList, ProfileStackParamList } from '../../navigation/types';
import { insuranceService, vehiclesService } from '../../services';
import { useRequireAuth } from '../../hooks/useRequireAuth';
import { useAppStore } from '../../store/useAppStore';
import { palette, radii, spacing, useTheme } from '../../theme';

type Nav = NativeStackNavigationProp<ProfileStackParamList, 'ProfHub'>;

interface HubRow {
  icon: IconName | React.ReactNode;
  label: string;
  /** Screen on the More stack … */
  to?: keyof ProfileStackParamList;
  /** … or a screen on another tab. */
  cross?: { tab: keyof MainTabParamList; screen: string; params?: object };
  gate?: string;
  /** Small "Check" prompt on the right until the item is set up. */
  check?: boolean;
}

/**
 * More hub: identity, then the account rows grouped into captioned cards
 * (icon + label rows, no subtitles). Check-in and points live on Rewards.
 */
export function ProfHubScreen() {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();
  const { brand: carBrand } = useActiveVehicle();
  const storePoints = useAppStore((s) => s.points);
  const isPro = useAppStore((s) => s.isPro);
  const requireAuth = useRequireAuth();
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  // Guests have no account yet, points read zero.
  const points = isAuthenticated ? storePoints : 0;
  const authedUser = useAppStore((s) => s.user);
  // A guest is a guest, never the demo account's details.
  const displayName = authedUser?.name ?? 'Guest';
  const displayInitial = displayName.trim().charAt(0).toUpperCase() || 'G';

  // "Check" prompts: shown until a car / a policy is on file.
  const { data: policies } = useQuery({ queryKey: ['policies'], queryFn: () => insuranceService.listPolicies() });
  const { data: vehicles } = useQuery({ queryKey: ['vehicles'], queryFn: vehiclesService.listVehicles });
  const hasCar = (vehicles?.length ?? 0) > 0;
  const hasPolicy = (policies?.length ?? 0) > 0;

  const open = (row: HubRow) => {
    const go = () => (row.cross ? navigateCrossTab(navigation, row.cross.tab, row.cross.screen, row.cross.params) : navigation.navigate(row.to as never));
    if (row.gate) requireAuth(row.gate, go);
    else go();
  };

  /** Captioned card of icon + label rows (the Mercedes-style grouping, in our palette). */
  const section = (title: string, rows: HubRow[]) => (
    <View
      key={title}
      style={{
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 20,
        paddingHorizontal: spacing.lg,
        paddingTop: 14,
        paddingBottom: 6,
        marginBottom: spacing.lg,
      }}
    >
      <Text style={{ fontSize: 12, fontWeight: '600', color: colors.textTertiary, marginBottom: 4 }}>{title}</Text>
      {rows.map((row) => (
        <Tappable
          key={row.label}
          onPress={() => open(row)}
          style={({ pressed }) => ({
            flexDirection: 'row',
            alignItems: 'center',
            gap: 14,
            height: 50,
          })}
        >
          <View style={{ width: 26, alignItems: 'center' }}>
            {typeof row.icon === 'string' ? <Icon name={row.icon as IconName} size={24} color={colors.textSecondary} /> : row.icon}
          </View>
          <Text style={{ flex: 1, fontSize: 16, fontWeight: '600', color: colors.textPrimary }}>{row.label}</Text>
          {row.check ? (
            <View style={{ backgroundColor: colors.warningSurface, borderRadius: radii.pill, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.warning, paddingHorizontal: 8, paddingVertical: 2 }}>
              <Text style={{ fontSize: 12, color: colors.warningDeep }}>Check</Text>
            </View>
          ) : null}
        </Tappable>
      ))}
    </View>
  );

  return (
    <Screen safeTop>
      {/* Identity */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.lg }}>
        {authedUser?.avatarUri ? (
          <Image source={{ uri: authedUser.avatarUri }} style={{ width: 52, height: 52, borderRadius: 26 }} />
        ) : (
          <AvatarCircle initial={displayInitial} color={colors.primary} size={52} />
        )}
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={{ fontSize: 24, fontWeight: '800', color: colors.textPrimary }}>{displayName}</Text>
            {isPro ? (
              <View style={{ backgroundColor: palette.dark, borderRadius: radii.pill, paddingHorizontal: 8, paddingVertical: 2 }}>
                <Text style={{ fontSize: 11, fontWeight: '800', color: palette.star }}>★ PRO</Text>
              </View>
            ) : null}
          </View>
        </View>
        <View style={{ alignSelf: 'flex-start' }}>
          <CarSwitchChip />
        </View>
      </View>

      {/* User settings */}
      {section('User settings', [
        { icon: hasCar ? <CarBrandLogo brand={carBrand} size={24} /> : 'car', label: 'My cars', to: 'ProfCars', gate: 'myCars', check: !hasCar },
        { icon: 'shield', label: 'My insurance', to: 'ProfInsurance', gate: 'insurance', check: !hasPolicy },
        { icon: 'calendar', label: 'My bookings', cross: { tab: 'BookingsTab', screen: 'Bookings', params: { backTo: 'MoreTab' } } },
        { icon: 'search', label: 'AI estimate history', to: 'ProfEstimates', gate: 'estimateHistory' },
        { icon: 'wallet', label: 'Payment method', to: 'ProfPayment', gate: 'payment' },
      ])}

      {/* Pro banner */}
      <Tappable
        onPress={() =>
          isPro ? navigation.navigate('ProManage') : requireAuth('getPro', () => navigateCrossTab(navigation, 'HomeTab', 'ProSubscribe', { returnTo: 'ProfHub' }))
        }
        style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: palette.dark, borderRadius: 20, padding: spacing.lg, marginBottom: spacing.lg }}
      >
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,.55)', marginBottom: 4 }}>AutoMate Pro</Text>
          <Text style={{ fontSize: 17, fontWeight: '800', color: '#fff' }}>{isPro ? 'Pro membership active' : 'Skip deposits + all DIY guides'}</Text>
          <Text style={{ fontSize: 13, color: 'rgba(255,255,255,.65)', marginTop: 2 }}>{isPro ? 'Manage your membership' : 'Priority quotes · from $4/mo'}</Text>
        </View>
        <View style={{ backgroundColor: palette.amber, borderRadius: radii.md, paddingHorizontal: 12, paddingVertical: 8 }}>
          <Text style={{ fontSize: 13, fontWeight: '800', color: palette.onAmber }}>{isPro ? 'Manage' : 'Get Pro'}</Text>
        </View>
      </Tappable>

      {/* Benefits & alerts */}
      {section('Rewards & alerts', [
        { icon: 'trophy', label: `Rewards · ${points.toLocaleString()} pts`, to: 'ProfMiles', gate: 'milestones' },
        { icon: 'tag', label: 'Deals & offers', cross: { tab: 'HomeTab', screen: 'BundleDeals' }, gate: 'deals' },
        { icon: 'chart', label: 'Points history', to: 'ProfPointsHistory', gate: 'pointsHistory' },
        { icon: 'bell', label: 'Notifications', cross: { tab: 'HomeTab', screen: 'Notifications' } },
      ])}

      {/* Support */}
      {section('Support', [
        { icon: 'alert', label: 'Help center', to: 'ProfHelpCenter' },
        { icon: 'chat', label: 'Repair & booking help', to: 'HelpBookings' },
        { icon: 'file', label: 'Terms of service', to: 'ProfTerms' },
        { icon: 'gear', label: 'Settings', to: 'ProfSettings' },
      ])}
    </Screen>
  );
}
