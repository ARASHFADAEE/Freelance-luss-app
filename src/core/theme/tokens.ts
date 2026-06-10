/** Design tokens — single source of truth for spacing, color, type, radius. */

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
} as const;

export const shadows = {
  none: {
    elevation: 0,
    shadowOpacity: 0,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 },
  },
  sm: {
    elevation: 1,
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  md: {
    elevation: 2,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
} as const;

export const palette = {
  primary: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    500: '#2563EB',
    600: '#1D4ED8',
    700: '#1E40AF',
  },
  neutral: {
    0: '#FFFFFF',
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    400: '#9CA3AF',
    600: '#4B5563',
    900: '#111827',
  },
  success: '#059669',
  successMuted: '#D1FAE5',
  warning: '#D97706',
  warningMuted: '#FEF3C7',
  error: '#DC2626',
  errorMuted: '#FEE2E2',
  info: '#0284C7',
  infoMuted: '#E0F2FE',
} as const;

export const darkPalette = {
  primary: {
    50: '#1E3A5F',
    100: '#1E40AF',
    500: '#3B82F6',
    600: '#60A5FA',
    700: '#93C5FD',
  },
  neutral: {
    0: '#0F172A',
    50: '#1E293B',
    100: '#334155',
    200: '#475569',
    400: '#94A3B8',
    600: '#CBD5E1',
    900: '#F1F5F9',
  },
  success: '#10B981',
  successMuted: '#064E3B',
  warning: '#FBBF24',
  warningMuted: '#78350F',
  error: '#F87171',
  errorMuted: '#7F1D1D',
  info: '#38BDF8',
  infoMuted: '#0C4A6E',
} as const;

export const typography = {
  display: { fontSize: 32, fontWeight: '700' as const, lineHeight: 40 },
  h1: { fontSize: 24, fontWeight: '700' as const, lineHeight: 32 },
  h2: { fontSize: 20, fontWeight: '600' as const, lineHeight: 28 },
  h3: { fontSize: 17, fontWeight: '600' as const, lineHeight: 24 },
  body: { fontSize: 15, fontWeight: '400' as const, lineHeight: 24 },
  bodyMedium: { fontSize: 15, fontWeight: '500' as const, lineHeight: 24 },
  caption: { fontSize: 13, fontWeight: '400' as const, lineHeight: 18 },
  overline: { fontSize: 11, fontWeight: '600' as const, lineHeight: 16 },
  amount: { fontSize: 20, fontWeight: '700' as const, lineHeight: 28 },
  amountLarge: { fontSize: 28, fontWeight: '700' as const, lineHeight: 36 },
} as const;

export type TypographyVariant = keyof typeof typography;

export const semanticLight = {
  primary: palette.primary[500],
  primaryContainer: palette.primary[50],
  secondary: palette.success,
  background: palette.neutral[50],
  surface: palette.neutral[0],
  surfaceElevated: palette.neutral[0],
  text: palette.neutral[900],
  textSecondary: palette.neutral[600],
  border: palette.neutral[200],
  borderSubtle: palette.neutral[100],
  success: palette.success,
  successMuted: palette.successMuted,
  warning: palette.warning,
  warningMuted: palette.warningMuted,
  danger: palette.error,
  dangerMuted: palette.errorMuted,
  info: palette.info,
  infoMuted: palette.infoMuted,
  card: palette.neutral[0],
  subtext: palette.neutral[600],
} as const;

export const semanticDark = {
  primary: darkPalette.primary[500],
  primaryContainer: darkPalette.primary[50],
  secondary: darkPalette.success,
  background: darkPalette.neutral[0],
  surface: darkPalette.neutral[50],
  surfaceElevated: darkPalette.neutral[100],
  text: darkPalette.neutral[900],
  textSecondary: darkPalette.neutral[600],
  border: darkPalette.neutral[200],
  borderSubtle: darkPalette.neutral[100],
  success: darkPalette.success,
  successMuted: darkPalette.successMuted,
  warning: darkPalette.warning,
  warningMuted: darkPalette.warningMuted,
  danger: darkPalette.error,
  dangerMuted: darkPalette.errorMuted,
  info: darkPalette.info,
  infoMuted: darkPalette.infoMuted,
  card: darkPalette.neutral[50],
  subtext: darkPalette.neutral[600],
} as const;

export type SemanticColors = typeof semanticLight;
