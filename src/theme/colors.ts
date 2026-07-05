/**
 * Color tokens ported 1:1 from AutoMate_Interactive_Wireframe_v17.html.
 *
 * v17's design system is a themeable dark/light palette: the wireframe encodes
 * each token as a CSS var whose dark value is its name (e.g. `--c0a0f19` = the
 * dark hex) and remaps them in `.light{…}`. Those two maps are reproduced below
 * as `darkColors` / `lightColors`. **v17 defaults to DARK** (navy `#0a0f19`),
 * with primary action blue `#2e6bff`, success `#16a34a`, gold `#f0b44e`, and a
 * purple `#7F77DD` brand accent.
 */
export const palette = {
  // Brand / primary action (v17 blue — 180 uses across the wireframe)
  primary: '#2e6bff',
  primaryDark: '#1e4fcc',
  primaryDeep: '#15307a',
  primaryLight: '#6fa0ff',
  primarySurface: '#e9f0ff',

  // Brand accent (v17 logo "Mate" + some avatars) + cyan splash mark
  accent: '#7F77DD',
  brandBlue: '#29ABE2',

  // Auth / navy family (splash, login — always navy)
  navy: '#0B1E3D',
  navyMid: '#1A2A42',
  navyDeep: '#0D1B2A',
  navyBright: '#122F60',
  authAction: '#1B4E8F',

  // Neutrals (light base — theme-aware surfaces live in light/darkColors)
  background: '#eef1f6',
  surface: '#ffffff',
  surfaceAlt: '#f0f2f6',
  inputBg: '#f0f2f6',
  border: '#e3e7ef',
  divider: '#e3e7ef',
  disabled: '#d7dce5',
  white: '#FFFFFF',

  textPrimary: '#1a1f2b',
  textSecondary: '#4a5260',
  textTertiary: '#6b7686',
  textPlaceholder: '#828c9b',

  // Semantic — success (v17 green)
  success: '#16a34a',
  successDark: '#0f8a43',
  successDeep: '#085041',
  successSurface: '#e6f6ee',
  successLight: '#bce3cc',

  // Semantic — warning / points / gold (v17 stars)
  warning: '#f0b44e',
  gold: '#f0b44e',
  warningSurface: '#fcf3e1',
  warningDeep: '#8a5a12',
  warningMid: '#a06a14',
  warningBorder: '#efddb2',

  // Semantic — danger
  danger: '#e24b4a',
  dangerSurface: '#fcecec',
  dangerBorder: '#f3caca',
  dangerDeep: '#c0322f',

  // Semantic — info (blue tint)
  info: '#2e6bff',
  infoSurface: '#eef4ff',
  infoDeep: '#0c447c',

  // Dark navy cards / panels (Pro upsell, AI panels) — v17 navy
  dark: '#0B1E3D',
  darkAlt: '#1A2A42',
  aiPanel: '#0a0f19',
} as const;

export interface ThemeColors {
  background: string;
  surface: string;
  surfaceAlt: string;
  inputBg: string;
  border: string;
  divider: string;
  disabled: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  textPlaceholder: string;
  tabBarBackground: string;
  tabBarBorder: string;
  tabInactive: string;
  tabActive: string;
  card: string;
  primary: string;
  primaryDark: string;
  primaryDeep: string;
  primaryLight: string;
  primarySurface: string;
  success: string;
  successDark: string;
  successDeep: string;
  successSurface: string;
  successLight: string;
  warning: string;
  warningSurface: string;
  warningDeep: string;
  danger: string;
  dangerSurface: string;
  dangerBorder: string;
  dangerDeep: string;
  info: string;
  infoSurface: string;
  infoDeep: string;
  onPrimary: string;
}

// v17 light-mode (.light{…}) remap.
export const lightColors: ThemeColors = {
  background: '#eef1f6',
  surface: '#ffffff',
  surfaceAlt: '#f0f2f6',
  inputBg: '#f0f2f6',
  border: '#e3e7ef',
  divider: '#e3e7ef',
  disabled: '#d7dce5',
  textPrimary: '#1a1f2b',
  textSecondary: '#4a5260',
  textTertiary: '#6b7686',
  textPlaceholder: '#828c9b',
  tabBarBackground: '#ffffff',
  tabBarBorder: '#e3e7ef',
  tabInactive: '#6b7686',
  tabActive: '#2e6bff',
  card: '#ffffff',
  primary: '#2e6bff',
  primaryDark: '#2e6bff',
  primaryDeep: '#1842b0',
  primaryLight: '#c5d7f5',
  primarySurface: '#e9f0ff',
  success: '#16a34a',
  successDark: '#0f8a43',
  successDeep: '#085041',
  successSurface: '#e6f6ee',
  successLight: '#bce3cc',
  warning: '#f0b44e',
  warningSurface: '#fcf3e1',
  warningDeep: '#8a5a12',
  danger: '#e24b4a',
  dangerSurface: '#fcecec',
  dangerBorder: '#f3caca',
  dangerDeep: '#c0322f',
  info: '#2e6bff',
  infoSurface: '#eef4ff',
  infoDeep: '#0c447c',
  onPrimary: '#ffffff',
};

// v17 default dark-mode (.sf{…}) palette — near-black navy chrome.
export const darkColors: ThemeColors = {
  background: '#0a0f19',
  surface: '#121a2b',
  surfaceAlt: '#1a2333',
  inputBg: '#1a2333',
  border: '#1f2940',
  divider: '#1f2940',
  disabled: '#39435a',
  textPrimary: '#e8edf5',
  textSecondary: '#b8c3d3',
  textTertiary: '#8a94a6',
  textPlaceholder: '#6e7a8c',
  tabBarBackground: '#0a0f19',
  tabBarBorder: '#1f2940',
  tabInactive: '#8a94a6',
  tabActive: '#2e6bff',
  card: '#121a2b',
  primary: '#2e6bff',
  primaryDark: '#6fa0ff',
  primaryDeep: '#d6e4ff',
  primaryLight: '#2b4a86',
  primarySurface: '#15233e',
  success: '#16a34a',
  successDark: '#3fcb78',
  successDeep: '#9fe5cc',
  successSurface: '#11271c',
  successLight: '#1c5c36',
  warning: '#f0b44e',
  warningSurface: '#2a2212',
  warningDeep: '#e6b85c',
  danger: '#f0726e',
  dangerSurface: '#2a1517',
  dangerBorder: '#7a3034',
  dangerDeep: '#f0726e',
  info: '#6fa0ff',
  infoSurface: '#16233e',
  infoDeep: '#9cc4ec',
  onPrimary: '#ffffff',
};
