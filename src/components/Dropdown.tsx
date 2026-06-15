import React, { useState } from 'react';
import { Modal, ScrollView, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';

import { palette, radii, spacing, useTheme } from '../theme';
import { Tappable } from './Tappable';

interface Props {
  label: string;
  value: string;
  options: string[];
  placeholder?: string;
  disabled?: boolean;
  onChange: (v: string) => void;
  containerStyle?: StyleProp<ViewStyle>;
}

/**
 * Labeled dropdown selector matching the TextField look (label above, bordered
 * box, chevron ▾). Tapping opens a slide-up bottom-sheet Modal of options;
 * selecting one calls onChange and closes the sheet.
 */
export function Dropdown({
  label,
  value,
  options,
  placeholder,
  disabled,
  onChange,
  containerStyle,
}: Props) {
  const { colors } = useTheme();
  const [open, setOpen] = useState(false);
  const isDisabled = !!disabled || options.length === 0;
  const hasValue = value.trim().length > 0;

  return (
    <View style={[{ marginBottom: spacing.md }, containerStyle]}>
      <Text
        style={{
          fontSize: 14,
          fontWeight: '500',
          color: colors.textSecondary,
          marginBottom: 6,
        }}
      >
        {label}
      </Text>
      <Tappable
        onPress={() => setOpen(true)}
        disabled={isDisabled}
        accessibilityRole="combobox"
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: radii.md,
          backgroundColor: colors.inputBg,
          paddingHorizontal: spacing.md,
          paddingVertical: 13,
          opacity: isDisabled ? 0.5 : 1,
        }}
      >
        <Text
          numberOfLines={1}
          style={{
            flex: 1,
            fontSize: 15,
            color: hasValue ? colors.textPrimary : palette.textPlaceholder,
          }}
        >
          {hasValue ? value : placeholder || `Select ${label.toLowerCase()}`}
        </Text>
        <Text style={{ fontSize: 12, color: colors.textSecondary, marginLeft: spacing.xs }}>▾</Text>
      </Tappable>

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <Tappable
          noFeedback
          onPress={() => setOpen(false)}
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,.45)',
            justifyContent: 'flex-end',
          }}
        >
          <Tappable
            noFeedback
            onPress={() => {}}
            style={{
              backgroundColor: colors.surface,
              borderTopLeftRadius: radii.lg,
              borderTopRightRadius: radii.lg,
              paddingBottom: spacing.xl,
              maxHeight: '70%',
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: '700',
                letterSpacing: 0.6,
                textTransform: 'uppercase',
                color: colors.textTertiary,
                paddingHorizontal: spacing.md,
                paddingTop: spacing.md,
                paddingBottom: spacing.xs,
              }}
            >
              {label}
            </Text>
            <ScrollView>
              {options.map((option, i) => {
                const on = option === value;
                return (
                  <Tappable
                    key={option}
                    onPress={() => {
                      onChange(option);
                      setOpen(false);
                    }}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingHorizontal: spacing.md,
                      paddingVertical: 14,
                      backgroundColor: on ? colors.primarySurface : 'transparent',
                      borderBottomWidth: i < options.length - 1 ? StyleSheet.hairlineWidth : 0,
                      borderBottomColor: colors.divider,
                    }}
                  >
                    <Text
                      style={{
                        flex: 1,
                        fontSize: 15,
                        fontWeight: on ? '600' : '400',
                        color: on ? colors.primaryDeep : colors.textPrimary,
                      }}
                    >
                      {option}
                    </Text>
                    {on ? <Text style={{ fontSize: 16, color: colors.primary }}>✔</Text> : null}
                  </Tappable>
                );
              })}
            </ScrollView>
          </Tappable>
        </Tappable>
      </Modal>
    </View>
  );
}
