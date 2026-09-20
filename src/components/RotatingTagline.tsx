import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Platform, Text, View } from 'react-native';

import { useTheme } from '../theme';

/** Each line: a plain first row, then an indented accent row in the app blue. */
export interface TaglineLine {
  lead: string;
  accent: string;
}

const LINES: TaglineLine[] = [
  { lead: 'Everyone deserves a', accent: 'Fair Price' },
  { lead: 'Stop Searching for', accent: 'Auto Shops' },
  { lead: 'We Find You the', accent: 'Best Price' },
];

const HOLD_MS = 2400;
const SLIDE_MS = 440;
/** How far the accent row is indented under its lead row. */
const INDENT = 18;

/**
 * Home header tagline: shows one two-row line at a time — a plain lead and an
 * indented blue accent — holding for a moment, then scrolling it up and out
 * while the next line scrolls in from below.
 */
export function RotatingTagline({ lines = LINES, size = 21 }: { lines?: TaglineLine[]; size?: number }) {
  const { colors } = useTheme();
  const [i, setI] = useState(0);
  /** 0 = below and clear, 1 = resting, 2 = above and clear. */
  const phase = useRef(new Animated.Value(1)).current;
  const rowH = Math.round(size * 1.22);
  const blockH = rowH * 2;

  useEffect(() => {
    let cancelled = false;
    phase.setValue(0);
    // Slide in from below, hold, then slide up and out; swap and repeat.
    Animated.sequence([
      Animated.timing(phase, { toValue: 1, duration: SLIDE_MS, easing: Easing.out(Easing.cubic), useNativeDriver: Platform.OS !== 'web' }),
      Animated.delay(HOLD_MS),
      Animated.timing(phase, { toValue: 2, duration: SLIDE_MS, easing: Easing.in(Easing.cubic), useNativeDriver: Platform.OS !== 'web' }),
    ]).start(({ finished }) => {
      if (finished && !cancelled) setI((n) => (n + 1) % lines.length);
    });
    return () => {
      cancelled = true;
    };
  }, [i, lines.length, phase]);

  const line = lines[i];
  const base = { fontSize: size, lineHeight: rowH, fontWeight: '800' as const, letterSpacing: -0.3 };
  return (
    <View style={{ height: blockH, overflow: 'hidden' }} accessibilityRole="header" accessibilityLabel={`${line.lead} ${line.accent}`}>
      <Animated.View
        style={{
          opacity: phase.interpolate({ inputRange: [0, 1, 2], outputRange: [0, 1, 0] }),
          transform: [{ translateY: phase.interpolate({ inputRange: [0, 1, 2], outputRange: [rowH * 0.7, 0, -rowH * 0.7] }) }],
        }}
      >
        <Text style={[base, { height: rowH, color: colors.textPrimary }]} numberOfLines={1}>
          {line.lead}
        </Text>
        <Text style={[base, { height: rowH, color: colors.primary, marginLeft: INDENT }]} numberOfLines={1}>
          {line.accent}
        </Text>
      </Animated.View>
    </View>
  );
}
