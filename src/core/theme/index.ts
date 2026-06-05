import { MD3DarkTheme, MD3LightTheme, configureFonts } from 'react-native-paper';
import { COLORS, DARK_COLORS } from '../constants';
import { FONT_FAMILY } from './fonts';

const fontConfig = {
  fontFamily: FONT_FAMILY,
};

const sharedRoundness = 10;

export const lightTheme = {
  ...MD3LightTheme,
  roundness: sharedRoundness,
  colors: {
    ...MD3LightTheme.colors,
    primary: COLORS.primary,
    secondary: COLORS.secondary,
    background: COLORS.background,
    surface: COLORS.card,
    onSurface: COLORS.text,
    onSurfaceVariant: COLORS.subtext,
    error: COLORS.danger,
    outline: COLORS.border,
    outlineVariant: COLORS.border,
    elevation: { level0: 'transparent', level1: COLORS.card, level2: COLORS.card, level3: COLORS.card, level4: COLORS.card, level5: COLORS.card },
  },
  fonts: configureFonts({ config: fontConfig }),
  custom: COLORS,
};

export const darkTheme = {
  ...MD3DarkTheme,
  roundness: sharedRoundness,
  colors: {
    ...MD3DarkTheme.colors,
    primary: DARK_COLORS.primary,
    secondary: DARK_COLORS.secondary,
    background: DARK_COLORS.background,
    surface: DARK_COLORS.card,
    onSurface: DARK_COLORS.text,
    onSurfaceVariant: DARK_COLORS.subtext,
    error: DARK_COLORS.danger,
    outline: DARK_COLORS.border,
    outlineVariant: DARK_COLORS.border,
    elevation: { level0: 'transparent', level1: DARK_COLORS.card, level2: DARK_COLORS.card, level3: DARK_COLORS.card, level4: DARK_COLORS.card, level5: DARK_COLORS.card },
  },
  fonts: configureFonts({ config: fontConfig }),
  custom: DARK_COLORS,
};

export type AppTheme = typeof lightTheme;

declare module 'react-native-paper' {
  interface Theme {
    custom: typeof COLORS;
  }
}
