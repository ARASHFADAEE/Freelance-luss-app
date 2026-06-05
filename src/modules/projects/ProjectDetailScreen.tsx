import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { clientRepository, paymentRepository, projectRepository } from '@/database';
import { PROJECT_STATUS_LABELS } from '@/core/constants';
import { formatCurrency } from '@/core/utils/currency';
import { formatJalaliDate } from '@/core/utils/persian';
import type { ProjectsStackParamList } from '@/navigation/types';
import { ScreenContainer } from '@/shared/components/ScreenContainer';
import { ProgressBar } from '@/shared/components/ProgressBar';
import { useProfileStore } from '@/stores/profileStore';
import { useAppTheme } from '@/core/theme/useAppTheme';

export function ProjectDetailScreen() {
  const theme = useAppTheme();
  const route = useRoute<RouteProp<ProjectsStackParamList, 'ProjectDetail'>>();
  const navigation = useNavigation<NativeStackNavigationProp<ProjectsStackParamList>>();
  const currency = useProfileStore((s) => s.profile?.currency ?? 'TOMAN');

  const { data: project } = useQuery({
    queryKey: ['project', route.params.projectId],
    queryFn: () => projectRepository.getById(route.params.projectId),
  });

  const { data: client } = useQuery({
    queryKey: ['client', project?.clientId],
    queryFn: () => clientRepository.getById(project!.clientId),
    enabled: !!project?.clientId,
  });

  const { data: payments = [] } = useQuery({
    queryKey: ['payments', route.params.projectId],
    queryFn: () => paymentRepository.getByProjectId(route.params.projectId),
  });

  if (!project) return null;

  const progress = project.totalAmount > 0 ? (project.receivedAmount / project.totalAmount) * 100 : 0;
  const isSettled = project.totalAmount > 0 && project.remainingAmount <= 0;

  return (
    <ScreenContainer>
      <Text variant="titleLarge" style={{ fontWeight: '700', textAlign: 'right' }}>{project.title}</Text>
      {isSettled && (
        <View style={[styles.settledBadge, { backgroundColor: theme.custom.success + '18' }]}>
          <Text variant="labelLarge" style={{ color: theme.custom.success, fontWeight: '700' }}>پروژه تسویه شده ✓</Text>
        </View>
      )}
      <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'right', marginBottom: 16 }}>
        {client?.fullName} · {PROJECT_STATUS_LABELS[project.status]}
      </Text>

      <View style={[styles.stats, { borderColor: theme.colors.outlineVariant }]}>
        <View style={styles.statRow}>
          <Text variant="bodyMedium">{formatCurrency(project.totalAmount, currency)}</Text>
          <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>کل</Text>
        </View>
        <View style={styles.statRow}>
          <Text variant="bodyMedium" style={{ color: theme.custom.success }}>{formatCurrency(project.receivedAmount, currency)}</Text>
          <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>دریافت</Text>
        </View>
        <View style={styles.statRow}>
          <Text variant="bodyMedium" style={{ color: theme.custom.danger }}>{formatCurrency(project.remainingAmount, currency)}</Text>
          <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>مانده</Text>
        </View>
        <ProgressBar progress={progress} />
      </View>

      <View style={styles.actions}>
        <Button
          mode="contained"
          icon="cash-plus"
          onPress={() => navigation.navigate('PaymentForm', { projectId: project.id })}
          style={styles.actionBtn}
        >
          ثبت پرداخت
        </Button>
        <Button
          mode="outlined"
          icon="pencil"
          onPress={() => navigation.navigate('ProjectForm', { projectId: project.id })}
          style={styles.actionBtn}
        >
          ویرایش
        </Button>
      </View>

      <Text variant="titleSmall" style={styles.section}>پرداخت‌ها</Text>
      <FlatList
        data={payments}
        scrollEnabled={false}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={{ textAlign: 'center', color: theme.colors.onSurfaceVariant }}>پرداختی نیست</Text>}
        renderItem={({ item }) => (
          <View style={[styles.payRow, { borderColor: theme.colors.outlineVariant }]}>
            <Text variant="bodyMedium" style={{ color: theme.custom.success }}>{formatCurrency(item.amount, currency)}</Text>
            <View style={{ alignItems: 'flex-end' }}>
              <Text variant="bodySmall">{formatJalaliDate(item.paymentDate)}</Text>
              {item.description ? <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>{item.description}</Text> : null}
            </View>
          </View>
        )}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  settledBadge: { alignSelf: 'flex-end', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, marginBottom: 8 },
  stats: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 12, padding: 14, marginBottom: 16 },
  statRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', marginBottom: 6 },
  actions: { flexDirection: 'row-reverse', gap: 12, marginBottom: 20 },
  actionBtn: { flex: 1 },
  section: { fontWeight: '600', marginBottom: 10, textAlign: 'right' },
  payRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', borderBottomWidth: StyleSheet.hairlineWidth, paddingVertical: 10 },
});
