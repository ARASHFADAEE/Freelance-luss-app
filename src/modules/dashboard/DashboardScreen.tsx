import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { analyticsQueryKeys, liveAnalyticsQueryOptions, useRefetchAnalyticsOnFocus } from '@/core/query/analyticsQueries';
import { analyticsRepository } from '@/database';
import { formatCurrency } from '@/core/utils/currency';
import { useProfileStore } from '@/stores/profileStore';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import { ScreenContainer } from '@/shared/components/ScreenContainer';
import { StatCard } from '@/shared/components/StatCard';
import { SkeletonCard } from '@/shared/components/Skeleton';
import { SimpleBarChart } from '@/shared/components/SimpleBarChart';
import { APP_NAME } from '@/core/constants';
import { useAppTheme } from '@/core/theme/useAppTheme';

export function DashboardScreen() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const profile = useProfileStore((s) => s.profile);
  const hasProFeatures = useSubscriptionStore((s) => s.hasProFeatures);
  const isInTrial = useSubscriptionStore((s) => s.isInTrial);
  const currency = profile?.currency ?? 'TOMAN';

  useRefetchAnalyticsOnFocus();

  const { data: stats, isLoading } = useQuery({
    queryKey: analyticsQueryKeys.dashboardStats,
    queryFn: () => analyticsRepository.getDashboardStats(),
    ...liveAnalyticsQueryOptions,
  });

  const { data: monthlyData = [] } = useQuery({
    queryKey: analyticsQueryKeys.monthlyData,
    queryFn: () => analyticsRepository.getMonthlyData(6),
    enabled: hasProFeatures(),
    ...liveAnalyticsQueryOptions,
  });

  const chartData = monthlyData.map((m) => ({
    label: m.label.split(' ')[0],
    revenue: m.revenue / 1_000_000,
    expenses: m.expenses / 1_000_000,
  }));

  return (
    <ScreenContainer>
      <View style={{ paddingTop: insets.top + 4, marginBottom: 20 }}>
        <Text variant="titleLarge" style={{ fontWeight: '700', textAlign: 'right' }}>{APP_NAME}</Text>
        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'right' }}>
          {profile?.fullName ? `سلام ${profile.fullName}` : 'خلاصه مالی'}
          {hasProFeatures() ? (isInTrial() ? ' · دوره آزمایشی' : ' · Pro') : ''}
        </Text>
      </View>

      {isLoading ? (
        <View style={styles.grid}><SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard /></View>
      ) : stats ? (
        <View style={styles.grid}>
          <StatCard title="درآمد ماه" value={formatCurrency(stats.monthlyRevenue, currency)} icon="cash" color={theme.custom.success} />
          <StatCard title="هزینه ماه" value={formatCurrency(stats.monthlyExpenses, currency)} icon="cash-minus" color={theme.custom.danger} />
          <StatCard title="سود ماه" value={formatCurrency(stats.monthlyProfit, currency)} icon="trending-up" color={theme.custom.secondary} />
          <StatCard title="مطالبات" value={formatCurrency(stats.outstandingReceivables, currency)} icon="clock-outline" color={theme.custom.warning} />
          <StatCard title="پروژه فعال" value={String(stats.activeProjects)} icon="briefcase-outline" />
          <StatCard title="فاکتور باز" value={String(stats.unpaidInvoices)} icon="file-outline" />
        </View>
      ) : null}

      {hasProFeatures() && chartData.length > 0 && (
        <View style={[styles.chartBox, { borderColor: theme.colors.outlineVariant, backgroundColor: theme.colors.surface }]}>
          <Text variant="labelLarge" style={{ textAlign: 'right', marginBottom: 4, fontWeight: '600' }}> نمودار ۶ ماه اخیر</Text>
          <Text variant="labelSmall" style={{ textAlign: 'right', color: theme.colors.onSurfaceVariant, marginBottom: 12 }}>بر اساس میلیون تومان</Text>
          <SimpleBarChart
            key={chartData.map((d) => `${d.label}:${d.revenue}:${d.expenses}`).join('|')}
            data={chartData}
            height={300}
            revenueColor={theme.custom.success}
            expenseColor={theme.custom.danger}
          />
        </View>
      )}

      {!hasProFeatures() && (
        <Text variant="bodySmall" style={{ textAlign: 'center', color: theme.colors.onSurfaceVariant, marginTop: 8 }}>
          نمودارها با اشتراک Pro یا دوره آزمایشی ۳ روزه فعال می‌شود
        </Text>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  chartBox: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 16, padding: 16 },
});
