import React, { useMemo } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Button } from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { clientRepository, projectRepository } from '@/database';
import { PROJECT_STATUS_LABELS } from '@/core/constants';
import { formatCurrency } from '@/core/utils/currency';
import type { ClientsStackParamList, RootTabParamList } from '@/navigation/types';
import { ScreenContainer } from '@/shared/components/ScreenContainer';
import { ListCard } from '@/shared/components/ListCard';
import { ProgressBar } from '@/shared/components/ProgressBar';
import { EmptyState } from '@/shared/components/EmptyState';
import { AppText } from '@/shared/components/AppText';
import { useProfileStore } from '@/stores/profileStore';
import { useAppTheme } from '@/core/theme/useAppTheme';
import { radius, spacing } from '@/core/theme/tokens';

type Nav = CompositeNavigationProp<
  NativeStackNavigationProp<ClientsStackParamList>,
  BottomTabNavigationProp<RootTabParamList>
>;

export function ClientDetailScreen() {
  const theme = useAppTheme();
  const route = useRoute<RouteProp<ClientsStackParamList, 'ClientDetail'>>();
  const navigation = useNavigation<Nav>();
  const currency = useProfileStore((s) => s.profile?.currency ?? 'TOMAN');

  const { data: client } = useQuery({
    queryKey: ['client', route.params.clientId],
    queryFn: () => clientRepository.getById(route.params.clientId),
  });

  const { data: projects = [] } = useQuery({
    queryKey: ['projects', route.params.clientId],
    queryFn: () => projectRepository.getByClientId(route.params.clientId),
  });

  const totalRevenue = useMemo(
    () => projects.reduce((sum, p) => sum + p.receivedAmount, 0),
    [projects],
  );

  if (!client) return null;

  const stickyFooter = (
    <View style={styles.footerActions}>
      <Button
        mode="outlined"
        onPress={() => navigation.navigate('ClientForm', { clientId: client.id })}
        style={styles.footerBtn}
      >
        ویرایش
      </Button>
      <Button
        mode="contained"
        icon="briefcase-plus-outline"
        onPress={() =>
          navigation.navigate('Projects', { screen: 'ProjectForm', params: { clientId: client.id } })
        }
        style={styles.footerBtn}
      >
        افزودن پروژه
      </Button>
    </View>
  );

  return (
    <ScreenContainer stickyFooter={stickyFooter}>
      <View style={[styles.header, { borderColor: theme.colors.outlineVariant }]}>
        <AppText variant="h1">{client.fullName}</AppText>
        {client.companyName ? <AppText variant="bodyMedium">{client.companyName}</AppText> : null}
        {client.phone ? <AppText variant="caption" color="muted">{client.phone}</AppText> : null}
        {client.email ? <AppText variant="caption" color="muted">{client.email}</AppText> : null}
        {totalRevenue > 0 && (
          <View style={[styles.revenuePill, { backgroundColor: theme.custom.successMuted }]}>
            <AppText variant="caption" color="success" style={{ fontWeight: '600' }}>
              درآمد ثبت‌شده: {formatCurrency(totalRevenue, currency)}
            </AppText>
          </View>
        )}
      </View>

      <AppText variant="h3" style={styles.section}>
        پروژه‌ها
      </AppText>
      <FlatList
        data={projects}
        scrollEnabled={false}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <EmptyState
            icon="briefcase-outline"
            title="پروژه‌ای نیست"
            actionLabel="افزودن پروژه"
            onAction={() =>
              navigation.navigate('Projects', { screen: 'ProjectForm', params: { clientId: client.id } })
            }
          />
        }
        renderItem={({ item }) => {
          const progress = item.totalAmount > 0 ? (item.receivedAmount / item.totalAmount) * 100 : 0;
          return (
            <ListCard
              title={item.title}
              subtitle={`${PROJECT_STATUS_LABELS[item.status]} · ${formatCurrency(item.totalAmount, currency)}`}
              footer={<ProgressBar progress={progress} />}
              onPress={() =>
                navigation.navigate('Projects', { screen: 'ProjectDetail', params: { projectId: item.id } })
              }
            />
          );
        }}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingBottom: spacing.lg,
    marginBottom: spacing.lg,
    gap: spacing.xs,
    alignItems: 'flex-end',
  },
  revenuePill: {
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.full,
  },
  section: { marginBottom: spacing.md },
  footerActions: {
    flexDirection: 'row-reverse',
    gap: spacing.sm,
  },
  footerBtn: { flex: 1 },
});
