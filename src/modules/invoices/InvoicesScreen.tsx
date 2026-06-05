import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { clientRepository, invoiceRepository } from '@/database';
import { formatCurrency } from '@/core/utils/currency';
import { formatJalaliDate } from '@/core/utils/persian';
import type { Invoice } from '@/core/types';
import type { InvoicesStackParamList } from '@/navigation/types';
import { ScreenContainer } from '@/shared/components/ScreenContainer';
import { FAB } from '@/shared/components/FAB';
import { EmptyState } from '@/shared/components/EmptyState';
import { FilterChips } from '@/shared/components/FilterChips';
import { useProfileStore } from '@/stores/profileStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '@/core/theme/useAppTheme';

type InvoiceFilter = 'all' | 'paid' | 'unpaid';

const STATUS: Record<string, string> = {
  draft: 'پیش‌نویس', sent: 'ارسال‌شده', paid: 'پرداخت شده', overdue: 'سررسید گذشته', cancelled: 'لغو شده',
};

function isInvoicePaid(invoice: Invoice): boolean {
  return invoice.status === 'paid';
}

export function InvoicesScreen() {
  const theme = useTheme();
  const appTheme = useAppTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<InvoicesStackParamList>>();
  const currency = useProfileStore((s) => s.profile?.currency ?? 'TOMAN');
  const [filter, setFilter] = useState<InvoiceFilter>('all');

  const { data: invoices = [], refetch } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => invoiceRepository.getAll(),
  });

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: () => clientRepository.getAll(),
  });

  const clientMap = useMemo(() => new Map(clients.map((c) => [c.id, c.fullName])), [clients]);

  const filtered = useMemo(() => {
    if (filter === 'paid') return invoices.filter(isInvoicePaid);
    if (filter === 'unpaid') return invoices.filter((i) => !isInvoicePaid(i) && i.status !== 'cancelled');
    return invoices;
  }, [invoices, filter]);

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScreenContainer scrollable={false} style={{ paddingTop: insets.top + 4 }}>
        <Text variant="titleLarge" style={styles.title}>فاکتورها</Text>

        <FilterChips
          value={filter}
          onChange={setFilter}
          options={[
            { value: 'all', label: 'همه' },
            { value: 'unpaid', label: 'پرداخت‌نشده' },
            { value: 'paid', label: 'پرداخت‌شده' },
          ]}
        />

        {filtered.length === 0 ? (
          <EmptyState
            icon="file-document-outline"
            title={filter === 'all' ? 'فاکتوری نیست' : 'فاکتوری با این فیلتر نیست'}
            actionLabel="صدور"
            onAction={() => navigation.navigate('InvoiceForm', {})}
          />
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 80 }}
            onRefresh={refetch}
            refreshing={false}
            renderItem={({ item }) => {
              const paid = isInvoicePaid(item);
              const clientName = clientMap.get(item.clientId) ?? '—';

              return (
                <View
                  style={[
                    styles.card,
                    {
                      borderColor: paid ? appTheme.custom.success + '40' : theme.colors.outlineVariant,
                      backgroundColor: paid ? appTheme.custom.success + '08' : theme.colors.surface,
                      opacity: paid ? 0.75 : 1,
                    },
                  ]}
                >
                  <View style={styles.cardTop}>
                    <View style={{ flex: 1, alignItems: 'flex-end' }}>
                      <Text variant="bodyLarge" style={{ fontWeight: '700', color: paid ? theme.colors.onSurfaceVariant : theme.colors.onSurface }}>
                        {item.invoiceNumber}
                      </Text>
                      <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 2 }}>
                        {clientName}
                      </Text>
                      <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
                        {formatJalaliDate(item.issueDate)} · {formatCurrency(item.total, currency)}
                      </Text>
                    </View>
                    {paid ? (
                      <View style={[styles.badge, { backgroundColor: appTheme.custom.success + '22' }]}>
                        <MaterialCommunityIcons name="check-circle" size={14} color={appTheme.custom.success} />
                        <Text variant="labelSmall" style={{ color: appTheme.custom.success, fontWeight: '700' }}>پرداخت شده</Text>
                      </View>
                    ) : (
                      <View style={[styles.badge, { backgroundColor: (item.status === 'overdue' ? appTheme.custom.danger : theme.colors.primary) + '18' }]}>
                        <Text variant="labelSmall" style={{ color: item.status === 'overdue' ? appTheme.custom.danger : theme.colors.primary, fontWeight: '600' }}>
                          {STATUS[item.status]}
                        </Text>
                      </View>
                    )}
                  </View>
                  <Button
                    mode="contained-tonal"
                    icon="eye"
                    compact
                    onPress={() => navigation.navigate('InvoiceDetail', { invoiceId: item.id })}
                    style={styles.viewBtn}
                    contentStyle={{ flexDirection: 'row-reverse' }}
                  >
                    مشاهده فاکتور
                  </Button>
                </View>
              );
            }}
          />
        )}
      </ScreenContainer>
      <FAB onPress={() => navigation.navigate('InvoiceForm', {})} icon="file-plus" />
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontWeight: '700', marginBottom: 12, textAlign: 'right' },
  card: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 14, padding: 14, marginBottom: 10 },
  cardTop: { flexDirection: 'row-reverse', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
  badge: { flexDirection: 'row-reverse', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  viewBtn: { alignSelf: 'stretch' },
});
