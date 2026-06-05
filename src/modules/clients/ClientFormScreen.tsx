import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Snackbar } from 'react-native-paper';
import { FormTextInput } from '@/shared/components/FormTextInput';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { clientRepository } from '@/database';
import type { ClientsStackParamList } from '@/navigation/types';
import { ScreenContainer } from '@/shared/components/ScreenContainer';
import { useSubscriptionStore } from '@/stores/subscriptionStore';

const schema = z.object({
  fullName: z.string().min(2, 'نام الزامی است'),
  phone: z.string().optional(),
  email: z.string().optional(),
  companyName: z.string().optional(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export function ClientFormScreen() {
  const route = useRoute<RouteProp<ClientsStackParamList, 'ClientForm'>>();
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const clientId = route.params?.clientId;
  const canAddClient = useSubscriptionStore((s) => s.canAddClient);
  const [error, setError] = useState('');

  const { data: client } = useQuery({
    queryKey: ['client', clientId],
    queryFn: () => clientRepository.getById(clientId!),
    enabled: !!clientId,
  });

  const { control, handleSubmit, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { fullName: '', phone: '', email: '', companyName: '', notes: '' },
  });

  useEffect(() => {
    if (client) reset(client);
  }, [client, reset]);

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      if (clientId) {
        await clientRepository.update(clientId, data);
      } else {
        const allowed = await canAddClient();
        if (!allowed) throw new Error('محدودیت پلن رایگان: حداکثر ۳ مشتری');
        await clientRepository.create({
          fullName: data.fullName,
          phone: data.phone ?? '',
          email: data.email ?? '',
          companyName: data.companyName ?? '',
          notes: data.notes ?? '',
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      navigation.goBack();
    },
    onError: (e) => setError(e.message),
  });

  return (
    <ScreenContainer>
      <View style={styles.form}>
        <Controller control={control} name="fullName" render={({ field: { onChange, value } }) => (
          <FormTextInput label="نام *" value={value} onChangeText={onChange} style={styles.input} />
        )} />
        <Controller control={control} name="phone" render={({ field: { onChange, value } }) => (
          <FormTextInput label="تلفن" value={value} onChangeText={onChange} keyboardType="phone-pad" style={styles.input} />
        )} />
        <Controller control={control} name="email" render={({ field: { onChange, value } }) => (
          <FormTextInput label="ایمیل" value={value} onChangeText={onChange} style={styles.input} />
        )} />
        <Controller control={control} name="companyName" render={({ field: { onChange, value } }) => (
          <FormTextInput label="شرکت" value={value} onChangeText={onChange} style={styles.input} />
        )} />
        <Controller control={control} name="notes" render={({ field: { onChange, value } }) => (
          <FormTextInput label="یادداشت" value={value} onChangeText={onChange} multiline style={styles.input} />
        )} />
        <Button mode="contained" onPress={handleSubmit((d) => mutation.mutate(d))} loading={mutation.isPending}>
          ذخیره
        </Button>
      </View>
      <Snackbar visible={!!error} onDismiss={() => setError('')}>{error}</Snackbar>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  form: { gap: 10 },
  input: { backgroundColor: 'transparent' },
});
