import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, IconButton, Menu, Snackbar, Text } from 'react-native-paper';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { refetchAnalyticsQueries } from '@/core/query/analyticsQueries';
import { clientRepository, invoiceRepository, serviceRepository } from '@/database';
import type { InvoicesStackParamList } from '@/navigation/types';
import { rtlLayoutStyle } from '@/core/theme/rtlLayout';
import { todayISO, addDaysISO } from '@/core/utils/persian';
import { formatCurrency } from '@/core/utils/currency';
import { useProfileStore } from '@/stores/profileStore';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import { JalaliDateField } from '@/shared/components/JalaliDateField';
import { CurrencyInput } from '@/shared/components/CurrencyInput';
import { ClientPickerField } from '@/shared/components/ClientPickerField';
import { FormTextInput } from '@/shared/components/FormTextInput';

interface ItemDraft {
  serviceId: string | null;
  title: string;
  quantity: number;
  unitPrice: number;
}

export function InvoiceFormScreen() {
  const route = useRoute<RouteProp<InvoicesStackParamList, 'InvoiceForm'>>();
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const profile = useProfileStore((s) => s.profile);
  const canAddInvoice = useSubscriptionStore((s) => s.canAddInvoice);
  const currency = profile?.currency ?? 'TOMAN';

  const [clientId, setClientId] = useState(route.params?.clientId ?? '');
  const [projectId] = useState(route.params?.projectId ?? null);
  const [issueDate, setIssueDate] = useState(todayISO());
  const [dueDate, setDueDate] = useState(addDaysISO(todayISO(), 30));
  const [discount, setDiscount] = useState(0);
  const [items, setItems] = useState<ItemDraft[]>([{ serviceId: null, title: '', quantity: 1, unitPrice: 0 }]);
  const [serviceMenuVisible, setServiceMenuVisible] = useState<number | null>(null);
  const [error, setError] = useState('');

  const { data: clients = [] } = useQuery({ queryKey: ['clients'], queryFn: () => clientRepository.getAll() });
  const { data: services = [] } = useQuery({ queryKey: ['services'], queryFn: () => serviceRepository.getAll() });

  const { data: existingInvoice } = useQuery({
    queryKey: ['invoice', route.params?.invoiceId],
    queryFn: () => invoiceRepository.getById(route.params!.invoiceId!),
    enabled: !!route.params?.invoiceId,
  });

  const { data: existingItems = [] } = useQuery({
    queryKey: ['invoice-items', route.params?.invoiceId],
    queryFn: () => invoiceRepository.getItems(route.params!.invoiceId!),
    enabled: !!route.params?.invoiceId,
  });

  useEffect(() => {
    if (existingInvoice) {
      setClientId(existingInvoice.clientId);
      setIssueDate(existingInvoice.issueDate);
      setDueDate(existingInvoice.dueDate);
      setDiscount(existingInvoice.discount);
    }
    if (existingItems.length > 0) {
      setItems(existingItems.map((i) => ({ serviceId: i.serviceId, title: i.title, quantity: i.quantity, unitPrice: i.unitPrice })));
    }
  }, [existingInvoice, existingItems]);

  const subtotal = items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
  const taxRate = profile?.taxRate ?? 9;
  const taxable = Math.max(0, subtotal - discount);
  const tax = Math.round(taxable * taxRate / 100);
  const total = taxable + tax;

  const mutation = useMutation({
    mutationFn: async () => {
      if (!clientId) throw new Error('مشتری را انتخاب کنید');
      const validItems = items.filter((i) => i.title && i.unitPrice > 0);
      if (validItems.length === 0) throw new Error('حداقل یک آیتم اضافه کنید');
      const invoiceData = { clientId, projectId, issueDate, dueDate, subtotal, tax, discount, total, status: 'draft' as const, notes: '' };
      const mappedItems = validItems.map((i) => ({ serviceId: i.serviceId, title: i.title, quantity: i.quantity, unitPrice: i.unitPrice, total: i.quantity * i.unitPrice }));
      if (route.params?.invoiceId) {
        await invoiceRepository.update(route.params.invoiceId, invoiceData);
        await invoiceRepository.updateItems(route.params.invoiceId, mappedItems);
      } else {
        const allowed = await canAddInvoice();
        if (!allowed) throw new Error('محدودیت پلن رایگان');
        await invoiceRepository.create(invoiceData, mappedItems);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      void refetchAnalyticsQueries(queryClient);
      navigation.goBack();
    },
    onError: (e) => setError(e.message),
  });

  return (
    <ScrollView contentContainerStyle={styles.content} style={rtlLayoutStyle}>
      <ClientPickerField
        clients={clients}
        value={clientId}
        onChange={setClientId}
        required
      />

      <JalaliDateField label="تاریخ صدور" value={issueDate} onChange={setIssueDate} />
      <JalaliDateField label="سررسید" value={dueDate} onChange={setDueDate} />

      <Text variant="titleSmall" style={styles.section}>اقلام فاکتور</Text>
      {items.map((item, index) => (
        <View key={index} style={styles.itemBox}>
          <Menu visible={serviceMenuVisible === index} onDismiss={() => setServiceMenuVisible(null)} anchor={
            <Button compact mode="text" onPress={() => setServiceMenuVisible(index)}>انتخاب خدمت</Button>
          }>
            {services.map((s) => (
              <Menu.Item key={s.id} title={s.title} onPress={() => {
                const n = [...items]; n[index] = { serviceId: s.id, title: s.title, quantity: 1, unitPrice: s.defaultPrice }; setItems(n); setServiceMenuVisible(null);
              }} />
            ))}
          </Menu>
          <FormTextInput
            label="عنوان"
            value={item.title}
            onChangeText={(t) => { const n = [...items]; n[index].title = t; setItems(n); }}
            style={styles.input}
          />
          <CurrencyInput
            label="قیمت واحد"
            value={item.unitPrice}
            onChangeValue={(v) => { const n = [...items]; n[index].unitPrice = v; setItems(n); }}
          />
          {items.length > 1 && <IconButton icon="delete" onPress={() => setItems(items.filter((_, i) => i !== index))} />}
        </View>
      ))}
      <Button mode="text" onPress={() => setItems([...items, { serviceId: null, title: '', quantity: 1, unitPrice: 0 }])}>+ آیتم</Button>

      <CurrencyInput
        label="تخفیف"
        value={discount}
        onChangeValue={setDiscount}
        labelAlign="center"
        contentAlign="center"
      />

      <View style={styles.totals}>
        <Text style={styles.totalLine}>جمع: {formatCurrency(subtotal, currency)}</Text>
        <Text style={styles.totalLine}>مالیات: {formatCurrency(tax, currency)}</Text>
        <Text variant="titleMedium" style={styles.grandTotal}>کل: {formatCurrency(total, currency)}</Text>
      </View>

      <Button mode="contained" onPress={() => mutation.mutate()} loading={mutation.isPending}>ذخیره فاکتور</Button>
      <Snackbar visible={!!error} onDismiss={() => setError('')}>{error}</Snackbar>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 8, paddingBottom: 32 },
  section: { fontWeight: '600', marginTop: 8, textAlign: 'right' },
  itemBox: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 10, padding: 8, marginBottom: 8, borderColor: '#e5e7eb' },
  input: { backgroundColor: 'transparent' },
  totals: { gap: 4, marginVertical: 12, alignItems: 'flex-end' },
  totalLine: { textAlign: 'right' },
  grandTotal: { fontWeight: '700', textAlign: 'right' },
});
