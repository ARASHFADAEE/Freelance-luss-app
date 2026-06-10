import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '@/core/theme/useAppTheme';
import { useQuery } from '@tanstack/react-query';
import {
  analyticsQueryKeys,
  liveAnalyticsQueryOptions,
  useRefetchAnalyticsOnFocus,
} from '@/core/query/analyticsQueries';
import { analyticsRepository } from '@/database';
import { formatCurrency } from '@/core/utils/currency';
import { addDaysISO, todayISO } from '@/core/utils/persian';
import { useProfileStore } from '@/stores/profileStore';
import { useHasProFeatures, useIsInTrial } from '@/hooks/useHasProFeatures';
import { CashFlowChart } from '@/shared/components/CashFlowChart';
import { ChartContainer } from '@/shared/components/ChartContainer';
import { ExpenseBreakdownChart } from '@/shared/components/ExpenseBreakdownChart';
import { AppText } from '@/shared/components/AppText';
import { PageHeader } from '@/shared/components/PageHeader';
import { AmountText } from '@/shared/components/AmountText';
import { KPICard } from '@/shared/components/KPICard';
import { spacing, radius } from '@/core/theme/tokens';
import { PeriodToggle } from '@/shared/components/PeriodToggle';
import { ReportListCard } from '@/shared/components/ReportListCard';
import { JalaliDateField } from '@/shared/components/JalaliDateField';
import { FilterChips } from '@/shared/components/FilterChips';
import { EmptyState } from '@/shared/components/EmptyState';
import { SkeletonCard } from '@/shared/components/Skeleton';
import { rtlLayoutStyle } from '@/core/theme/rtlLayout';
import type { RootTabParamList } from '@/navigation/types';

type PeriodFilter = 'monthly' | 'yearly' | 'custom';
type ReportTab = 'summary' | 'clients' | 'services' | 'expenses';

interface Props {
  embedded?: boolean;
}

export function ReportsScreen({ embedded = false }: Props) {
  const theme = useAppTheme();
  const navigation = useNavigation<BottomTabNavigationProp<RootTabParamList>>();
  const insets = useSafeAreaInsets();
  const currency = useProfileStore((s) => s.profile?.currency ?? 'TOMAN');
  const hasPro = useHasProFeatures();
  const isInTrial = useIsInTrial();
  const [period, setPeriod] = useState<PeriodFilter>('monthly');
  const [reportTab, setReportTab] = useState<ReportTab>('summary');
  const [fromDate, setFromDate] = useState(addDaysISO(todayISO(), -90));
  const [toDate, setToDate] = useState(todayISO());

  useRefetchAnalyticsOnFocus();

  const { data: clientReports = [], isLoading: clientsLoading } = useQuery({
    queryKey: analyticsQueryKeys.clientReports,
    queryFn: () => analyticsRepository.getClientReports(),
    enabled: hasPro,
    ...liveAnalyticsQueryOptions,
  });

  const { data: serviceReports = [], isLoading: servicesLoading } = useQuery({
    queryKey: analyticsQueryKeys.serviceReports,
    queryFn: () => analyticsRepository.getServiceReports(),
    enabled: hasPro,
    ...liveAnalyticsQueryOptions,
  });

  const { data: presetChart = [], isLoading: chartLoading } = useQuery({
    queryKey: [...analyticsQueryKeys.reportChart, period],
    queryFn: () =>
      period === 'monthly'
        ? analyticsRepository.getMonthlyData(12)
        : analyticsRepository.getYearlyData(5),
    enabled: hasPro && period !== 'custom',
    ...liveAnalyticsQueryOptions,
  });

  const { data: rangeData, isLoading: rangeLoading } = useQuery({
    queryKey: [...analyticsQueryKeys.reportRange, fromDate, toDate],
    queryFn: () => analyticsRepository.getRangeData(fromDate, toDate),
    enabled: hasPro && period === 'custom',
    ...liveAnalyticsQueryOptions,
  });

  const { data: expenseBreakdown = [], isLoading: expensesLoading } = useQuery({
    queryKey: [...analyticsQueryKeys.expenseBreakdown, period, fromDate, toDate],
    queryFn: () =>
      period === 'custom'
        ? analyticsRepository.getExpenseBreakdownInRange(fromDate, toDate)
        : analyticsRepository.getExpenseBreakdown(),
    enabled: hasPro,
    ...liveAnalyticsQueryOptions,
  });

  const chartSource = period === 'custom' ? (rangeData?.chart ?? []) : presetChart;
  const totalRevenue =
    period === 'custom' ? (rangeData?.revenue ?? 0) : presetChart.reduce((s, m) => s + m.revenue, 0);
  const totalExpenses =
    period === 'custom' ? (rangeData?.expenses ?? 0) : presetChart.reduce((s, m) => s + m.expenses, 0);
  const profit = totalRevenue - totalExpenses;

  const bars = useMemo(
    () =>
      chartSource.map((m) => ({
        label: period === 'yearly' ? m.label : m.label.split(' ')[0],
        revenue: m.revenue / 1_000_000,
        expenses: m.expenses / 1_000_000,
      })),
    [chartSource, period],
  );

  const isChartLoading = chartLoading || rangeLoading;

  if (!hasPro) {
    return (
      <View
        style={[styles.locked, { backgroundColor: theme.colors.background }]}
        accessibilityRole="alert"
        accessibilityLabel="گزارش‌های پیشرفته نیاز به اشتراک Pro دارند"
      >
        <View style={[styles.previewBlur, { borderColor: theme.colors.outlineVariant }]}>
          <SkeletonCard />
          <SkeletonCard />
        </View>
        <AppText variant="h3" align="center" style={{ marginTop: spacing.lg }}>
          گزارش‌های پیشرفته
        </AppText>
        <AppText variant="body" color="muted" align="center" style={styles.lockedDesc}>
          {isInTrial
            ? 'دوره آزمایشی شما تمام شده است.'
            : '۳ روز اول رایگان است — سپس اشتراک Pro برای نمودار و گزارش لازم است.'}
        </AppText>
        <Button
          mode="contained"
          style={{ marginTop: spacing.lg }}
          accessibilityLabel="خرید اشتراک Pro"
          onPress={() => navigation.navigate('More', { screen: 'Subscription' })}
        >
          خرید اشتراک Pro
        </Button>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.background, ...rtlLayoutStyle }}
      contentContainerStyle={[
        styles.content,
        embedded ? styles.embeddedContent : { paddingTop: insets.top + spacing.md },
      ]}
      accessibilityLabel="صفحه گزارش‌های مالی"
    >
      {!embedded ? (
        <PageHeader title="گزارش درآمد" topInset={insets.top + spacing.xs}>
          <FilterChips
            value={reportTab}
            onChange={setReportTab}
            options={[
              { value: 'summary', label: 'خلاصه' },
              { value: 'clients', label: 'مشتریان' },
              { value: 'services', label: 'خدمات' },
              { value: 'expenses', label: 'هزینه‌ها' },
            ]}
          />
        </PageHeader>
      ) : (
        <View style={styles.embeddedTabs}>
          <FilterChips
            value={reportTab}
            onChange={setReportTab}
            accessibilityGroupLabel="بخش گزارش"
            options={[
              { value: 'summary', label: 'خلاصه' },
              { value: 'clients', label: 'مشتریان' },
              { value: 'services', label: 'خدمات' },
              { value: 'expenses', label: 'هزینه‌ها' },
            ]}
          />
        </View>
      )}

      {reportTab === 'summary' && (
        <>
          <PeriodToggle
            value={period}
            onChange={setPeriod}
            options={[
              { value: 'monthly', label: 'ماهانه', icon: 'calendar-month' },
              { value: 'yearly', label: 'سالانه', icon: 'calendar-range' },
              { value: 'custom', label: 'بازه', icon: 'calendar-edit' },
            ]}
          />

          {period === 'custom' && (
            <View
              style={[
                styles.dateBox,
                { borderColor: theme.colors.outlineVariant, backgroundColor: theme.colors.surface },
              ]}
            >
              <AppText variant="h3" style={{ marginBottom: spacing.sm }}>
                فیلتر تاریخ
              </AppText>
              <JalaliDateField label="از تاریخ" value={fromDate} onChange={setFromDate} />
              <JalaliDateField label="تا تاریخ" value={toDate} onChange={setToDate} />
            </View>
          )}

          <View style={styles.kpiRow}>
            <KPICard
              variant="compact"
              title="درآمد"
              value={formatCurrency(totalRevenue, currency)}
              icon="cash"
              accentColor={theme.custom.success}
            />
            <KPICard
              variant="compact"
              title="هزینه"
              value={formatCurrency(totalExpenses, currency)}
              icon="cash-minus"
              accentColor={theme.custom.danger}
              positiveIsGood={false}
            />
            <KPICard
              variant="compact"
              title="سود"
              value={formatCurrency(profit, currency)}
              icon="chart-line"
              accentColor={profit >= 0 ? theme.colors.primary : theme.custom.danger}
            />
          </View>

          {isChartLoading ? (
            <SkeletonCard />
          ) : bars.length > 0 ? (
            <ChartContainer
              title={period === 'monthly' ? '۱۲ ماه اخیر' : period === 'yearly' ? '۵ سال اخیر' : 'نمودار بازه'}
              subtitle="میلیون تومان"
              style={styles.chartBox}
            >
              <CashFlowChart
                key={bars.map((d) => `${d.label}:${d.revenue}:${d.expenses}`).join('|')}
                data={bars}
                revenueColor={theme.custom.success}
                expenseColor={theme.custom.danger}
                unitLabel="میلیون تومان"
              />
            </ChartContainer>
          ) : (
            <EmptyState icon="chart-bar" title="داده‌ای برای نمودار نیست" />
          )}
        </>
      )}

      {reportTab === 'clients' && (
        <>
          <AppText variant="h3" style={styles.sectionTitle}>
            مشتریان برتر
          </AppText>
          {clientsLoading ? (
            <SkeletonCard />
          ) : clientReports.length === 0 ? (
            <EmptyState icon="account-group-outline" title="داده‌ای ثبت نشده" />
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
                accessibilityLabel={`رتبه ${i + 1}، ${c.clientName}، درآمد ${formatCurrency(c.totalRevenue, currency)}`}
              />
            ))
          )}
        </>
      )}

      {reportTab === 'services' && (
        <>
          <AppText variant="h3" style={styles.sectionTitle}>
            خدمات پرفروش
          </AppText>
          {servicesLoading ? (
            <SkeletonCard />
          ) : serviceReports.length === 0 ? (
            <EmptyState icon="briefcase-outline" title="داده‌ای ثبت نشده" />
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
                accessibilityLabel={`رتبه ${i + 1}، ${s.serviceTitle}`}
              />
            ))
          )}
        </>
      )}

      {reportTab === 'expenses' && (
        <>
          <AppText variant="h3" style={styles.sectionTitle}>
            تفکیک هزینه‌ها
          </AppText>
          {expensesLoading ? (
            <SkeletonCard />
          ) : expenseBreakdown.length === 0 ? (
            <EmptyState icon="cash-minus" title="هزینه‌ای ثبت نشده" />
          ) : (
            <ChartContainer title="سهم هر دسته" subtitle="بر اساس مبلغ ثبت‌شده">
              <ExpenseBreakdownChart data={expenseBreakdown} currency={currency} />
              <View style={[styles.expenseTotal, { borderTopColor: theme.colors.outlineVariant }]}>
                <AmountText variant="bodyMedium" color="danger">
                  {formatCurrency(
                    expenseBreakdown.reduce((s, e) => s + e.amount, 0),
                    currency,
                  )}
                </AmountText>
                <AppText variant="caption" color="muted">
                  مجموع هزینه‌ها
                </AppText>
              </View>
            </ChartContainer>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, paddingBottom: spacing['2xl'] },
  embeddedContent: { paddingTop: spacing.sm, paddingBottom: 100 },
  embeddedTabs: { marginBottom: spacing.lg },
  dateBox: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.lg,
    padding: spacing.lg - 2,
    marginBottom: spacing.lg,
  },
  kpiRow: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  chartBox: { marginBottom: spacing.md },
  sectionTitle: { marginBottom: spacing.md },
  expenseTotal: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  locked: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing['2xl'] },
  lockedDesc: { marginTop: spacing.sm, maxWidth: 300, lineHeight: 24 },
  previewBlur: {
    width: '100%',
    maxWidth: 320,
    opacity: 0.45,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
});
