import React from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';

import { pointsToUsd } from '../config/points';
import { palette, radii, spacing, useTheme } from '../theme';

/**
 * "Use points" row for payment screens (maint-payment, diy-payment).
 * Toggling on applies up to min(balance, total × 100) points against the
 * order total — 1 pt = $0.01, so 420 pts knocks $4.20 off.
 */
export function UsePointsRow({
  balance,
  maxRedeemable,
  applied,
  onToggle,
}: {
  /** Current points balance (store.points). */
  balance: number;
  /** min(balance, total * 100) — most points this order can absorb. */
  maxRedeemable: number;
  /** Points currently applied (0 = toggle off). */
  applied: number;
  onToggle: (on: boolean) => void;
}) {
  const { colors } = useTheme();
  const on = applied > 0;
  const disabled = maxRedeemable <= 0;
  return (
    <View
      style={{
        backgroundColor: colors.warningSurface,
        borderRadius: radii.sm,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.warning,
        padding: spacing.sm,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginBottom: spacing.md,
        opacity: disabled ? 0.55 : 1,
      }}
    >
      <Text style={{ fontSize: 16 }}>★</Text>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 14, fontWeight: '600', color: colors.warningDeep }}>
          Use points
        </Text>
        <Text style={{ fontSize: 13, color: colors.warningDeep }}>
          {on
            ? `Applying ${applied.toLocaleString()} pts · − ${pointsToUsd(applied)}`
            : `${balance.toLocaleString()} pts available · = ${pointsToUsd(balance)}`}
        </Text>
      </View>
      <Switch
        value={on}
        onValueChange={onToggle}
        disabled={disabled}
        trackColor={{ false: colors.border, true: palette.warning }}
        thumbColor="#fff"
      />
    </View>
  );
}
