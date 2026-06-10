import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { FinancialStackParamList } from '@/navigation/types';
import { FilterChips } from '@/shared/components/FilterChips';
import { AppText } from '@/shared/components/AppText';
import { ExpensesScreen } from '@/modules/expenses/ExpensesScreen';
import { ReportsScreen } from '@/modules/reports/ReportsScreen';
import { spacing } from '@/core/theme/tokens';

type HubTab = 'expenses' | 'reports';

export function FinancialHubScreen() {
  const route = useRoute<RouteProp<FinancialStackParamList, 'FinancialHub'>>();
  const insets = useSafeAreaInsets();
  const initialTab = route.params?.initialTab ?? 'expenses';
  const [tab, setTab] = useState<HubTab>(initialTab);

  useEffect(() => {
    if (route.params?.initialTab) setTab(route.params.initialTab);
  }, [route.params?.initialTab]);

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.xs }]}>
        <AppText variant="h1" style={styles.title}>
          مالی
        </AppText>
        <FilterChips
          value={tab}
          onChange={setTab}
          options={[
            { value: 'expenses', label: 'هزینه‌ها' },
            { value: 'reports', label: 'گزارش‌ها' },
          ]}
        />
      </View>
      <View style={styles.body}>
        {tab === 'expenses' ? <ExpensesScreen embedded /> : <ReportsScreen embedded />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  title: { marginBottom: spacing.md },
  body: { flex: 1 },
});
