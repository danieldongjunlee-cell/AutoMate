import { Text as RNText } from 'react-native';
import React from 'react';
import { Image, View } from 'react-native';

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
    <RNText style={{ fontSize: size, fontWeight: '800', letterSpacing: -0.4, color }}>
      Auto<RNText style={{ color: palette.brandBlue }}>Mate</RNText>
    </RNText>
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

/** The AutoMate app icon (bundled artwork). */
const APP_MARK = require('../../assets/logo/automate-mark.png');

/** The app icon, at whatever size the header needs. */
export function AppMark({ size = 36 }: { size?: number }) {
  return <Image source={APP_MARK} accessibilityLabel="AutoMate" resizeMode="contain" style={{ width: size, height: size }} />;
}

/** App mark + "AutoMate" in the theme's text colour (Home header). */
export function AppLogoRow({ markSize = 34, textSize = 18, color = '#151a26' }: { markSize?: number; textSize?: number; color?: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }} accessibilityLabel="AutoMate">
      <AppMark size={markSize} />
      <RNText style={{ fontSize: textSize, fontWeight: '800', letterSpacing: -0.4, color }}>
        Auto<RNText style={{ color: palette.primary }}>Mate</RNText>
      </RNText>
    </View>
  );
}
