import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Tappable } from './Tappable';

import { spacing, useTheme } from '../theme';

/** Settings list row: icon · label · optional value · › (or a custom right element). */
export function SettingsRow({
  icon,
  label,
  value,
  onPress,
  right,
  last,
}: {
  icon: string;
  label: string;
  value?: string;
  onPress?: () => void;
  right?: React.ReactNode;
  last?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <Tappable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        paddingVertical: 13,
        borderBottomWidth: last ? 0 : StyleSheet.hairlineWidth,
        borderBottomColor: colors.divider,
        opacity: pressed ? 0.6 : 1,
      })}
    >
      <Text style={{ fontSize: 18, marginRight: spacing.md }}>{icon}</Text>
      <Text style={{ flex: 1, fontSize: 15, fontWeight: '500', color: colors.textPrimary }}>
        {label}
      </Text>
      {value ? (
        <Text style={{ fontSize: 13, color: colors.textTertiary, marginRight: 8 }}>{value}</Text>
      ) : null}
      {right ?? (onPress ? <Text style={{ fontSize: 17, color: colors.disabled }}>›</Text> : null)}
    </Tappable>
  );
}

/** Pill toggle from the wireframe settings (28×16 scaled ×1.5). */
export function TogglePill({ value, onToggle }: { value: boolean; onToggle: () => void }) {
  const { colors } = useTheme();
  return (
    <Tappable
      onPress={onToggle}
      hitSlop={8}
      style={{
        width: 44,
        height: 26,
        borderRadius: 13,
        backgroundColor: value ? colors.primary : colors.border,
        justifyContent: 'center',
        paddingHorizontal: 3,
        alignItems: value ? 'flex-end' : 'flex-start',
      }}
    >
      <View
        style={{
          width: 20,
          height: 20,
          borderRadius: 10,
          backgroundColor: '#fff',
        }}
      />
    </Tappable>
  );
}
