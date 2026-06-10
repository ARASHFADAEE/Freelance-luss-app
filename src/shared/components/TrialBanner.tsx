import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { TRIAL_DAYS } from '@/core/constants';
import { useAppTheme } from '@/core/theme/useAppTheme';
import { formatPersianNumber } from '@/core/utils/persian';
import { AppText } from './AppText';
import { radius, spacing } from '@/core/theme/tokens';

interface Props {
  daysRemaining: number;
  onPress?: () => void;
  variant?: 'full' | 'compact';
}

export function TrialBanner({ daysRemaining, onPress, variant = 'full' }: Props) {
  const theme = useAppTheme();
  const isCompact = variant === 'compact';
  const accent = theme.custom.success;

  const label = isCompact
    ? `Pro آزمایشی — ${formatPersianNumber(daysRemaining)} روز`
    : `دوره آزمایشی Pro — ${formatPersianNumber(daysRemaining)} روز باقی‌مانده`;

  const content = (
    <>
      <MaterialCommunityIcons name="gift-outline" size={isCompact ? 20 : 24} color={accent} />
      <View style={[styles.textWrap, isCompact && styles.textWrapCompact]}>
        <AppText variant={isCompact ? 'bodyMedium' : 'bodyMedium'} style={{ fontWeight: '700' }}>
          {label}
        </AppText>
        {!isCompact && (
          <AppText variant="caption" color="muted">
            گزارش‌ها، PDF و نمودار فعال · {formatPersianNumber(TRIAL_DAYS)} روز دسترسی کامل
          </AppText>
        )}
      </View>
      {onPress ? (
        <MaterialCommunityIcons name="chevron-left" size={20} color={theme.colors.onSurfaceVariant} />
      ) : null}
    </>
  );

  const boxStyle = [
    styles.box,
    isCompact && styles.boxCompact,
    { backgroundColor: accent + '14', borderColor: accent + '50' },
  ];

  if (!onPress) {
    return (
      <View style={boxStyle} accessibilityRole="text" accessibilityLabel={label}>
        {content}
      </View>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${label}، برای جزئیات اشتراک لمس کنید`}
      style={({ pressed }) => [...boxStyle, { opacity: pressed ? 0.88 : 1 }]}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  box: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md + 2,
    marginBottom: spacing.lg,
    minHeight: 44,
  },
  boxCompact: {
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  textWrap: { flex: 1, alignItems: 'flex-end', gap: spacing.xs / 2 },
  textWrapCompact: { gap: 0 },
});
