import React, { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { Avatar, Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { clientRepository } from '@/database';
import { useDebouncedValue } from '@/core/hooks/useDebouncedValue';
import type { Client } from '@/core/types';
import type { ClientsStackParamList } from '@/navigation/types';
import { ScreenContainer } from '@/shared/components/ScreenContainer';
import { SearchBar } from '@/shared/components/SearchBar';
import { FAB } from '@/shared/components/FAB';
import { EmptyState } from '@/shared/components/EmptyState';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function clientSubtitle(client: Client, isSearching: boolean): string | null {
  if (isSearching) {
    if (client.companyName) return client.companyName;
    if (client.phone) return client.phone;
    if (client.email) return client.email;
    return null;
  }
  return client.companyName || client.phone || null;
}

export function ClientsScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<ClientsStackParamList>>();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search.trim(), 280);
  const isSearching = debouncedSearch.length > 0;

  const { data: clients = [], refetch, isFetching } = useQuery({
    queryKey: ['clients', debouncedSearch],
    queryFn: () => (isSearching ? clientRepository.search(debouncedSearch) : clientRepository.getAll()),
    placeholderData: (prev) => prev,
  });

  const isPendingSearch = search.trim() !== debouncedSearch || (isFetching && isSearching);

  const resultLabel = useMemo(() => {
    if (!isSearching) return null;
    return clients.length === 0
      ? 'نتیجه‌ای یافت نشد'
      : `${clients.length} مشتری یافت شد`;
  }, [isSearching, clients.length]);

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScreenContainer scrollable={false} style={{ paddingTop: insets.top + 4 }}>
        <Text variant="titleLarge" style={styles.title}>مشتریان</Text>

        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="نام، شرکت، موبایل یا ایمیل..."
          loading={isPendingSearch}
        />

        {resultLabel && (
          <View style={styles.resultRow}>
            {isPendingSearch ? (
              <ActivityIndicator size={14} color={theme.colors.primary} />
            ) : (
              <MaterialCommunityIcons
                name={clients.length > 0 ? 'check-circle-outline' : 'alert-circle-outline'}
                size={16}
                color={clients.length > 0 ? theme.colors.primary : theme.colors.onSurfaceVariant}
              />
            )}
            <Text
              variant="labelMedium"
              style={{ color: clients.length > 0 ? theme.colors.primary : theme.colors.onSurfaceVariant }}
            >
              {resultLabel}
            </Text>
          </View>
        )}

        {clients.length === 0 ? (
          <EmptyState
            icon={isSearching ? 'magnify-close' : 'account-group-outline'}
            title={isSearching ? 'مشتری‌ای پیدا نشد' : 'مشتری‌ای ثبت نشده'}
            description={
              isSearching
                ? 'عبارت دیگری امتحان کنید یا املای نام/شماره را بررسی کنید'
                : 'کارفرمای اول را اضافه کنید'
            }
            actionLabel={isSearching ? undefined : 'افزودن'}
            onAction={isSearching ? undefined : () => navigation.navigate('ClientForm', {})}
          />
        ) : (
          <FlatList
            data={clients}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 80 }}
            onRefresh={refetch}
            refreshing={false}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => {
              const subtitle = clientSubtitle(item, isSearching);
              return (
                <Pressable
                  onPress={() => navigation.navigate('ClientDetail', { clientId: item.id })}
                  style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
                >
                  <View style={[styles.row, { borderColor: theme.colors.outlineVariant, backgroundColor: theme.colors.surface }]}>
                    <MaterialCommunityIcons name="chevron-left" size={20} color={theme.colors.onSurfaceVariant} />
                    <View style={styles.info}>
                      <Text variant="bodyLarge" style={{ fontWeight: '600' }}>{item.fullName}</Text>
                      {subtitle ? (
                        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }} numberOfLines={1}>
                          {subtitle}
                        </Text>
                      ) : null}
                    </View>
                    <Avatar.Text size={40} label={item.fullName.charAt(0)} style={{ backgroundColor: theme.colors.primary }} />
                  </View>
                </Pressable>
              );
            }}
          />
        )}
      </ScreenContainer>
      <FAB onPress={() => navigation.navigate('ClientForm', {})} />
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontWeight: '700', marginBottom: 12, textAlign: 'right' },
  resultRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
    marginTop: -4,
  },
  row: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    marginBottom: 8,
  },
  info: { flex: 1, alignItems: 'flex-end', gap: 2 },
});
