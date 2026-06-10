import React from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { useAppTheme } from '@/core/theme/useAppTheme';
import { spacing } from '@/core/theme/tokens';
import { AppText } from './AppText';

interface Props {
  title?: string;
  description?: string;
  children: React.ReactNode;
  style?: ViewStyle;
}

export function FormSection({ title, description, children, style }: Props) {
  const theme = useAppTheme();

  return (
    <View style={[styles.section, style]}>
      {title ? (
        <AppText variant="h3" style={styles.title}>
          {title}
        </AppText>
      ) : null}
      {description ? (
        <AppText variant="caption" color="muted" style={styles.description}>
          {description}
        </AppText>
      ) : null}
      <View style={[styles.body, { borderColor: theme.colors.outlineVariant }]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: spacing.lg,
  },
  title: {
    marginBottom: spacing.xs,
  },
  description: {
    marginBottom: spacing.md,
  },
  body: {
    gap: spacing.sm,
  },
});
