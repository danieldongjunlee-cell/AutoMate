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
  display: { fontSize: 40, fontWeight: '800', lineHeight: 44 } as Type,
  title: { fontSize: 24, fontWeight: '700', lineHeight: 30 } as Type,
  headline: { fontSize: 20, fontWeight: '600', lineHeight: 26 } as Type,
  subheadline: { fontSize: 17, fontWeight: '600', lineHeight: 22 } as Type,
  body: { fontSize: 16, fontWeight: '400', lineHeight: 23 } as Type,
  bodyMedium: { fontSize: 16, fontWeight: '500', lineHeight: 23 } as Type,
  bodySmall: { fontSize: 14, fontWeight: '400', lineHeight: 20 } as Type,
  caption: { fontSize: 13, fontWeight: '400', lineHeight: 18 } as Type,
  label: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    lineHeight: 16,
  } as Type,
  badge: { fontSize: 12, fontWeight: '600', lineHeight: 16 } as Type,
} as const;
