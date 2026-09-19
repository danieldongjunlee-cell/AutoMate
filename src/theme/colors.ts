/**
 * Color tokens for the AutoMate redesign (Claude Design canvas v34).
 *
 * The app has ONE dark ground everywhere: background `#0a0f19`, surface
 * `#121a2b`, primary blue `#2e6bff`, teal accent `#4FE3C1`, amber `#F0B44E`.
 * There is no light theme any more — `darkColors` is the only `ThemeColors`
 * map and `useTheme()` always returns it. The only white element in the app is
 * the dock's centre `+` button.
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

  // Neutrals (dark ground — identical to darkColors, kept for static styles)
  background: '#0a0f19',
  surface: '#121a2b',
  surfaceAlt: '#1a2333',
  inputBg: '#1a2333',
  border: '#1f2940',
  divider: '#1f2940',
  disabled: '#39435a',
  white: '#FFFFFF',

  textPrimary: '#e8edf5',
  textSecondary: '#b8c3d3',
  textTertiary: '#8a94a6',
  textPlaceholder: '#6e7a8c',

  // Redesign accents
  teal: '#4FE3C1',
  mint: '#2EE87E',
  amber: '#F0B44E',
  lavender: '#B7B1F2',
  /** Text colour on amber (money / Pro) buttons. */
  onAmber: '#0B1E3D',

  // Tiles: navy-blend surfaces (Tile component variants)
  tileNavy: '#16233d',
  tileNavyBorder: '#23335a',
  tileSteel: '#1b273d',
  tileSteelBorder: '#2b3a57',
  tileTeal: '#0f2a3d',
  tileTealBorder: '#1d4459',

  // Chrome: floating dock, action sheet, icon chips
  dock: 'rgba(18,26,43,0.96)',
  sheet: '#0f1626',
  chip: 'rgba(255,255,255,0.06)',

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

// The one and only theme: near-black navy chrome.
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
  tabBarBackground: 'rgba(18,26,43,0.96)',
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
