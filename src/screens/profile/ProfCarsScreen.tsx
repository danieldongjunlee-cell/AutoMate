import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { Screen, SectionLabel } from '../../components/ui';
import { VEHICLE } from '../../services/mock/data';
import { palette, radii, spacing, useTheme } from '../../theme';

const SPECS = [
  ['VIN', VEHICLE.vin],
  ['Odometer', `${VEHICLE.odometerMi.toLocaleString()} mi`],
  ['Oil spec', VEHICLE.oilSpec],
  ['Last service', VEHICLE.lastService],
] as const;

/** Wireframe s-prof-cars: primary vehicle card + add another. */
export function ProfCarsScreen() {
  const { colors } = useTheme();

  return (
    <Screen>
      <SectionLabel>Your vehicles</SectionLabel>
      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: radii.md,
          borderWidth: 1.5,
          borderColor: colors.primary,
          overflow: 'hidden',
          marginBottom: spacing.sm,
        }}
      >
        <LinearGradient
          colors={[palette.primary, palette.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            padding: spacing.md,
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.sm,
          }}
        >
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: radii.sm,
              backgroundColor: 'rgba(255,255,255,.2)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: 22 }}>🚗</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#fff' }}>{VEHICLE.name}</Text>
            <Text style={{ fontSize: 12, color: 'rgba(255,255,255,.6)' }}>{VEHICLE.colorName}</Text>
          </View>
          <View
            style={{
              backgroundColor: 'rgba(255,255,255,.2)',
              borderRadius: radii.pill,
              paddingHorizontal: 10,
              paddingVertical: 3,
            }}
          >
            <Text style={{ fontSize: 12, color: '#fff' }}>Primary</Text>
          </View>
        </LinearGradient>
        <View style={{ paddingHorizontal: spacing.md, paddingVertical: spacing.xs }}>
          {SPECS.map(([label, value]) => (
            <View
              key={label}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                paddingVertical: 7,
                borderBottomWidth: StyleSheet.hairlineWidth,
                borderBottomColor: colors.divider,
              }}
            >
              <Text style={{ fontSize: 13, color: colors.textTertiary }}>{label}</Text>
              <Text style={{ fontSize: 13, fontWeight: '500', color: colors.textPrimary }}>
                {value}
              </Text>
            </View>
          ))}
        </View>
        <View
          style={{
            padding: spacing.sm,
            borderTopWidth: StyleSheet.hairlineWidth,
            borderTopColor: colors.divider,
            flexDirection: 'row',
            gap: spacing.xs,
          }}
        >
          <Pressable
            onPress={() => Alert.alert('Edit car', 'Vehicle editing comes with the backend.')}
            style={({ pressed }) => ({
              flex: 1,
              backgroundColor: colors.primarySurface,
              borderRadius: radii.sm,
              paddingVertical: 9,
              alignItems: 'center',
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Text style={{ fontSize: 13, fontWeight: '500', color: colors.primaryDark }}>
              Edit car
            </Text>
          </Pressable>
          <Pressable
            onPress={() => Alert.alert('Remove car', 'Vehicle removal comes with the backend.')}
            style={({ pressed }) => ({
              flex: 1,
              backgroundColor: colors.surface,
              borderRadius: radii.sm,
              borderWidth: StyleSheet.hairlineWidth,
              borderColor: colors.border,
              paddingVertical: 9,
              alignItems: 'center',
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Text style={{ fontSize: 13, color: colors.textTertiary }}>Remove</Text>
          </Pressable>
        </View>
      </View>

      {/* Add car */}
      <Pressable
        onPress={() => Alert.alert('Add car', 'VIN scan / manual entry comes with the backend.')}
        style={({ pressed }) => ({
          backgroundColor: colors.surface,
          borderRadius: radii.md,
          borderWidth: 1.5,
          borderStyle: 'dashed',
          borderColor: colors.primaryLight,
          padding: spacing.lg,
          alignItems: 'center',
          marginBottom: spacing.md,
          opacity: pressed ? 0.7 : 1,
        })}
      >
        <Text style={{ fontSize: 28, marginBottom: 6 }}>➕</Text>
        <Text style={{ fontSize: 15, fontWeight: '500', color: colors.primaryDark, marginBottom: 2 }}>
          Add another car
        </Text>
        <Text style={{ fontSize: 13, color: colors.textTertiary }}>
          Scan VIN barcode or enter manually
        </Text>
      </Pressable>

      <View
        style={{
          backgroundColor: colors.warningSurface,
          borderRadius: radii.sm,
          padding: spacing.sm,
          flexDirection: 'row',
          gap: spacing.sm,
        }}
      >
        <Text style={{ fontSize: 16 }}>💡</Text>
        <Text style={{ flex: 1, fontSize: 13, color: colors.warningDeep, lineHeight: 19 }}>
          Add all your vehicles to compare quotes and track service for each one.
        </Text>
      </View>
    </Screen>
  );
}
