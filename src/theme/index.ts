import { useColorScheme } from 'react-native';

import { useAppStore } from '../store/useAppStore';
import { darkColors, lightColors, palette, ThemeColors } from './colors';
import { radii, spacing, typography } from './tokens';

export { palette, darkColors, lightColors, spacing, radii, typography };
export type { ThemeColors };

export interface Theme {
  dark: boolean;
  colors: ThemeColors;
  spacing: typeof spacing;
  radii: typeof radii;
  typography: typeof typography;
}

const darkTheme: Theme = { dark: true, colors: darkColors, spacing, radii, typography };
const lightTheme: Theme = { dark: false, colors: lightColors, spacing, radii, typography };

/** App theme: Settings → Appearance (light by default, dark, or follow the device). */
export function useTheme(): Theme {
  const mode = useAppStore((s) => s.themeMode);
  const scheme = useColorScheme();
  const dark = mode === 'system' ? scheme === 'dark' : mode === 'dark';
  return dark ? darkTheme : lightTheme;
}
