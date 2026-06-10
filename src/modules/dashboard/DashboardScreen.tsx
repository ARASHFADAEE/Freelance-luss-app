import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  analyticsQueryKeys,
  liveAnalyticsQueryOptions,
  useRefetchAnalyticsOnFocus,
} from '@/core/query/analyticsQueries';
import { analyticsRepository } from '@/database';
import { formatCurrency } from '@/core/utils/currency';
import { useProfileStore } from '@/stores/profileStore';
import { useHasProFeatures, useIsInTrial } from '@/hooks/useHasProFeatures';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import { TrialBanner } from '@/shared/components/TrialBanner';
import { ScreenContainer } from '@/shared/components/ScreenContainer';
import { KPICard } from '@/shared/components/KPICard';
import { SkeletonCard } from '@/shared/components/Skeleton';
import { CashFlowChart } from '@/shared/components/CashFlowChart';
import { ChartContainer } from '@/shared/components/ChartContainer';
import { QuickActionGrid } from '@/shared/components/QuickActionGrid';
import { InsightCard } from '@/shared/components/InsightCard';
import { AppText } from '@/shared/components/AppText';
import { APP_NAME } from '@/core/constants';
import { useAppTheme } from '@/core/theme/useAppTheme';
import { radius, spacing } from '@/core/theme/tokens';
import type { RootTabParamList } from '@/navigation/types';

export function DashboardScreen() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<BottomTabNavigationProp<RootTabParamList>>();
  const profile = useProfileStore((s) => s.profile);
  const hasPro = useHasProFeatures();
  const isInTrial = useIsInTrial();
  const trialDaysRemaining = useSubscriptionStore((s) => s.getTrialDaysRemaining);
  const currency = profile?.currency ?? 'TOMAN';

  useRefetchAnalyticsOnFocus();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: analyticsQueryKeys.dashboardStats,
    queryFn: () => analyticsRepository.getDashboardStats(),
    ...liveAnalyticsQueryOptions,
  });

  const { data: insights = [], isLoading: insightsLoading } = useQuery({
    queryKey: analyticsQueryKeys.dashboardInsights,
    queryFn: () => analyticsRepository.getDashboardInsights(),
    ...liveAnalyticsQueryOptions,
  });

  const { data: monthlyData, isLoading: chartLoading } = useQuery({
    queryKey: analyticsQueryKeys.monthlyData,
    queryFn: () => analyticsRepository.getMonthlyData(6),
    enabled: hasPro,
    ...liveAnalyticsQueryOptions,
  });

  const chartData = useMemo(
    () =>
      (monthlyData ?? []).map((m) => ({
        label: m.label.split(' ')[0],
        revenue: m.revenue / 1_000_000,
        expenses: m.expenses / 1_000_000,
      })),
    [monthlyData],
  );

  const chartKey = useMemo(
    () => chartData.map((d) => `${d.label}:${d.revenue}:${d.expenses}`).join('|'),
    [chartData],
  );

  const quickActions = useMemo(
    () => [
      {
        id: 'client',
        label: 'مشتری',
        icon: 'account-plus' as const,
        color: theme.colors.primary,
        onPress: () => navigation.navigate('Clients', { screen: 'ClientForm', params: {} }),
      },
      {
        id: 'project',
        label: 'پروژه',
        icon: 'briefcase-plus-outline' as const,
        color: theme.colors.primary,
        onPress: () => navigation.navigate('Projects', { screen: 'ProjectForm', params: {} }),
      },
      {
        id: 'invoice',
        label: 'فاکتور',
        icon: 'file-document-plus-outline' as const,
        color: theme.custom.info,
        onPress: () => navigation.navigate('Invoices', { screen: 'InvoiceForm', params: {} }),
      },
      {
        id: 'payment',
        label: 'پرداخت',
        icon: 'cash-plus' as const,
        color: theme.custom.success,
        onPress: () => navigation.navigate('Projects', { screen: 'ProjectsList' }),
      },
      {
        id: 'expense',
        label: 'هزینه',
        icon: 'cash-minus' as const,
        color: theme.custom.danger,
        onPress: () => navigation.navigate('Financial', { screen: 'ExpenseForm', params: {} }),
      },
      {
        id: 'reports',
        label: 'گزارش',
        icon: 'chart-bar' as const,
        color: theme.custom.warning,
        onPress: () =>
          navigation.navigate('Financial', { screen: 'FinancialHub', params: { initialTab: 'reports' } }),
      },
    ],
    [navigation, theme],
  );

  const header = (
    <View style={[styles.header, { paddingTop: insets.top + spacing.xs }]}>
      <AppText variant="h1">{APP_NAME}</AppText>
      <AppText variant="caption" color="muted">
        {profile?.fullName ? `سلام ${profile.fullName}` : 'خلاصه مالی'}
        {hasPro ? (isInTrial ? ' · دوره آزمایشی' : ' · Pro') : ''}
      </AppText>
    </View>
  );

  return (
    <ScreenContainer header={header} contentStyle={styles.content}>
      {isInTrial && (
        <TrialBanner
          variant="compact"
          daysRemaining={trialDaysRemaining()}
          onPress={() => navigation.navigate('More', { screen: 'Subscription' })}
        />
      )}

      {statsLoading ? (
        <View style={styles.grid}>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </View>
      ) : stats ? (
        <>
          <KPICard
            variant="hero"
            title="سود خالص این ماه"
            value={formatCurrency(stats.monthlyProfit, currency)}
            icon="trending-up"
            accentColor={stats.monthlyProfit >= 0 ? theme.custom.success : theme.custom.danger}
            trendPercent={stats.profitTrendPercent}
            positiveIsGood
            style={styles.heroCard}
          />
          <View style={styles.kpiStrip}>
            <KPICard
              variant="compact"
              title="درآمد"
              value={formatCurrency(stats.monthlyRevenue, currency)}
              icon="cash"
              accentColor={theme.custom.success}
              trendPercent={stats.revenueTrendPercent}
            />
            <KPICard
              variant="compact"
              title="مطالبات"
              value={formatCurrency(stats.outstandingReceivables, currency)}
              icon="clock-outline"
              accentColor={theme.custom.warning}
            />
            <KPICard
              variant="compact"
              title="هزینه"
              value={formatCurrency(stats.monthlyExpenses, currency)}
              icon="cash-minus"
              accentColor={theme.custom.danger}
              trendPercent={stats.expenseTrendPercent}
              positiveIsGood={false}
            />
            <KPICard
              variant="compact"
              title="سود ماه"
              value={formatCurrency(stats.monthlyProfit, currency)}
              icon="chart-line"
              accentColor={theme.colors.primary}
            />
          </View>
        </>
      ) : null}

      {hasPro && (
        <ChartContainer
          title="جریان نقد ۶ ماهه"
          subtitle="مقایسه درآمد و هزینه — میلیون تومان"
          style={styles.chartSection}
        >
          {chartLoading ? (
            <SkeletonCard />
          ) : chartData.length > 0 ? (
            <CashFlowChart
              key={chartKey}
              data={chartData}
              revenueColor={theme.custom.success}
              expenseColor={theme.custom.danger}
              unitLabel="میلیون تومان"
            />
          ) : null}
        </ChartContainer>
      )}

      {!hasPro && (
        <AppText variant="caption" color="muted" align="center" style={styles.proHint}>
          نمودارها با اشتراک Pro یا دوره آزمایشی ۳ روزه فعال می‌شود
        </AppText>
      )}

      {(insightsLoading || insights.length > 0) && (
        <View style={styles.section}>
          <AppText variant="h2" style={styles.sectionTitle}>
            بینش‌های سریع
          </AppText>
          {insightsLoading ? (
            <SkeletonCard />
          ) : (
            insights.map((insight) => <InsightCard key={insight.id} insight={insight} />)
          )}
        </View>
      )}

      <View style={styles.section}>
        <AppText variant="h2" style={styles.sectionTitle}>
          دسترسی سریع
        </AppText>
        <QuickActionGrid actions={quickActions} />
      </View>

      {stats && (
        <View style={[styles.footerStats, { borderColor: theme.colors.outlineVariant }]}>
          <AppText variant="caption" color="muted">
            {stats.activeProjects} پروژه فعال · {stats.unpaidInvoices} فاکتور باز
            {stats.overdueInvoices > 0 ? ` · ${stats.overdueInvoices} سررسید گذشته` : ''}
          </AppText>
        </View>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 0 },
  header: { marginBottom: spacing.lg },
  heroCard: { marginBottom: spacing.md },
  kpiStrip: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: spacing.sm + 2,
    marginBottom: spacing.lg,
  },
  chartSection: { marginBottom: spacing.lg },
  proHint: { marginBottom: spacing.lg },
  section: { marginBottom: spacing.xl },
  sectionTitle: { marginBottom: spacing.md },
  footerStats: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: spacing.md,
    marginTop: spacing.sm,
  },
  grid: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: spacing.sm + 2,
  },
});
