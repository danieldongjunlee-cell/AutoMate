import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Tappable } from '../../components/Tappable';
import { useRequireAuth } from '../../hooks/useRequireAuth';

import { Badge, Screen, SectionLabel } from '../../components/ui';
import { useActiveVehicle } from '../../hooks/useActiveVehicle';
import { MaintStackParamList } from '../../navigation/types';
import { marketValueFor, UPCOMING_SERVICES, VEHICLE } from '../../services/mock/data';
import { maintService } from '../../services';
import { palette, radii, spacing, useTheme } from '../../theme';

type Nav = NativeStackNavigationProp<MaintStackParamList, 'MaintDashboard'>;

export function MaintDashboardScreen() {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();
  // Guests can view the dashboard, but acting on any button asks them to sign up.
  const requireAuth = useRequireAuth();
  const { data: upcoming } = useQuery({
    queryKey: ['upcoming-services'],
    queryFn: maintService.getUpcomingServices,
  });
  // Car info follows the car the user entered/selected in More → My cars.
  const { active } = useActiveVehicle();
  const carName = active?.name ?? VEHICLE.name;
  const carOdometer = active?.odometerMi ?? VEHICLE.odometerMi;
  const carOil = (active?.oilSpec ?? VEHICLE.oilSpec).split(' ')[0]; // "5W-30"
  const carColor = (active?.colorName ?? VEHICLE.colorName).replace(/\s*Metallic$/i, '');
  // Market value tracks the selected car.
  const mv = marketValueFor(carName);

  return (
    <Screen>
      {/* Market value */}
      <LinearGradient
        colors={[palette.dark, palette.darkAlt]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ borderRadius: radii.md, padding: spacing.md, marginBottom: spacing.sm }}
      >
        <Text
          style={{
            fontSize: 13,
            fontWeight: '600',
            color: 'rgba(255,255,255,.45)',
            textTransform: 'uppercase',
            letterSpacing: 0.6,
            marginBottom: 4,
          }}
        >
          Estimated market value
        </Text>
        <Text style={{ fontSize: 36, fontWeight: '700', color: '#fff', marginBottom: 4 }}>
          ${mv.value.toLocaleString()}
        </Text>
        <Text style={{ fontSize: 14, color: palette.success, marginBottom: spacing.sm }}>
          ↑ ${mv.aboveAvg} above market avg
        </Text>
        <View
          style={{
            height: 6,
            backgroundColor: 'rgba(255,255,255,.15)',
            borderRadius: 3,
            overflow: 'hidden',
            marginBottom: 5,
          }}
        >
          <LinearGradient
            colors={[palette.primary, palette.warning]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ width: `${mv.barPct}%`, height: '100%', borderRadius: 3 }}
          />
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ fontSize: 12, color: '#888' }}>Low ${mv.low.toLocaleString()}</Text>
          <Text style={{ fontSize: 12, color: '#888' }}>High ${mv.high.toLocaleString()}</Text>
        </View>
      </LinearGradient>

      {/* Car info */}
      <Tappable
        onPress={() => requireAuth('maintAction', () => navigation.navigate('MaintHistory'))}
        style={({ pressed }) => ({
          backgroundColor: colors.surface,
          borderRadius: radii.md,
          borderWidth: 1.5,
          borderColor: colors.primary,
          padding: spacing.md,
          marginBottom: spacing.sm,
          opacity: pressed ? 0.8 : 1,
        })}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm }}>
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: radii.sm,
              backgroundColor: colors.primary,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: 22 }}>🚗</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: colors.textPrimary }}>
              {carName}
            </Text>
            <Text style={{ fontSize: 13, color: colors.textTertiary }}>
              {carOdometer.toLocaleString()} mi · {carOil} · {carColor}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ fontSize: 13, color: colors.textTertiary }}>Health</Text>
            <View
              style={{
                width: 52,
                height: 7,
                backgroundColor: colors.border,
                borderRadius: 4,
                overflow: 'hidden',
                marginVertical: 3,
              }}
            >
              <View
                style={{
                  width: `${VEHICLE.healthPct}%`,
                  height: '100%',
                  backgroundColor: colors.success,
                }}
              />
            </View>
            <Text style={{ fontSize: 13, fontWeight: '500', color: colors.successDark }}>
              {VEHICLE.healthLabel} {VEHICLE.healthPct}%
            </Text>
          </View>
          <Text style={{ fontSize: 22, color: colors.primary }}>›</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Badge label="✓ VIN-decoded" variant="primarySoft" />
          <Text style={{ fontSize: 13, color: colors.textTertiary }}>·</Text>
          <Text style={{ fontSize: 13, color: colors.successDark }}>
            Oil due ~{VEHICLE.oilDueInMi} mi
          </Text>
        </View>
      </Tappable>

      {/* DIY tips + Book a service (side-by-side) */}
      <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md }}>
        <Tappable
          onPress={() => requireAuth('maintAction', () => navigation.navigate('MaintDiy'))}
          style={({ pressed }) => ({
            flex: 1,
            backgroundColor: colors.surface,
            borderRadius: radii.md,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: colors.border,
            padding: spacing.md,
            opacity: pressed ? 0.8 : 1,
          })}
        >
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: radii.sm,
              backgroundColor: colors.success,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: spacing.sm,
            }}
          >
            <Text style={{ fontSize: 18 }}>🔧</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 2 }}>
            <Text style={{ fontSize: 15, fontWeight: '700', color: colors.successDeep }}>
              DIY Repair Tips
            </Text>
            <Badge label="PRO" variant="primarySoft" />
          </View>
          <Text style={{ fontSize: 13, color: colors.successDeep }}>
            Step-by-step guides & videos
          </Text>
        </Tappable>

        <Tappable onPress={() => requireAuth('maintAction', () => navigation.navigate('MaintServiceType'))} style={{ flex: 1 }}>
          {({ pressed }) => (
            <LinearGradient
              colors={[palette.primary, palette.primaryDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                borderRadius: radii.md,
                padding: spacing.md,
                opacity: pressed ? 0.85 : 1,
              }}
            >
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: radii.sm,
                  backgroundColor: 'rgba(255,255,255,.2)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: spacing.sm,
                }}
              >
                <Text style={{ fontSize: 18 }}>📅</Text>
              </View>
              <Text style={{ fontSize: 15, fontWeight: '700', color: '#fff', marginBottom: 2 }}>
                Book a Service
              </Text>
              <Text style={{ fontSize: 13, color: 'rgba(255,255,255,.72)' }}>
                Oil · Tires · Filters · Fluids · Brakes
              </Text>
            </LinearGradient>
          )}
        </Tappable>
      </View>

      {/* Upcoming services */}
      <SectionLabel>Upcoming services</SectionLabel>
      {(upcoming ?? UPCOMING_SERVICES).map((svc) => {
        const badge =
          svc.status === 'Soon'
            ? { bg: colors.warning, fg: '#fff' }
            : svc.status === 'Upcoming'
              ? { bg: colors.infoSurface, fg: colors.infoDeep }
              : { bg: colors.surface, fg: colors.textTertiary };
        return (
          <View
            key={svc.id}
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
                backgroundColor:
                  svc.status === 'Soon'
                    ? colors.warning
                    : svc.status === 'Upcoming'
                      ? colors.info
                      : colors.successSurface,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 16 }}>{svc.icon}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: '500', color: colors.textPrimary }}>
                {svc.name}
              </Text>
              <Text style={{ fontSize: 14, color: colors.textTertiary }}>{svc.due}</Text>
            </View>
            <View
              style={{
                backgroundColor: badge.bg,
                borderRadius: radii.pill,
                paddingHorizontal: 11,
                paddingVertical: 3,
              }}
            >
              <Text style={{ fontSize: 13, color: badge.fg }}>{svc.status}</Text>
            </View>
          </View>
        );
      })}
    </Screen>
  );
}
