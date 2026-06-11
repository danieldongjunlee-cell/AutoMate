import React from 'react';
import { ActivityIndicator, Pressable, StyleProp, Text, TextStyle, ViewStyle } from 'react-native';

import { palette, radii, spacing, useTheme } from '../theme';

type Variant = 'primary' | 'auth' | 'outline' | 'success' | 'warning' | 'danger';

interface Props {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export function PrimaryButton({
  label,
  onPress,
  variant = 'primary',
  disabled,
  loading,
  style,
  textStyle,
}: Props) {
  const { colors } = useTheme();

  const bg: Record<Variant, string> = {
    primary: colors.primary,
    auth: palette.authAction,
    outline: 'transparent',
    success: colors.success,
    warning: colors.warning,
    danger: colors.danger,
  };
  const fg: Record<Variant, string> = {
    primary: colors.onPrimary,
    auth: '#fff',
    outline: colors.textSecondary,
    success: '#fff',
    warning: palette.dark,
    danger: '#fff',
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        {
          backgroundColor: bg[variant],
          borderRadius: radii.md,
          paddingVertical: 14,
          paddingHorizontal: spacing.lg,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: variant === 'outline' ? 1 : 0,
          borderColor: colors.border,
          opacity: disabled ? 0.4 : pressed ? 0.8 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg[variant]} />
      ) : (
        <Text style={[{ color: fg[variant], fontSize: 16, fontWeight: '700' }, textStyle]}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}
