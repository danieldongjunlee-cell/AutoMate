import React from 'react';
import { View } from 'react-native';

import { Icon, IconName } from './Icon';
import { palette } from '../theme';

/**
 * Rounded-square icon chip (`rgba(255,255,255,.06)`, no border) that holds an
 * outline glyph: 64px in the action sheet, 50px in list rows (glyphs 34 / 28).
 * Pass `bg` for a solid tinted chip.
 */
export function IconChip({
  name,
  size = 50,
  glyph,
  color = palette.textPrimary,
  bg = palette.chip,
  radius,
}: {
  name: IconName;
  size?: number;
  /** Glyph px; defaults to 28 for 50px chips and 34 for 64px chips. */
  glyph?: number;
  color?: string;
  bg?: string;
  radius?: number;
}) {
  const g = glyph ?? (size >= 60 ? 34 : Math.round(size * 0.56));
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: radius ?? Math.round(size * 0.3),
        backgroundColor: bg,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <Icon name={name} size={g} color={color} />
    </View>
  );
}
