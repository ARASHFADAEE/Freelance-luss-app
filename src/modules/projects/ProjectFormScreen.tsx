import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet } from 'react-native';
import { Button, Snackbar } from 'react-native-paper';
import { FormTextInput } from '@/shared/components/FormTextInput';
import { FormSection } from '@/shared/components/FormSection';
import { ScreenContainer } from '@/shared/components/ScreenContainer';
import { ClientPickerField } from '@/shared/components/ClientPickerField';
import { SelectPickerField } from '@/shared/components/SelectPickerField';
import { useForm, Controller, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { refetchAnalyticsQueries } from '@/core/query/analyticsQueries';
import { clientRepository, projectRepository } from '@/database';
import { PROJECT_STATUS_LABELS } from '@/core/constants';
import type { ProjectStatus } from '@/core/types';
import type { ProjectsStackParamList } from '@/navigation/types';
import { todayISO } from '@/core/utils/persian';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import { JalaliDateField } from '@/shared/components/JalaliDateField';
import { CurrencyInput } from '@/shared/components/CurrencyInput';
import { spacing } from '@/core/theme/tokens';

const schema = z.object({
  clientId: z.string().min(1, 'مشتری را انتخاب کنید'),
  title: z.string().min(2, 'عنوان باید حداقل ۲ کاراکتر باشد'),
  description: z.string().optional(),
  totalAmount: z.preprocess((v) => Number(v), z.number().min(1, 'مبلغ کل را وارد کنید')),
  startDate: z.string(),
  dueDate: z.string(),
  status: z.string().min(1, 'وضعیت را انتخاب کنید'),
});

type FormData = z.infer<typeof schema>;

const STATUS_OPTIONS = Object.values(PROJECT_STATUS_LABELS);

export function ProjectFormScreen() {
  const route = useRoute<RouteProp<ProjectsStackParamList, 'ProjectForm'>>();
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const projectId = route.params?.projectId;
  const canAddProject = useSubscriptionStore((s) => s.canAddProject);
  const [error, setError] = useState('');

  const statusLabelToKey = useMemo(() => {
    const map = new Map<string, ProjectStatus>();
    (Object.keys(PROJECT_STATUS_LABELS) as ProjectStatus[]).forEach((k) => {
      map.set(PROJECT_STATUS_LABELS[k], k);
    });
    return map;
  }, []);

  const { data: project } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => projectRepository.getById(projectId!),
    enabled: !!projectId,
  });

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: () => clientRepository.getAll(),
  });

  const { control, handleSubmit, reset, setValue, watch, formState } = useForm<FormData>({
    resolver: zodResolver(schema) as Resolver<FormData>,
    defaultValues: {
      clientId: route.params?.clientId ?? '',
      title: '',
      description: '',
      totalAmount: 0,
      startDate: todayISO(),
      dueDate: todayISO(),
      status: 'negotiating',
    },
  });

  const totalAmount = watch('totalAmount');
  const startDate = watch('startDate');
  const dueDate = watch('dueDate');
  const statusKey = watch('status') as ProjectStatus;
  const statusLabel = PROJECT_STATUS_LABELS[statusKey] ?? '';

  useEffect(() => {
    if (project) {
      reset({
        clientId: project.clientId,
        title: project.title,
        description: project.description,
        totalAmount: project.totalAmount,
        startDate: project.startDate,
        dueDate: project.dueDate,
        status: project.status,
      });
    }
  }, [project, reset]);

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      if (projectId) {
        await projectRepository.update(projectId, { ...data, status: data.status as ProjectStatus });
      } else {
        const allowed = await canAddProject();
        if (!allowed) throw new Error('محدودیت پلن رایگان: حداکثر ۵ پروژه');
        await projectRepository.create({
          clientId: data.clientId,
          title: data.title,
          description: data.description ?? '',
          totalAmount: data.totalAmount,
          startDate: data.startDate,
          dueDate: data.dueDate,
          status: data.status as ProjectStatus,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      void refetchAnalyticsQueries(queryClient);
      navigation.goBack();
    },
    onError: (e) => setError(e.message),
  });

  const saveButton = (
    <Button mode="contained" onPress={handleSubmit((d) => mutation.mutate(d))} loading={mutation.isPending}>
      ذخیره پروژه
    </Button>
  );

  return (
    <ScreenContainer stickyFooter={saveButton}>
      <FormSection title="اطلاعات پروژه" description="مشتری و عنوان کار">
        <Controller
          control={control}
          name="clientId"
          render={({ field: { onChange, value }, fieldState }) => (
            <ClientPickerField
              clients={clients}
              value={value}
              onChange={onChange}
              required
              errorMessage={fieldState.error?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="title"
          render={({ field: { onChange, value }, fieldState }) => (
            <FormTextInput
              label="عنوان پروژه"
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
          name="description"
          render={({ field: { onChange, value } }) => (
            <FormTextInput
              label="توضیحات"
              value={value}
              onChangeText={onChange}
              multiline
              numberOfLines={3}
              style={styles.input}
            />
          )}
        />
      </FormSection>

      <FormSection title="مبلغ و زمان‌بندی">
        <CurrencyInput
          label="مبلغ کل"
          required
          value={totalAmount}
          onChangeValue={(n) => setValue('totalAmount', n, { shouldValidate: true })}
          errorMessage={formState.errors.totalAmount?.message}
        />
        <JalaliDateField label="تاریخ شروع" value={startDate} onChange={(d) => setValue('startDate', d)} />
        <JalaliDateField label="تاریخ سررسید" value={dueDate} onChange={(d) => setValue('dueDate', d)} />
        <SelectPickerField
          label="وضعیت پروژه"
          value={statusLabel}
          options={STATUS_OPTIONS}
          onChange={(label) => {
            const key = statusLabelToKey.get(label);
            if (key) setValue('status', key, { shouldValidate: true });
          }}
          required
          errorMessage={formState.errors.status?.message}
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
});
