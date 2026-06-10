import React from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '@/core/theme/useAppTheme';
import { radius, spacing } from '@/core/theme/tokens';
import { AppText } from './AppText';
import { AmountText } from './AmountText';
import { TrendBadge } from './TrendBadge';

type KPIVariant = 'hero' | 'default' | 'compact';

interface Props {
  title: string;
  value: string;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  accentColor?: string;
  variant?: KPIVariant;
  trendPercent?: number;
  /** Passed to TrendBadge — revenue/profit = true, expenses = false */
  positiveIsGood?: boolean;
  style?: ViewStyle;
  accessibilityLabel?: string;
}

export function KPICard({
  title,
  value,
  icon,
  accentColor,
  variant = 'default',
  trendPercent,
  positiveIsGood = true,
  style,
  accessibilityLabel,
}: Props) {
  const theme = useAppTheme();
  const accent = accentColor ?? theme.colors.primary;
  const isHero = variant === 'hero';
  const isCompact = variant === 'compact';

  return (
    <View
      accessible
      accessibilityRole="summary"
      accessibilityLabel={accessibilityLabel ?? `${title}: ${value}`}
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.outlineVariant,
          padding: isHero ? spacing.lg : isCompact ? spacing.md : spacing.lg - 2,
          borderRadius: isHero ? radius.lg : radius.md,
        },
        isHero && styles.hero,
        isCompact && styles.compact,
        style,
      ]}
    >
      <View style={styles.top}>
        {icon ? (
          <View style={[styles.iconWrap, { backgroundColor: accent + '18' }]}>
            <MaterialCommunityIcons name={icon} size={isCompact ? 16 : 18} color={accent} />
          </View>
        ) : null}
        <AppText variant={isCompact ? 'overline' : 'caption'} color="muted" style={styles.title}>
          {title}
        </AppText>
      </View>

      <AmountText
        variant={isHero ? 'amountLarge' : isCompact ? 'bodyMedium' : 'amount'}
        style={[
          styles.value,
          isHero && { color: accent },
          !isHero && { color: theme.colors.onSurface },
        ]}
      >
        {value}
      </AmountText>

      {trendPercent != null && (
        <TrendBadge percent={trendPercent} positiveIsGood={positiveIsGood} compact={isCompact} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: StyleSheet.hairlineWidth,
  },
  hero: {
    width: '100%',
  },
  compact: {
    flex: 1,
    minWidth: '46%',
  },
  top: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
  },
  value: {
    marginBottom: spacing.xs,
  },
});
