import React from 'react';
import Svg, {
  Circle,
  Defs,
  Ellipse,
  G,
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
 * "AI Repair Estimate" hero icon: a 3D robot inspecting a car through the AI
 * magnifying glass. Metallic gradients + rim lights + glowing visor sell the
 * 3D read at icon size. Renders fully opaque so it reads as an icon.
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
        {/* Robot shell: brushed white metal, lit from the upper left. */}
        <LinearGradient id="ai-robo" x1="0" y1="0" x2="0.6" y2="1">
          <Stop offset="0" stopColor="#ffffff" />
          <Stop offset="0.45" stopColor="#dde3ec" />
          <Stop offset="1" stopColor="#93a0b2" />
        </LinearGradient>
        <LinearGradient id="ai-robo-limb" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#b8c1cf" />
          <Stop offset="1" stopColor="#5f6875" />
        </LinearGradient>
        <LinearGradient id="ai-visor" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#1c2740" />
          <Stop offset="1" stopColor="#070c18" />
        </LinearGradient>
        <RadialGradient id="ai-eye" cx="0.5" cy="0.5" r="0.5">
          <Stop offset="0" stopColor="#d9fdff" />
          <Stop offset="0.55" stopColor="#2ee6ff" />
          <Stop offset="1" stopColor="#0b8fb0" />
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

      {/* 3D robot inspector, standing in front of the car. */}
      <G>
        <Ellipse cx="19" cy="82" rx="16" ry="3" fill="#000" opacity={0.18} />
        {/* Legs + feet */}
        <Rect x="10" y="52" width="7" height="24" rx="3.5" fill="url(#ai-robo-limb)" />
        <Rect x="21" y="52" width="7" height="24" rx="3.5" fill="url(#ai-robo-limb)" />
        <Rect x="7.5" y="74" width="11" height="6" rx="3" fill="#3a4250" />
        <Rect x="19.5" y="74" width="11" height="6" rx="3" fill="#3a4250" />
        {/* Torso with glowing chest core */}
        <Rect x="6" y="28" width="26" height="26" rx="6" fill="url(#ai-robo)" stroke="#7e8694" strokeWidth={0.6} />
        <Path d="M8 31 Q19 27.5 30 31" stroke="#ffffff" strokeWidth={1.4} strokeLinecap="round" opacity={0.8} />
        <Rect x="11" y="33" width="16" height="10" rx="3" fill="url(#ai-visor)" />
        <Circle cx="19" cy="38" r="2.4" fill="url(#ai-eye)" />
        {/* Neck + antenna + head */}
        <Rect x="16.5" y="24.5" width="5" height="4" rx="1.5" fill="#8f9aab" />
        <Path d="M19 7 L19 3.4" stroke="#8f9aab" strokeWidth={1.4} strokeLinecap="round" />
        <Circle cx="19" cy="2.6" r="1.9" fill="url(#ai-eye)" />
        <Rect x="7" y="6" width="24" height="19" rx="7" fill="url(#ai-robo)" stroke="#7e8694" strokeWidth={0.6} />
        {/* Ear caps */}
        <Circle cx="7" cy="15.5" r="2.2" fill="url(#ai-rim)" />
        <Circle cx="31" cy="15.5" r="2.2" fill="url(#ai-rim)" />
        {/* Visor + glowing eyes */}
        <Rect x="10" y="11" width="18" height="10" rx="5" fill="url(#ai-visor)" />
        <Circle cx="15.5" cy="16" r="2.3" fill="url(#ai-eye)" />
        <Circle cx="22.5" cy="16" r="2.3" fill="url(#ai-eye)" />
        <Path d="M12 13 Q19 11.4 26 13" stroke="#ffffff" strokeWidth={1} strokeLinecap="round" opacity={0.5} />
        {/* Head rim light */}
        <Path d="M9.5 9.5 Q19 5.8 28.5 9.5" stroke="#ffffff" strokeWidth={1.4} strokeLinecap="round" opacity={0.85} />
        {/* Arm reaching out to hold the magnifier */}
        <Circle cx="30" cy="33" r="3.6" fill="url(#ai-rim)" />
        <Path d="M31 34 Q34 38 37.5 39.6" stroke="#23314d" strokeWidth={5} strokeLinecap="round" />
        <Path d="M31 34 Q34 38 37.5 39.6" stroke="#4a5f86" strokeWidth={2} strokeLinecap="round" />
      </G>

      {/* Magnifying glass, gripped by the robot, inspecting the car. */}
      <Path d="M42.5 37.5 L39 39.6" stroke="#23314d" strokeWidth={8} strokeLinecap="round" />
      <Path d="M42.5 37.5 L39 39.6" stroke="#4a5f86" strokeWidth={3.5} strokeLinecap="round" />
      {/* Gripping hand over the handle */}
      <Circle cx="38.4" cy="40" r="3.4" fill="#2b3550" />
      <Circle cx="38.4" cy="40" r="1.7" fill="#5c6f96" />
      <Circle cx="56" cy="30" r="16" fill="url(#ai-lensglass)" stroke="url(#ai-lensrim)" strokeWidth={5.5} />
      <Circle cx="56" cy="30" r="13.4" fill="none" stroke="#eaf2ff" strokeWidth={1} opacity={0.7} />
      {/* Glass glare */}
      <Path d="M48 23.5 Q53 19.5 60.5 21" stroke="#ffffff" strokeWidth={2.2} strokeLinecap="round" opacity={0.85} />
      {/* AI sparkle inside the lens (it's "thinking"/analyzing). */}
      <Path d={sparkle(56, 30, 8)} fill="#2e6bff" />
      <Path d={sparkle(56, 30, 3.8)} fill="#ffffff" />

      {/* AI sparkles around the scene. */}
      <Path d={sparkle(100, 14, 6)} fill="#f0b44e" />
      <Path d={sparkle(110, 28, 3.4)} fill="#5b8bff" />
      <Path d={sparkle(74, 8, 3)} fill="#9bc0ff" />
    </Svg>
  );
}
