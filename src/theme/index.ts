import { useAppStore } from '../store/useAppStore';
import { darkColors, lightColors, palette, ThemeColors } from './colors';
import { radii, spacing, typography } from './tokens';

export { palette, lightColors, darkColors, spacing, radii, typography };
export type { ThemeColors };

export interface Theme {
  dark: boolean;
  colors: ThemeColors;
  spacing: typeof spacing;
  radii: typeof radii;
  typography: typeof typography;
}

const lightTheme: Theme = { dark: false, colors: lightColors, spacing, radii, typography };
const darkTheme: Theme = { dark: true, colors: darkColors, spacing, radii, typography };

/** App theme, driven by the dark-mode toggle in Settings (Zustand). */
export function useTheme(): Theme {
  const darkMode = useAppStore((s) => s.darkMode);
  return darkMode ? darkTheme : lightTheme;
}
