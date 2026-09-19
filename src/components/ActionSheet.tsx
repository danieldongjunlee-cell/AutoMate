import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Modal, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconChip } from './IconChip';
import { IconName } from './Icon';
import { Tappable } from './Tappable';
import { palette, radii, spacing } from '../theme';

export interface ActionSheetRow {
  key: string;
  title: string;
  sub: string;
  icon: IconName;
  /** Row tint (teal / blue / amber on the canvas). */
  color: string;
  /** Glyph colour on the solid chip — dark on bright tints, white on blue. */
  glyphColor?: string;
  onPress: () => void;
}

/**
 * The dock's `+` sheet: 28px radius on `#0f1626`, three tinted rows, each with
 * a solid icon chip and a 4px coloured left edge. Row background is a
 * horizontal gradient `colour2e → colour12` with a `colour55` border.
 */
export function ActionSheet({
  visible,
  onClose,
  rows,
}: {
  visible: boolean;
  onClose: () => void;
  rows: ActionSheetRow[];
}) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Tappable
        noFeedback
        onPress={onClose}
        style={{ flex: 1, backgroundColor: 'rgba(3,6,12,0.66)', justifyContent: 'flex-end' }}
      >
        <View
          // Swallow taps so the backdrop close doesn't fire.
          onStartShouldSetResponder={() => true}
          style={{
            backgroundColor: palette.sheet,
            borderTopLeftRadius: radii.actionSheet,
            borderTopRightRadius: radii.actionSheet,
            borderWidth: 1,
            borderBottomWidth: 0,
            borderColor: palette.border,
            paddingHorizontal: spacing.lg,
            paddingTop: spacing.md,
            paddingBottom: Math.max(insets.bottom, spacing.lg) + spacing.sm,
          }}
        >
          <View
            style={{
              width: 44,
              height: 5,
              borderRadius: 3,
              backgroundColor: palette.border,
              alignSelf: 'center',
              marginBottom: spacing.lg,
            }}
          />
          {rows.map((r) => (
            <Tappable
              key={r.key}
              onPress={() => {
                onClose();
                r.onPress();
              }}
              style={{ marginBottom: spacing.md, borderRadius: 20, overflow: 'hidden' }}
            >
              <LinearGradient
                colors={[`${r.color}2e`, `${r.color}12`]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: spacing.md,
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: `${r.color}55`,
                  paddingVertical: 14,
                  paddingLeft: 18,
                  paddingRight: spacing.lg,
                }}
              >
                <View
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: 4,
                    backgroundColor: r.color,
                  }}
                />
                <IconChip name={r.icon} size={64} glyph={34} bg={r.color} color={r.glyphColor ?? palette.background} radius={20} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 18, fontWeight: '800', color: palette.textPrimary }}>{r.title}</Text>
                  <Text style={{ fontSize: 13, color: palette.textSecondary, marginTop: 2 }}>{r.sub}</Text>
                </View>
              </LinearGradient>
            </Tappable>
          ))}
          <Tappable onPress={onClose} style={{ alignItems: 'center', paddingVertical: 10 }}>
            <Text style={{ fontSize: 15, fontWeight: '700', color: palette.textTertiary }}>Cancel</Text>
          </Tappable>
        </View>
      </Tappable>
    </Modal>
  );
}
