import React from 'react';
import Svg, {
  Circle,
  Defs,
  Ellipse,
  G,
  Line,
  LinearGradient,
  Path,
  RadialGradient,
  Rect,
  Stop,
} from 'react-native-svg';

/** 4-point "AI" sparkle/star centered at (cx,cy). */
function sparkle(cx: number, cy: number, s: number) {
  const a = s * 0.28;
  return (
    `M${cx} ${cy - s} L${cx + a} ${cy - a} L${cx + s} ${cy} L${cx + a} ${cy + a} ` +
    `L${cx} ${cy + s} L${cx - a} ${cy + a} L${cx - s} ${cy} L${cx - a} ${cy - a} Z`
  );
}

/**
 * "AI Repair Estimate" hero icon: a friendly AI robot holding a magnifying
 * glass to examine the car. Renders fully opaque so it reads as an icon.
 */
export function AiInspectLogo({ size = 120, opacity = 1 }: { size?: number; opacity?: number }) {
  const height = size * 0.74;
  return (
    <Svg width={size} height={height} viewBox="0 0 120 88" opacity={opacity}>
      <Defs>
        <LinearGradient id="ai-body" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#ffffff" />
          <Stop offset="0.35" stopColor="#dfe4ec" />
          <Stop offset="0.7" stopColor="#b3bbc8" />
          <Stop offset="1" stopColor="#828c9c" />
        </LinearGradient>
        <LinearGradient id="ai-gloss" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#ffffff" stopOpacity="0.9" />
          <Stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </LinearGradient>
        <LinearGradient id="ai-glass" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#cfe0f2" />
          <Stop offset="1" stopColor="#5a6b86" />
        </LinearGradient>
        <RadialGradient id="ai-rim" cx="0.5" cy="0.5" r="0.5">
          <Stop offset="0" stopColor="#eef1f5" />
          <Stop offset="0.6" stopColor="#aab2bf" />
          <Stop offset="1" stopColor="#6a7686" />
        </RadialGradient>
        {/* Magnifier ring: bright blue metal so the lens reads as the AI tool. */}
        <LinearGradient id="ai-lensrim" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#5b8bff" />
          <Stop offset="1" stopColor="#1f49c4" />
        </LinearGradient>
        <RadialGradient id="ai-lensglass" cx="0.4" cy="0.35" r="0.7">
          <Stop offset="0" stopColor="#eaf2ff" stopOpacity="0.55" />
          <Stop offset="1" stopColor="#8fb4ff" stopOpacity="0.22" />
        </RadialGradient>
        {/* Robot body: glossy blue metal. */}
        <LinearGradient id="ai-robot" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#7aa6ff" />
          <Stop offset="1" stopColor="#2747b8" />
        </LinearGradient>
      </Defs>

      {/* Car (smaller, lower-left) — the thing being examined. */}
      <G transform="translate(-4,28) scale(0.88)">
        <Ellipse cx="61" cy="62" rx="52" ry="6" fill="#000" opacity={0.18} />
        <Path
          d="M4 46 C4 38 9 35 18 34 L30 21 C34 16 40 14 49 14 L74 14 C86 14 92 18 98 28 L111 32 C117 34 118 39 118 45 L118 48 C118 50 116 51 113 51 L9 51 C6 51 4 49 4 47 Z"
          fill="url(#ai-body)"
          stroke="#7e8694"
          strokeWidth={0.8}
        />
        <Path
          d="M10 40 C12 36 18 35 24 35 L34 24 C38 20 44 18 51 18 L73 18 C82 18 88 21 92 27 C70 25 40 27 10 40 Z"
          fill="url(#ai-gloss)"
          opacity={0.55}
        />
        <Path d="M33 24 L47 19 L57 19 L57 31 L31 31 Z" fill="url(#ai-glass)" />
        <Path d="M61 19 L73 19 C81 19 86 22 90 30 L61 31 Z" fill="url(#ai-glass)" />
        <Circle cx="33" cy="51" r="10" fill="#202329" />
        <Circle cx="33" cy="51" r="6" fill="url(#ai-rim)" />
        <Circle cx="33" cy="51" r="2" fill="#3a3f48" />
        <Circle cx="92" cy="51" r="10" fill="#202329" />
        <Circle cx="92" cy="51" r="6" fill="url(#ai-rim)" />
        <Circle cx="92" cy="51" r="2" fill="#3a3f48" />
      </G>

      {/* Robot arm reaching from the robot to grip the magnifier handle. */}
      <Path d="M84 62 L74 63 L63 60" stroke="url(#ai-robot)" strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {/* Robot hand/claw gripping the handle. */}
      <Circle cx="62" cy="60" r="4" fill="url(#ai-robot)" stroke="#1f3a8a" strokeWidth={0.6} />

      {/* Magnifying glass examining the car. */}
      <Path d="M47 48 L63 60" stroke="#23314d" strokeWidth={8} strokeLinecap="round" />
      <Path d="M47 48 L63 60" stroke="#4a5f86" strokeWidth={3.5} strokeLinecap="round" />
      <Circle cx="36" cy="40" r="17" fill="url(#ai-lensglass)" stroke="url(#ai-lensrim)" strokeWidth={5.5} />
      <Circle cx="36" cy="40" r="14" fill="none" stroke="#eaf2ff" strokeWidth={1} opacity={0.7} />
      <Path d="M27 33 Q33 28 41 30" stroke="#ffffff" strokeWidth={2.2} strokeLinecap="round" opacity={0.85} />

      {/* Robot — head + body holding the magnifier, on the right. */}
      <Rect x="84" y="52" width="24" height="26" rx="6" fill="url(#ai-robot)" stroke="#1f3a8a" strokeWidth={0.8} />
      <Circle cx="96" cy="64" r="3" fill="#bcd6ff" />
      <Rect x="87" y="33" width="18" height="19" rx="6" fill="url(#ai-robot)" stroke="#1f3a8a" strokeWidth={0.8} />
      {/* Antenna */}
      <Line x1="96" y1="33" x2="96" y2="27" stroke="#7aa6ff" strokeWidth={1.6} strokeLinecap="round" />
      <Circle cx="96" cy="26" r="2" fill="#f0b44e" />
      {/* Eyes + smile */}
      <Circle cx="92" cy="42" r="2.7" fill="#eaf2ff" />
      <Circle cx="92" cy="42" r="1.1" fill="#1f49c4" />
      <Circle cx="101" cy="42" r="2.7" fill="#eaf2ff" />
      <Circle cx="101" cy="42" r="1.1" fill="#1f49c4" />
      <Path d="M92 47 Q96.5 49.5 101 47" stroke="#dfeaff" strokeWidth={1.4} strokeLinecap="round" fill="none" />

      {/* AI sparkles. */}
      <Path d={sparkle(58, 12, 5)} fill="#f0b44e" />
      <Path d={sparkle(110, 20, 3.4)} fill="#5b8bff" />
      <Path d={sparkle(16, 16, 3)} fill="#9bc0ff" />
    </Svg>
  );
}
