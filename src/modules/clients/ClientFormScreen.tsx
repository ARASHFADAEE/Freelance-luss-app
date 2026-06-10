import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { Button, Snackbar } from 'react-native-paper';
import { FormTextInput } from '@/shared/components/FormTextInput';
import { FormSection } from '@/shared/components/FormSection';
import { ScreenContainer } from '@/shared/components/ScreenContainer';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { clientRepository } from '@/database';
import type { ClientsStackParamList } from '@/navigation/types';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import { spacing } from '@/core/theme/tokens';

const schema = z.object({
  fullName: z.string().min(2, 'نام باید حداقل ۲ کاراکتر باشد'),
  phone: z.string().optional(),
  email: z
    .string()
    .refine((val) => !val || z.string().email().safeParse(val).success, 'ایمیل معتبر نیست')
    .optional(),
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

  const saveButton = (
    <Button
      mode="contained"
      onPress={handleSubmit((d) => mutation.mutate(d))}
      loading={mutation.isPending}
      style={styles.saveBtn}
    >
      ذخیره
    </Button>
  );

  return (
    <ScreenContainer stickyFooter={saveButton}>
      <FormSection title="اطلاعات اصلی" description="نام و راه‌های تماس کارفرما">
        <Controller
          control={control}
          name="fullName"
          render={({ field: { onChange, value }, fieldState }) => (
            <FormTextInput
              label="نام"
              required
              value={value}
              onChangeText={onChange}
              errorMessage={fieldState.error?.message}
              style={styles.input}
            />
          )}
        />
        <Controller
          control={control}
          name="phone"
          render={({ field: { onChange, value } }) => (
            <FormTextInput
              label="تلفن"
              value={value}
              onChangeText={onChange}
              keyboardType="phone-pad"
              helperText="اختیاری — برای تماس سریع"
              style={styles.input}
            />
          )}
        />
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, value }, fieldState }) => (
            <FormTextInput
              label="ایمیل"
              value={value}
              onChangeText={onChange}
              keyboardType="email-address"
              autoCapitalize="none"
              errorMessage={fieldState.error?.message}
              style={styles.input}
            />
          )}
        />
      </FormSection>

      <FormSection title="اطلاعات تکمیلی">
        <Controller
          control={control}
          name="companyName"
          render={({ field: { onChange, value } }) => (
            <FormTextInput label="شرکت" value={value} onChangeText={onChange} style={styles.input} />
          )}
        />
        <Controller
          control={control}
          name="notes"
          render={({ field: { onChange, value } }) => (
            <FormTextInput
              label="یادداشت"
              value={value}
              onChangeText={onChange}
              multiline
              numberOfLines={3}
              style={styles.input}
            />
          )}
        />
      </FormSection>

      <Snackbar visible={!!error} onDismiss={() => setError('')}>
        {error}
      </Snackbar>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  input: { backgroundColor: 'transparent' },
  saveBtn: { borderRadius: spacing.md },
});
