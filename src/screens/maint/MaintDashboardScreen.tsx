import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useLayoutEffect, useState } from 'react';
import { Image, Text, View } from 'react-native';

import { Icon, IconName } from '../../components/Icon';
import { IconChip } from '../../components/IconChip';
import { Tappable } from '../../components/Tappable';
import { Screen } from '../../components/ui';
import { useActiveVehicle } from '../../hooks/useActiveVehicle';
import { useRequireAuth } from '../../hooks/useRequireAuth';
import { navigateCrossTab } from '../../navigation/crossTab';
import { MaintStackParamList } from '../../navigation/types';
import { maintService } from '../../services';
import { useCarImage } from '../../services/carImage';
import { marketValueFor, UPCOMING_SERVICES, VEHICLE } from '../../services/mock/data';
import { useAppStore } from '../../store/useAppStore';
import { palette, radii, spacing, useTheme } from '../../theme';

type Nav = NativeStackNavigationProp<MaintStackParamList, 'MaintDashboard'>;

const HERO_H = 176;

/** Bundled car photo shown until the Car Images API returns one for the active car. */
const PLACEHOLDER_CAR = require('../../../assets/cars/accord-2019.png');

/** Upcoming-service row icons in their own colours (canvas "Maintenance dashboard"). */
const SERVICE_ICON: Record<string, { icon: IconName; color: string }> = {
  'up-oil': { icon: 'oil', color: palette.amber },
  'up-tires': { icon: 'tire', color: palette.primaryLight },
  'up-insp': { icon: 'search', color: palette.lavender },
};
function serviceIcon(id: string, name: string): { icon: IconName; color: string } {
  if (SERVICE_ICON[id]) return SERVICE_ICON[id];
  const n = name.toLowerCase();
  if (n.includes('oil')) return { icon: 'oil', color: palette.amber };
  if (n.includes('tire') || n.includes('wheel')) return { icon: 'tire', color: palette.primaryLight };
  if (n.includes('brake')) return { icon: 'brake', color: palette.danger };
  if (n.includes('filter')) return { icon: 'filter', color: palette.teal };
  if (n.includes('fluid') || n.includes('coolant')) return { icon: 'droplet', color: '#5BD1F5' };
  if (n.includes('inspect')) return { icon: 'search', color: palette.lavender };
  return { icon: 'wrench', color: '#8a94a6' };
}

/**
 * Maintenance dashboard (canvas): hero car photo, one market-value card with
 * a gradient gauge, a full-width blue "Book a service", three coloured quick
 * actions, upcoming services and the vehicle row.
 */
export function MaintDashboardScreen() {
  const navigation = useNavigation<Nav>();
  const { colors, dark } = useTheme();
  const requireAuth = useRequireAuth();
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const setServiceTypePick = useAppStore((s) => s.setServiceTypePick);
  const { data: upcoming } = useQuery({ queryKey: ['upcoming-services'], queryFn: maintService.getUpcomingServices });
  const { active } = useActiveVehicle();
  const carName = active?.name ?? VEHICLE.name;
  const carOdometer = active?.odometerMi ?? VEHICLE.odometerMi;
  const carOil = (active?.oilSpec ?? VEHICLE.oilSpec).split(' ')[0];
  const carColor = (active?.colorName ?? VEHICLE.colorName).replace(/\s*Metallic$/i, '');
  const mv = marketValueFor(carName);
  const { data: photoUrl } = useCarImage(carName);
  const [heroW, setHeroW] = useState(0);
  const [photoFailed, setPhotoFailed] = useState(false);

  // Header: back chevron (native), car name centred, bell on the right.
  useLayoutEffect(() => {
    navigation.setOptions({
      title: carName,
      headerRight: () => (
        <Tappable onPress={() => navigation.navigate('Notifications' as never)} hitSlop={8} accessibilityLabel="Notifications">
          <Icon name="bell" size={24} color={colors.textPrimary} />
        </Tappable>
      ),
    });
  }, [navigation, carName, colors.textPrimary]);

  const quick = (label: string, icon: IconName, color: string, onPress: () => void) => (
    <Tappable
      key={label}
      onPress={() => requireAuth('maintAction', onPress)}
      style={{
        flex: 1,
        alignItems: 'center',
        gap: 8,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 18,
        paddingVertical: 14,
      }}
    >
      <IconChip name={icon} size={50} glyph={26} color={color} bg={`${color}14`} radius={14} />
      <Text style={{ fontSize: 13, fontWeight: '700', color: colors.textPrimary }}>{label}</Text>
    </Tappable>
  );

  return (
    <Screen>
      {/* Hero: the car photo (Car Images API via our server), else the bundled placeholder car. */}
      <View
        onLayout={(e) => setHeroW(Math.round(e.nativeEvent.layout.width))}
        style={{ height: HERO_H, alignItems: 'center', justifyContent: 'center', marginTop: -spacing.sm, marginBottom: spacing.xs }}
      >
        {photoUrl && !photoFailed ? (
          <Image
            source={{ uri: photoUrl }}
            onError={() => setPhotoFailed(true)}
            accessibilityLabel={`${carName} photo`}
            resizeMode="contain"
            style={{
              width: heroW || 300,
              height: HERO_H,
              // Web draws this as a box shadow; on the light ground it would show as a grey rectangle.
              shadowColor: '#000',
              shadowOpacity: dark ? 0.55 : 0,
              shadowRadius: 22,
              shadowOffset: { width: 0, height: 18 },
            }}
          />
        ) : (
          <Image
            source={PLACEHOLDER_CAR}
            accessibilityLabel="Car placeholder photo"
            resizeMode="contain"
            style={{
              width: heroW || 300,
              height: HERO_H,
              // Web draws this as a box shadow; on the light ground it would show as a grey rectangle.
              shadowColor: '#000',
              shadowOpacity: dark ? 0.55 : 0,
              shadowRadius: 22,
              shadowOffset: { width: 0, height: 18 },
            }}
          />
        )}
      </View>

      {/* Estimated market value */}
      <View style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radii.tile, padding: spacing.lg, marginBottom: spacing.md }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.md }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 15, fontWeight: '800', color: colors.textPrimary }}>Estimated market value</Text>
            <Text style={{ fontSize: 12, color: colors.textTertiary, marginTop: 2 }}>Checked today · VIN-decoded </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ fontSize: 24, fontWeight: '800', color: colors.textPrimary, lineHeight: 26 }}>${mv.value.toLocaleString()}</Text>
            <Text style={{ fontSize: 12, fontWeight: '700', color: palette.mint }}>↑ ${mv.aboveAvg}</Text>
          </View>
        </View>
        <View style={{ height: 9, borderRadius: 5, backgroundColor: colors.border, overflow: 'hidden', marginTop: spacing.md }}>
          <LinearGradient colors={[palette.mint, colors.primary]} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={{ width: `${Math.max(4, Math.min(100, mv.barPct))}%`, height: 9, borderRadius: 5 }} />
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
          <Text style={{ fontSize: 11, fontWeight: '700', color: colors.textTertiary }}>${mv.low.toLocaleString()}</Text>
          <Text style={{ fontSize: 11, fontWeight: '700', color: colors.textTertiary }}>${mv.high.toLocaleString()}</Text>
        </View>
      </View>

      {/* Book a service · the dashboard's primary action → pick services, then shops */}
      <Tappable
        onPress={() =>
          requireAuth('bookService', () => {
            setServiceTypePick([]);
            navigation.navigate('MaintServiceType');
          })
        }
        accessibilityLabel="Book a service"
        style={{
          height: 58,
          borderRadius: 18,
          backgroundColor: colors.primary,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          marginBottom: spacing.md,
          shadowColor: colors.primary,
          shadowOpacity: 0.35,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 8 },
        }}
      >
        <Icon name="calcheck" size={30} color="#fff" />
        <Text style={{ fontSize: 17, fontWeight: '800', color: '#fff' }}>Book a service</Text>
      </Tappable>

      {/* Quick actions */}
      <View style={{ flexDirection: 'row', gap: spacing.md, marginBottom: spacing.section }}>
        {quick('DIY tips', 'star', palette.amber, () => navigation.navigate('MaintDiy'))}
        {quick('Receipt', 'camera', palette.teal, () => navigation.navigate('MaintScanCam'))}
        {quick('History', 'clock', palette.lavender, () => navigation.navigate('MaintHistory'))}
      </View>

      {/* Upcoming services · hidden for guests (no account history yet). */}
      {isAuthenticated ? (
        <>
          <Text style={{ fontSize: 12, fontWeight: '700', letterSpacing: 0.6, textTransform: 'uppercase', color: colors.textTertiary, marginBottom: spacing.sm }}>Upcoming services</Text>
          {(upcoming ?? UPCOMING_SERVICES).map((svc) => {
            const { icon, color } = serviceIcon(svc.id, svc.name);
            const badge =
              svc.status === 'Soon'
                ? { bg: colors.warningSurface, fg: colors.warning }
                : svc.status === 'Upcoming'
                  ? { bg: colors.primarySurface, fg: colors.primaryDark }
                  : { bg: colors.surfaceAlt, fg: colors.textSecondary };
            return (
              <View
                key={svc.id}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: spacing.md,
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: radii.lg,
                  padding: spacing.md,
                  marginBottom: spacing.sm,
                }}
              >
                <IconChip name={icon} size={44} glyph={24} color={color} bg={`${color}14`} radius={12} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 15, fontWeight: '700', color: colors.textPrimary }}>{svc.name}</Text>
                  <Text style={{ fontSize: 13, color: colors.textTertiary }}>{svc.due}</Text>
                </View>
                <View style={{ backgroundColor: badge.bg, borderRadius: radii.pill, paddingHorizontal: 10, paddingVertical: 3 }}>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: badge.fg }}>{svc.status}</Text>
                </View>
              </View>
            );
          })}
        </>
      ) : null}

      {/* Vehicle row → My cars */}
      <Tappable
        onPress={() => navigateCrossTab(navigation, 'MoreTab', 'ProfCars')}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.md,
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: radii.lg,
          padding: spacing.md,
          marginTop: isAuthenticated ? spacing.lg : 0,
        }}
      >
        <IconChip name="car" size={44} glyph={24} color={palette.teal} bg={`${palette.teal}14`} radius={12} />
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 15, fontWeight: '700', color: colors.textPrimary }}>{carName}</Text>
          <Text style={{ fontSize: 13, color: colors.textTertiary }}>
            {carOdometer.toLocaleString()} mi · {carOil} · {carColor}
          </Text>
        </View>
        <Icon name="chevron" size={22} color={colors.textTertiary} />
      </Tappable>
    </Screen>
  );
}
