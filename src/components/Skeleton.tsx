import React, { useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  Modal,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';

import { radii, spacing, useTheme } from '../theme';

/** Shared looping pulse (0.45 → 1 → 0.45 opacity) for all skeleton blocks. */
function usePulse() {
  const pulse = useRef(new Animated.Value(0.45)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 650,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.45,
          duration: 650,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);
  return pulse;
}

/** Single animated placeholder block (theme-aware). */
export function Skeleton({
  width,
  height = 14,
  radius = radii.sm,
  style,
}: {
  width?: number | `${number}%`;
  height?: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const { colors } = useTheme();
  const pulse = usePulse();
  return (
    <Animated.View
      style={[
        {
          width: width ?? '100%',
          height,
          borderRadius: radius,
          backgroundColor: colors.surfaceAlt,
          opacity: pulse,
        },
        style,
      ]}
    />
  );
}

/** List-row skeleton: leading circle + two text lines (notifications, history). */
export function SkeletonRow() {
  const { colors } = useTheme();
  const pulse = usePulse();
  return (
    <Animated.View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        paddingVertical: spacing.sm,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: colors.divider,
        opacity: pulse,
      }}
    >
      <View
        style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surfaceAlt }}
      />
      <View style={{ flex: 1, gap: 7 }}>
        <View
          style={{ width: '62%', height: 13, borderRadius: 6, backgroundColor: colors.surfaceAlt }}
        />
        <View
          style={{ width: '38%', height: 11, borderRadius: 6, backgroundColor: colors.surfaceAlt }}
        />
      </View>
    </Animated.View>
  );
}

/** Card skeleton shaped like quote/post/policy cards: header row + body + action bar. */
export function SkeletonCard({ tall }: { tall?: boolean }) {
  const { colors } = useTheme();
  const pulse = usePulse();
  return (
    <Animated.View
      style={{
        backgroundColor: colors.surface,
        borderRadius: radii.md,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.border,
        padding: spacing.md,
        marginBottom: spacing.sm,
        opacity: pulse,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
        <View
          style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surfaceAlt }}
        />
        <View style={{ flex: 1, gap: 7 }}>
          <View
            style={{ width: '52%', height: 13, borderRadius: 6, backgroundColor: colors.surfaceAlt }}
          />
          <View
            style={{ width: '34%', height: 11, borderRadius: 6, backgroundColor: colors.surfaceAlt }}
          />
        </View>
        <View
          style={{ width: 54, height: 20, borderRadius: 6, backgroundColor: colors.surfaceAlt }}
        />
      </View>
      <View
        style={{
          height: tall ? 84 : 34,
          borderRadius: radii.sm,
          backgroundColor: colors.surfaceAlt,
          marginVertical: spacing.sm,
        }}
      />
      <View style={{ flexDirection: 'row', gap: 6 }}>
        <View
          style={{ flex: 1, height: 32, borderRadius: radii.sm, backgroundColor: colors.surfaceAlt }}
        />
        <View
          style={{ width: 90, height: 32, borderRadius: radii.sm, backgroundColor: colors.surfaceAlt }}
        />
      </View>
    </Animated.View>
  );
}

/** N skeletons of one shape — `variant="card"` for cards, `"row"` for list rows. */
export function SkeletonList({
  count = 3,
  variant = 'row',
  tall,
}: {
  count?: number;
  variant?: 'row' | 'card';
  tall?: boolean;
}) {
  return (
    <View>
      {Array.from({ length: count }).map((_, i) =>
        variant === 'card' ? <SkeletonCard key={i} tall={tall} /> : <SkeletonRow key={i} />,
      )}
    </View>
  );
}

/**
 * Full-screen blocking overlay for in-flight payments/bookings: dims the
 * screen and swallows every tap so double-submits are impossible.
 */
export function ProcessingOverlay({ visible, label }: { visible: boolean; label?: string }) {
  const { colors } = useTheme();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={() => {}}>
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,.45)',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <View
          style={{
            backgroundColor: colors.card,
            borderRadius: radii.md,
            paddingHorizontal: spacing.xl,
            paddingVertical: spacing.lg,
            alignItems: 'center',
            gap: spacing.sm,
            minWidth: 200,
          }}
        >
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textPrimary }}>
            {label ?? 'Processing…'}
          </Text>
          <Text style={{ fontSize: 13, color: colors.textTertiary }}>Don't close the app</Text>
        </View>
      </View>
    </Modal>
  );
}
