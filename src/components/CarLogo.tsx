import React from 'react';
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from 'react-native-svg';

/**
 * Silver-sedan logo for the "Get an AI Repair Estimate" action — a clean
 * side-profile car with a brushed-silver body, matching the reference image.
 */
export function CarLogo({ size = 120, opacity = 1 }: { size?: number; opacity?: number }) {
  const height = size * 0.52;
  return (
    <Svg width={size} height={height} viewBox="0 0 120 62" opacity={opacity}>
      <Defs>
        <LinearGradient id="carBody" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#f3f5f8" />
          <Stop offset="0.5" stopColor="#d4d9e1" />
          <Stop offset="1" stopColor="#a9b1bd" />
        </LinearGradient>
      </Defs>
      {/* Body */}
      <Path
        d="M4 44 C4 37 9 34 18 33 L30 21 C34 17 40 15 49 15 L74 15 C85 15 91 19 97 28 L110 32 C116 34 117 38 117 44 L117 47 C117 49 115 50 112 50 L9 50 C6 50 4 48 4 46 Z"
        fill="url(#carBody)"
        stroke="#969fac"
        strokeWidth={1}
      />
      {/* Greenhouse / windows */}
      <Path d="M33 23 L46 18 L57 18 L57 30 L31 30 Z" fill="#79859a" opacity={0.9} />
      <Path d="M61 18 L74 18 C82 18 87 21 91 29 L61 30 Z" fill="#79859a" opacity={0.9} />
      {/* Wheels */}
      <Circle cx={33} cy={50} r={9} fill="#2b2f36" />
      <Circle cx={33} cy={50} r={4} fill="#cfd4dc" />
      <Circle cx={92} cy={50} r={9} fill="#2b2f36" />
      <Circle cx={92} cy={50} r={4} fill="#cfd4dc" />
    </Svg>
  );
}
