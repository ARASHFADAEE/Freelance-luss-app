import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { FinancialStackParamList } from '@/navigation/types';
import { FilterChips } from '@/shared/components/FilterChips';
import { PageHeader } from '@/shared/components/PageHeader';
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
      <View style={styles.header}>
        <PageHeader title="مالی" topInset={insets.top + spacing.xs}>
          <FilterChips
            value={tab}
            onChange={setTab}
            options={[
              { value: 'expenses', label: 'هزینه‌ها' },
              { value: 'reports', label: 'گزارش‌ها' },
            ]}
          />
        </PageHeader>
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
  },
  body: { flex: 1 },
});
