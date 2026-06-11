import React from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { radii, spacing, useTheme } from '../theme';

/**
 * Shared pieces of the two "Booking confirmed" screens (wireframe
 * s-booking-confirm and s-maint-schedule-confirm — one pattern, two routes).
 */

/** ✅ circle + headline + subtitle. */
export function SuccessHeader({ title, subtitle }: { title: string; subtitle: string }) {
  const { colors } = useTheme();
  return (
    <View style={{ alignItems: 'center', paddingVertical: spacing.lg }}>
      <View
        style={{
          width: 80,
          height: 80,
          borderRadius: 40,
          backgroundColor: colors.successSurface,
          borderWidth: 2.5,
          borderColor: colors.success,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: spacing.sm,
        }}
      >
        <Text style={{ fontSize: 36 }}>✅</Text>
      </View>
      <Text style={{ fontSize: 24, fontWeight: '700', color: colors.successDeep, marginBottom: 2 }}>
        {title}
      </Text>
      <Text style={{ fontSize: 14, color: colors.textTertiary }}>{subtitle}</Text>
    </View>
  );
}

/** Two-column label/value cell in the booking summary grid. */
export function SummaryCell({
  label,
  value,
  sub,
  subColor,
}: {
  label: string;
  value: string;
  sub?: string;
  subColor?: string;
}) {
  const { colors } = useTheme();
  return (
    <View style={{ width: '50%', paddingVertical: spacing.xs }}>
      <Text
        style={{
          fontSize: 11,
          fontWeight: '600',
          color: colors.textTertiary,
          textTransform: 'uppercase',
          marginBottom: 2,
        }}
      >
        {label}
      </Text>
      <Text style={{ fontSize: 15, fontWeight: '600', color: colors.textPrimary }}>{value}</Text>
      {sub ? (
        <Text style={{ fontSize: 12, color: subColor ?? colors.textTertiary }}>{sub}</Text>
      ) : null}
    </View>
  );
}

/** 🔔 tinted reminder row with an Edit affordance. */
export function ReminderRow({ sub }: { sub: string }) {
  const { colors } = useTheme();
  return (
    <View
      style={{
        backgroundColor: colors.primarySurface,
        borderRadius: radii.sm,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.primaryLight,
        padding: spacing.sm,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginBottom: spacing.sm,
      }}
    >
      <Text style={{ fontSize: 20 }}>🔔</Text>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 14, fontWeight: '500', color: colors.primaryDeep }}>
          Reminder set
        </Text>
        <Text style={{ fontSize: 12, color: colors.textTertiary }}>{sub}</Text>
      </View>
      <Pressable
        onPress={() => Alert.alert('Reminder', 'Reminder editing comes with the backend.')}
        hitSlop={6}
      >
        <Text style={{ fontSize: 13, color: colors.primary }}>Edit</Text>
      </Pressable>
    </View>
  );
}
