import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { Button, Snackbar } from 'react-native-paper';
import { useForm, Controller, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { refetchAnalyticsQueries } from '@/core/query/analyticsQueries';
import { expenseRepository } from '@/database';
import { EXPENSE_CATEGORIES } from '@/core/constants';
import type { FinancialStackParamList } from '@/navigation/types';
import { todayISO } from '@/core/utils/persian';
import { ScreenContainer } from '@/shared/components/ScreenContainer';
import { FormSection } from '@/shared/components/FormSection';
import { JalaliDateField } from '@/shared/components/JalaliDateField';
import { CurrencyInput } from '@/shared/components/CurrencyInput';
import { SelectPickerField } from '@/shared/components/SelectPickerField';
import { FormTextInput } from '@/shared/components/FormTextInput';
import { spacing } from '@/core/theme/tokens';

const schema = z.object({
  category: z.string().min(1, 'دسته‌بندی را انتخاب کنید'),
  amount: z.preprocess((v) => Number(v), z.number().min(1, 'مبلغ باید بیشتر از صفر باشد')),
  description: z.string().optional(),
  date: z.string(),
});

type FormData = z.infer<typeof schema>;

export function ExpenseFormScreen() {
  const route = useRoute<RouteProp<FinancialStackParamList, 'ExpenseForm'>>();
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const expenseId = route.params?.expenseId;
  const [error, setError] = useState('');

  const { data: expense } = useQuery({
    queryKey: ['expense', expenseId],
    queryFn: () => expenseRepository.getById(expenseId!),
    enabled: !!expenseId,
  });

  const { control, handleSubmit, reset, setValue, watch, formState } = useForm<FormData>({
    resolver: zodResolver(schema) as Resolver<FormData>,
    defaultValues: { category: '', amount: 0, description: '', date: todayISO() },
  });

  const category = watch('category');
  const amount = watch('amount');
  const date = watch('date');

  useEffect(() => {
    if (expense) {
      reset({
        category: expense.category,
        amount: expense.amount,
        description: expense.description,
        date: expense.date,
      });
    }
  }, [expense, reset]);

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      if (expenseId) await expenseRepository.update(expenseId, data);
      else await expenseRepository.create({ ...data, description: data.description ?? '' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      void refetchAnalyticsQueries(queryClient);
      navigation.goBack();
    },
    onError: (e) => setError(e.message),
  });

  const saveButton = (
    <Button mode="contained" onPress={handleSubmit((d) => mutation.mutate(d))} loading={mutation.isPending}>
      ذخیره هزینه
    </Button>
  );

  return (
    <ScreenContainer stickyFooter={saveButton}>
      <FormSection title="جزئیات هزینه">
        <SelectPickerField
          label="دسته‌بندی"
          value={category}
          options={EXPENSE_CATEGORIES}
          onChange={(c) => setValue('category', c, { shouldValidate: true })}
          placeholder="مثلاً هاست، دامنه، تبلیغات..."
          required
          errorMessage={formState.errors.category?.message}
        />
        <CurrencyInput
          label="مبلغ"
          required
          value={amount}
          onChangeValue={(n) => setValue('amount', n, { shouldValidate: true })}
          errorMessage={formState.errors.amount?.message}
        />
        <Controller
          control={control}
          name="description"
          render={({ field: { onChange, value } }) => (
            <FormTextInput label="توضیح" value={value} onChangeText={onChange} style={styles.input} />
          )}
        />
        <JalaliDateField label="تاریخ" value={date} onChange={(d) => setValue('date', d)} />
      </FormSection>

      <Snackbar visible={!!error} onDismiss={() => setError('')}>
        {error}
      </Snackbar>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  input: { backgroundColor: 'transparent' },
});
