import React from 'react';
import { Alert, Text, View } from 'react-native';

import { Tappable } from './Tappable';

import { radii, spacing, useTheme } from '../theme';

/**
 * Pro paywall overlay (submitted / after-hours / DIY hub). Children render
 * dimmed underneath; the unlock CTA is a mock purchase for now.
 */
export function ProLockOverlay({
  children,
  title = 'Pro feature',
  subtitle,
  cta = 'Unlock Pro · $48/yr',
  onDark,
  onUnlock,
}: {
  children: React.ReactNode;
  title?: string;
  subtitle: string;
  cta?: string;
  onDark?: boolean;
  onUnlock?: () => void;
}) {
  const { colors } = useTheme();
  return (
    <View>
      <View style={{ opacity: 0.4 }} pointerEvents="none">
        {children}
      </View>
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: onDark ? 'rgba(11,30,61,.75)' : 'rgba(248,247,244,.8)',
          borderRadius: radii.md,
          borderWidth: 1.5,
          borderStyle: 'dashed',
          borderColor: onDark ? 'rgba(127,119,221,.5)' : colors.primaryLight,
          padding: spacing.md,
        }}
      >
        <Text style={{ fontSize: 26, marginBottom: 4 }}>🔒</Text>
        <Text
          style={{
            fontSize: 14,
            fontWeight: '700',
            color: onDark ? '#fff' : colors.textPrimary,
            marginBottom: 3,
          }}
        >
          {title}
        </Text>
        <Text
          style={{
            fontSize: 12,
            color: onDark ? 'rgba(255,255,255,.5)' : colors.textTertiary,
            textAlign: 'center',
            lineHeight: 17,
            marginBottom: spacing.md,
            paddingHorizontal: spacing.lg,
          }}
        >
          {subtitle}
        </Text>
        <Tappable
          onPress={onUnlock}
          style={({ pressed }) => ({
            backgroundColor: colors.primary,
            borderRadius: radii.pill,
            paddingHorizontal: 22,
            paddingVertical: 9,
            opacity: pressed ? 0.8 : 1,
          })}
        >
          <Text style={{ fontSize: 13, fontWeight: '700', color: colors.onPrimary }}>{cta}</Text>
        </Tappable>
      </View>
    </View>
  );
}

/** EASY / MED / HARD difficulty chip + guide row used in the Pro lists. */
export function DiyGuideRow({
  level,
  title,
  meta,
  onDark,
  free,
  showLink,
  onReadGuide,
}: {
  level: 'EASY' | 'MED' | 'HARD';
  title: string;
  meta: string;
  onDark?: boolean;
  free?: boolean;
  showLink?: boolean;
  /** When provided, "Read guide →" opens the matched guide instead of an alert. */
  onReadGuide?: () => void;
}) {
  const { colors } = useTheme();
  const levelBg = { EASY: colors.success, MED: colors.warning, HARD: colors.danger }[level];
  const levelFg = level === 'MED' ? '#1A1A1A' : '#fff';
  const open =
    onReadGuide ??
    (() => Alert.alert(title, `${meta}\n\nFull step-by-step guide content ships with the backend.`));
  const containerStyle = {
    backgroundColor: onDark ? 'rgba(255,255,255,.07)' : colors.surface,
    borderRadius: radii.sm,
    borderWidth: 0.5,
    borderColor: onDark ? 'rgba(255,255,255,.12)' : colors.border,
    padding: spacing.md,
    marginBottom: 6,
  } as const;

  const inner = (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <View style={{ backgroundColor: levelBg, borderRadius: 4, paddingHorizontal: 8, paddingVertical: 2 }}>
        <Text style={{ fontSize: 10, fontWeight: '700', color: levelFg }}>{level}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 15, fontWeight: '600', color: onDark ? '#fff' : colors.textPrimary }}>
          {title}
        </Text>
        <Text style={{ fontSize: 12, color: onDark ? 'rgba(255,255,255,.4)' : colors.textTertiary, marginTop: 2 }}>
          {meta}
        </Text>
      </View>
      {free ? (
        <View
          style={{
            backgroundColor: colors.successSurface,
            borderRadius: radii.pill,
            paddingHorizontal: 8,
            paddingVertical: 2,
          }}
        >
          <Text style={{ fontSize: 10, color: colors.successDeep }}>📄 Free</Text>
        </View>
      ) : null}
      {showLink ? (
        <Text style={{ fontSize: 24, color: onDark ? 'rgba(255,255,255,.6)' : colors.primary }}>›</Text>
      ) : null}
    </View>
  );

  return showLink ? (
    <Tappable onPress={open} style={containerStyle}>
      {inner}
    </Tappable>
  ) : (
    <View style={containerStyle}>{inner}</View>
  );
}
