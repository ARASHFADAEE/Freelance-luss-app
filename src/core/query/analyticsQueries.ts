import { useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useQueryClient, type QueryClient } from '@tanstack/react-query';

const ANALYTICS_QUERY_ROOTS = new Set([
  'dashboard-stats',
  'dashboard-insights',
  'monthly-data',
  'client-reports',
  'service-reports',
  'report-chart',
  'report-range',
  'expense-breakdown',
]);

export const analyticsQueryKeys = {
  dashboardStats: ['dashboard-stats'] as const,
  dashboardInsights: ['dashboard-insights'] as const,
  monthlyData: ['monthly-data'] as const,
  clientReports: ['client-reports'] as const,
  serviceReports: ['service-reports'] as const,
  reportChart: ['report-chart'] as const,
  reportRange: ['report-range'] as const,
  expenseBreakdown: ['expense-breakdown'] as const,
};

/** داده‌های داشبورد و گزارش همیشه تازه بمانند */
export const liveAnalyticsQueryOptions = {
  staleTime: 0,
  refetchOnMount: true,
  refetchOnWindowFocus: true,
} as const;

export function refetchAnalyticsQueries(queryClient: QueryClient) {
  return queryClient.refetchQueries({
    predicate: (query) =>
      typeof query.queryKey[0] === 'string' && ANALYTICS_QUERY_ROOTS.has(query.queryKey[0]),
  });
}

export function invalidateAnalyticsQueries(queryClient: QueryClient) {
  return queryClient.invalidateQueries({
    predicate: (query) =>
      typeof query.queryKey[0] === 'string' && ANALYTICS_QUERY_ROOTS.has(query.queryKey[0]),
  });
}

export function useRefetchAnalyticsOnFocus() {
  const queryClient = useQueryClient();

  useFocusEffect(
    useCallback(() => {
      void refetchAnalyticsQueries(queryClient);
    }, [queryClient]),
  );
}
