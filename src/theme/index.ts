import { darkColors, palette, ThemeColors } from './colors';
import { radii, spacing, typography } from './tokens';

export { palette, darkColors, spacing, radii, typography };
export type { ThemeColors };

export interface Theme {
  dark: boolean;
  colors: ThemeColors;
  spacing: typeof spacing;
  radii: typeof radii;
  typography: typeof typography;
}

const darkTheme: Theme = { dark: true, colors: darkColors, spacing, radii, typography };

/** App theme. The redesign is dark-only, so this is a constant. */
export function useTheme(): Theme {
  return darkTheme;
}
