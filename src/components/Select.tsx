import React, { useState } from 'react';
import { Modal, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';

import { radii, spacing, useTheme } from '../theme';
import { Tappable } from './Tappable';

/**
 * Dropdown select (user-feedback pass 1: maint-history filters became two
 * side-by-side dropdowns). Pressable field showing the current value + a
 * chevron; opens a themed Modal option list.
 */
export function Select({
  label,
  value,
  options,
  onChange,
  style,
}: {
  label?: string;
  value: string;
  options: string[];
  onChange: (option: string) => void;
  style?: StyleProp<ViewStyle>;
}) {
  const { colors } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Tappable
        onPress={() => setOpen(true)}
        accessibilityRole="combobox"
        style={[
          {
            backgroundColor: colors.surface,
            borderRadius: radii.sm,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: colors.border,
            paddingHorizontal: spacing.md,
            paddingVertical: 8,
          },
          style,
        ]}
      >
        {label ? (
          <Text
            style={{
              fontSize: 11,
              fontWeight: '700',
              letterSpacing: 0.5,
              textTransform: 'uppercase',
              color: colors.textTertiary,
              marginBottom: 1,
            }}
          >
            {label}
          </Text>
        ) : null}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text
            numberOfLines={1}
            style={{ flex: 1, fontSize: 14, fontWeight: '500', color: colors.textPrimary }}
          >
            {value}
          </Text>
          <Text style={{ fontSize: 12, color: colors.textSecondary, marginLeft: spacing.xs }}>
            ▾
          </Text>
        </View>
      </Tappable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Tappable
          noFeedback
          onPress={() => setOpen(false)}
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,.45)',
            justifyContent: 'center',
            padding: spacing.xl,
          }}
        >
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: radii.md,
              overflow: 'hidden',
              borderWidth: StyleSheet.hairlineWidth,
              borderColor: colors.border,
            }}
          >
            {label ? (
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
            ) : null}
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
                    paddingVertical: 13,
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
          </View>
        </Tappable>
      </Modal>
    </>
  );
}
