import React from 'react';
import Svg, { Circle, Defs, G, LinearGradient, Path, Rect, Stop, Text as SvgText } from 'react-native-svg';

/**
 * Navy storefront placeholder (canvas "Quotes received"): a bay door or a
 * glass front, striped awning, a sign with the shop initials and a lamp.
 * Used when a shop has no profile photo. `variant` alternates the front.
 */
export function Storefront({ initials, accent, variant = 0, width, height = 150 }: { initials: string; accent: string; variant?: 0 | 1; width: number; height?: number }) {
  const w = width;
  const h = height;
  const awningCount = Math.floor((w - 36) / 34) + 1;
  return (
    <Svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <Defs>
        <LinearGradient id="sf-vig" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#000" stopOpacity={0} />
          <Stop offset="1" stopColor="#000" stopOpacity={0.45} />
        </LinearGradient>
      </Defs>
      {variant === 0 ? (
        <G>
          <Rect x={0} y={0} width={w} height={h} fill="#16233d" />
          <Rect x={0} y={h - 30} width={w} height={30} fill="#0d1626" />
          <Rect x={28} y={40} width={w - 56} height={h - 70} rx={6} fill="#1b2a4a" stroke="#2b3a57" />
          {[0, 1, 2, 3, 4].map((i) => (
            <Rect key={i} x={40} y={50 + i * 17} width={w - 80} height={11} rx={2} fill="#22304a" />
          ))}
          <Rect x={w / 2 - 14} y={h - 46} width={28} height={4} rx={2} fill={accent} opacity={0.9} />
        </G>
      ) : (
        <G>
          <Rect x={0} y={0} width={w} height={h} fill="#141e33" />
          <Rect x={0} y={h - 30} width={w} height={30} fill="#0d1626" />
          <Rect x={24} y={46} width={w - 48} height={h - 76} rx={4} fill="#1a2a4a" stroke="#2b3a57" />
          {[0, 1, 2, 3].map((i) => (
            <Rect key={i} x={36 + (i * (w - 72)) / 4} y={54} width={(w - 72) / 4 - 10} height={h - 92} rx={3} fill="#22304a" stroke="#2b3a57" />
          ))}
          <Rect x={w / 2 - 20} y={h - 58} width={40} height={28} rx={3} fill="#0f1a2c" stroke={accent} strokeWidth={1.2} />
        </G>
      )}
      {/* Awning */}
      {Array.from({ length: awningCount }, (_, i) => (
        <Rect key={`a${i}`} x={18 + i * 34} y={20} width={34} height={18} fill={i % 2 === 0 ? accent : '#0f1a2c'} opacity={0.85} />
      ))}
      {/* Sign */}
      <Rect x={w / 2 - 36} y={4} width={72} height={26} rx={6} fill="#0a0f19" stroke={accent} strokeWidth={1.2} />
      <SvgText x={w / 2} y={22} textAnchor="middle" fontSize={13} fontWeight="800" fill={accent}>
        {initials}
      </SvgText>
      {/* Lamp */}
      <Circle cx={w - 34} cy={46} r={3} fill={accent} />
      <Path d={`M${w - 34} 49 L${w - 34} 60`} stroke={accent} strokeWidth={1} opacity={0.5} />
      <Rect x={0} y={0} width={w} height={h} fill="url(#sf-vig)" />
    </Svg>
  );
}
