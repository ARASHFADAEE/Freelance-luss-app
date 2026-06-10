import { MD3DarkTheme, MD3LightTheme, configureFonts } from 'react-native-paper';
import { FONT_FAMILY } from './fonts';
import { radius, semanticDark, semanticLight, spacing } from './tokens';

const fontConfig = {
  fontFamily: FONT_FAMILY,
};

export const lightTheme = {
  ...MD3LightTheme,
  roundness: radius.md,
  colors: {
    ...MD3LightTheme.colors,
    primary: semanticLight.primary,
    onPrimary: '#FFFFFF',
    primaryContainer: semanticLight.primaryContainer,
    secondary: semanticLight.secondary,
    background: semanticLight.background,
    surface: semanticLight.surface,
    onSurface: semanticLight.text,
    onSurfaceVariant: semanticLight.textSecondary,
    error: semanticLight.danger,
    outline: semanticLight.border,
    outlineVariant: semanticLight.borderSubtle,
    elevation: {
      level0: 'transparent',
      level1: semanticLight.surface,
      level2: semanticLight.surfaceElevated,
      level3: semanticLight.surfaceElevated,
      level4: semanticLight.surfaceElevated,
      level5: semanticLight.surfaceElevated,
    },
  },
  fonts: configureFonts({ config: fontConfig }),
  custom: semanticLight,
  tokens: { spacing, radius },
};

export const darkTheme = {
  ...MD3DarkTheme,
  roundness: radius.md,
  colors: {
    ...MD3DarkTheme.colors,
    primary: semanticDark.primary,
    onPrimary: '#0F172A',
    primaryContainer: semanticDark.primaryContainer,
    secondary: semanticDark.secondary,
    background: semanticDark.background,
    surface: semanticDark.surface,
    onSurface: semanticDark.text,
    onSurfaceVariant: semanticDark.textSecondary,
    error: semanticDark.danger,
    outline: semanticDark.border,
    outlineVariant: semanticDark.borderSubtle,
    elevation: {
      level0: 'transparent',
      level1: semanticDark.surface,
      level2: semanticDark.surfaceElevated,
      level3: semanticDark.surfaceElevated,
      level4: semanticDark.surfaceElevated,
      level5: semanticDark.surfaceElevated,
    },
  },
  fonts: configureFonts({ config: fontConfig }),
  custom: semanticDark,
  tokens: { spacing, radius },
};

export type AppTheme = typeof lightTheme;

declare module 'react-native-paper' {
  interface Theme {
    custom: typeof semanticLight;
    tokens: { spacing: typeof spacing; radius: typeof radius };
  }
}

export { spacing, radius, typography, palette, semanticLight, semanticDark } from './tokens';
export type { TypographyVariant, SemanticColors } from './tokens';
