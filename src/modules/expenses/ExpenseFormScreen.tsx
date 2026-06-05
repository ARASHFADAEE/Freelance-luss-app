import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { Button, Snackbar } from 'react-native-paper';
import { useForm, Controller, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { expenseRepository } from '@/database';
import { EXPENSE_CATEGORIES } from '@/core/constants';
import type { MoreStackParamList } from '@/navigation/types';
import { todayISO } from '@/core/utils/persian';
import { ScreenContainer } from '@/shared/components/ScreenContainer';
import { JalaliDateField } from '@/shared/components/JalaliDateField';
import { CurrencyInput } from '@/shared/components/CurrencyInput';
import { SelectPickerField } from '@/shared/components/SelectPickerField';
import { FormTextInput } from '@/shared/components/FormTextInput';

const schema = z.object({
  category: z.string(),
  amount: z.preprocess((v) => Number(v), z.number().min(1)),
  description: z.string().optional(),
  date: z.string(),
});

type FormData = z.infer<typeof schema>;

export function ExpenseFormScreen() {
  const route = useRoute<RouteProp<MoreStackParamList, 'ExpenseForm'>>();
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const expenseId = route.params?.expenseId;
  const [error, setError] = useState('');

  const { data: expense } = useQuery({
    queryKey: ['expense', expenseId],
    queryFn: () => expenseRepository.getById(expenseId!),
    enabled: !!expenseId,
  });

  const { control, handleSubmit, reset, setValue, watch } = useForm<FormData>({
    resolver: zodResolver(schema) as Resolver<FormData>,
    defaultValues: { category: '', amount: 0, description: '', date: todayISO() },
  });

  const category = watch('category');
  const amount = watch('amount');
  const date = watch('date');

  useEffect(() => {
    if (expense) reset({ category: expense.category, amount: expense.amount, description: expense.description, date: expense.date });
  }, [expense, reset]);

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      if (expenseId) await expenseRepository.update(expenseId, data);
      else await expenseRepository.create({ ...data, description: data.description ?? '' });
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['expenses'] }); navigation.goBack(); },
    onError: (e) => setError(e.message),
  });

  return (
    <ScreenContainer>
      <SelectPickerField
        label="دسته‌بندی هزینه"
        value={category}
        options={EXPENSE_CATEGORIES}
        onChange={(c) => setValue('category', c)}
        placeholder="مثلاً هاست، دامنه، تبلیغات..."
        required
      />
      <CurrencyInput label="مبلغ" value={amount} onChangeValue={(n) => setValue('amount', n)} />
      <Controller control={control} name="description" render={({ field: { onChange, value } }) => (
        <FormTextInput label="توضیح" value={value} onChangeText={onChange} style={styles.input} />
      )} />
      <JalaliDateField label="تاریخ" value={date} onChange={(d) => setValue('date', d)} />
      <Button mode="contained" onPress={handleSubmit((d) => mutation.mutate(d))} loading={mutation.isPending} style={{ marginTop: 12 }}>ذخیره</Button>
      <Snackbar visible={!!error} onDismiss={() => setError('')}>{error}</Snackbar>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  input: { backgroundColor: 'transparent', marginBottom: 8 },
});
