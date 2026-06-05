import React from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { expenseRepository } from '@/database';
import { formatCurrency } from '@/core/utils/currency';
import { formatJalaliDate } from '@/core/utils/persian';
import type { MoreStackParamList } from '@/navigation/types';
import { ScreenContainer } from '@/shared/components/ScreenContainer';
import { FAB } from '@/shared/components/FAB';
import { EmptyState } from '@/shared/components/EmptyState';
import { useProfileStore } from '@/stores/profileStore';
import { useAppTheme } from '@/core/theme/useAppTheme';

export function ExpensesScreen() {
  const theme = useAppTheme();
  const navigation = useNavigation<NativeStackNavigationProp<MoreStackParamList>>();
  const currency = useProfileStore((s) => s.profile?.currency ?? 'TOMAN');

  const { data: expenses = [], refetch } = useQuery({
    queryKey: ['expenses'],
    queryFn: () => expenseRepository.getAll(),
  });

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScreenContainer scrollable={false}>
        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'right' }}>مجموع</Text>
        <Text variant="headlineSmall" style={{ fontWeight: '700', textAlign: 'right', marginBottom: 16 }}>{formatCurrency(total, currency)}</Text>

        {expenses.length === 0 ? (
          <EmptyState icon="cash-minus" title="هزینه‌ای نیست" actionLabel="ثبت" onAction={() => navigation.navigate('ExpenseForm', {})} />
        ) : (
          <FlatList
            data={expenses}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 80 }}
            onRefresh={refetch}
            refreshing={false}
            renderItem={({ item }) => (
              <Pressable onPress={() => navigation.navigate('ExpenseForm', { expenseId: item.id })}>
                <View style={[styles.row, { borderColor: theme.colors.outlineVariant }]}>
                  <Text variant="bodyMedium" style={{ color: theme.custom.danger }}>{formatCurrency(item.amount, currency)}</Text>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text variant="bodyMedium">{item.category}</Text>
                    <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>{formatJalaliDate(item.date)}</Text>
                  </View>
                </View>
              </Pressable>
            )}
          />
        )}
      </ScreenContainer>
      <FAB onPress={() => navigation.navigate('ExpenseForm', {})} icon="cash-minus" />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: StyleSheet.hairlineWidth, paddingVertical: 12 },
});
