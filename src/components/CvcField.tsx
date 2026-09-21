import React from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';

import { Text } from './Text';

import { Icon } from './Icon';
import { TextField } from './TextField';
import { spacing, useTheme } from '../theme';

/** A CVC is three digits, four on American Express. */
export const isValidCvc = (cvc: string) => /^\d{3,4}$/.test(cvc.trim());

/**
 * The card's security code, asked for wherever a card is registered or
 * charged. Digits only, never stored, masked as it is typed.
 */
export function CvcField({
  value,
  onChange,
  label = 'CVC',
  hint = '3 digits on the back of the card, 4 on American Express',
  containerStyle,
}: {
  value: string;
  onChange: (cvc: string) => void;
  label?: string;
  hint?: string;
  containerStyle?: StyleProp<ViewStyle>;
}) {
  const { colors } = useTheme();
  return (
    <View style={containerStyle}>
      <TextField
        label={label}
        value={value}
        onChangeText={(t) => onChange(t.replace(/\D/g, '').slice(0, 4))}
        placeholder="123"
        keyboardType="number-pad"
        secure
        maxLength={4}
        containerStyle={{ marginBottom: 6 }}
      />
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: spacing.md }}>
        <Icon name="lock" size={13} color={colors.textTertiary} />
        <Text style={{ flex: 1, fontSize: 12, color: colors.textTertiary }}>{hint}</Text>
      </View>
    </View>
  );
}
