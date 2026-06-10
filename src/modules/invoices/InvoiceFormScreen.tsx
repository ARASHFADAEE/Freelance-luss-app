import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, IconButton, Menu, Snackbar } from 'react-native-paper';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { refetchAnalyticsQueries } from '@/core/query/analyticsQueries';
import { clientRepository, invoiceRepository, serviceRepository } from '@/database';
import type { InvoicesStackParamList } from '@/navigation/types';
import { todayISO, addDaysISO } from '@/core/utils/persian';
import { formatCurrency } from '@/core/utils/currency';
import { useProfileStore } from '@/stores/profileStore';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import { ScreenContainer } from '@/shared/components/ScreenContainer';
import { FormSection } from '@/shared/components/FormSection';
import { JalaliDateField } from '@/shared/components/JalaliDateField';
import { CurrencyInput } from '@/shared/components/CurrencyInput';
import { ClientPickerField } from '@/shared/components/ClientPickerField';
import { FormTextInput } from '@/shared/components/FormTextInput';
import { AppText } from '@/shared/components/AppText';
import { AmountText } from '@/shared/components/AmountText';
import { useAppTheme } from '@/core/theme/useAppTheme';
import { radius, spacing } from '@/core/theme/tokens';

interface ItemDraft {
  serviceId: string | null;
  title: string;
  quantity: number;
  unitPrice: number;
}

export function InvoiceFormScreen() {
  const theme = useAppTheme();
  const route = useRoute<RouteProp<InvoicesStackParamList, 'InvoiceForm'>>();
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const profile = useProfileStore((s) => s.profile);
  const canAddInvoice = useSubscriptionStore((s) => s.canAddInvoice);
  const currency = profile?.currency ?? 'TOMAN';

  const [clientId, setClientId] = useState(route.params?.clientId ?? '');
  const [clientError, setClientError] = useState('');
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
  const tax = Math.round((taxable * taxRate) / 100);
  const total = taxable + tax;

  const validate = (): boolean => {
    setClientError('');
    if (!clientId) {
      setClientError('مشتری را انتخاب کنید');
      return false;
    }
    const validItems = items.filter((i) => i.title.trim() && i.unitPrice > 0);
    if (validItems.length === 0) {
      setError('حداقل یک آیتم با عنوان و قیمت معتبر اضافه کنید');
      return false;
    }
    return true;
  };

  const mutation = useMutation({
    mutationFn: async () => {
      if (!validate()) throw new Error('validation');
      const validItems = items.filter((i) => i.title.trim() && i.unitPrice > 0);
      const invoiceData = {
        clientId,
        projectId,
        issueDate,
        dueDate,
        subtotal,
        tax,
        discount,
        total,
        status: 'draft' as const,
        notes: '',
      };
      const mappedItems = validItems.map((i) => ({
        serviceId: i.serviceId,
        title: i.title,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        total: i.quantity * i.unitPrice,
      }));
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
    onError: (e) => {
      if (e.message !== 'validation') setError(e.message);
    },
  });

  const stickyFooter = (
    <View style={styles.footer}>
      <View style={styles.totals}>
        <View style={styles.totalRow}>
          <AmountText variant="bodyMedium">{formatCurrency(subtotal, currency)}</AmountText>
          <AppText variant="caption" color="muted">
            جمع
          </AppText>
        </View>
        <View style={styles.totalRow}>
          <AmountText variant="bodyMedium">{formatCurrency(tax, currency)}</AmountText>
          <AppText variant="caption" color="muted">
            مالیات
          </AppText>
        </View>
        <View style={styles.totalRow}>
          <AmountText variant="amount" color="primary">
            {formatCurrency(total, currency)}
          </AmountText>
          <AppText variant="bodyMedium" style={{ fontWeight: '600' }}>
            کل
          </AppText>
        </View>
      </View>
      <Button mode="contained" onPress={() => mutation.mutate()} loading={mutation.isPending}>
        ذخیره فاکتور
      </Button>
    </View>
  );

  return (
    <ScreenContainer stickyFooter={stickyFooter}>
      <FormSection title="اطلاعات فاکتور">
        <ClientPickerField
          clients={clients}
          value={clientId}
          onChange={(id) => {
            setClientId(id);
            setClientError('');
          }}
          required
          errorMessage={clientError}
        />
        <JalaliDateField label="تاریخ صدور" value={issueDate} onChange={setIssueDate} />
        <JalaliDateField label="سررسید" value={dueDate} onChange={setDueDate} />
      </FormSection>

      <FormSection title="اقلام فاکتور" description="خدمت یا عنوان دستی با قیمت واحد">
        {items.map((item, index) => (
          <View
            key={index}
            style={[styles.itemBox, { borderColor: theme.colors.outlineVariant, backgroundColor: theme.colors.surface }]}
          >
            <View style={styles.itemHeader}>
              <AppText variant="bodyMedium" style={{ fontWeight: '600' }}>
                آیتم {index + 1}
              </AppText>
              {items.length > 1 && (
                <IconButton
                  icon="delete-outline"
                  size={20}
                  onPress={() => setItems(items.filter((_, i) => i !== index))}
                />
              )}
            </View>
            <Menu
              visible={serviceMenuVisible === index}
              onDismiss={() => setServiceMenuVisible(null)}
              anchor={
                <Button compact mode="text" onPress={() => setServiceMenuVisible(index)}>
                  انتخاب از خدمات
                </Button>
              }
            >
              {services.map((s) => (
                <Menu.Item
                  key={s.id}
                  title={s.title}
                  onPress={() => {
                    const n = [...items];
                    n[index] = { serviceId: s.id, title: s.title, quantity: 1, unitPrice: s.defaultPrice };
                    setItems(n);
                    setServiceMenuVisible(null);
                  }}
                />
              ))}
            </Menu>
            <FormTextInput
              label="عنوان"
              required
              value={item.title}
              onChangeText={(t) => {
                const n = [...items];
                n[index].title = t;
                setItems(n);
              }}
              style={styles.input}
            />
            <CurrencyInput
              label="قیمت واحد"
              required
              value={item.unitPrice}
              onChangeValue={(v) => {
                const n = [...items];
                n[index].unitPrice = v;
                setItems(n);
              }}
            />
          </View>
        ))}
        <Button
          mode="text"
          icon="plus"
          onPress={() => setItems([...items, { serviceId: null, title: '', quantity: 1, unitPrice: 0 }])}
        >
          افزودن آیتم
        </Button>
      </FormSection>

      <FormSection title="تخفیف">
        <CurrencyInput label="مبلغ تخفیف" value={discount} onChangeValue={setDiscount} />
      </FormSection>

      <Snackbar visible={!!error} onDismiss={() => setError('')}>
        {error}
      </Snackbar>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  input: { backgroundColor: 'transparent' },
  itemBox: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.xs,
  },
  itemHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footer: { gap: spacing.md },
  totals: { gap: spacing.xs },
  totalRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
