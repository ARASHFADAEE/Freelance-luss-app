import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { clientRepository, invoiceRepository, projectRepository } from '@/database';
import { formatCurrency } from '@/core/utils/currency';
import { formatJalaliDate } from '@/core/utils/persian';
import { isInvoicePaid } from '@/core/utils/invoice';
import type { Invoice } from '@/core/types';
import type { InvoicesStackParamList } from '@/navigation/types';
import { ScreenContainer } from '@/shared/components/ScreenContainer';
import { EmptyState } from '@/shared/components/EmptyState';
import { FilterChips } from '@/shared/components/FilterChips';
import { ListCard } from '@/shared/components/ListCard';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { SkeletonList } from '@/shared/components/Skeleton';
import { AppText } from '@/shared/components/AppText';
import { useProfileStore } from '@/stores/profileStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '@/core/theme/useAppTheme';
import { spacing } from '@/core/theme/tokens';

type InvoiceFilter = 'all' | 'paid' | 'unpaid';

const STATUS: Record<string, string> = {
  draft: 'پیش‌نویس',
  sent: 'ارسال‌شده',
  paid: 'پرداخت شده',
  overdue: 'سررسید گذشته',
  cancelled: 'لغو شده',
};

export function InvoicesScreen() {
  const theme = useTheme();
  const appTheme = useAppTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<InvoicesStackParamList>>();
  const currency = useProfileStore((s) => s.profile?.currency ?? 'TOMAN');
  const [filter, setFilter] = useState<InvoiceFilter>('all');

  const { data: invoices = [], refetch, isFetching, isLoading } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => invoiceRepository.getAll(),
  });

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: () => clientRepository.getAll(),
  });

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectRepository.getAll(),
  });

  const clientMap = useMemo(() => new Map(clients.map((c) => [c.id, c.fullName])), [clients]);
  const projectMap = useMemo(() => new Map(projects.map((p) => [p.id, p])), [projects]);

  const checkPaid = (invoice: Invoice) =>
    isInvoicePaid(invoice, invoice.projectId ? projectMap.get(invoice.projectId) : null);

  const filtered = useMemo(() => {
    if (filter === 'paid') return invoices.filter(checkPaid);
    if (filter === 'unpaid') return invoices.filter((i) => !checkPaid(i) && i.status !== 'cancelled');
    return invoices;
  }, [invoices, filter, projectMap]);

  const header = (
    <View style={{ paddingTop: insets.top + spacing.xs }}>
      <AppText variant="h1" style={styles.title}>
        فاکتورها
      </AppText>
      <FilterChips
        value={filter}
        onChange={setFilter}
        options={[
          { value: 'all', label: 'همه' },
          { value: 'unpaid', label: 'پرداخت‌نشده' },
          { value: 'paid', label: 'پرداخت‌شده' },
        ]}
      />
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScreenContainer scrollable={false} padded={false} style={{ paddingHorizontal: spacing.lg }} header={header}>
        {isLoading ? (
          <SkeletonList count={5} />
        ) : filtered.length === 0 ? (
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
            contentContainerStyle={{ paddingBottom: 100 }}
            onRefresh={refetch}
            refreshing={isFetching && !isLoading}
            renderItem={({ item }) => {
              const paid = checkPaid(item);
              const clientName = clientMap.get(item.clientId) ?? '—';
              const isOverdue = !paid && item.status === 'overdue';

              return (
                <ListCard
                  title={item.invoiceNumber}
                  subtitle={`${clientName} · ${formatJalaliDate(item.issueDate)} · ${formatCurrency(item.total, currency)}`}
                  muted={paid}
                  borderColor={paid ? appTheme.custom.success + '40' : undefined}
                  backgroundColor={paid ? appTheme.custom.success + '08' : undefined}
                  badge={
                    paid ? (
                      <StatusBadge label="پرداخت شده" tone="success" icon="check-circle" />
                    ) : (
                      <StatusBadge
                        label={STATUS[item.status]}
                        tone={isOverdue ? 'danger' : 'primary'}
                      />
                    )
                  }
                  onPress={() => navigation.navigate('InvoiceDetail', { invoiceId: item.id })}
                  accessibilityLabel={`فاکتور ${item.invoiceNumber} برای ${clientName}`}
                />
              );
            }}
          />
        )}
      </ScreenContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { marginBottom: spacing.md },
});
