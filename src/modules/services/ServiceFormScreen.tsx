import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { Button, Menu, Snackbar, TextInput } from 'react-native-paper';
import { useForm, Controller, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { serviceRepository } from '@/database';
import { SERVICE_CATEGORIES } from '@/core/constants';
import type { MoreStackParamList } from '@/navigation/types';
import { ScreenContainer } from '@/shared/components/ScreenContainer';
import { CurrencyInput } from '@/shared/components/CurrencyInput';

const schema = z.object({
  title: z.string().min(2),
  category: z.string(),
  defaultPrice: z.preprocess((v) => Number(v), z.number().min(0)),
  description: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export function ServiceFormScreen() {
  const route = useRoute<RouteProp<MoreStackParamList, 'ServiceForm'>>();
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const serviceId = route.params?.serviceId;
  const [categoryMenuVisible, setCategoryMenuVisible] = useState(false);
  const [error, setError] = useState('');

  const { data: service } = useQuery({
    queryKey: ['service', serviceId],
    queryFn: () => serviceRepository.getById(serviceId!),
    enabled: !!serviceId,
  });

  const { control, handleSubmit, reset, setValue, watch } = useForm<FormData>({
    resolver: zodResolver(schema) as Resolver<FormData>,
    defaultValues: { title: '', category: SERVICE_CATEGORIES[0], defaultPrice: 0, description: '' },
  });

  const category = watch('category');
  const defaultPrice = watch('defaultPrice');

  useEffect(() => {
    if (service) reset(service);
  }, [service, reset]);

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      if (serviceId) await serviceRepository.update(serviceId, data);
      else await serviceRepository.create({ ...data, description: data.description ?? '' });
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['services'] }); navigation.goBack(); },
    onError: (e) => setError(e.message),
  });

  return (
    <ScreenContainer>
      <Controller control={control} name="title" render={({ field: { onChange, value } }) => (
        <TextInput label="عنوان *" value={value} onChangeText={onChange} mode="outlined" style={styles.input} />
      )} />
      <Menu visible={categoryMenuVisible} onDismiss={() => setCategoryMenuVisible(false)} anchor={
        <Button mode="outlined" onPress={() => setCategoryMenuVisible(true)} style={styles.menuBtn}>{category}</Button>
      }>
        {SERVICE_CATEGORIES.map((c) => <Menu.Item key={c} title={c} onPress={() => { setValue('category', c); setCategoryMenuVisible(false); }} />)}
      </Menu>
      <CurrencyInput label="قیمت پیش‌فرض" value={defaultPrice} onChangeValue={(n) => setValue('defaultPrice', n)} />
      <Controller control={control} name="description" render={({ field: { onChange, value } }) => (
        <TextInput label="توضیح" value={value} onChangeText={onChange} multiline mode="outlined" style={styles.input} />
      )} />
      <Button mode="contained" onPress={handleSubmit((d) => mutation.mutate(d))} loading={mutation.isPending} style={{ marginTop: 12 }}>ذخیره</Button>
      <Snackbar visible={!!error} onDismiss={() => setError('')}>{error}</Snackbar>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  input: { backgroundColor: 'transparent', marginBottom: 8 },
  menuBtn: { alignSelf: 'stretch', marginBottom: 8 },
});
