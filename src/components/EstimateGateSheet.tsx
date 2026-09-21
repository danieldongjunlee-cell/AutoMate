import React from 'react';
import { Modal, View } from 'react-native';

import { Text } from './Text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from './Icon';
import { IconChip } from './IconChip';
import { Tappable } from './Tappable';
import { palette, radii, spacing, useTheme } from '../theme';

/**
 * Guest gate for "AI Repair Estimate" (canvas "Estimate gate"): a bottom sheet
 * offering the picker as a guest, or Join first to earn points. Signed-in
 * users never see it.
 */
export function EstimateGateSheet({
  visible,
  onClose,
  onGuest,
  onSignUp,
}: {
  visible: boolean;
  onClose: () => void;
  onGuest: () => void;
  onSignUp: () => void;
}) {
  const insets = useSafeAreaInsets();
  const { colors, dark } = useTheme();

  const option = (opts: {
    title: string;
    caption: string;
    icon: 'user' | 'coins';
    bg: string;
    border: string;
    tint: string;
    onPress: () => void;
  }) => (
    <Tappable
      onPress={() => {
        onClose();
        opts.onPress();
      }}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        backgroundColor: opts.bg,
        borderWidth: 1,
        borderColor: opts.border,
        borderRadius: 20,
        padding: spacing.md,
        marginBottom: spacing.md,
      }}
    >
      <IconChip name={opts.icon} size={64} glyph={34} color={opts.tint} radius={20} />
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 18, fontWeight: '800', color: colors.textPrimary }}>{opts.title}</Text>
        <Text style={{ fontSize: 13, color: colors.textSecondary, marginTop: 3 }}>{opts.caption}</Text>
      </View>
      <Icon name="chevron" size={22} color={colors.textTertiary} />
    </Tappable>
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Tappable noFeedback onPress={onClose} style={{ flex: 1, backgroundColor: colors.backdrop, justifyContent: 'flex-end' }}>
        <View
          onStartShouldSetResponder={() => true}
          style={{
            backgroundColor: colors.sheet,
            borderTopLeftRadius: radii.actionSheet,
            borderTopRightRadius: radii.actionSheet,
            borderWidth: 1,
            borderBottomWidth: 0,
            borderColor: colors.border,
            paddingHorizontal: spacing.lg,
            paddingTop: spacing.md,
            paddingBottom: Math.max(insets.bottom, spacing.lg) + spacing.sm,
          }}
        >
          <View style={{ width: 44, height: 5, borderRadius: 3, backgroundColor: colors.border, alignSelf: 'center', marginBottom: spacing.lg }} />
          <Text style={{ fontSize: 22, fontWeight: '800', color: colors.textPrimary, marginBottom: 4 }}>
            You can use this as a guest
          </Text>
          <Text style={{ fontSize: 14, color: colors.textSecondary, lineHeight: 20, marginBottom: spacing.lg }}>
            Sign up to save your estimate, cars and points.
          </Text>
          {option({
            title: 'Get an estimate as a guest',
            caption: 'No account needed · quotes in about an hour',
            icon: 'user',
            bg: colors.tileNavy,
            border: colors.tileNavyBorder,
            tint: colors.textPrimary,
            onPress: onGuest,
          })}
          {option({
            title: 'Sign up and get rewards',
            caption: 'Earn points on every estimate',
            icon: 'coins',
            bg: dark ? '#2a2212' : colors.warningSurface,
            border: palette.amber,
            tint: palette.amber,
            onPress: onSignUp,
          })}
          <Tappable onPress={onClose} style={{ alignItems: 'center', paddingVertical: 10 }}>
            <Text style={{ fontSize: 15, fontWeight: '700', color: colors.textTertiary }}>Not now</Text>
          </Tappable>
        </View>
      </Tappable>
    </Modal>
  );
}
