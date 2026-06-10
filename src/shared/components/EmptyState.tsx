import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';
import { radius, spacing } from '@/core/theme/tokens';
import { AppText } from './AppText';

interface Props {
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  illustration?: React.ReactNode;
}

export function EmptyState({
  icon = 'inbox-outline',
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  illustration,
}: Props) {
  const theme = useTheme();

  return (
    <View
      style={styles.container}
      accessibilityRole="text"
      accessibilityLabel={[title, description].filter(Boolean).join('. ')}
    >
      {illustration ?? (
        <View style={[styles.iconCircle, { backgroundColor: theme.colors.surface }]}>
          <MaterialCommunityIcons
            name={icon}
            size={48}
            color={theme.colors.onSurfaceVariant}
            style={{ opacity: 0.6 }}
          />
        </View>
      )}
      <AppText variant="h3" align="center">
        {title}
      </AppText>
      {description ? (
        <AppText variant="body" color="muted" align="center" style={styles.description}>
          {description}
        </AppText>
      ) : null}
      {actionLabel && onAction ? (
        <Button mode="contained" onPress={onAction} style={styles.primaryBtn}>
          {actionLabel}
        </Button>
      ) : null}
      {secondaryActionLabel && onSecondaryAction ? (
        <Button mode="text" onPress={onSecondaryAction}>
          {secondaryActionLabel}
        </Button>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing['2xl'],
    gap: spacing.sm,
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  description: {
    maxWidth: 280,
  },
  primaryBtn: {
    marginTop: spacing.sm,
    minWidth: 140,
  },
});
