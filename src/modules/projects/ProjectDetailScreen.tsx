import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Button } from 'react-native-paper';
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
import { StatusBadge } from '@/shared/components/StatusBadge';
import { ListCard } from '@/shared/components/ListCard';
import { EmptyState } from '@/shared/components/EmptyState';
import { AppText } from '@/shared/components/AppText';
import { AmountText } from '@/shared/components/AmountText';
import { useProfileStore } from '@/stores/profileStore';
import { useAppTheme } from '@/core/theme/useAppTheme';
import { radius, spacing } from '@/core/theme/tokens';

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

  const stickyFooter = (
    <View style={styles.footerActions}>
      <Button
        mode="outlined"
        icon="pencil"
        onPress={() => navigation.navigate('ProjectForm', { projectId: project.id })}
        style={styles.footerBtn}
      >
        ویرایش
      </Button>
      <Button
        mode="contained"
        icon="cash-plus"
        onPress={() => navigation.navigate('PaymentForm', { projectId: project.id })}
        style={styles.footerBtn}
      >
        ثبت پرداخت
      </Button>
    </View>
  );

  return (
    <ScreenContainer stickyFooter={stickyFooter}>
      <View style={styles.titleRow}>
        <AppText variant="h1" style={{ flex: 1 }}>
          {project.title}
        </AppText>
        {isSettled && <StatusBadge label="تسویه شده" tone="success" icon="check-circle" />}
      </View>
      <AppText variant="caption" color="muted" style={styles.meta}>
        {client?.fullName} · {PROJECT_STATUS_LABELS[project.status]}
      </AppText>

      <View style={[styles.stats, { borderColor: theme.colors.outlineVariant, backgroundColor: theme.colors.surface }]}>
        <View style={styles.statRow}>
          <AmountText variant="bodyMedium">{formatCurrency(project.totalAmount, currency)}</AmountText>
          <AppText variant="caption" color="muted">
            کل
          </AppText>
        </View>
        <View style={styles.statRow}>
          <AmountText variant="bodyMedium" color="success">
            {formatCurrency(project.receivedAmount, currency)}
          </AmountText>
          <AppText variant="caption" color="muted">
            دریافت
          </AppText>
        </View>
        <View style={styles.statRow}>
          <AmountText variant="bodyMedium" color="danger">
            {formatCurrency(project.remainingAmount, currency)}
          </AmountText>
          <AppText variant="caption" color="muted">
            مانده
          </AppText>
        </View>
        <ProgressBar progress={progress} />
      </View>

      <AppText variant="h3" style={styles.section}>
        پرداخت‌ها
      </AppText>
      <FlatList
        data={payments}
        scrollEnabled={false}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <EmptyState icon="cash" title="پرداختی ثبت نشده" description="اولین پرداخت این پروژه را ثبت کنید" />
        }
        renderItem={({ item }) => (
          <ListCard
            showChevron={false}
            title={formatCurrency(item.amount, currency)}
            subtitle={formatJalaliDate(item.paymentDate)}
            right={
              item.description ? (
                <AppText variant="caption" color="muted" numberOfLines={2}>
                  {item.description}
                </AppText>
              ) : undefined
            }
          />
        )}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  titleRow: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  meta: { marginBottom: spacing.lg },
  stats: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.md,
    padding: spacing.lg - 2,
    marginBottom: spacing.xl,
    gap: spacing.sm,
  },
  statRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  section: { marginBottom: spacing.md },
  footerActions: {
    flexDirection: 'row-reverse',
    gap: spacing.sm,
  },
  footerBtn: { flex: 1 },
});
