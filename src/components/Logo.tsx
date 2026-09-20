import React from 'react';
import { Text, View } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { palette } from '../theme';

/** AutoMate shield+car mark, traced from the wireframe's inline SVG. */
export function LogoMark({ size = 46 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 52 52" fill="none">
      <Rect width={52} height={52} rx={12} fill={palette.navy} />
      <Path
        d="M26 7L39 12.5L39 24C39 32 34 38 26 41C18 38 13 32 13 24L13 12.5Z"
        fill="rgba(41,171,226,.15)"
        stroke={palette.brandBlue}
        strokeWidth={1.8}
      />
      <Path d="M17 28L19 23L24 22L28 22L33 23L35 28L35 30L17 30Z" fill="#fff" />
      <Circle cx={21} cy={30.5} r={2.2} fill="#fff" />
      <Circle cx={31} cy={30.5} r={2.2} fill="#fff" />
      <Path
        d="M19 25L23.5 29.5L33 19"
        stroke={palette.brandBlue}
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/** "AutoMate" wordmark (Mate in brand blue). */
export function LogoWordmark({
  size = 20,
  color = '#fff',
}: {
  size?: number;
  color?: string;
}) {
  return (
    <Text style={{ fontSize: size, fontWeight: '800', letterSpacing: -0.4, color }}>
      Auto<Text style={{ color: palette.brandBlue }}>Mate</Text>
    </Text>
  );
}

/** Mark + wordmark row used in headers. */
export function LogoRow({ markSize = 20, textSize = 13 }: { markSize?: number; textSize?: number }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <LogoMark size={markSize} />
      <LogoWordmark size={textSize} />
    </View>
  );
}

/**
 * The app icon (the rounded navy tile with a white car and a blue check
 * badge), redrawn as SVG so it stays crisp at any size.
 */
export function AppMark({ size = 36 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <Rect width={64} height={64} rx={16} fill="#0f1a2e" />
      <Rect x={1} y={1} width={62} height={62} rx={15} stroke="rgba(255,255,255,0.08)" strokeWidth={1.5} />
      {/* Car body */}
      <Path d="M12 39.5l4.2-9.6A3 3 0 0 1 19 28h13.5a3 3 0 0 1 2.6 1.5l3.4 6.2" stroke="#fff" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M10 39.5h32.5" stroke="#fff" strokeWidth={3} strokeLinecap="round" />
      <Path d="M10 39.5v7.5h3.5M42.5 39.5v7.5h-2" stroke="#fff" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx={19} cy={47} r={3.6} fill="#0f1a2e" stroke="#fff" strokeWidth={3} />
      <Circle cx={35} cy={47} r={3.6} fill="#0f1a2e" stroke="#fff" strokeWidth={3} />
      <Path d="M15 44h1.5M38 44h1.5" stroke="#fff" strokeWidth={2} strokeLinecap="round" />
      {/* Check badge */}
      <Circle cx={47} cy={27} r={11} fill="#2e6bff" />
      <Path d="M41.5 27.5l3.8 3.8L52.5 23" stroke="#fff" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

/** App mark + "AutoMate" in the theme's text colour (Home header). */
export function AppLogoRow({ markSize = 34, textSize = 18, color = '#151a26' }: { markSize?: number; textSize?: number; color?: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }} accessibilityLabel="AutoMate">
      <AppMark size={markSize} />
      <Text style={{ fontSize: textSize, fontWeight: '800', letterSpacing: -0.4, color }}>
        Auto<Text style={{ color: palette.primary }}>Mate</Text>
      </Text>
    </View>
  );
}
