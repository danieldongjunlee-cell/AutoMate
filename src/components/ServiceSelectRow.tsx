import React from 'react';
import { Glyph, Icon } from './Icon';
import { StyleSheet, View } from 'react-native';

import { Text } from './Text';

import { Tappable } from './Tappable';

import { BookableService } from '../services/mock/data';
import { spacing, useTheme } from '../theme';

/** Multi-select service row from s-maint-schedule-book (left bar + when selected). */
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
      })}
    >
      <View style={{ marginRight: spacing.sm }}>
        <Glyph glyph={service.icon} size={20} color={colors.textSecondary} />
      </View>
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
        <Text style={{ fontSize: 13, color: selected ? colors.primaryDark : colors.textTertiary }}>
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
        <Icon name="check" size={18} color={selected ? colors.primary : colors.disabled} strokeWidth={2.4} />
      </View>
    </Tappable>
  );
}
