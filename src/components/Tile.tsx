import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ImageBackground, ImageSourcePropType, StyleProp, Text, View, ViewStyle } from 'react-native';

import { Icon, IconName } from './Icon';
import { Tappable } from './Tappable';
import { palette, radii } from '../theme';

export type TileVariant = 'navy' | 'steel' | 'teal';

const VARIANTS: Record<TileVariant, { bg: string; border: string }> = {
  navy: { bg: palette.tileNavy, border: palette.tileNavyBorder },
  steel: { bg: palette.tileSteel, border: palette.tileSteelBorder },
  teal: { bg: palette.tileTeal, border: palette.tileTealBorder },
};

/** Tile title: 21/800, kept to two lines so tiles stay 150–168px tall. */
function TileTitle({ children, color = palette.textPrimary }: { children: string; color?: string }) {
  return (
    <Text
      numberOfLines={2}
      style={{ fontSize: 21, lineHeight: 25, fontWeight: '800', color, letterSpacing: -0.2 }}
    >
      {children}
    </Text>
  );
}

/**
 * Navy-blend action tile (redesign canvas): 24px radius, title top-left,
 * optional outline-icon chip bottom-right. Three surface variants so a row of
 * tiles reads as one family without looking identical.
 */
export function Tile({
  title,
  variant = 'navy',
  icon,
  iconColor = palette.textPrimary,
  onPress,
  height = 156,
  style,
  children,
}: {
  title: string;
  variant?: TileVariant;
  icon?: IconName;
  iconColor?: string;
  onPress?: () => void;
  height?: number;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}) {
  const v = VARIANTS[variant];
  return (
    <Tappable
      onPress={onPress}
      disabled={!onPress}
      style={[
        {
          minHeight: height,
          borderRadius: radii.tile,
          backgroundColor: v.bg,
          borderWidth: 1,
          borderColor: v.border,
          padding: 16,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <TileTitle>{title}</TileTitle>
      {children}
      {icon ? (
        <View
          style={{
            position: 'absolute',
            right: 14,
            bottom: 14,
            width: 50,
            height: 50,
            borderRadius: 14,
            backgroundColor: palette.chip,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name={icon} size={28} color={iconColor} />
        </View>
      ) : null}
    </Tappable>
  );
}

/**
 * Photo tile: a full-bleed duotone photo behind a top-to-bottom navy gradient
 * so the title stays legible. Used for the two Home launchers.
 */
export function PhotoTile({
  title,
  source,
  onPress,
  height = 168,
  style,
}: {
  title: string;
  source: ImageSourcePropType;
  onPress?: () => void;
  height?: number;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Tappable
      onPress={onPress}
      disabled={!onPress}
      style={[
        {
          height,
          borderRadius: radii.tile,
          backgroundColor: palette.tileNavy,
          borderWidth: 1,
          borderColor: palette.tileNavyBorder,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <ImageBackground source={source} resizeMode="cover" style={{ flex: 1 }}>
        <LinearGradient
          colors={['rgba(22,35,61,0.10)', 'rgba(22,35,61,0.55)', 'rgba(10,15,25,0.94)']}
          locations={[0, 0.5, 1]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={{ flex: 1, justifyContent: 'flex-end', padding: 16 }}
        >
          <TileTitle>{title}</TileTitle>
        </LinearGradient>
      </ImageBackground>
    </Tappable>
  );
}
