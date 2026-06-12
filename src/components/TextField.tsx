import React, { useState } from 'react';
import { StyleProp, Text, TextInput, TextInputProps, View, ViewStyle } from 'react-native';

import { Tappable } from './Tappable';

import { palette, radii, spacing, useTheme } from '../theme';

interface Props extends TextInputProps {
  label: string;
  /** Light label for navy (auth) backgrounds. */
  onDark?: boolean;
  secure?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
}

export function TextField({ label, onDark, secure, containerStyle, ...inputProps }: Props) {
  const { colors } = useTheme();
  const [hidden, setHidden] = useState(!!secure);
  const [focused, setFocused] = useState(false);

  return (
    <View style={[{ marginBottom: spacing.md }, containerStyle]}>
      <Text
        style={{
          fontSize: 14,
          fontWeight: '500',
          color: onDark ? 'rgba(255,255,255,.7)' : colors.textSecondary,
          marginBottom: 6,
        }}
      >
        {label}
      </Text>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          borderWidth: focused ? 1.5 : 1,
          borderColor: focused ? palette.authAction : colors.border,
          borderRadius: radii.md,
          backgroundColor: onDark ? '#FAFAF8' : colors.inputBg,
          paddingHorizontal: spacing.md,
        }}
      >
        <TextInput
          {...inputProps}
          secureTextEntry={hidden}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholderTextColor={palette.textPlaceholder}
          style={{
            flex: 1,
            paddingVertical: 13,
            fontSize: 15,
            color: onDark ? palette.textPrimary : colors.textPrimary,
          }}
        />
        {secure ? (
          <Tappable onPress={() => setHidden((h) => !h)} hitSlop={8}>
            <Text style={{ color: palette.authAction, fontSize: 13, fontWeight: '500' }}>
              {hidden ? 'Show' : 'Hide'}
            </Text>
          </Tappable>
        ) : null}
      </View>
    </View>
  );
}
