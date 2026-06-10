import React from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { spacing } from '@/core/theme/tokens';
import { AppText } from './AppText';

interface Props {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  topInset?: number;
  style?: ViewStyle;
}

/** عنوان صفحه با فاصله یکدست تا محتوای اصلی */
export function PageHeader({ title, subtitle, children, topInset = 0, style }: Props) {
  return (
    <View style={[styles.wrap, topInset > 0 && { paddingTop: topInset }, style]}>
      <AppText variant="h1" accessibilityRole="header">
        {title}
      </AppText>
      {subtitle ? (
        <AppText variant="caption" color="muted" style={styles.subtitle}>
          {subtitle}
        </AppText>
      ) : null}
      {children ? <View style={styles.children}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: spacing.xl,
  },
  subtitle: {
    marginTop: spacing.xs,
  },
  children: {
    marginTop: spacing.lg,
  },
});
