import React from 'react';
import { Alert, Platform, Text, View } from 'react-native';

import { Icon } from './Icon';
import { Tappable } from './Tappable';

import { palette, radii, spacing, useTheme } from '../theme';

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
  blur,
  onUnlock,
}: {
  children: React.ReactNode;
  title?: string;
  subtitle: string;
  cta?: string;
  onDark?: boolean;
  /** Blur the locked preview (web) on top of dimming it. */
  blur?: boolean;
  onUnlock?: () => void;
}) {
  const { colors } = useTheme();
  return (
    <View>
      <View style={[{ opacity: 0.4 }, blur && Platform.OS === 'web' ? ({ filter: 'blur(3px)' } as object) : null]} pointerEvents="none">
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
          backgroundColor: 'rgba(10,15,25,.78)',
          borderRadius: radii.lg,
          borderWidth: 1,
          borderColor: onDark ? 'rgba(240,180,78,.35)' : colors.border,
          padding: spacing.md,
        }}
      >
        <Icon name="lock" size={22} color={palette.amber} />
        <Text
          style={{
            fontSize: 14,
            fontWeight: '700',
            color: onDark ? '#fff' : colors.textPrimary,
            marginTop: 2,
            marginBottom: 2,
          }}
        >
          {title}
        </Text>
        <Text
          style={{
            fontSize: 13,
            color: onDark ? 'rgba(255,255,255,.5)' : colors.textTertiary,
            textAlign: 'center',
            lineHeight: 17,
            marginBottom: spacing.sm,
            paddingHorizontal: spacing.md,
          }}
        >
          {subtitle}
        </Text>
        <Tappable
          onPress={onUnlock}
          style={({ pressed }) => ({
            backgroundColor: palette.amber,
            borderRadius: radii.pill,
            paddingHorizontal: 22,
            paddingVertical: 10,
          })}
        >
          <Text style={{ fontSize: 14, fontWeight: '800', color: palette.onAmber }}>{cta}</Text>
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
        <Text style={{ fontSize: 11, fontWeight: '700', color: levelFg }}>{level}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 15, fontWeight: '600', color: onDark ? '#fff' : colors.textPrimary }}>
          {title}
        </Text>
        <Text style={{ fontSize: 13, color: onDark ? 'rgba(255,255,255,.4)' : colors.textTertiary, marginTop: 2 }}>
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
          <Text style={{ fontSize: 11, fontWeight: '700', color: palette.mint }}>Free</Text>
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
