import React, { useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { Avatar, Text, useTheme } from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { clientRepository } from '@/database';
import type { ClientsStackParamList } from '@/navigation/types';
import { ScreenContainer } from '@/shared/components/ScreenContainer';
import { SearchBar } from '@/shared/components/SearchBar';
import { FAB } from '@/shared/components/FAB';
import { EmptyState } from '@/shared/components/EmptyState';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function ClientsScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<ClientsStackParamList>>();
  const [search, setSearch] = useState('');

  const { data: clients = [], refetch } = useQuery({
    queryKey: ['clients', search],
    queryFn: () => (search ? clientRepository.search(search) : clientRepository.getAll()),
  });

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScreenContainer scrollable={false} style={{ paddingTop: insets.top + 4 }}>
        <Text variant="titleLarge" style={styles.title}>مشتریان</Text>
        <SearchBar value={search} onChangeText={setSearch} placeholder="جستجو..." />

        {clients.length === 0 ? (
          <EmptyState
            icon="account-group-outline"
            title="مشتری‌ای ثبت نشده"
            description="کارفرمای اول را اضافه کنید"
            actionLabel="افزودن"
            onAction={() => navigation.navigate('ClientForm', {})}
          />
        ) : (
          <FlatList
            data={clients}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 80 }}
            onRefresh={refetch}
            refreshing={false}
            renderItem={({ item }) => (
              <Pressable onPress={() => navigation.navigate('ClientDetail', { clientId: item.id })}>
                <View style={[styles.row, { borderColor: theme.colors.outlineVariant, backgroundColor: theme.colors.surface }]}>
                  <Avatar.Text size={40} label={item.fullName.charAt(0)} style={{ backgroundColor: theme.colors.primary }} />
                  <View style={styles.info}>
                    <Text variant="bodyLarge" style={{ fontWeight: '600' }}>{item.fullName}</Text>
                    {item.companyName ? (
                      <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>{item.companyName}</Text>
                    ) : null}
                  </View>
                </View>
              </Pressable>
            )}
          />
        )}
      </ScreenContainer>
      <FAB onPress={() => navigation.navigate('ClientForm', {})} />
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontWeight: '700', marginBottom: 12, textAlign: 'right' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    marginBottom: 8,
  },
  info: { flex: 1, alignItems: 'flex-end' },
});
