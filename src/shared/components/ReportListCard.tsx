import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '@/core/theme/useAppTheme';
import { radius, spacing } from '@/core/theme/tokens';
import { AppText } from './AppText';

interface Props {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  subtitle: string;
  value: string;
  accentColor?: string;
  rank?: number;
  accessibilityLabel?: string;
}

function ReportListCardComponent({
  icon,
  title,
  subtitle,
  value,
  accentColor,
  rank,
  accessibilityLabel,
}: Props) {
  const theme = useAppTheme();
  const color = accentColor ?? theme.colors.primary;

  return (
    <View
      style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant }]}
      accessibilityRole="text"
      accessibilityLabel={accessibilityLabel ?? `${title}، ${subtitle}، ${value}`}
    >
      {rank != null && (
        <View style={[styles.rank, { backgroundColor: color + '18' }]}>
          <AppText variant="overline" style={{ color, fontWeight: '700' }}>
            {rank}
          </AppText>
        </View>
      )}
      <View style={[styles.iconWrap, { backgroundColor: color + '14' }]}>
        <MaterialCommunityIcons name={icon} size={22} color={color} />
      </View>
      <View style={styles.content}>
        <AppText variant="bodyMedium" style={{ fontWeight: '600' }} numberOfLines={1}>
          {title}
        </AppText>
        <AppText variant="caption" color="muted">
          {subtitle}
        </AppText>
      </View>
      <AppText variant="bodyMedium" style={{ color, fontWeight: '700' }}>
        {value}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.lg - 2,
    padding: spacing.md + 2,
    marginBottom: spacing.sm,
  },
  rank: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { flex: 1, gap: spacing.xs / 2, alignItems: 'flex-end' },
});

export const ReportListCard = memo(ReportListCardComponent);
