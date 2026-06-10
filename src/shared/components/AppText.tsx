import React from 'react';
import { Text as RNText, type TextProps as RNTextProps, StyleSheet } from 'react-native';
import { FONT_FAMILY } from '@/core/theme/fonts';
import { typography, semanticLight, type TypographyVariant } from '@/core/theme/tokens';
import { useAppTheme } from '@/core/theme/useAppTheme';

interface Props extends RNTextProps {
  variant?: TypographyVariant;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'default' | 'muted';
  align?: 'right' | 'left' | 'center';
  tabular?: boolean;
}

const colorKeyMap = {
  primary: 'primary',
  secondary: 'secondary',
  success: 'success',
  warning: 'warning',
  danger: 'danger',
  default: 'text',
  muted: 'textSecondary',
} as const;

export function AppText({
  variant = 'body',
  color = 'default',
  align = 'right',
  tabular = false,
  style,
  children,
  ...props
}: Props) {
  const theme = useAppTheme();
  const token = typography[variant];
  const customKey = colorKeyMap[color];
  const custom = theme.custom ?? semanticLight;

  const textColor =
    customKey === 'primary' || customKey === 'secondary'
      ? (theme.colors[customKey] ?? custom[customKey])
      : (custom[customKey] ?? theme.colors.onSurfaceVariant);

  return (
    <RNText
      style={[
        styles.base,
        {
          fontSize: token.fontSize,
          fontWeight: token.fontWeight,
          lineHeight: token.lineHeight,
          color: textColor,
          textAlign: align,
          fontVariant: tabular ? ['tabular-nums'] : undefined,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </RNText>
  );
}

const styles = StyleSheet.create({
  base: {
    fontFamily: FONT_FAMILY,
    writingDirection: 'rtl',
  },
});
