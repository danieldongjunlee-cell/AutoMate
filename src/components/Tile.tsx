import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, ImageSourcePropType, Platform, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';

import { Icon, IconName } from './Icon';
import { Tappable } from './Tappable';
import { radii, ThemeColors, useTheme } from '../theme';

export type TileVariant = 'navy' | 'steel' | 'teal';

const variantColors = (c: ThemeColors): Record<TileVariant, { bg: string; border: string }> => ({
  navy: { bg: c.tileNavy, border: c.tileNavyBorder },
  steel: { bg: c.tileSteel, border: c.tileSteelBorder },
  teal: { bg: c.tileTeal, border: c.tileTealBorder },
});

/** Tile title: 21/800, kept to two lines so tiles stay 150–168px tall. */
function TileTitle({ children, color }: { children: string; color?: string }) {
  const { colors } = useTheme();
  color = color ?? colors.textPrimary;
  return (
    <Text
      numberOfLines={2}
      style={{ fontSize: 21, lineHeight: 25, fontWeight: '800', color, letterSpacing: -0.2 }}
    >
      {children}
    </Text>
  );
}

/**
 * Navy-blend action tile (redesign canvas): 24px radius, title top-left,
 * optional outline-icon chip bottom-right. Three surface variants so a row of
 * tiles reads as one family without looking identical.
 */
export function Tile({
  title,
  variant = 'navy',
  icon,
  iconColor,
  onPress,
  height = 156,
  style,
  children,
}: {
  title: string;
  variant?: TileVariant;
  icon?: IconName;
  iconColor?: string;
  onPress?: () => void;
  height?: number;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}) {
  const { colors } = useTheme();
  const v = variantColors(colors)[variant];
  return (
    <Tappable
      onPress={onPress}
      disabled={!onPress}
      style={[
        {
          minHeight: height,
          borderRadius: radii.tile,
          backgroundColor: v.bg,
          borderWidth: 1,
          borderColor: v.border,
          padding: 16,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <TileTitle>{title}</TileTitle>
      {children}
      {icon ? (
        <View
          style={{
            position: 'absolute',
            right: 14,
            bottom: 14,
            width: 50,
            height: 50,
            borderRadius: 14,
            backgroundColor: colors.chip,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name={icon} size={28} color={iconColor ?? colors.textPrimary} />
        </View>
      ) : null}
    </Tappable>
  );
}

/**
 * Scan overlay for the photo tiles: while the tile is hovered (or being
 * pressed on touch), a teal laser line sweeps top → bottom on a faint grid,
 * like the damage-scanner animation on the AutoMate site.
 */
function ScanOverlay({ active, height }: { active: boolean; height: number }) {
  const y = useRef(new Animated.Value(0)).current;
  const fade = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fade, { toValue: active ? 1 : 0, duration: 220, useNativeDriver: Platform.OS !== 'web' }).start();
    if (!active) return;
    y.setValue(0);
    const loop = Animated.loop(Animated.timing(y, { toValue: 1, duration: 1500, easing: Easing.inOut(Easing.sin), useNativeDriver: Platform.OS !== 'web' }));
    loop.start();
    return () => loop.stop();
  }, [active, y, fade]);
  const lines = Array.from({ length: Math.max(1, Math.round(height / 22)) }, (_, i) => i);
  return (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { opacity: fade }]}>
      {/* Grid */}
      {lines.map((i) => (
        <View key={`h${i}`} style={{ position: 'absolute', left: 0, right: 0, top: i * 22, height: 1, backgroundColor: 'rgba(79,227,193,0.14)' }} />
      ))}
      {[0.2, 0.4, 0.6, 0.8].map((x) => (
        <View key={`v${x}`} style={{ position: 'absolute', top: 0, bottom: 0, left: `${x * 100}%`, width: 1, backgroundColor: 'rgba(79,227,193,0.12)' }} />
      ))}
      {/* Sweeping laser line + glow */}
      <Animated.View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          height: 26,
          transform: [{ translateY: y.interpolate({ inputRange: [0, 1], outputRange: [-26, height] }) }],
        }}
      >
        <LinearGradient colors={['rgba(79,227,193,0)', 'rgba(79,227,193,0.35)']} style={{ height: 22 }} />
        <View style={{ height: 2, backgroundColor: '#4FE3C1', shadowColor: '#4FE3C1', shadowOpacity: 0.9, shadowRadius: 8, shadowOffset: { width: 0, height: 0 } }} />
      </Animated.View>
      {/* Corner brackets */}
      {[
        { top: 10, left: 10, borderTopWidth: 2, borderLeftWidth: 2 },
        { top: 10, right: 10, borderTopWidth: 2, borderRightWidth: 2 },
        { bottom: 10, left: 10, borderBottomWidth: 2, borderLeftWidth: 2 },
        { bottom: 10, right: 10, borderBottomWidth: 2, borderRightWidth: 2 },
      ].map((st, i) => (
        <View key={i} style={{ position: 'absolute', width: 16, height: 16, borderColor: '#4FE3C1', ...st }} />
      ))}
    </Animated.View>
  );
}

/** Dark ground behind the tile photos so a contained photo letterboxes cleanly. */
const TILE_GROUND = '#0a1020';
const SCAN_TEAL = '#4FE3C1';
const SERVICE_AMBER = '#F0B44E';

/**
 * Maintenance tile overlay: a service check running, the gauge sweeps, the
 * dashboard warning lights self-test in sequence and a gear turns, all in the
 * amber of a service light.
 */
function ServiceOverlay({ active, height }: { active: boolean; height: number }) {
  const spin = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;
  const fade = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fade, { toValue: active ? 1 : 0, duration: 220, useNativeDriver: Platform.OS !== 'web' }).start();
    if (!active) return;
    spin.setValue(0);
    pulse.setValue(0);
    const loops = [
      Animated.loop(Animated.timing(spin, { toValue: 1, duration: 2600, easing: Easing.linear, useNativeDriver: Platform.OS !== 'web' })),
      Animated.loop(Animated.timing(pulse, { toValue: 3, duration: 1800, easing: Easing.linear, useNativeDriver: Platform.OS !== 'web' })),
    ];
    loops.forEach((l) => l.start());
    return () => loops.forEach((l) => l.stop());
  }, [active, spin, pulse, fade]);

  /** One warning light in the self-test row; each lights in turn. */
  const lamp = (i: number, icon: IconName) => (
    <Animated.View
      key={icon}
      style={{
        opacity: pulse.interpolate({ inputRange: [i - 0.6, i, i + 0.6, 3], outputRange: [0.25, 1, 0.25, 0.25], extrapolate: 'clamp' }),
      }}
    >
      <Icon name={icon} size={18} color={SERVICE_AMBER} strokeWidth={2} />
    </Animated.View>
  );

  return (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { opacity: fade }]}>
      {/* Sweep across the dial, like a needle test */}
      <LinearGradient
        colors={['rgba(240,180,78,0)', 'rgba(240,180,78,0.16)', 'rgba(240,180,78,0)']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={StyleSheet.absoluteFill}
      />
      {/* Turning gear */}
      <Animated.View
        style={{
          position: 'absolute',
          top: 12,
          right: 12,
          transform: [{ rotate: spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }],
        }}
      >
        <Icon name="gear" size={26} color={SERVICE_AMBER} strokeWidth={1.8} />
      </Animated.View>
      {/* Warning-light self test */}
      <View style={{ position: 'absolute', left: 14, top: 14, flexDirection: 'row', gap: 10 }}>
        {[lamp(0, 'oil'), lamp(1, 'brake'), lamp(2, 'battery')]}
      </View>
      {/* Service-check frame */}
      {[
        { top: 8, left: 8, borderTopWidth: 2, borderLeftWidth: 2 },
        { top: 8, right: 8, borderTopWidth: 2, borderRightWidth: 2 },
        { bottom: 8, left: 8, borderBottomWidth: 2, borderLeftWidth: 2 },
        { bottom: 8, right: 8, borderBottomWidth: 2, borderRightWidth: 2 },
      ].map((st, i) => (
        <View key={i} style={{ position: 'absolute', width: 14, height: 14, borderColor: SERVICE_AMBER, ...st }} />
      ))}
      <View style={{ position: 'absolute', left: 0, right: 0, bottom: height * 0.26, height: 1, backgroundColor: 'rgba(240,180,78,0.35)' }} />
    </Animated.View>
  );
}

/**
 * Photo tile: the photo on a dark ground with a bottom gradient so the title
 * stays legible. `fit` picks cover (fill the tile, crop the overflow) or
 * contain (show the whole photo). Hovering (web) or holding (touch) plays the
 * tile's animation, the damage scan, or the maintenance service check.
 */
export function PhotoTile({
  title,
  source,
  onPress,
  height = 168,
  fit = 'contain',
  effect = 'scan',
  style,
}: {
  title: string;
  source: ImageSourcePropType;
  onPress?: () => void;
  height?: number;
  /** cover fills the tile (top/bottom cropped); contain shows the whole photo. */
  fit?: 'cover' | 'contain';
  effect?: 'scan' | 'service';
  style?: StyleProp<ViewStyle>;
}) {
  const { colors } = useTheme();
  const [active, setActive] = useState(false);
  const accent = effect === 'service' ? SERVICE_AMBER : SCAN_TEAL;
  return (
    <Tappable
      onPress={onPress}
      disabled={!onPress}
      onHoverIn={() => setActive(true)}
      onHoverOut={() => setActive(false)}
      onPressIn={() => setActive(true)}
      onPressOut={() => Platform.OS !== 'web' && setActive(false)}
      noFeedback
      style={[
        {
          height,
          borderRadius: radii.tile,
          backgroundColor: TILE_GROUND,
          borderWidth: 1,
          borderColor: active ? accent : colors.tileNavyBorder,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      {/* The photo, a touch transparent so it sits back behind the label. */}
      <Image source={source} resizeMode={fit} style={[StyleSheet.absoluteFill, { width: '100%', height: '100%', opacity: 0.88 }]} />
      <LinearGradient
        colors={['rgba(10,16,32,0)', 'rgba(10,16,32,0.3)', 'rgba(10,16,32,0.9)']}
        locations={[0, 0.55, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={{ flex: 1, justifyContent: 'flex-end', padding: 16 }}
      >
        <TileTitle color="#e8edf5">{title}</TileTitle>
      </LinearGradient>
      {effect === 'service' ? <ServiceOverlay active={active} height={height} /> : <ScanOverlay active={active} height={height} />}
    </Tappable>
  );
}
