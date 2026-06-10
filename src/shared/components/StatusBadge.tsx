import React from 'react';
import { StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '@/core/theme/useAppTheme';
import { radius, spacing } from '@/core/theme/tokens';
import { AppText } from './AppText';

type BadgeTone = 'success' | 'warning' | 'danger' | 'primary' | 'neutral';

interface Props {
  label: string;
  tone?: BadgeTone;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
}

export function StatusBadge({ label, tone = 'neutral', icon }: Props) {
  const theme = useAppTheme();

  const toneMap = {
    success: { color: theme.custom.success, bg: theme.custom.successMuted },
    warning: { color: theme.custom.warning, bg: theme.custom.warningMuted },
    danger: { color: theme.custom.danger, bg: theme.custom.dangerMuted },
    primary: { color: theme.colors.primary, bg: theme.custom.primaryContainer },
    neutral: { color: theme.custom.textSecondary, bg: theme.custom.borderSubtle },
  } as const;

  const { color, bg } = toneMap[tone];

  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      {icon ? <MaterialCommunityIcons name={icon} size={12} color={color} /> : null}
      <AppText variant="overline" style={{ color, fontWeight: '700' }}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
});
