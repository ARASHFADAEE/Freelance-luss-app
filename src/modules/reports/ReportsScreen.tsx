import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SegmentedButtons, Text } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '@/core/theme/useAppTheme';
import { useQuery } from '@tanstack/react-query';
import { analyticsRepository } from '@/database';
import { formatCurrency } from '@/core/utils/currency';
import { useProfileStore } from '@/stores/profileStore';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import { SimpleBarChart } from '@/shared/components/SimpleBarChart';

type PeriodFilter = 'monthly' | 'yearly';

export function ReportsScreen() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const currency = useProfileStore((s) => s.profile?.currency ?? 'TOMAN');
  const isPro = useSubscriptionStore((s) => s.plan === 'pro');
  const [period, setPeriod] = useState<PeriodFilter>('monthly');

  const { data: clientReports = [] } = useQuery({
    queryKey: ['client-reports'],
    queryFn: () => analyticsRepository.getClientReports(),
    enabled: isPro,
  });

  const { data: serviceReports = [] } = useQuery({
    queryKey: ['service-reports'],
    queryFn: () => analyticsRepository.getServiceReports(),
    enabled: isPro,
  });

  const { data: expenseBreakdown = [] } = useQuery({
    queryKey: ['expense-breakdown'],
    queryFn: () => analyticsRepository.getExpenseBreakdown(),
    enabled: isPro,
  });

  const { data: chartData = [] } = useQuery({
    queryKey: ['report-chart', period],
    queryFn: () =>
      period === 'monthly'
        ? analyticsRepository.getMonthlyData(12)
        : analyticsRepository.getYearlyData(5),
    enabled: isPro,
  });

  if (!isPro) {
    return (
      <View style={[styles.locked, { backgroundColor: theme.colors.background }]}>
        <Text variant="titleMedium" style={{ textAlign: 'center' }}>گزارش‌های پیشرفته فقط در پلن Pro</Text>
      </View>
    );
  }

  const bars = chartData.map((m) => ({
    label: period === 'monthly' ? m.label.split(' ')[0] : m.label,
    revenue: m.revenue / 1_000_000,
    expenses: m.expenses / 1_000_000,
  }));

  const totalRevenue = chartData.reduce((s, m) => s + m.revenue, 0);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background, direction: 'rtl' }} contentContainerStyle={[styles.content, { paddingTop: insets.top + 12 }]}>
      <Text variant="titleLarge" style={styles.title}>گزارش درآمد</Text>

      <SegmentedButtons
        value={period}
        onValueChange={(v) => setPeriod(v as PeriodFilter)}
        buttons={[
          { value: 'monthly', label: 'ماهانه' },
          { value: 'yearly', label: 'سالانه' },
        ]}
        style={{ marginBottom: 16 }}
      />

      {bars.length > 0 && (
        <View style={[styles.chartBox, { borderColor: theme.colors.outlineVariant, backgroundColor: theme.colors.surface }]}>
          <View style={styles.chartHeader}>
            <Text variant="labelLarge" style={{ fontWeight: '600' }}>
              {period === 'monthly' ? '۱۲ ماه اخیر' : '۵ سال اخیر'}
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              مجموع: {formatCurrency(totalRevenue, currency)}
            </Text>
          </View>
          <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 8, textAlign: 'right' }}>
            میلیون تومان
          </Text>
          <SimpleBarChart
            data={bars}
            revenueColor={theme.custom.success}
            expenseColor={theme.custom.danger}
            revenueLabel="درآمد"
            expenseLabel="هزینه"
          />
        </View>
      )}

      <Text variant="titleMedium" style={styles.sectionTitle}>مشتریان</Text>
      {clientReports.map((c) => (
        <View key={c.clientId} style={[styles.row, { borderColor: theme.colors.outlineVariant }]}>
          <Text variant="bodyMedium" style={{ fontWeight: '600', textAlign: 'right' }}>{c.clientName}</Text>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'right' }}>
            {formatCurrency(c.totalRevenue, currency)} · {c.projectCount} پروژه
          </Text>
        </View>
      ))}

      <Text variant="titleMedium" style={styles.sectionTitle}>خدمات</Text>
      {serviceReports.map((s) => (
        <View key={s.serviceId} style={[styles.row, { borderColor: theme.colors.outlineVariant }]}>
          <Text variant="bodyMedium" style={{ fontWeight: '600', textAlign: 'right' }}>{s.serviceTitle}</Text>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'right' }}>
            {formatCurrency(s.totalRevenue, currency)} · {s.usageCount} بار
          </Text>
        </View>
      ))}

      {expenseBreakdown.length > 0 && (
        <>
          <Text variant="titleMedium" style={styles.sectionTitle}>هزینه‌ها</Text>
          {expenseBreakdown.map((e) => (
            <View key={e.category} style={styles.expenseRow}>
              <Text>{formatCurrency(e.amount, currency)}</Text>
              <Text variant="bodyMedium">{e.category}</Text>
            </View>
          ))}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 40 },
  title: { fontWeight: '700', marginBottom: 16, textAlign: 'right' },
  chartHeader: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  sectionTitle: { fontWeight: '600', marginTop: 20, marginBottom: 12, textAlign: 'right' },
  chartBox: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 16, padding: 16, marginBottom: 8 },
  row: { borderBottomWidth: StyleSheet.hairlineWidth, paddingVertical: 12 },
  expenseRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', paddingVertical: 8 },
  locked: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
});
