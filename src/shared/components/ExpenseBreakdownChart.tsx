import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { useAppTheme } from '@/core/theme/useAppTheme';
import { radius, spacing } from '@/core/theme/tokens';
import { formatCurrency } from '@/core/utils/currency';
import { formatPersianNumber, toPersianDigits } from '@/core/utils/persian';
import { AppText } from './AppText';
import { AmountText } from './AmountText';

export interface ExpenseBreakdownItem {
  category: string;
  amount: number;
}

interface Props {
  data: ExpenseBreakdownItem[];
  currency?: string;
  size?: number;
}

const CHART_COLORS = ['#DC2626', '#F59E0B', '#2563EB', '#059669', '#7C3AED', '#0891B2', '#DB2777'];

export function ExpenseBreakdownChart({ data, currency = 'TOMAN', size = 148 }: Props) {
  const theme = useAppTheme();
  const total = useMemo(() => data.reduce((s, d) => s + d.amount, 0), [data]);

  const slices = useMemo(() => {
    if (total <= 0) return [];
    let cursor = 0;
    return data.map((item, i) => {
      const pct = item.amount / total;
      const slice = { ...item, pct, color: CHART_COLORS[i % CHART_COLORS.length], start: cursor, end: cursor + pct };
      cursor += pct;
      return slice;
    });
  }, [data, total]);

  if (data.length === 0 || total <= 0) {
    return (
      <AppText variant="caption" color="muted" align="center">
        هزینه‌ای برای نمایش نیست
      </AppText>
    );
  }

  const stroke = 22;
  const r = (size - stroke) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;

  const summaryLabel = `تفکیک ${formatPersianNumber(data.length)} دسته هزینه، مجموع ${formatCurrency(total, currency as 'TOMAN')}`;

  return (
    <View accessibilityRole="summary" accessibilityLabel={summaryLabel}>
      <View style={styles.chartRow}>
        <View style={styles.legend}>
          {slices.map((slice) => (
            <View key={slice.category} style={styles.legendItem}>
              <View style={styles.legendText}>
                <AppText variant="bodyMedium" style={{ fontWeight: '600' }} numberOfLines={1}>
                  {slice.category}
                </AppText>
                <View style={styles.legendMeta}>
                  <AmountText variant="caption" color="muted">
                    {formatCurrency(slice.amount, currency as 'TOMAN')}
                  </AmountText>
                  <AppText variant="caption" color="muted">
                    {toPersianDigits(String(Math.round(slice.pct * 100)))}٪
                  </AppText>
                </View>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.outlineVariant + '80' }]}>
                <View
                  style={[
                    styles.barFill,
                    {
                      width: `${Math.max(slice.pct * 100, 4)}%`,
                      backgroundColor: slice.color,
                    },
                  ]}
                />
              </View>
            </View>
          ))}
        </View>

        <Svg width={size} height={size} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          <G rotation="-90" origin={`${cx}, ${cy}`}>
            <Circle cx={cx} cy={cy} r={r} stroke={theme.colors.outlineVariant} strokeWidth={stroke} fill="none" />
            {slices.map((slice) => (
              <Circle
                key={slice.category}
                cx={cx}
                cy={cy}
                r={r}
                stroke={slice.color}
                strokeWidth={stroke}
                fill="none"
                strokeDasharray={`${circumference * slice.pct} ${circumference * (1 - slice.pct)}`}
                strokeDashoffset={-circumference * slice.start}
                strokeLinecap="butt"
              />
            ))}
          </G>
        </Svg>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  chartRow: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-start',
    gap: spacing.lg,
  },
  legend: {
    flex: 1,
    gap: spacing.md,
  },
  legendItem: {
    gap: spacing.xs,
  },
  legendText: {
    alignItems: 'flex-end',
  },
  legendMeta: {
    flexDirection: 'row-reverse',
    gap: spacing.sm,
    marginTop: 2,
  },
  barTrack: {
    height: 6,
    borderRadius: radius.sm,
    overflow: 'hidden',
    marginTop: spacing.xs,
  },
  barFill: {
    height: '100%',
    borderRadius: radius.sm,
  },
});
