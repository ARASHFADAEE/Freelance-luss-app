import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '@/core/theme/useAppTheme';
import { useQuery } from '@tanstack/react-query';
import { analyticsRepository } from '@/database';
import { formatCurrency } from '@/core/utils/currency';
import { addDaysISO, todayISO } from '@/core/utils/persian';
import { useProfileStore } from '@/stores/profileStore';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import { SimpleBarChart } from '@/shared/components/SimpleBarChart';
import { PeriodToggle } from '@/shared/components/PeriodToggle';
import { ReportListCard } from '@/shared/components/ReportListCard';
import { JalaliDateField } from '@/shared/components/JalaliDateField';
import { useResponsive } from '@/core/hooks/useResponsive';

type PeriodFilter = 'monthly' | 'yearly' | 'custom';

export function ReportsScreen() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const { isWide } = useResponsive();
  const currency = useProfileStore((s) => s.profile?.currency ?? 'TOMAN');
  const isPro = useSubscriptionStore((s) => s.plan === 'pro');
  const [period, setPeriod] = useState<PeriodFilter>('monthly');
  const [fromDate, setFromDate] = useState(addDaysISO(todayISO(), -90));
  const [toDate, setToDate] = useState(todayISO());

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

  const { data: presetChart = [] } = useQuery({
    queryKey: ['report-chart', period],
    queryFn: () =>
      period === 'monthly'
        ? analyticsRepository.getMonthlyData(12)
        : analyticsRepository.getYearlyData(5),
    enabled: isPro && period !== 'custom',
  });

  const { data: rangeData } = useQuery({
    queryKey: ['report-range', fromDate, toDate],
    queryFn: () => analyticsRepository.getRangeData(fromDate, toDate),
    enabled: isPro && period === 'custom',
  });

  const { data: expenseBreakdown = [] } = useQuery({
    queryKey: ['expense-breakdown', period, fromDate, toDate],
    queryFn: () =>
      period === 'custom'
        ? analyticsRepository.getExpenseBreakdownInRange(fromDate, toDate)
        : analyticsRepository.getExpenseBreakdown(),
    enabled: isPro,
  });

  const chartSource = period === 'custom' ? (rangeData?.chart ?? []) : presetChart;
  const totalRevenue = period === 'custom'
    ? (rangeData?.revenue ?? 0)
    : presetChart.reduce((s, m) => s + m.revenue, 0);
  const totalExpenses = period === 'custom'
    ? (rangeData?.expenses ?? 0)
    : presetChart.reduce((s, m) => s + m.expenses, 0);

  const bars = useMemo(() => chartSource.map((m) => ({
    label: period === 'yearly' ? m.label : m.label.split(' ')[0],
    revenue: m.revenue / 1_000_000,
    expenses: m.expenses / 1_000_000,
  })), [chartSource, period]);

  if (!isPro) {
    return (
      <View style={[styles.locked, { backgroundColor: theme.colors.background }]}>
        <Text variant="titleMedium" style={{ textAlign: 'center' }}>گزارش‌های پیشرفته فقط در پلن Pro</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.background, direction: 'rtl' }}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 12 }]}
    >
      <Text variant="titleLarge" style={styles.title}>گزارش درآمد</Text>

      <PeriodToggle
        value={period}
        onChange={setPeriod}
        options={[
          { value: 'monthly', label: 'ماهانه', icon: 'calendar-month' },
          { value: 'yearly', label: 'سالانه', icon: 'calendar-range' },
          { value: 'custom', label: 'بازه دلخواه', icon: 'calendar-edit' },
        ]}
      />

      {period === 'custom' && (
        <View style={[styles.dateBox, { borderColor: theme.colors.outlineVariant, backgroundColor: theme.colors.surface }]}>
          <Text variant="labelLarge" style={{ textAlign: 'right', marginBottom: 8, fontWeight: '600' }}>فیلتر پیشرفته تاریخ</Text>
          <JalaliDateField label="از تاریخ" value={fromDate} onChange={setFromDate} />
          <JalaliDateField label="تا تاریخ" value={toDate} onChange={setToDate} />
        </View>
      )}

      <View style={[styles.summaryRow, isWide && styles.summaryRowWide]}>
        <View style={[styles.statBox, { backgroundColor: theme.custom.success + '14', borderColor: theme.custom.success + '30' }]}>
          <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>درآمد</Text>
          <Text variant="titleMedium" style={{ color: theme.custom.success, fontWeight: '700' }}>{formatCurrency(totalRevenue, currency)}</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: theme.custom.danger + '14', borderColor: theme.custom.danger + '30' }]}>
          <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>هزینه</Text>
          <Text variant="titleMedium" style={{ color: theme.custom.danger, fontWeight: '700' }}>{formatCurrency(totalExpenses, currency)}</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: theme.colors.primary + '10', borderColor: theme.colors.primary + '25' }]}>
          <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>سود</Text>
          <Text variant="titleMedium" style={{ color: theme.colors.primary, fontWeight: '700' }}>{formatCurrency(totalRevenue - totalExpenses, currency)}</Text>
        </View>
      </View>

      {bars.length > 0 && (
        <View style={[styles.chartBox, { borderColor: theme.colors.outlineVariant, backgroundColor: theme.colors.surface }]}>
          <Text variant="labelLarge" style={{ fontWeight: '600', textAlign: 'right', marginBottom: 4 }}>
            {period === 'monthly' ? '۱۲ ماه اخیر' : period === 'yearly' ? '۵ سال اخیر' : 'نمودار بازه انتخابی'}
          </Text>
          <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 8, textAlign: 'right' }}>میلیون تومان</Text>
          <SimpleBarChart data={bars} revenueColor={theme.custom.success} expenseColor={theme.custom.danger} revenueLabel="درآمد" expenseLabel="هزینه" />
        </View>
      )}

      <Text variant="titleMedium" style={styles.sectionTitle}>مشتریان برتر</Text>
      {clientReports.length === 0 ? (
        <Text variant="bodySmall" style={styles.emptyHint}>داده‌ای ثبت نشده</Text>
      ) : (
        clientReports.map((c, i) => (
          <ReportListCard
            key={c.clientId}
            rank={i + 1}
            icon="account"
            title={c.clientName}
            subtitle={`${c.projectCount} پروژه · ${c.invoiceCount} فاکتور`}
            value={formatCurrency(c.totalRevenue, currency)}
            accentColor={theme.colors.primary}
          />
        ))
      )}

      <Text variant="titleMedium" style={styles.sectionTitle}>خدمات پرفروش</Text>
      {serviceReports.length === 0 ? (
        <Text variant="bodySmall" style={styles.emptyHint}>داده‌ای ثبت نشده</Text>
      ) : (
        serviceReports.map((s, i) => (
          <ReportListCard
            key={s.serviceId}
            rank={i + 1}
            icon="briefcase-outline"
            title={s.serviceTitle}
            subtitle={`${s.usageCount} بار استفاده`}
            value={formatCurrency(s.totalRevenue, currency)}
            accentColor={theme.custom.secondary}
          />
        ))
      )}

      {expenseBreakdown.length > 0 && (
        <>
          <Text variant="titleMedium" style={styles.sectionTitle}>تفکیک هزینه‌ها</Text>
          {expenseBreakdown.map((e, i) => {
            const max = expenseBreakdown[0]?.amount ?? 1;
            const pct = Math.round((e.amount / max) * 100);
            return (
              <View key={e.category} style={[styles.expenseCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant }]}>
                <View style={styles.expenseHeader}>
                  <Text variant="bodyMedium" style={{ fontWeight: '600' }}>{formatCurrency(e.amount, currency)}</Text>
                  <Text variant="bodyLarge" style={{ fontWeight: '600' }}>{e.category}</Text>
                </View>
                <View style={[styles.expenseBar, { backgroundColor: theme.colors.outlineVariant + '60' }]}>
                  <View style={[styles.expenseFill, { width: `${pct}%`, backgroundColor: theme.custom.danger }]} />
                </View>
              </View>
            );
          })}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 40 },
  title: { fontWeight: '700', marginBottom: 16, textAlign: 'right' },
  dateBox: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 14, padding: 14, marginBottom: 16 },
  summaryRow: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  summaryRowWide: { flexWrap: 'nowrap' },
  statBox: { flex: 1, minWidth: 100, borderWidth: 1, borderRadius: 12, padding: 12, alignItems: 'flex-end', gap: 4 },
  chartBox: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 16, padding: 16, marginBottom: 8 },
  sectionTitle: { fontWeight: '700', marginTop: 20, marginBottom: 12, textAlign: 'right' },
  emptyHint: { color: '#9ca3af', textAlign: 'center', marginBottom: 8 },
  expenseCard: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 12, padding: 14, marginBottom: 8 },
  expenseHeader: { flexDirection: 'row-reverse', justifyContent: 'space-between', marginBottom: 8 },
  expenseBar: { height: 6, borderRadius: 3, overflow: 'hidden' },
  expenseFill: { height: '100%', borderRadius: 3 },
  locked: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
});
