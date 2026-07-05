import { TextStyle } from 'react-native';

/** 4-pt spacing scale (wireframe rhythm ×2 — docs/wireframe-analysis.md §3). */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  /** Horizontal screen padding (wireframe 14px). */
  screenH: 16,
} as const;

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  sheet: 24,
  pill: 999,
} as const;

type Type = Pick<TextStyle, 'fontSize' | 'fontWeight' | 'lineHeight' | 'letterSpacing' | 'textTransform'>;

/** Type scale: wireframe px ≈ ×2 → dp. */
export const typography = {
  display: { fontSize: 44, fontWeight: '800', lineHeight: 48 } as Type,
  title: { fontSize: 27, fontWeight: '700', lineHeight: 33 } as Type,
  headline: { fontSize: 22, fontWeight: '600', lineHeight: 28 } as Type,
  subheadline: { fontSize: 19, fontWeight: '600', lineHeight: 24 } as Type,
  body: { fontSize: 18, fontWeight: '400', lineHeight: 25 } as Type,
  bodyMedium: { fontSize: 18, fontWeight: '500', lineHeight: 25 } as Type,
  bodySmall: { fontSize: 16, fontWeight: '400', lineHeight: 22 } as Type,
  caption: { fontSize: 14, fontWeight: '400', lineHeight: 19 } as Type,
  label: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    lineHeight: 17,
  } as Type,
  badge: { fontSize: 14, fontWeight: '600', lineHeight: 17 } as Type,
} as const;
