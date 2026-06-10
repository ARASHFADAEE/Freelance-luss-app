import React, { memo, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Svg, { Line, Rect, Text as SvgText } from 'react-native-svg';
import { useAppTheme } from '@/core/theme/useAppTheme';
import { radius, spacing } from '@/core/theme/tokens';
import { FONT_FAMILY } from '@/core/theme/fonts';
import { toPersianDigits } from '@/core/utils/persian';
import { AppText } from './AppText';

export interface CashFlowPoint {
  label: string;
  revenue: number;
  expenses: number;
}

interface Props {
  data: CashFlowPoint[];
  height?: number;
  revenueColor?: string;
  expenseColor?: string;
  revenueLabel?: string;
  expenseLabel?: string;
  unitLabel?: string;
}

const MIN_BAR_HEIGHT = 4;
const PADDING_H = 16;
const PADDING_BOTTOM = 28;

function formatAxisValue(value: number): string {
  if (value >= 100) return toPersianDigits(String(Math.round(value)));
  if (value >= 10) return toPersianDigits(value.toFixed(0));
  return toPersianDigits(value < 1 ? value.toFixed(1) : value.toFixed(0));
}

function CashFlowChartComponent({
  data,
  height = 260,
  revenueColor,
  expenseColor,
  revenueLabel = 'درآمد',
  expenseLabel = 'هزینه',
  unitLabel,
}: Props) {
  const theme = useAppTheme();
  const [layoutWidth, setLayoutWidth] = useState(0);
  const revColor = revenueColor ?? theme.custom.success;
  const expColor = expenseColor ?? theme.custom.danger;
  const gridColor = theme.colors.outlineVariant;
  const labelColor = theme.colors.onSurfaceVariant;
  const axisColor = theme.colors.onSurfaceVariant;

  const rtlData = useMemo(() => [...data].reverse(), [data]);

  if (rtlData.length === 0) return null;

  const chartH = height - PADDING_BOTTOM - 20;
  const maxVal = Math.max(...rtlData.flatMap((d) => [d.revenue, d.expenses]), 0.1);
  const containerW = layoutWidth > 0 ? layoutWidth : 320;
  const barGap = spacing.xs + 2;
  const groupCount = rtlData.length;
  const groupW = Math.min(56, Math.max(40, (containerW - PADDING_H * 2) / Math.max(groupCount, 1)));
  const barW = Math.max(10, Math.min(14, (groupW - barGap) / 2));
  const svgW = Math.max(containerW, groupCount * groupW + PADDING_H * 2);
  const baseY = height - PADDING_BOTTOM;
  const hasAnyValue = rtlData.some((d) => d.revenue > 0 || d.expenses > 0);

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((r) => ({
    ratio: r,
    y: baseY - chartH * r,
    value: maxVal * r,
  }));

  const barHeight = (value: number) => {
    if (value <= 0) return 0;
    return Math.max((value / maxVal) * chartH, MIN_BAR_HEIGHT);
  };

  return (
    <View
      style={styles.wrap}
      accessibilityRole="image"
      accessibilityLabel="نمودار جریان نقد درآمد و هزینه"
      onLayout={(e) => {
        const w = e.nativeEvent.layout.width;
        if (w > 0 && w !== layoutWidth) setLayoutWidth(w);
      }}
    >
      {!hasAnyValue && (
        <AppText variant="caption" color="muted" align="center" style={styles.emptyHint}>
          هنوز درآمد یا هزینه‌ای در این بازه ثبت نشده
        </AppText>
      )}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { width: Math.max(containerW, svgW) }]}
      >
        <Svg width={svgW} height={height}>
          {yTicks.map((tick, i) => (
            <React.Fragment key={i}>
              <Line
                x1={PADDING_H}
                y1={tick.y}
                x2={svgW - PADDING_H}
                y2={tick.y}
                stroke={gridColor}
                strokeWidth={1}
              />
              {tick.ratio > 0 && (
                <SvgText
                  x={PADDING_H - 4}
                  y={tick.y + 4}
                  fontSize={9}
                  fill={axisColor}
                  textAnchor="end"
                  fontFamily={FONT_FAMILY}
                >
                  {formatAxisValue(tick.value)}
                </SvgText>
              )}
            </React.Fragment>
          ))}

          {rtlData.map((d, i) => {
            const groupX = PADDING_H + i * groupW;
            const revH = barHeight(d.revenue);
            const expH = barHeight(d.expenses);
            const revX = groupX + (groupW - barW * 2 - barGap) / 2;
            const expX = revX + barW + barGap;
            const revY = baseY - revH;
            const expY = baseY - expH;
            const shortLabel = d.label.length > 6 ? `${d.label.slice(0, 5)}…` : d.label;

            return (
              <React.Fragment key={`${d.label}-${i}`}>
                {revH > 0 && (
                  <Rect x={revX} y={revY} width={barW} height={revH} fill={revColor} rx={3} />
                )}
                {expH > 0 && (
                  <Rect x={expX} y={expY} width={barW} height={expH} fill={expColor} rx={3} />
                )}
                <SvgText
                  x={groupX + groupW / 2}
                  y={height - 6}
                  fontSize={10}
                  fill={labelColor}
                  textAnchor="middle"
                  fontFamily={FONT_FAMILY}
                >
                  {shortLabel}
                </SvgText>
              </React.Fragment>
            );
          })}
        </Svg>
      </ScrollView>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: revColor }]} />
          <AppText variant="caption">{revenueLabel}</AppText>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: expColor }]} />
          <AppText variant="caption">{expenseLabel}</AppText>
        </View>
        {unitLabel ? (
          <AppText variant="overline" color="muted">
            {unitLabel}
          </AppText>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%' },
  emptyHint: { marginBottom: spacing.sm },
  scrollContent: {
    flexDirection: 'row-reverse',
  },
  legend: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: spacing.lg,
    marginTop: spacing.sm,
  },
  legendItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.xs + 2,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: radius.sm,
  },
});

export const CashFlowChart = memo(CashFlowChartComponent);
