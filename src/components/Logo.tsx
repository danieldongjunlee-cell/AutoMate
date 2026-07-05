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
