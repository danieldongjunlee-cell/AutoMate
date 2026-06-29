import React from 'react';
import Svg, {
  Circle,
  Defs,
  Ellipse,
  G,
  LinearGradient,
  Path,
  RadialGradient,
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
 * "AI Repair Estimate" hero icon: an AI assistant inspecting a car with a
 * magnifying glass, plus AI sparkles. Conveys "AI examines your car" far more
 * clearly than a bare car, and renders fully opaque so it reads as an icon.
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
      </Defs>

      {/* Car (shifted down to leave room for the magnifier overlay). */}
      <G transform="translate(2,22)">
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
        <Path d="M59 19 L59 49" stroke="#9aa3b1" strokeWidth={0.8} />
        <Circle cx="33" cy="51" r="10" fill="#202329" />
        <Circle cx="33" cy="51" r="6" fill="url(#ai-rim)" />
        <Circle cx="33" cy="51" r="2" fill="#3a3f48" />
        <Circle cx="92" cy="51" r="10" fill="#202329" />
        <Circle cx="92" cy="51" r="6" fill="url(#ai-rim)" />
        <Circle cx="92" cy="51" r="2" fill="#3a3f48" />
      </G>

      {/* Magnifying glass inspecting the car. */}
      <Path d="M50 40 L70 60" stroke="#23314d" strokeWidth={9} strokeLinecap="round" />
      <Path d="M50 40 L70 60" stroke="#4a5f86" strokeWidth={4} strokeLinecap="round" />
      <Circle cx="40" cy="30" r="20" fill="url(#ai-lensglass)" stroke="url(#ai-lensrim)" strokeWidth={6} />
      <Circle cx="40" cy="30" r="17" fill="none" stroke="#eaf2ff" strokeWidth={1} opacity={0.7} />
      {/* Glass glare */}
      <Path d="M30 22 Q36 17 45 19" stroke="#ffffff" strokeWidth={2.5} strokeLinecap="round" opacity={0.85} />
      {/* AI sparkle inside the lens (it's "thinking"/analyzing). */}
      <Path d={sparkle(40, 30, 9)} fill="#2e6bff" />
      <Path d={sparkle(40, 30, 4.2)} fill="#ffffff" />

      {/* AI sparkles around the scene. */}
      <Path d={sparkle(100, 14, 6)} fill="#f0b44e" />
      <Path d={sparkle(110, 28, 3.4)} fill="#5b8bff" />
      <Path d={sparkle(64, 10, 3)} fill="#9bc0ff" />
    </Svg>
  );
}
