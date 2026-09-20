import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Platform, Text, View } from 'react-native';

import { useTheme } from '../theme';

const LINES = ['Everyone deserves a fair price', 'Stop searching', 'We find them'];
const HOLD_MS = 2200;
const SLIDE_MS = 420;

/**
 * Home header tagline: shows one line at a time, holding for a moment, then
 * scrolling it up and out while the next line scrolls in from below.
 */
export function RotatingTagline({ lines = LINES, size = 20 }: { lines?: string[]; size?: number }) {
  const { colors } = useTheme();
  const [i, setI] = useState(0);
  // 0 = current line resting; 1 = current line gone up, next line arrived.
  const t = useRef(new Animated.Value(0)).current;
  // Each line may wrap to two rows ("Everyone deserves a fair price" on a phone).
  const lineH = Math.round(size * 1.25) * 2;

  useEffect(() => {
    let cancelled = false;
    const hold = setTimeout(() => {
      Animated.timing(t, { toValue: 1, duration: SLIDE_MS, easing: Easing.inOut(Easing.cubic), useNativeDriver: Platform.OS !== 'web' }).start(() => {
        if (cancelled) return;
        t.setValue(0);
        setI((n) => (n + 1) % lines.length);
      });
    }, HOLD_MS);
    return () => {
      cancelled = true;
      clearTimeout(hold);
    };
  }, [i, lines.length, t]);

  const current = lines[i];
  const next = lines[(i + 1) % lines.length];
  const style = { fontSize: size, lineHeight: Math.round(size * 1.25), fontWeight: '800' as const, letterSpacing: -0.3, color: colors.textPrimary };
  return (
    <View style={{ height: lineH, overflow: 'hidden', justifyContent: 'flex-start' }} accessibilityLabel={current} accessibilityRole="header">
      <Animated.View style={{ transform: [{ translateY: t.interpolate({ inputRange: [0, 1], outputRange: [0, -lineH] }) }] }}>
        <Text style={[style, { height: lineH }]} numberOfLines={2}>
          {current}
        </Text>
        <Text style={[style, { height: lineH }]} numberOfLines={2}>
          {next}
        </Text>
      </Animated.View>
    </View>
  );
}
