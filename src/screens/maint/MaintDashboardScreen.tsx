import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Badge, Screen, SectionLabel } from '../../components/ui';
import { MaintStackParamList } from '../../navigation/types';
import { UPCOMING_SERVICES, VEHICLE } from '../../services/mock/data';
import { maintService } from '../../services';
import { palette, radii, spacing, useTheme } from '../../theme';

type Nav = NativeStackNavigationProp<MaintStackParamList, 'MaintDashboard'>;

const DIY_TAGS = ['Bumper dent', 'Scratch', 'Paint chip', 'Door ding'];

export function MaintDashboardScreen() {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();
  const { data: upcoming } = useQuery({
    queryKey: ['upcoming-services'],
    queryFn: maintService.getUpcomingServices,
  });
  const mv = VEHICLE.marketValue;

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
            fontSize: 12,
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
        <Text style={{ fontSize: 13, color: palette.success, marginBottom: spacing.sm }}>
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
          <Text style={{ fontSize: 11, color: '#888' }}>Low ${mv.low.toLocaleString()}</Text>
          <Text style={{ fontSize: 11, color: '#888' }}>High ${mv.high.toLocaleString()}</Text>
        </View>
      </LinearGradient>

      {/* Car info */}
      <Pressable
        onPress={() => navigation.navigate('MaintHistory')}
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
              {VEHICLE.name}
            </Text>
            <Text style={{ fontSize: 12, color: colors.textTertiary }}>
              {VEHICLE.odometerMi.toLocaleString()} mi · 5W-30 · Lunar Silver
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ fontSize: 12, color: colors.textTertiary }}>Health</Text>
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
            <Text style={{ fontSize: 12, fontWeight: '500', color: colors.successDark }}>
              {VEHICLE.healthLabel} {VEHICLE.healthPct}%
            </Text>
          </View>
          <Text style={{ fontSize: 22, color: colors.primary }}>›</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Badge label="✓ VIN-decoded" variant="primarySoft" />
          <Text style={{ fontSize: 12, color: colors.textTertiary }}>·</Text>
          <Text style={{ fontSize: 12, color: colors.successDark }}>
            Oil due ~{VEHICLE.oilDueInMi} mi
          </Text>
        </View>
      </Pressable>

      {/* DIY tips */}
      <Pressable
        onPress={() => navigation.navigate('MaintDiy')}
        style={({ pressed }) => ({
          backgroundColor: colors.surface,
          borderRadius: radii.md,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.success,
          padding: spacing.md,
          marginBottom: spacing.sm,
          opacity: pressed ? 0.8 : 1,
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
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1 }}>
            <Text style={{ fontSize: 18 }}>🔧</Text>
            <View>
              <Text style={{ fontSize: 15, fontWeight: '600', color: colors.successDeep }}>
                DIY Repair Tips
              </Text>
              <Text style={{ fontSize: 12, color: colors.textTertiary }}>
                Browse free · Full guides with Pro
              </Text>
            </View>
          </View>
          <Text style={{ fontSize: 14, fontWeight: '500', color: colors.success }}>View all →</Text>
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          {DIY_TAGS.map((tag) => (
            <View
              key={tag}
              style={{
                backgroundColor: colors.successSurface,
                borderRadius: radii.pill,
                borderWidth: StyleSheet.hairlineWidth,
                borderColor: colors.success,
                paddingHorizontal: 10,
                paddingVertical: 3,
              }}
            >
              <Text style={{ fontSize: 11, color: colors.successDeep }}>{tag}</Text>
            </View>
          ))}
        </View>
      </Pressable>

      {/* Book a service */}
      <Pressable onPress={() => navigation.navigate('MaintSchedule')}>
        {({ pressed }) => (
          <LinearGradient
            colors={[palette.primary, palette.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              borderRadius: radii.md,
              padding: spacing.md,
              marginBottom: spacing.md,
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.sm,
              opacity: pressed ? 0.85 : 1,
            }}
          >
            <Text style={{ fontSize: 26 }}>📅</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#fff' }}>Book a service</Text>
              <Text style={{ fontSize: 12, color: 'rgba(255,255,255,.65)' }}>
                Oil change · Tires · Brakes · Inspection
              </Text>
            </View>
            <Text style={{ fontSize: 22, color: 'rgba(255,255,255,.8)' }}>→</Text>
          </LinearGradient>
        )}
      </Pressable>

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
              <Text style={{ fontSize: 13, color: colors.textTertiary }}>{svc.due}</Text>
            </View>
            <View
              style={{
                backgroundColor: badge.bg,
                borderRadius: radii.pill,
                paddingHorizontal: 11,
                paddingVertical: 3,
              }}
            >
              <Text style={{ fontSize: 12, color: badge.fg }}>{svc.status}</Text>
            </View>
          </View>
        );
      })}
    </Screen>
  );
}
