import React from 'react';
import { ActivityIndicator, StyleProp, Text, TextStyle, ViewStyle } from 'react-native';

import { palette, radii, spacing, useTheme } from '../theme';
import { Tappable } from './Tappable';

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
    <Tappable
      onPress={onPress}
      disabled={disabled || loading}
      style={() => [
        {
          backgroundColor: bg[variant],
          borderRadius: radii.md,
          paddingVertical: 14,
          paddingHorizontal: spacing.lg,
          alignItems: 'center' as const,
          justifyContent: 'center' as const,
          borderWidth: variant === 'outline' ? 1 : 0,
          borderColor: colors.border,
          opacity: disabled ? 0.4 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg[variant]} />
      ) : (
        <Text style={[{ color: fg[variant], fontSize: 18, fontWeight: '700' }, textStyle]}>
          {label}
        </Text>
      )}
    </Tappable>
  );
}
