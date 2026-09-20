import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Icon } from './Icon';
import { Tappable } from './Tappable';
import { radii, spacing, useTheme } from '../theme';

export interface BreakdownLine {
  label: string;
  value: string;
  /** Struck-through original (a discount applied). */
  was?: string;
  strong?: boolean;
  accent?: boolean;
}

/**
 * Collapsible "Price breakdown": a summary row with the total that expands to
 * the itemised lines. Used on the quote rows and the maintenance shop rows.
 */
export function PriceBreakdown({
  title,
  total,
  caption,
  lines,
  initiallyOpen = false,
}: {
  title: string;
  /** Headline figure shown on the right of the summary row. */
  total: string;
  caption?: string;
  lines: BreakdownLine[];
  initiallyOpen?: boolean;
}) {
  const { colors } = useTheme();
  const [open, setOpen] = useState(initiallyOpen);
  return (
    <View style={{ backgroundColor: colors.surfaceAlt, borderRadius: 16, overflow: 'hidden' }}>
      <Tappable
        onPress={() => setOpen((v) => !v)}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        accessibilityLabel={`${open ? 'Hide' : 'Show'} ${title.toLowerCase()}`}
        style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md }}
      >
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 12, fontWeight: '700', letterSpacing: 0.6, textTransform: 'uppercase', color: colors.textTertiary }}>{title}</Text>
          {caption ? (
            <Text style={{ fontSize: 12, color: colors.textTertiary, marginTop: 2 }} numberOfLines={1}>
              {caption}
            </Text>
          ) : null}
        </View>
        <Text style={{ fontSize: 22, fontWeight: '800', color: colors.textPrimary }}>{total}</Text>
        <View style={{ transform: [{ rotate: open ? '-90deg' : '90deg' }] }}>
          <Icon name="chevron" size={18} color={colors.textTertiary} strokeWidth={2} />
        </View>
      </Tappable>
      {open ? (
        <View style={{ paddingHorizontal: spacing.md, paddingBottom: spacing.md }}>
          {lines.map((l) => (
            <View
              key={l.label}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: spacing.sm,
                paddingVertical: 5,
                borderTopWidth: StyleSheet.hairlineWidth,
                borderTopColor: colors.border,
              }}
            >
              <Text style={{ flex: 1, fontSize: 14, fontWeight: l.strong ? '800' : '400', color: l.strong ? colors.textPrimary : colors.textSecondary }} numberOfLines={1}>
                {l.label}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                {l.was ? <Text style={{ fontSize: 12, color: colors.textTertiary, textDecorationLine: 'line-through' }}>{l.was}</Text> : null}
                <Text style={{ fontSize: 14, fontWeight: l.strong ? '800' : '700', color: l.accent ? colors.successDeep : colors.textPrimary }}>{l.value}</Text>
              </View>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

/** Pill used above a breakdown when a row needs a small hint (kept for reuse). */
export const breakdownRadius = radii.md;
