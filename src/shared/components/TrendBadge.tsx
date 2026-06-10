import React from 'react';
import { StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '@/core/theme/useAppTheme';
import { formatPersianNumber } from '@/core/utils/persian';
import { radius, spacing } from '@/core/theme/tokens';
import { AppText } from './AppText';

interface Props {
  /** Percentage change vs previous period. Positive = up, negative = down. */
  percent: number;
  /** When true, an increase is good (e.g. revenue). When false, increase is bad (e.g. expenses). */
  positiveIsGood?: boolean;
  compact?: boolean;
}

export function TrendBadge({ percent, positiveIsGood = true, compact = false }: Props) {
  const theme = useAppTheme();
  const isUp = percent > 0;
  const isNeutral = percent === 0;
  const isGood = isNeutral ? true : positiveIsGood ? isUp : !isUp;

  const color = isNeutral
    ? theme.colors.onSurfaceVariant
    : isGood
      ? theme.custom.success
      : theme.custom.danger;

  const bg = isNeutral
    ? theme.custom.borderSubtle
    : isGood
      ? theme.custom.successMuted
      : theme.custom.dangerMuted;

  const icon = isNeutral ? 'minus' : isUp ? 'trending-up' : 'trending-down';
  const label = isNeutral
    ? 'بدون تغییر'
    : `${formatPersianNumber(Math.abs(Math.round(percent)))}٪`;

  return (
    <View style={[styles.badge, { backgroundColor: bg }, compact && styles.compact]}>
      <MaterialCommunityIcons name={icon} size={compact ? 14 : 16} color={color} />
      <AppText variant="caption" style={{ color, fontWeight: '600' }}>
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
    alignSelf: 'flex-end',
  },
  compact: {
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 2,
  },
});
