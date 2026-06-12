import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Tappable } from './Tappable';

import { BookableService } from '../services/mock/data';
import { spacing, useTheme } from '../theme';

/** Multi-select service row from s-maint-schedule-book (left bar + ✔ when selected). */
export function ServiceSelectRow({
  service,
  selected,
  onToggle,
  last,
}: {
  service: BookableService;
  selected: boolean;
  onToggle: () => void;
  last?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <Tappable
      onPress={onToggle}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        backgroundColor: selected ? colors.primarySurface : 'transparent',
        borderLeftWidth: 3,
        borderLeftColor: selected ? colors.primary : 'transparent',
        borderBottomWidth: last ? 0 : StyleSheet.hairlineWidth,
        borderBottomColor: colors.divider,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <Text style={{ fontSize: 18, marginRight: spacing.sm }}>{service.icon}</Text>
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 15,
            fontWeight: '600',
            color: selected ? colors.primaryDeep : colors.textPrimary,
          }}
        >
          {service.name}
        </Text>
        <Text style={{ fontSize: 12, color: selected ? colors.primaryDark : colors.textTertiary }}>
          {service.detail}
        </Text>
      </View>
      <View style={{ alignItems: 'flex-end', gap: 2 }}>
        <Text
          style={{
            fontSize: 16,
            fontWeight: '700',
            color: selected ? colors.primaryDeep : colors.successDark,
          }}
        >
          ${service.price}
        </Text>
        <Text style={{ fontSize: 18, color: selected ? colors.primary : colors.disabled }}>✔</Text>
      </View>
    </Tappable>
  );
}
