import React from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';
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
import { ProgressBar } from '@/shared/components/ProgressBar';
import { useProfileStore } from '@/stores/profileStore';

type Nav = CompositeNavigationProp<
  NativeStackNavigationProp<ClientsStackParamList>,
  BottomTabNavigationProp<RootTabParamList>
>;

export function ClientDetailScreen() {
  const theme = useTheme();
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

  if (!client) return null;

  return (
    <ScreenContainer>
      <View style={[styles.header, { borderColor: theme.colors.outlineVariant }]}>
        <Text variant="titleLarge" style={{ fontWeight: '700', textAlign: 'right' }}>{client.fullName}</Text>
        {client.companyName ? <Text variant="bodyMedium" style={{ textAlign: 'right' }}>{client.companyName}</Text> : null}
        {client.phone ? <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'right' }}>{client.phone}</Text> : null}
      </View>

      <View style={styles.actions}>
        <Button mode="outlined" compact onPress={() => navigation.navigate('ClientForm', { clientId: client.id })}>ویرایش</Button>
        <Button mode="contained" compact onPress={() => navigation.navigate('Projects', { screen: 'ProjectForm', params: { clientId: client.id } })}>
            افزودن پروژه
        </Button>
      </View>

      <Text variant="titleSmall" style={styles.section}>پروژه‌ها</Text>
      <FlatList
        data={projects}
        scrollEnabled={false}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={{ textAlign: 'center', color: theme.colors.onSurfaceVariant }}>پروژه‌ای نیست</Text>}
        renderItem={({ item }) => {
          const progress = item.totalAmount > 0 ? (item.receivedAmount / item.totalAmount) * 100 : 0;
          return (
            <Pressable onPress={() => navigation.navigate('Projects', { screen: 'ProjectDetail', params: { projectId: item.id } })}>
              <View style={[styles.projectRow, { borderColor: theme.colors.outlineVariant }]}>
                <Text variant="bodyMedium" style={{ fontWeight: '600', textAlign: 'right' }}>{item.title}</Text>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'right' }}>
                  {PROJECT_STATUS_LABELS[item.status]} · {formatCurrency(item.totalAmount, currency)}
                </Text>
                <ProgressBar progress={progress} />
              </View>
            </Pressable>
          );
        }}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { borderBottomWidth: StyleSheet.hairlineWidth, paddingBottom: 16, marginBottom: 16 },
  actions: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  section: { fontWeight: '600', marginBottom: 10, textAlign: 'right' },
  projectRow: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 10, padding: 12, marginBottom: 8 },
});
