import React from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { projectRepository } from '@/database';
import { PROJECT_STATUS_LABELS } from '@/core/constants';
import { formatCurrency } from '@/core/utils/currency';
import { isProjectSettled } from '@/core/utils/project';
import type { ProjectsStackParamList } from '@/navigation/types';
import { ScreenContainer } from '@/shared/components/ScreenContainer';
import { FAB } from '@/shared/components/FAB';
import { EmptyState } from '@/shared/components/EmptyState';
import { ProgressBar } from '@/shared/components/ProgressBar';
import { useProfileStore } from '@/stores/profileStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '@/core/theme/useAppTheme';

export function ProjectsScreen() {
  const theme = useTheme();
  const appTheme = useAppTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<ProjectsStackParamList>>();
  const currency = useProfileStore((s) => s.profile?.currency ?? 'TOMAN');

  const { data: projects = [], refetch } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectRepository.getAll(),
  });

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScreenContainer scrollable={false} style={{ paddingTop: insets.top + 4 }}>
        <Text variant="titleLarge" style={styles.title}>پروژه‌ها</Text>

        {projects.length === 0 ? (
          <EmptyState icon="briefcase-outline" title="پروژه‌ای نیست" actionLabel="افزودن" onAction={() => navigation.navigate('ProjectForm', {})} />
        ) : (
          <FlatList
            data={projects}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 80 }}
            onRefresh={refetch}
            refreshing={false}
            renderItem={({ item }) => {
              const settled = isProjectSettled(item);
              const progress = item.totalAmount > 0 ? (item.receivedAmount / item.totalAmount) * 100 : 0;

              return (
                <Pressable onPress={() => navigation.navigate('ProjectDetail', { projectId: item.id })}>
                  <View
                    style={[
                      styles.card,
                      {
                        borderColor: settled ? appTheme.custom.success + '40' : theme.colors.outlineVariant,
                        backgroundColor: settled ? appTheme.custom.success + '08' : theme.colors.surface,
                        opacity: settled ? 0.72 : 1,
                      },
                    ]}
                  >
                    <View style={styles.row}>
                      {settled ? (
                        <View style={[styles.settledBadge, { backgroundColor: appTheme.custom.success + '20' }]}>
                          <Text variant="labelSmall" style={{ color: appTheme.custom.success, fontWeight: '700' }}>
                            تسویه شده
                          </Text>
                        </View>
                      ) : (
                        <Text variant="labelSmall" style={{ color: theme.colors.primary }}>
                          {PROJECT_STATUS_LABELS[item.status]}
                        </Text>
                      )}
                      <Text
                        variant="bodyLarge"
                        style={{
                          fontWeight: '600',
                          flex: 1,
                          textAlign: 'right',
                          color: settled ? theme.colors.onSurfaceVariant : theme.colors.onSurface,
                        }}
                      >
                        {item.title}
                      </Text>
                    </View>
                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'right', marginTop: 4 }}>
                      {settled
                        ? `${formatCurrency(item.totalAmount, currency)} · پرداخت کامل`
                        : `${formatCurrency(item.totalAmount, currency)} · مانده ${formatCurrency(item.remainingAmount, currency)}`}
                    </Text>
                    {!settled && <ProgressBar progress={progress} />}
                  </View>
                </Pressable>
              );
            }}
          />
        )}
      </ScreenContainer>
      <FAB onPress={() => navigation.navigate('ProjectForm', {})} />
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontWeight: '700', marginBottom: 12, textAlign: 'right' },
  card: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 12, padding: 14, marginBottom: 8 },
  row: { flexDirection: 'row-reverse', alignItems: 'center', gap: 8 },
  settledBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
});
