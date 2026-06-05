import React from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { serviceRepository } from '@/database';
import { formatCurrency } from '@/core/utils/currency';
import type { MoreStackParamList } from '@/navigation/types';
import { ScreenContainer } from '@/shared/components/ScreenContainer';
import { FAB } from '@/shared/components/FAB';
import { EmptyState } from '@/shared/components/EmptyState';
import { useProfileStore } from '@/stores/profileStore';

export function ServicesScreen() {
  const theme = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<MoreStackParamList>>();

  const { data: services = [], refetch } = useQuery({
    queryKey: ['services'],
    queryFn: () => serviceRepository.getAll(),
  });
  const currency = useProfileStore((s) => s.profile?.currency ?? 'TOMAN');

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScreenContainer scrollable={false}>
        {services.length === 0 ? (
          <EmptyState icon="briefcase-plus-outline" title="خدمتی نیست" actionLabel="افزودن" onAction={() => navigation.navigate('ServiceForm', {})} />
        ) : (
          <FlatList
            data={services}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 80 }}
            onRefresh={refetch}
            refreshing={false}
            renderItem={({ item }) => (
              <Pressable onPress={() => navigation.navigate('ServiceForm', { serviceId: item.id })}>
                <View style={[styles.row, { borderColor: theme.colors.outlineVariant }]}>
                  <Text variant="bodyMedium" style={{ color: theme.colors.primary }}>{formatCurrency(item.defaultPrice, currency)}</Text>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text variant="bodyLarge" style={{ fontWeight: '600' }}>{item.title}</Text>
                    <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>{item.category}</Text>
                  </View>
                </View>
              </Pressable>
            )}
          />
        )}
      </ScreenContainer>
      <FAB onPress={() => navigation.navigate('ServiceForm', {})} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: StyleSheet.hairlineWidth, paddingVertical: 14 },
});
