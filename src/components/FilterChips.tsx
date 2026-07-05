import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';

import { Tappable } from './Tappable';

import { pointsToUsd } from '../config/points';
import { radii, spacing, useTheme } from '../theme';

/** Horizontal single-select chip row (history filters, DIY categories, service types). */
export function FilterChips({
  options,
  selected,
  onSelect,
}: {
  options: string[];
  selected: string;
  onSelect: (option: string) => void;
}) {
  const { colors } = useTheme();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: spacing.xs, paddingVertical: 2 }}
      style={{ marginBottom: spacing.sm, flexGrow: 0 }}
    >
      {options.map((option) => {
        const on = option === selected;
        return (
          <Tappable
            key={option}
            onPress={() => onSelect(option)}
            style={({ pressed }) => ({
              backgroundColor: on ? colors.primary : colors.surface,
              borderRadius: radii.pill,
              paddingHorizontal: 16,
              paddingVertical: 7,
              borderWidth: on ? 0 : StyleSheet.hairlineWidth,
              borderColor: colors.border,
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: on ? '600' : '400',
                color: on ? colors.onPrimary : colors.textSecondary,
              }}
            >
              {option}
            </Text>
          </Tappable>
        );
      })}
    </ScrollView>
  );
}

/** ★ +N pts chip (scan/manual/post rewards). `usd` appends the dollar value. */
export function PointsBadge({ points, usd = false }: { points: number; usd?: boolean }) {
  const { colors } = useTheme();
  return (
    <Text
      style={{
        backgroundColor: colors.warningSurface,
        color: colors.warningDeep,
        fontSize: 13,
        fontWeight: '500',
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: radii.pill,
        overflow: 'hidden',
      }}
    >
      ★ +{points} pts{usd ? ` · ${pointsToUsd(points)}` : ''}
    </Text>
  );
}
