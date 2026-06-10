import React from 'react';
import { type TextProps } from 'react-native';
import { AppText } from './AppText';
import { typography, type TypographyVariant } from '@/core/theme/tokens';

interface Props extends Omit<TextProps, 'children'> {
  children: string;
  variant?: Extract<TypographyVariant, 'amount' | 'amountLarge' | 'h3' | 'bodyMedium' | 'caption'>;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'default' | 'muted';
  align?: 'right' | 'left' | 'center';
}

export function AmountText({
  children,
  variant = 'amount',
  color = 'default',
  align = 'right',
  style,
  ...props
}: Props) {
  return (
    <AppText
      variant={variant}
      color={color}
      align={align}
      tabular
      style={[{ letterSpacing: typography[variant].fontSize > 20 ? -0.5 : 0 }, style]}
      {...props}
    >
      {children}
    </AppText>
  );
}
