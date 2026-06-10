import React from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { expenseRepository } from '@/database';
import { formatCurrency } from '@/core/utils/currency';
import { formatJalaliDate } from '@/core/utils/persian';
import type { FinancialStackParamList } from '@/navigation/types';
import { ScreenContainer } from '@/shared/components/ScreenContainer';
import { EmptyState } from '@/shared/components/EmptyState';
import { AmountText } from '@/shared/components/AmountText';
import { AppText } from '@/shared/components/AppText';
import { useProfileStore } from '@/stores/profileStore';
import { useAppTheme } from '@/core/theme/useAppTheme';
import { spacing } from '@/core/theme/tokens';

interface Props {
  embedded?: boolean;
}

export function ExpensesScreen({ embedded = false }: Props) {
  const theme = useAppTheme();
  const navigation = useNavigation<NativeStackNavigationProp<FinancialStackParamList>>();
  const currency = useProfileStore((s) => s.profile?.currency ?? 'TOMAN');

  const { data: expenses = [], refetch, isFetching, isLoading } = useQuery({
    queryKey: ['expenses'],
    queryFn: () => expenseRepository.getAll(),
  });

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScreenContainer
        scrollable={false}
        padded={!embedded}
        style={embedded ? { paddingHorizontal: spacing.lg } : undefined}
      >
        <View style={styles.summary}>
          <AppText variant="caption" color="muted">
            مجموع هزینه‌ها
          </AppText>
          <AmountText variant="amountLarge" color="danger">
            {formatCurrency(total, currency)}
          </AmountText>
        </View>

        {isLoading ? null : expenses.length === 0 ? (
          <EmptyState
            icon="cash-minus"
            title="هزینه‌ای نیست"
            actionLabel="ثبت"
            onAction={() => navigation.navigate('ExpenseForm', {})}
          />
        ) : (
          <FlatList
            data={expenses}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: embedded ? 100 : 80 }}
            onRefresh={refetch}
            refreshing={isFetching && !isLoading}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => navigation.navigate('ExpenseForm', { expenseId: item.id })}
                accessibilityRole="button"
                accessibilityLabel={`${item.category} ${formatCurrency(item.amount, currency)}`}
              >
                <View style={[styles.row, { borderColor: theme.colors.outlineVariant }]}>
                  <AmountText variant="bodyMedium" color="danger">
                    {formatCurrency(item.amount, currency)}
                  </AmountText>
                  <View style={styles.rowInfo}>
                    <AppText variant="bodyMedium" style={{ fontWeight: '600' }}>
                      {item.category}
                    </AppText>
                    <AppText variant="caption" color="muted">
                      {formatJalaliDate(item.date)}
                    </AppText>
                  </View>
                </View>
              </Pressable>
            )}
          />
        )}
      </ScreenContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  summary: { marginBottom: spacing.lg, alignItems: 'flex-end', gap: spacing.xs },
  row: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: spacing.md,
  },
  rowInfo: { alignItems: 'flex-end', gap: spacing.xs / 2 },
});
