import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Menu, Snackbar } from 'react-native-paper';
import { FormTextInput } from '@/shared/components/FormTextInput';
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
import { rtlLayoutStyle } from '@/core/theme/rtlLayout';
import { CurrencyInput } from '@/shared/components/CurrencyInput';

const schema = z.object({
  clientId: z.string().min(1),
  title: z.string().min(2),
  description: z.string().optional(),
  totalAmount: z.preprocess((v) => Number(v), z.number().min(0)),
  startDate: z.string(),
  dueDate: z.string(),
  status: z.string(),
});

type FormData = z.infer<typeof schema>;

export function ProjectFormScreen() {
  const route = useRoute<RouteProp<ProjectsStackParamList, 'ProjectForm'>>();
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const projectId = route.params?.projectId;
  const canAddProject = useSubscriptionStore((s) => s.canAddProject);
  const [statusMenuVisible, setStatusMenuVisible] = useState(false);
  const [clientMenuVisible, setClientMenuVisible] = useState(false);
  const [error, setError] = useState('');

  const { data: project } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => projectRepository.getById(projectId!),
    enabled: !!projectId,
  });

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: () => clientRepository.getAll(),
  });

  const { control, handleSubmit, reset, setValue, watch } = useForm<FormData>({
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

  const selectedClientId = watch('clientId');
  const selectedStatus = watch('status');
  const totalAmount = watch('totalAmount');
  const startDate = watch('startDate');
  const dueDate = watch('dueDate');
  const selectedClient = clients.find((c) => c.id === selectedClientId);

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
          description: data.description,
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

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Menu visible={clientMenuVisible} onDismiss={() => setClientMenuVisible(false)} anchor={
        <Button mode="outlined" onPress={() => setClientMenuVisible(true)} style={styles.menuBtn}>
          {selectedClient?.fullName ?? 'انتخاب مشتری *'}
        </Button>
      }>
        {clients.map((c) => (
          <Menu.Item key={c.id} title={c.fullName} onPress={() => { setValue('clientId', c.id); setClientMenuVisible(false); }} />
        ))}
      </Menu>

      <Controller control={control} name="title" render={({ field: { onChange, value } }) => (
        <FormTextInput label="عنوان پروژه *" value={value} onChangeText={onChange} style={styles.input} />
      )} />
      <Controller control={control} name="description" render={({ field: { onChange, value } }) => (
        <FormTextInput label="توضیحات" value={value} onChangeText={onChange} multiline style={styles.input} />
      )} />

      <CurrencyInput label="مبلغ کل" value={totalAmount} onChangeValue={(n) => setValue('totalAmount', n)} />

      <JalaliDateField label="تاریخ شروع" value={startDate} onChange={(d) => setValue('startDate', d)} />
      <JalaliDateField label="تاریخ سررسید" value={dueDate} onChange={(d) => setValue('dueDate', d)} />

      <Menu visible={statusMenuVisible} onDismiss={() => setStatusMenuVisible(false)} anchor={
        <Button mode="outlined" onPress={() => setStatusMenuVisible(true)} style={styles.menuBtn}>
          {PROJECT_STATUS_LABELS[selectedStatus as ProjectStatus] ?? 'وضعیت'}
        </Button>
      }>
        {(Object.keys(PROJECT_STATUS_LABELS) as ProjectStatus[]).map((s) => (
          <Menu.Item key={s} title={PROJECT_STATUS_LABELS[s]} onPress={() => { setValue('status', s); setStatusMenuVisible(false); }} />
        ))}
      </Menu>

      <Button mode="contained" onPress={handleSubmit((d) => mutation.mutate(d))} loading={mutation.isPending} style={styles.button}>
        ذخیره
      </Button>
      <Snackbar visible={!!error} onDismiss={() => setError('')}>{error}</Snackbar>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, ...rtlLayoutStyle },
  content: { padding: 16, gap: 8, paddingBottom: 32 },
  input: { backgroundColor: 'transparent' },
  menuBtn: { alignSelf: 'stretch' },
  button: { marginTop: 8 },
});
