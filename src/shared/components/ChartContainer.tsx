import React from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { useAppTheme } from '@/core/theme/useAppTheme';
import { radius, spacing } from '@/core/theme/tokens';
import { AppText } from './AppText';

interface Props {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  style?: ViewStyle;
}

export function ChartContainer({ title, subtitle, children, style }: Props) {
  const theme = useAppTheme();

  return (
    <View
      style={[
        styles.box,
        {
          borderColor: theme.colors.outlineVariant,
          backgroundColor: theme.colors.surface,
        },
        style,
      ]}
      accessibilityRole="summary"
      accessibilityLabel={`${title}${subtitle ? `، ${subtitle}` : ''}`}
    >
      <AppText variant="h3">{title}</AppText>
      {subtitle ? (
        <AppText variant="caption" color="muted" style={styles.subtitle}>
          {subtitle}
        </AppText>
      ) : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  subtitle: {
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
});
