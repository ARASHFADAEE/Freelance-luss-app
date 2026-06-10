import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Snackbar } from 'react-native-paper';
import { FormTextInput } from '@/shared/components/FormTextInput';
import { FormSection } from '@/shared/components/FormSection';
import { useForm, Controller, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { refetchAnalyticsQueries } from '@/core/query/analyticsQueries';
import { paymentRepository, projectRepository } from '@/database';
import type { ProjectsStackParamList } from '@/navigation/types';
import { ScreenContainer } from '@/shared/components/ScreenContainer';
import { JalaliDateField } from '@/shared/components/JalaliDateField';
import { CurrencyInput } from '@/shared/components/CurrencyInput';
import { AppText } from '@/shared/components/AppText';
import { AmountText } from '@/shared/components/AmountText';
import { todayISO } from '@/core/utils/persian';
import { formatCurrency } from '@/core/utils/currency';
import { useProfileStore } from '@/stores/profileStore';
import { useAppTheme } from '@/core/theme/useAppTheme';
import { radius, spacing } from '@/core/theme/tokens';

const schema = z.object({
  amount: z.preprocess((v) => Number(v), z.number().min(1, 'مبلغ پرداخت را وارد کنید')),
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

  const { control, handleSubmit, setValue, watch, formState } = useForm<FormData>({
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
      void refetchAnalyticsQueries(queryClient);
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

  const saveButton = (
    <Button mode="contained" icon="cash-plus" onPress={handleSubmit((d) => mutation.mutate(d))} loading={mutation.isPending}>
      ثبت پرداخت
    </Button>
  );

  return (
    <ScreenContainer stickyFooter={saveButton}>
      {project && (
        <View style={[styles.summary, { borderColor: theme.colors.outlineVariant, backgroundColor: theme.colors.surface }]}>
          <AppText variant="h3">{project.title}</AppText>
          <View style={styles.summaryRow}>
            <AmountText variant="bodyMedium">{formatCurrency(project.totalAmount, currency)}</AmountText>
            <AppText variant="caption" color="muted">
              مبلغ کل
            </AppText>
          </View>
          <View style={styles.summaryRow}>
            <AmountText variant="bodyMedium" color="success">
              {formatCurrency(project.receivedAmount, currency)}
            </AmountText>
            <AppText variant="caption" color="muted">
              دریافت‌شده
            </AppText>
          </View>
          <View style={styles.summaryRow}>
            <AmountText variant="bodyMedium" color="danger">
              {formatCurrency(project.remainingAmount, currency)}
            </AmountText>
            <AppText variant="caption" color="muted">
              مانده فعلی
            </AppText>
          </View>
          {amount > 0 && (
            <View
              style={[
                styles.preview,
                { backgroundColor: willSettle ? theme.custom.successMuted : theme.custom.primaryContainer },
              ]}
            >
              <AppText variant="caption" color={willSettle ? 'success' : 'default'}>
                {willSettle
                  ? 'با این پرداخت، پروژه کاملاً تسویه می‌شود'
                  : `مانده پس از ثبت: ${formatCurrency(afterPaymentRemaining, currency)}`}
              </AppText>
            </View>
          )}
        </View>
      )}

      <FormSection title="ثبت پرداخت">
        <CurrencyInput
          label="مبلغ"
          required
          value={amount}
          onChangeValue={(n) => setValue('amount', n, { shouldValidate: true })}
          errorMessage={formState.errors.amount?.message}
        />
        <JalaliDateField label="تاریخ پرداخت" value={paymentDate} onChange={(d) => setValue('paymentDate', d)} />
        <Controller
          control={control}
          name="description"
          render={({ field: { onChange, value } }) => (
            <FormTextInput
              label="توضیح"
              helperText="مثلاً پیش‌پرداخت، قسط اول..."
              value={value}
              onChangeText={onChange}
              style={styles.input}
            />
          )}
        />
      </FormSection>

      <Snackbar visible={!!error} onDismiss={() => setError('')}>
        {error}
      </Snackbar>
      <Snackbar visible={!!success} onDismiss={() => setSuccess('')} duration={2000}>
        {success}
      </Snackbar>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  summary: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.md,
    padding: spacing.lg - 2,
    marginBottom: spacing.lg,
    gap: spacing.sm,
    alignItems: 'flex-end',
  },
  summaryRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    width: '100%',
    alignItems: 'center',
  },
  preview: {
    marginTop: spacing.xs,
    padding: spacing.sm + 2,
    borderRadius: radius.sm,
    alignSelf: 'stretch',
  },
  input: { backgroundColor: 'transparent' },
});
