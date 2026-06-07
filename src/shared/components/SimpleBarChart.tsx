import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Svg, { Line, Rect, Text as SvgText } from 'react-native-svg';
import { Text } from 'react-native-paper';
import { toPersianDigits } from '@/core/utils/persian';

export interface BarChartPoint {
  label: string;
  revenue: number;
  expenses: number;
}

interface Props {
  data: BarChartPoint[];
  height?: number;
  revenueColor: string;
  expenseColor: string;
  revenueLabel?: string;
  expenseLabel?: string;
}

const MIN_BAR_HEIGHT = 6;

export function SimpleBarChart({
  data,
  height = 280,
  revenueColor,
  expenseColor,
  revenueLabel = 'درآمد',
  expenseLabel = 'هزینه',
}: Props) {
  const [layoutWidth, setLayoutWidth] = useState(0);

  if (data.length === 0) return null;

  const chartH = height - 48;
  const maxVal = Math.max(...data.flatMap((d) => [d.revenue, d.expenses]), 0.1);
  const groupW = 52;
  const barW = 16;
  const gap = 6;
  const containerW = layoutWidth > 0 ? layoutWidth : 320;
  const svgW = Math.max(containerW, data.length * (groupW + gap) + 32);
  const baseY = height - 28;
  const hasAnyValue = data.some((d) => d.revenue > 0 || d.expenses > 0);

  const gridLines = [0.25, 0.5, 0.75, 1].map((r) => baseY - chartH * r);

  const barHeight = (value: number) => {
    if (value <= 0) return 0;
    return Math.max((value / maxVal) * chartH, MIN_BAR_HEIGHT);
  };

  return (
    <View
      style={styles.wrap}
      onLayout={(e) => {
        const w = e.nativeEvent.layout.width;
        if (w > 0 && w !== layoutWidth) setLayoutWidth(w);
      }}
    >
      {!hasAnyValue && (
        <Text variant="bodySmall" style={styles.emptyHint}>
          هنوز درآمد یا هزینه‌ای در این بازه ثبت نشده
        </Text>
      )}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ width: Math.max(containerW, svgW), direction: 'ltr' }}
      >
        <Svg width={svgW} height={height}>
          {gridLines.map((y, i) => (
            <Line key={i} x1={16} y1={y} x2={svgW - 16} y2={y} stroke="#f3f4f6" strokeWidth={1} />
          ))}

          {data.map((d, i) => {
            const x = 24 + i * (groupW + gap);
            const revH = barHeight(d.revenue);
            const expH = barHeight(d.expenses);
            const revY = baseY - revH;
            const expY = baseY - expH;

            return (
              <React.Fragment key={`${d.label}-${i}`}>
                {d.revenue > 0 && (
                  <SvgText x={x + barW / 2} y={revY - 4} fontSize={9} fill="#6b7280" textAnchor="middle">
                    {toPersianDigits(d.revenue < 10 ? d.revenue.toFixed(1) : Math.round(d.revenue))}
                  </SvgText>
                )}
                {revH > 0 && (
                  <Rect x={x} y={revY} width={barW} height={revH} fill={revenueColor} rx={4} opacity={0.9} />
                )}
                {expH > 0 && (
                  <Rect x={x + barW + 4} y={expY} width={barW} height={expH} fill={expenseColor} rx={4} opacity={0.85} />
                )}
                <SvgText x={x + groupW / 2} y={height - 8} fontSize={10} fill="#374151" textAnchor="middle" fontWeight="500">
                  {d.label.length > 8 ? d.label.slice(0, 7) + '…' : d.label}
                </SvgText>
              </React.Fragment>
            );
          })}
        </Svg>
      </ScrollView>

      <View style={styles.legend}>
        {revenueLabel ? (
          <View style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: revenueColor }]} />
            <Text variant="labelMedium">{revenueLabel}</Text>
          </View>
        ) : null}
        {expenseLabel ? (
          <View style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: expenseColor }]} />
            <Text variant="labelMedium">{expenseLabel}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%' },
  emptyHint: { textAlign: 'center', color: '#6b7280', marginBottom: 8 },
  legend: { flexDirection: 'row-reverse', justifyContent: 'center', gap: 24, marginTop: 8 },
  legendItem: { flexDirection: 'row-reverse', alignItems: 'center', gap: 8 },
  dot: { width: 10, height: 10, borderRadius: 5 },
});
