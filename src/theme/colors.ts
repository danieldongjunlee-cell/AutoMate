/**
 * Color tokens extracted from AutoMate_Interactive_Wireframe_v15.html.
 * See docs/wireframe-analysis.md §3 for the source mapping.
 */
export const palette = {
  // Brand / primary (in-app)
  primary: '#7F77DD',
  primaryDark: '#534AB7',
  primaryDeep: '#3C3489',
  primaryLight: '#AFA9EC',
  primarySurface: '#EEEDFE',

  // Auth / navy family
  navy: '#0B1E3D',
  navyMid: '#1A2A42',
  navyDeep: '#0D1B2A',
  navyBright: '#122F60',
  brandBlue: '#29ABE2',
  authAction: '#1B4E8F',

  // Neutrals (light)
  background: '#F4F2ED',
  surface: '#F8F7F4',
  surfaceAlt: '#F0EDE6',
  inputBg: '#FAFAF8',
  border: '#E0DDD5',
  divider: '#F0EDE6',
  disabled: '#D0CECA',
  white: '#FFFFFF',

  // Text (tertiary/placeholder raised from #888/#AAA for readable contrast —
  // user-feedback pass 1: faint fonts).
  textPrimary: '#1A1A1A',
  textSecondary: '#555555',
  textTertiary: '#6E6E6E',
  textPlaceholder: '#999999',

  // Semantic — success
  success: '#1D9E75',
  successDark: '#0F6E56',
  successDeep: '#085041',
  successSurface: '#E1F5EE',
  successLight: '#5DCFAA',

  // Semantic — warning / points / deals
  warning: '#EF9F27',
  warningSurface: '#FAEEDA',
  warningDeep: '#633806',
  warningMid: '#854F0B',
  warningBorder: '#FAC775',

  // Semantic — danger
  danger: '#E24B4A',
  dangerSurface: '#FCEBEB',
  dangerBorder: '#F09595',
  dangerDeep: '#A32D2D',

  // Semantic — info
  info: '#378ADD',
  infoSurface: '#E6F1FB',
  infoDeep: '#0C447C',

  // Dark cards / misc
  dark: '#1A1A1A',
  darkAlt: '#2D2D2D',
  aiPanel: '#1A1A2E',
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

export const lightColors: ThemeColors = {
  background: palette.background,
  surface: palette.surface,
  surfaceAlt: palette.surfaceAlt,
  inputBg: palette.inputBg,
  border: palette.border,
  divider: palette.divider,
  disabled: palette.disabled,
  textPrimary: palette.textPrimary,
  textSecondary: palette.textSecondary,
  textTertiary: palette.textTertiary,
  textPlaceholder: palette.textPlaceholder,
  tabBarBackground: palette.white,
  tabBarBorder: palette.border,
  tabInactive: '#6E6E6E',
  tabActive: palette.primary,
  card: palette.surface,
  primary: palette.primary,
  primaryDark: palette.primaryDark,
  primaryDeep: palette.primaryDeep,
  primaryLight: palette.primaryLight,
  primarySurface: palette.primarySurface,
  success: palette.success,
  successDark: palette.successDark,
  successDeep: palette.successDeep,
  successSurface: palette.successSurface,
  successLight: palette.successLight,
  warning: palette.warning,
  warningSurface: palette.warningSurface,
  warningDeep: palette.warningDeep,
  danger: palette.danger,
  dangerSurface: palette.dangerSurface,
  dangerBorder: palette.dangerBorder,
  dangerDeep: palette.dangerDeep,
  info: palette.info,
  infoSurface: palette.infoSurface,
  infoDeep: palette.infoDeep,
  onPrimary: palette.white,
};

// Dark palette derived from the wireframe's dark-mode chrome
// (tab bar #0F0F1A, border #2A2A3A, labels #5A5A8A/#9189E8).
export const darkColors: ThemeColors = {
  background: '#12121C',
  surface: '#1B1B28',
  surfaceAlt: '#22222F',
  inputBg: '#181824',
  border: '#2A2A3A',
  divider: '#262635',
  disabled: '#3A3A4A',
  textPrimary: '#E0E0F0',
  textSecondary: '#B0B0C8',
  textTertiary: '#9C9CBE',
  textPlaceholder: '#6E6E92',
  tabBarBackground: '#0F0F1A',
  tabBarBorder: '#2A2A3A',
  tabInactive: '#5A5A8A',
  tabActive: '#9189E8',
  card: '#1B1B28',
  primary: '#9189E8',
  primaryDark: '#7F77DD',
  primaryDeep: '#AFA9EC',
  primaryLight: '#534AB7',
  primarySurface: '#252238',
  success: '#2FBA8E',
  successDark: '#5DCFAA',
  successDeep: '#9FE5CC',
  successSurface: '#15302A',
  successLight: '#5DCFAA',
  warning: '#F2B04A',
  warningSurface: '#332817',
  warningDeep: '#F0C050',
  danger: '#E8625F',
  dangerSurface: '#331C1C',
  dangerBorder: '#7A4040',
  dangerDeep: '#F09595',
  info: '#5BA0E5',
  infoSurface: '#16283A',
  infoDeep: '#9CC4EC',
  onPrimary: '#FFFFFF',
};
