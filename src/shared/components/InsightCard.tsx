import React from 'react';
import { StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { DashboardInsight } from '@/core/types';
import { useAppTheme } from '@/core/theme/useAppTheme';
import { radius, spacing } from '@/core/theme/tokens';
import { AppText } from './AppText';

interface Props {
  insight: DashboardInsight;
}

const toneColors = {
  success: (t: ReturnType<typeof useAppTheme>) => ({ color: t.custom.success, bg: t.custom.successMuted }),
  warning: (t: ReturnType<typeof useAppTheme>) => ({ color: t.custom.warning, bg: t.custom.warningMuted }),
  danger: (t: ReturnType<typeof useAppTheme>) => ({ color: t.custom.danger, bg: t.custom.dangerMuted }),
  info: (t: ReturnType<typeof useAppTheme>) => ({ color: t.custom.info, bg: t.custom.infoMuted }),
} as const;

export function InsightCard({ insight }: Props) {
  const theme = useAppTheme();
  const { color, bg } = toneColors[insight.tone](theme);

  return (
    <View
      style={[styles.card, { backgroundColor: bg, borderColor: color + '35' }]}
      accessibilityRole="text"
      accessibilityLabel={`${insight.title}. ${insight.subtitle}`}
    >
      <View style={[styles.iconWrap, { backgroundColor: color + '20' }]}>
        <MaterialCommunityIcons
          name={insight.icon as keyof typeof MaterialCommunityIcons.glyphMap}
          size={20}
          color={color}
        />
      </View>
      <View style={styles.content}>
        <AppText variant="bodyMedium" style={{ fontWeight: '600' }}>
          {insight.title}
        </AppText>
        <AppText variant="caption" color="muted">
          {insight.subtitle}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    gap: spacing.xs / 2,
    alignItems: 'flex-end',
  },
});
