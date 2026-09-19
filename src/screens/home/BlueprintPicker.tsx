import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Text, View } from 'react-native';
import Svg, { Circle, Defs, G, Path, Pattern, Polygon, RadialGradient, Rect, Stop } from 'react-native-svg';

import { Tappable } from '../../components/Tappable';
import { palette } from '../../theme';
import { BLUEPRINT_CAPTIONS, BLUEPRINT_GROUPS, BLUEPRINT_VB, MARKERS, PART_NAMES, PartKey } from './carBlueprint';

const PANEL_BG = '#070b14';
const CAPTION_H = 38;
const SELECT_FILL = 'rgba(79,227,193,.16)';

/**
 * Blueprint damage picker (canvas "Damage picker"): dark navy panel with a dot
 * grid and a faint teal glow, three line-art views of the car side by side.
 * Each part is a tappable region in exactly one view; the selected region is
 * tinted teal and gets a marker with a pulsing double ring. Nothing is tinted
 * at rest.
 */
export function BlueprintPicker({
  selected,
  done,
  onPick,
}: {
  selected: PartKey | null;
  /** Parts that already have photos (small filled marker). */
  done: ReadonlySet<PartKey>;
  onPick: (key: PartKey) => void;
}) {
  const [width, setWidth] = useState(0);
  const { w: vw, h: vh } = BLUEPRINT_VB;
  const svgH = width ? Math.round((width * vh) / vw) : 0;
  const scale = width ? width / vw : 0;

  return (
    <View
      onLayout={(e) => setWidth(Math.round(e.nativeEvent.layout.width))}
      style={{
        borderRadius: 24,
        backgroundColor: PANEL_BG,
        borderWidth: 1,
        borderColor: palette.border,
        overflow: 'hidden',
        height: svgH ? svgH + CAPTION_H + 8 : 280,
      }}
    >
      {width > 0 ? (
        <>
          {/* Dot grid + teal glow */}
          <Svg width={width} height={svgH + CAPTION_H + 8} style={{ position: 'absolute', left: 0, top: 0 }}>
            <Defs>
              <Pattern id="bp-dots" width={18} height={18} patternUnits="userSpaceOnUse">
                <Circle cx={1} cy={1} r={1} fill="rgba(255,255,255,.07)" />
              </Pattern>
              <RadialGradient id="bp-glow" cx="50%" cy="55%" rx="60%" ry="50%">
                <Stop offset="0" stopColor={palette.teal} stopOpacity={0.09} />
                <Stop offset="1" stopColor={palette.teal} stopOpacity={0} />
              </RadialGradient>
            </Defs>
            <Rect x={0} y={0} width={width} height={svgH + CAPTION_H + 8} fill="url(#bp-glow)" />
            <Rect x={0} y={0} width={width} height={svgH + CAPTION_H + 8} fill="url(#bp-dots)" />
          </Svg>

          {/* Captions */}
          {(['DRIVER SIDE', 'TOP VIEW', 'PASSENGER SIDE'] as const).map((cap, i) => (
            <Text
              key={cap}
              style={{
                position: 'absolute',
                top: 12,
                left: BLUEPRINT_CAPTIONS[i] * width - 60,
                width: 120,
                textAlign: 'center',
                fontSize: 11,
                fontWeight: '800',
                letterSpacing: 1,
                color: palette.textSecondary,
              }}
            >
              {cap}
            </Text>
          ))}

          {/* Line-art + tappable regions */}
          <Svg width={width} height={svgH} viewBox={`0 0 ${vw} ${vh}`} style={{ position: 'absolute', left: 0, top: CAPTION_H }}>
            {BLUEPRINT_GROUPS.map((g) => (
              <G key={g.name} transform={g.transform}>
                {g.lines.map((l, i) => {
                  if (l.t === 'p') {
                    return <Path key={i} d={l.d} fill={l.f} stroke={l.s} strokeWidth={l.w} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />;
                  }
                  if (l.t === 'r') {
                    return <Rect key={i} x={l.x} y={l.y} width={l.w} height={l.h} rx={l.rx} fill={l.f} stroke={l.s} strokeWidth={l.sw} vectorEffect="non-scaling-stroke" />;
                  }
                  return <Circle key={i} cx={l.cx} cy={l.cy} r={l.r} fill={l.f} stroke={l.s} strokeWidth={l.sw} vectorEffect="non-scaling-stroke" />;
                })}
                {g.regions.map((r) => {
                  const on = selected === r.key;
                  const fill = on ? SELECT_FILL : 'rgba(0,0,0,0.001)';
                  return r.circle ? (
                    <Circle key={r.key} cx={r.circle[0]} cy={r.circle[1]} r={r.circle[2]} fill={fill} onPress={() => onPick(r.key)} />
                  ) : (
                    <Polygon key={r.key} points={r.points} fill={fill} onPress={() => onPick(r.key)} />
                  );
                })}
              </G>
            ))}
          </Svg>

          {/* Markers (pixel-positioned so the rings can animate with RN Animated) */}
          {MARKERS.map((m) => (
            <Marker
              key={m.key}
              x={m.x * scale}
              y={m.y * scale + CAPTION_H}
              label={PART_NAMES[m.key]}
              active={selected === m.key}
              done={done.has(m.key)}
              onPress={() => onPick(m.key)}
            />
          ))}
        </>
      ) : null}
    </View>
  );
}

function Marker({ x, y, label, active, done, onPress }: { x: number; y: number; label: string; active: boolean; done: boolean; onPress: () => void }) {
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!active) {
      pulse.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.timing(pulse, { toValue: 1, duration: 1400, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    );
    loop.start();
    return () => loop.stop();
  }, [active, pulse]);

  const ring = (delay: number, size: number) => {
    const t = Animated.modulo(Animated.add(pulse, delay), 1);
    return (
      <Animated.View
        pointerEvents="none"
        style={{
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: 1.3,
          borderColor: palette.teal,
          left: -size / 2,
          top: -size / 2,
          opacity: t.interpolate({ inputRange: [0, 1], outputRange: [0.9, 0] }),
          transform: [{ scale: t.interpolate({ inputRange: [0, 1], outputRange: [0.55, 1.35] }) }],
        }}
      />
    );
  };

  const dot = active ? 14 : done ? 9 : 7;
  const hit = useMemo(() => ({ top: 10, bottom: 10, left: 10, right: 10 }), []);
  return (
    <View pointerEvents="box-none" style={{ position: 'absolute', left: x, top: y, width: 0, height: 0 }}>
      {active ? ring(0, 36) : null}
      {active ? ring(0.5, 24) : null}
      <Tappable
        onPress={onPress}
        hitSlop={hit}
        accessibilityLabel={label}
        accessibilityRole="button"
        noFeedback
        style={{
          position: 'absolute',
          left: -dot / 2,
          top: -dot / 2,
          width: dot,
          height: dot,
          borderRadius: dot / 2,
          backgroundColor: palette.teal,
          opacity: active ? 1 : done ? 0.95 : 0.6,
        }}
      />
    </View>
  );
}
