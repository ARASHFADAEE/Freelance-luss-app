import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { projectRepository } from '@/database';
import { PROJECT_STATUS_LABELS } from '@/core/constants';
import { formatCurrency } from '@/core/utils/currency';
import { isProjectSettled } from '@/core/utils/project';
import type { ProjectsStackParamList } from '@/navigation/types';
import { ScreenContainer } from '@/shared/components/ScreenContainer';
import { EmptyState } from '@/shared/components/EmptyState';
import { ListCard } from '@/shared/components/ListCard';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { ProgressBar } from '@/shared/components/ProgressBar';
import { SkeletonList } from '@/shared/components/Skeleton';
import { AppText } from '@/shared/components/AppText';
import { useProfileStore } from '@/stores/profileStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '@/core/theme/useAppTheme';
import { spacing } from '@/core/theme/tokens';

export function ProjectsScreen() {
  const theme = useTheme();
  const appTheme = useAppTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<ProjectsStackParamList>>();
  const currency = useProfileStore((s) => s.profile?.currency ?? 'TOMAN');

  const { data: projects = [], refetch, isFetching, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectRepository.getAll(),
  });

  const header = (
    <View style={{ paddingTop: insets.top + spacing.xs }}>
      <AppText variant="h1" style={styles.title}>
        پروژه‌ها
      </AppText>
      {projects.length > 0 && (
        <AppText variant="caption" color="muted">
          {projects.length} پروژه
        </AppText>
      )}
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScreenContainer scrollable={false} padded={false} style={{ paddingHorizontal: spacing.lg }} header={header}>
        {isLoading ? (
          <SkeletonList count={5} />
        ) : projects.length === 0 ? (
          <EmptyState
            icon="briefcase-outline"
            title="پروژه‌ای نیست"
            description="اولین پروژه را برای این مشتری بسازید"
            actionLabel="افزودن"
            onAction={() => navigation.navigate('ProjectForm', {})}
          />
        ) : (
          <FlatList
            data={projects}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 100 }}
            onRefresh={refetch}
            refreshing={isFetching && !isLoading}
            renderItem={({ item }) => {
              const settled = isProjectSettled(item);
              const progress = item.totalAmount > 0 ? (item.receivedAmount / item.totalAmount) * 100 : 0;

              return (
                <ListCard
                  title={item.title}
                  subtitle={
                    settled
                      ? `${formatCurrency(item.totalAmount, currency)} · پرداخت کامل`
                      : `${formatCurrency(item.totalAmount, currency)} · مانده ${formatCurrency(item.remainingAmount, currency)}`
                  }
                  muted={settled}
                  borderColor={settled ? appTheme.custom.success + '40' : undefined}
                  backgroundColor={settled ? appTheme.custom.success + '08' : undefined}
                  badge={
                    settled ? (
                      <StatusBadge label="تسویه شده" tone="success" icon="check-circle" />
                    ) : (
                      <StatusBadge label={PROJECT_STATUS_LABELS[item.status]} tone="primary" />
                    )
                  }
                  footer={!settled ? <ProgressBar progress={progress} /> : undefined}
                  onPress={() => navigation.navigate('ProjectDetail', { projectId: item.id })}
                />
              );
            }}
          />
        )}
      </ScreenContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { marginBottom: spacing.xs },
});
