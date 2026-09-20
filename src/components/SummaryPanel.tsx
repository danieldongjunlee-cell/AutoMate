import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';

import { Icon, IconName } from './Icon';
import { Tappable } from './Tappable';
import { palette, radii, spacing, useTheme } from '../theme';

export interface SummaryPanelRow {
  key: string;
  title: string;
  caption?: string;
  /** Leading glyph, the mint tick of "Your services" by default. */
  icon?: IconName;
  iconColor?: string;
  value?: string;
  /** Replaces `value` when the amount needs its own styling (a struck price). */
  valueNode?: React.ReactNode;
}

/**
 * The gradient-framed "Your services" panel: an icon tile, the section's
 * name, the headline fact, an Edit link, the lines that make it up and a
 * tinted total strip. Shared so the booking step and the deposit step read
 * as one design.
 */
export function SummaryPanel({
  icon = 'calcheck',
  label,
  title,
  actionLabel,
  onAction,
  actionAccessibilityLabel,
  rows,
  footerLabel,
  footerCaption,
  footerValue,
  footerValueColor,
  style,
}: {
  icon?: IconName;
  /** Small uppercase name above the headline. */
  label: string;
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  actionAccessibilityLabel?: string;
  rows: SummaryPanelRow[];
  footerLabel?: string;
  footerCaption?: string;
  footerValue?: string;
  footerValueColor?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const { colors } = useTheme();

  return (
    <LinearGradient
      colors={[colors.primary, palette.teal]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        {
          borderRadius: radii.tile,
          padding: 2,
          shadowColor: colors.primary,
          shadowOpacity: 0.35,
          shadowRadius: 20,
          shadowOffset: { width: 0, height: 10 },
          elevation: 8,
        },
        style,
      ]}
    >
      <View style={{ backgroundColor: colors.surface, borderRadius: radii.tile - 2, overflow: 'hidden' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg, paddingBottom: spacing.md }}>
          <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name={icon} size={26} color={colors.onPrimary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 12, fontWeight: '800', letterSpacing: 0.8, textTransform: 'uppercase', color: colors.primaryDark }}>
              {label}
            </Text>
            <Text style={{ fontSize: 17, fontWeight: '800', color: colors.textPrimary, marginTop: 1 }} numberOfLines={1}>
              {title}
            </Text>
          </View>
          {actionLabel && onAction ? (
            <Tappable onPress={onAction} hitSlop={8} accessibilityLabel={actionAccessibilityLabel ?? actionLabel}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: colors.primaryDark }}>{actionLabel}</Text>
            </Tappable>
          ) : null}
        </View>

        {rows.map((r) => (
          <View
            key={r.key}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.sm,
              paddingHorizontal: spacing.lg,
              paddingVertical: 10,
              borderTopWidth: StyleSheet.hairlineWidth,
              borderTopColor: colors.divider,
            }}
          >
            <Icon name={r.icon ?? 'check'} size={20} color={r.iconColor ?? palette.mint} strokeWidth={2.2} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: '700', color: colors.textPrimary }}>{r.title}</Text>
              {r.caption ? <Text style={{ fontSize: 12, color: colors.textTertiary }}>{r.caption}</Text> : null}
            </View>
            {r.valueNode ??
              (r.value ? (
                <Text style={{ fontSize: 15, fontWeight: '800', color: colors.textPrimary }}>{r.value}</Text>
              ) : null)}
          </View>
        ))}

        {footerLabel ? (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: colors.primarySurface,
              paddingHorizontal: spacing.lg,
              paddingVertical: 12,
            }}
          >
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 12, fontWeight: '700', letterSpacing: 0.6, textTransform: 'uppercase', color: colors.primaryDark }}>
                {footerLabel}
              </Text>
              {footerCaption ? (
                <Text style={{ fontSize: 12, color: colors.textTertiary, marginTop: 1 }}>{footerCaption}</Text>
              ) : null}
            </View>
            {footerValue ? (
              <Text style={{ fontSize: 24, fontWeight: '800', color: footerValueColor ?? colors.textPrimary }}>{footerValue}</Text>
            ) : null}
          </View>
        ) : null}
      </View>
    </LinearGradient>
  );
}
