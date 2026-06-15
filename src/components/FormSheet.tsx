import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { radii, spacing, useTheme } from '../theme';

/**
 * Centered form modal with a robust dismiss: the dimmed backdrop is an
 * absolute-fill Pressable rendered BEHIND the card (a sibling, not a parent),
 * so taps/typing inside the card never bubble to the close handler — fixing the
 * "popup disappears when I tap a field" bug on web. Tapping outside closes
 * (unless `dismissable` is false, e.g. while saving).
 */
export function FormSheet({
  visible,
  onClose,
  title,
  dismissable = true,
  children,
}: {
  visible: boolean;
  onClose: () => void;
  title?: string;
  dismissable?: boolean;
  children: React.ReactNode;
}) {
  const { colors } = useTheme();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={{ flex: 1, justifyContent: 'center', padding: spacing.xl }}>
        <Pressable
          style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,.45)' }]}
          onPress={dismissable ? onClose : undefined}
        />
        <View style={{ backgroundColor: colors.background, borderRadius: radii.lg, padding: spacing.lg }}>
          {title ? (
            <Text style={{ fontSize: 17, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.md }}>
              {title}
            </Text>
          ) : null}
          {children}
        </View>
      </View>
    </Modal>
  );
}
