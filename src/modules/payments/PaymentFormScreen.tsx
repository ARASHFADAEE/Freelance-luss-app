import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Snackbar, Text } from 'react-native-paper';
import { FormTextInput } from '@/shared/components/FormTextInput';
import { useForm, Controller, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { paymentRepository, projectRepository } from '@/database';
import type { ProjectsStackParamList } from '@/navigation/types';
import { ScreenContainer } from '@/shared/components/ScreenContainer';
import { JalaliDateField } from '@/shared/components/JalaliDateField';
import { CurrencyInput } from '@/shared/components/CurrencyInput';
import { todayISO } from '@/core/utils/persian';
import { formatCurrency } from '@/core/utils/currency';
import { useProfileStore } from '@/stores/profileStore';
import { useAppTheme } from '@/core/theme/useAppTheme';

const schema = z.object({
  amount: z.preprocess((v) => Number(v), z.number().min(1)),
  paymentDate: z.string(),
  description: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export function PaymentFormScreen() {
  const theme = useAppTheme();
  const route = useRoute<RouteProp<ProjectsStackParamList, 'PaymentForm'>>();
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const currency = useProfileStore((s) => s.profile?.currency ?? 'TOMAN');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { data: project } = useQuery({
    queryKey: ['project', route.params.projectId],
    queryFn: () => projectRepository.getById(route.params.projectId),
  });

  const { control, handleSubmit, setValue, watch } = useForm<FormData>({
    resolver: zodResolver(schema) as Resolver<FormData>,
    defaultValues: { amount: 0, paymentDate: todayISO(), description: '' },
  });

  const amount = watch('amount');
  const paymentDate = watch('paymentDate');
  const afterPaymentRemaining = project ? Math.max(0, project.remainingAmount - amount) : 0;
  const willSettle = !!project && project.totalAmount > 0 && afterPaymentRemaining <= 0;

  const mutation = useMutation({
    mutationFn: (data: FormData) =>
      paymentRepository.create({
        projectId: route.params.projectId,
        amount: data.amount,
        paymentDate: data.paymentDate,
        description: data.description,
      }),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', route.params.projectId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      if (result.settled) {
        setSuccess('پرداخت ثبت شد — پروژه تسویه شده است ✓');
        setTimeout(() => navigation.goBack(), 1400);
      } else {
        setSuccess(`پرداخت ثبت شد — مانده: ${formatCurrency(result.remainingAmount, currency)}`);
        setTimeout(() => navigation.goBack(), 1200);
      }
    },
    onError: (e) => setError(e.message),
  });

  return (
    <ScreenContainer>
      {project && (
        <View style={[styles.summary, { borderColor: theme.colors.outlineVariant, backgroundColor: theme.colors.surface }]}>
          <Text variant="titleSmall" style={{ fontWeight: '700', textAlign: 'right' }}>{project.title}</Text>
          <View style={styles.summaryRow}>
            <Text variant="bodyMedium">{formatCurrency(project.totalAmount, currency)}</Text>
            <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>مبلغ کل</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text variant="bodyMedium" style={{ color: theme.custom.success }}>{formatCurrency(project.receivedAmount, currency)}</Text>
            <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>دریافت‌شده</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text variant="bodyMedium" style={{ color: theme.custom.danger }}>{formatCurrency(project.remainingAmount, currency)}</Text>
            <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>مانده فعلی</Text>
          </View>
          {amount > 0 && (
            <View style={[styles.preview, { backgroundColor: willSettle ? theme.custom.success + '18' : theme.colors.primary + '10' }]}>
              <Text variant="bodySmall" style={{ textAlign: 'right', color: willSettle ? theme.custom.success : theme.colors.onSurface }}>
                {willSettle
                  ? 'با این پرداخت، پروژه کاملاً تسویه می‌شود'
                  : `مانده پس از ثبت: ${formatCurrency(afterPaymentRemaining, currency)}`}
              </Text>
            </View>
          )}
        </View>
      )}

      <View style={styles.form}>
        <CurrencyInput label="مبلغ *" value={amount} onChangeValue={(n) => setValue('amount', n)} labelAlign="right" />
        <JalaliDateField label="تاریخ پرداخت" value={paymentDate} onChange={(d) => setValue('paymentDate', d)} />
        <Controller control={control} name="description" render={({ field: { onChange, value } }) => (
          <FormTextInput label="توضیح (پیش‌پرداخت، قسط...)" value={value} onChangeText={onChange} style={styles.input} />
        )} />
        <Button mode="contained" onPress={handleSubmit((d) => mutation.mutate(d))} loading={mutation.isPending}>
          ثبت پرداخت
        </Button>
      </View>
      <Snackbar visible={!!error} onDismiss={() => setError('')}>{error}</Snackbar>
      <Snackbar visible={!!success} onDismiss={() => setSuccess('')} duration={2000}>{success}</Snackbar>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  summary: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 12, padding: 14, marginBottom: 16, gap: 6 },
  summaryRow: { flexDirection: 'row-reverse', justifyContent: 'space-between' },
  preview: { marginTop: 8, padding: 10, borderRadius: 8 },
  form: { gap: 10 },
  input: { backgroundColor: 'transparent' },
});
