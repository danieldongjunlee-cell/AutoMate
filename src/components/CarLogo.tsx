import React from 'react';
import Svg, { Circle, Defs, Ellipse, LinearGradient, Path, RadialGradient, Stop } from 'react-native-svg';

/**
 * 3D-style silver-sedan logo for the "Get an AI Repair Estimate" action.
 * Glossy body gradient + highlight, a soft ground shadow, reflective glass and
 * metallic wheels give it a rendered, three-dimensional look.
 */
export function CarLogo({ size = 120, opacity = 1 }: { size?: number; opacity?: number }) {
  const height = size * 0.56;
  return (
    <Svg width={size} height={height} viewBox="0 0 120 68" opacity={opacity}>
      <Defs>
        {/* Body: top light → mid silver → bottom shadow, for rounded volume. */}
        <LinearGradient id="cl-body" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#ffffff" />
          <Stop offset="0.35" stopColor="#dfe4ec" />
          <Stop offset="0.7" stopColor="#b3bbc8" />
          <Stop offset="1" stopColor="#828c9c" />
        </LinearGradient>
        {/* Glossy reflection highlight across the upper body. */}
        <LinearGradient id="cl-gloss" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#ffffff" stopOpacity="0.9" />
          <Stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </LinearGradient>
        {/* Glass with a sky-like reflection. */}
        <LinearGradient id="cl-glass" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#cfe0f2" />
          <Stop offset="1" stopColor="#5a6b86" />
        </LinearGradient>
        <RadialGradient id="cl-rim" cx="0.5" cy="0.5" r="0.5">
          <Stop offset="0" stopColor="#eef1f5" />
          <Stop offset="0.6" stopColor="#aab2bf" />
          <Stop offset="1" stopColor="#6a7686" />
        </RadialGradient>
      </Defs>

      {/* Ground shadow */}
      <Ellipse cx="61" cy="62" rx="52" ry="6" fill="#000" opacity={0.18} />

      {/* Body */}
      <Path
        d="M4 46 C4 38 9 35 18 34 L30 21 C34 16 40 14 49 14 L74 14 C86 14 92 18 98 28 L111 32 C117 34 118 39 118 45 L118 48 C118 50 116 51 113 51 L9 51 C6 51 4 49 4 47 Z"
        fill="url(#cl-body)"
        stroke="#7e8694"
        strokeWidth={0.8}
      />
      {/* Gloss highlight */}
      <Path
        d="M10 40 C12 36 18 35 24 35 L34 24 C38 20 44 18 51 18 L73 18 C82 18 88 21 92 27 C70 25 40 27 10 40 Z"
        fill="url(#cl-gloss)"
        opacity={0.55}
      />
      {/* Windows */}
      <Path d="M33 24 L47 19 L57 19 L57 31 L31 31 Z" fill="url(#cl-glass)" />
      <Path d="M61 19 L73 19 C81 19 86 22 90 30 L61 31 Z" fill="url(#cl-glass)" />
      {/* Door seam + handle */}
      <Path d="M59 19 L59 49" stroke="#9aa3b1" strokeWidth={0.8} />
      <Path d="M46 38 L54 38" stroke="#7e8694" strokeWidth={1.4} strokeLinecap="round" />

      {/* Wheels: tire + metallic rim + hub */}
      <Circle cx="33" cy="51" r="10" fill="#202329" />
      <Circle cx="33" cy="51" r="6" fill="url(#cl-rim)" />
      <Circle cx="33" cy="51" r="2" fill="#3a3f48" />
      <Circle cx="92" cy="51" r="10" fill="#202329" />
      <Circle cx="92" cy="51" r="6" fill="url(#cl-rim)" />
      <Circle cx="92" cy="51" r="2" fill="#3a3f48" />
    </Svg>
  );
}
