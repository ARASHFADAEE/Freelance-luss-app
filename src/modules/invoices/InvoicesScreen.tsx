import React from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { invoiceRepository } from '@/database';
import { formatCurrency } from '@/core/utils/currency';
import { formatJalaliDate } from '@/core/utils/persian';
import type { Invoice, InvoiceStatus } from '@/core/types';
import type { InvoicesStackParamList } from '@/navigation/types';
import { ScreenContainer } from '@/shared/components/ScreenContainer';
import { FAB } from '@/shared/components/FAB';
import { EmptyState } from '@/shared/components/EmptyState';
import { useProfileStore } from '@/stores/profileStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '@/core/theme/useAppTheme';

const STATUS: Record<InvoiceStatus, string> = {
  draft: 'پیش‌نویس',
  sent: 'ارسال‌شده',
  paid: 'تسویه شده',
  overdue: 'سررسید گذشته',
  cancelled: 'لغو شده',
};

function isInvoiceSettled(invoice: Invoice): boolean {
  return invoice.status === 'paid';
}

export function InvoicesScreen() {
  const theme = useTheme();
  const appTheme = useAppTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<InvoicesStackParamList>>();
  const currency = useProfileStore((s) => s.profile?.currency ?? 'TOMAN');

  const { data: invoices = [], refetch } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => invoiceRepository.getAll(),
  });

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScreenContainer scrollable={false} style={{ paddingTop: insets.top + 4 }}>
        <Text variant="titleLarge" style={styles.title}>فاکتورها</Text>
        {invoices.length === 0 ? (
          <EmptyState icon="file-document-outline" title="فاکتوری نیست" actionLabel="صدور" onAction={() => navigation.navigate('InvoiceForm', {})} />
        ) : (
          <FlatList
            data={invoices}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 80 }}
            onRefresh={refetch}
            refreshing={false}
            renderItem={({ item }) => {
              const settled = isInvoiceSettled(item);

              return (
                <Pressable onPress={() => navigation.navigate('InvoiceDetail', { invoiceId: item.id })}>
                  <View
                    style={[
                      styles.row,
                      {
                        borderColor: settled ? appTheme.custom.success + '40' : theme.colors.outlineVariant,
                        backgroundColor: settled ? appTheme.custom.success + '08' : theme.colors.surface,
                        opacity: settled ? 0.72 : 1,
                      },
                    ]}
                  >
                    {settled ? (
                      <View style={[styles.settledBadge, { backgroundColor: appTheme.custom.success + '20' }]}>
                        <Text variant="labelSmall" style={{ color: appTheme.custom.success, fontWeight: '700' }}>
                          تسویه شده
                        </Text>
                      </View>
                    ) : (
                      <Text
                        variant="labelSmall"
                        style={{
                          color: item.status === 'overdue' ? appTheme.custom.danger : theme.colors.primary,
                        }}
                      >
                        {STATUS[item.status]}
                      </Text>
                    )}
                    <View style={{ flex: 1, alignItems: 'flex-end' }}>
                      <Text
                        variant="bodyLarge"
                        style={{
                          fontWeight: '600',
                          color: settled ? theme.colors.onSurfaceVariant : theme.colors.onSurface,
                        }}
                      >
                        {item.invoiceNumber}
                      </Text>
                      <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                        {formatJalaliDate(item.issueDate)} · {formatCurrency(item.total, currency)}
                      </Text>
                    </View>
                  </View>
                </Pressable>
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
  row: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  settledBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
});
