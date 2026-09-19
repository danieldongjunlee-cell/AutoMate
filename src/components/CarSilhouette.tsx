import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

import { palette } from '../theme';

/**
 * Drawn side-profile car silhouette — the maintenance hero's placeholder when
 * the Car Images API has no photo for the car. Thin outline on the navy
 * ground, in the same line style as the damage picker.
 */
export function CarSilhouette({ width = 300, color = palette.textSecondary }: { width?: number; color?: string }) {
  const height = Math.round(width * 0.42);
  return (
    <Svg width={width} height={height} viewBox="0 0 320 134" fill="none">
      <Path
        d="M14 100 L12 80 Q13 70 24 66 L42 60 L94 50 L134 22 Q150 16 180 16 L232 18 Q250 20 266 38 L288 54 Q298 62 298 76 L298 100 Q298 112 286 112 L268 112 A30 30 0 0 0 208 112 L104 112 A30 30 0 0 0 44 112 L26 112 Q14 112 14 100 Z"
        stroke={color}
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
        fill="rgba(255,255,255,0.03)"
      />
      <Path d="M102 56 L138 28 L176 26 L176 56 Z M182 26 L230 26 L256 52 L182 58 Z" stroke={color} strokeWidth={1.4} strokeOpacity={0.75} strokeLinejoin="round" fill="rgba(255,255,255,0.05)" />
      <Path d="M108 58 L108 108 M176 26 L176 108 M30 100 L286 100" stroke={color} strokeWidth={1.2} strokeOpacity={0.5} />
      <Circle cx={74} cy={112} r={22} stroke={color} strokeWidth={2} fill="#070b14" />
      <Circle cx={74} cy={112} r={11} stroke={color} strokeWidth={1.4} strokeOpacity={0.7} />
      <Circle cx={238} cy={112} r={22} stroke={color} strokeWidth={2} fill="#070b14" />
      <Circle cx={238} cy={112} r={11} stroke={color} strokeWidth={1.4} strokeOpacity={0.7} />
    </Svg>
  );
}
