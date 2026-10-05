import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Platform, StyleProp, View, ViewStyle } from 'react-native';
import Svg, { Circle, Defs, G, LinearGradient, RadialGradient, Rect, Stop } from 'react-native-svg';

import { useTheme } from '../theme';

/** Drop-in for ActivityIndicator's `size` prop. */
type SpinnerSize = 'small' | 'large' | number;
const SIZE: Record<'small' | 'large', number> = { small: 22, large: 56 };

/**
 * An alloy wheel: tire with tread, five-spoke rim, hub with lug nuts and a
 * centre cap in the accent colour. Drawn once; the parent view spins it.
 */
function AlloyWheel({ size, accent }: { size: number; accent: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <RadialGradient id="rim" cx="40%" cy="35%" r="70%">
          <Stop offset="0" stopColor="#f4f6f9" />
          <Stop offset="0.6" stopColor="#c3cad6" />
          <Stop offset="1" stopColor="#8d97a8" />
        </RadialGradient>
        <LinearGradient id="spoke" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor="#8d97a8" />
          <Stop offset="0.5" stopColor="#eef1f5" />
          <Stop offset="1" stopColor="#8d97a8" />
        </LinearGradient>
        <RadialGradient id="tire" cx="50%" cy="50%" r="50%">
          <Stop offset="0.78" stopColor="#15181e" />
          <Stop offset="1" stopColor="#2b3039" />
        </RadialGradient>
      </Defs>
      {/* Tire and tread blocks */}
      <Circle cx="50" cy="50" r="49" fill="url(#tire)" />
      <Circle cx="50" cy="50" r="45" fill="none" stroke="#3a404b" strokeWidth="5" strokeDasharray="5 4.4" />
      <Circle cx="50" cy="50" r="40.5" fill="none" stroke="#0e1116" strokeWidth="1.2" />
      {/* Rim face, dish and lip */}
      <Circle cx="50" cy="50" r="38" fill="url(#rim)" />
      <Circle cx="50" cy="50" r="31" fill="#2f3542" />
      <Circle cx="50" cy="50" r="36" fill="none" stroke="#6f7a8c" strokeWidth="1" />
      {/* Five spokes */}
      {[0, 72, 144, 216, 288].map((deg) => (
        <G key={deg} rotation={deg} origin="50, 50">
          <Rect x="44.5" y="14" width="11" height="38" rx="5" fill="url(#spoke)" />
        </G>
      ))}
      {/* Hub, lug nuts, centre cap */}
      <Circle cx="50" cy="50" r="11" fill="#d7dde6" stroke="#8d97a8" strokeWidth="1" />
      {[0, 72, 144, 216, 288].map((deg) => (
        <G key={deg} rotation={deg} origin="50, 50">
          <Circle cx="50" cy="42.5" r="1.8" fill="#6f7a8c" />
        </G>
      ))}
      <Circle cx="50" cy="50" r="4.6" fill={accent} />
    </Svg>
  );
}

/**
 * Loading indicator: a car wheel rolling along a short stretch of road. Same
 * `size` / `color` props as ActivityIndicator so it drops in anywhere; the
 * colour tints the centre cap. Below ~28 px (inline in a button) only the
 * spinning wheel is drawn.
 */
export function Spinner({ size = 'small', color, style }: { size?: SpinnerSize; color?: string; style?: StyleProp<ViewStyle> }) {
  const { colors } = useTheme();
  const px = typeof size === 'number' ? size : SIZE[size];
  const accent = color ?? colors.primary;
  const spin = useRef(new Animated.Value(0)).current;
  const road = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const native = Platform.OS !== 'web';
    const loops = [
      Animated.loop(Animated.timing(spin, { toValue: 1, duration: 1100, easing: Easing.linear, useNativeDriver: native })),
      // Road dashes slide back at the wheel's rim speed (one dash period per 1/5 turn).
      Animated.loop(Animated.timing(road, { toValue: 1, duration: 220, easing: Easing.linear, useNativeDriver: native })),
    ];
    loops.forEach((l) => l.start());
    return () => loops.forEach((l) => l.stop());
  }, [spin, road]);

  const withRoad = px >= 28;
  const dash = px * 0.34;
  const gap = px * 0.2;
  const period = dash + gap;
  const roadWidth = px * 2.2;
  const dashes = Math.ceil(roadWidth / period) + 1;

  return (
    <View style={[{ alignItems: 'center', justifyContent: 'center' }, style]} accessibilityRole="progressbar" accessibilityLabel="Loading">
      <Animated.View style={{ width: px, height: px, transform: [{ rotate: spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }] }}>
        <AlloyWheel size={px} accent={accent} />
      </Animated.View>
      {withRoad ? (
        <View style={{ width: roadWidth, height: px * 0.08, marginTop: px * 0.08, overflow: 'hidden', borderRadius: px * 0.04 }}>
          <Animated.View
            style={{
              flexDirection: 'row',
              gap,
              transform: [{ translateX: road.interpolate({ inputRange: [0, 1], outputRange: [0, -period] }) }],
            }}
          >
            {Array.from({ length: dashes }, (_, i) => (
              <View key={i} style={{ width: dash, height: '100%', borderRadius: px * 0.04, backgroundColor: colors.textTertiary, opacity: 0.55 }} />
            ))}
          </Animated.View>
        </View>
      ) : null}
    </View>
  );
}
