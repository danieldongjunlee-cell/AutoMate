import React from 'react';
import {
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';

import { radii, spacing, useTheme } from '../theme';

/** Themed scroll container with wireframe screen padding. */
export function Screen({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const { colors } = useTheme();
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={[
        { padding: spacing.screenH, paddingBottom: spacing.xxxl },
        style,
      ]}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  );
}

/** Surface card with hairline border (wireframe #F8F7F4 / #E0DDD5). */
export function Card({
  children,
  style,
  tinted,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** primarySurface variant (#EEEDFE). */
  tinted?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: tinted ? colors.primarySurface : colors.surface,
          borderColor: tinted ? colors.primaryLight : colors.border,
          borderWidth: StyleSheet.hairlineWidth,
          borderRadius: radii.md,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

/** Uppercase section label (wireframe 7.5px/700 → 12/700). */
export function SectionLabel({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<TextStyle>;
}) {
  const { colors, typography } = useTheme();
  return (
    <Text
      style={[
        typography.label,
        { color: colors.textTertiary, marginBottom: spacing.sm },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

type BadgeVariant = 'primary' | 'success' | 'warning' | 'danger' | 'neutral' | 'primarySoft';

/** Pill badge. */
export function Badge({
  label,
  variant = 'neutral',
  style,
}: {
  label: string;
  variant?: BadgeVariant;
  style?: StyleProp<ViewStyle>;
}) {
  const { colors } = useTheme();
  const map: Record<BadgeVariant, { bg: string; fg: string }> = {
    primary: { bg: colors.primary, fg: colors.onPrimary },
    primarySoft: { bg: colors.primarySurface, fg: colors.primaryDeep },
    success: { bg: colors.successSurface, fg: colors.successDeep },
    warning: { bg: colors.warningSurface, fg: colors.warningDeep },
    danger: { bg: colors.dangerSurface, fg: colors.dangerDeep },
    neutral: { bg: colors.surfaceAlt, fg: colors.textSecondary },
  };
  const { bg, fg } = map[variant];
  return (
    <View
      style={[
        {
          backgroundColor: bg,
          borderRadius: radii.pill,
          paddingHorizontal: 10,
          paddingVertical: 3,
          alignSelf: 'flex-start',
        },
        style,
      ]}
    >
      <Text style={{ fontSize: 12, fontWeight: '600', color: fg }}>{label}</Text>
    </View>
  );
}

/** Circular initial avatar (dealer/user). */
export function AvatarCircle({
  initial,
  color,
  size = 36,
}: {
  initial: string;
  color: string;
  size?: number;
}) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ fontSize: size * 0.4, fontWeight: '700', color: '#fff' }}>{initial}</Text>
    </View>
  );
}
