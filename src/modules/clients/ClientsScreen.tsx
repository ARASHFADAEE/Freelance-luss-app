import React, { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';
import { Avatar, useTheme } from 'react-native-paper';
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
import { EmptyState } from '@/shared/components/EmptyState';
import { ListCard } from '@/shared/components/ListCard';
import { SkeletonList } from '@/shared/components/Skeleton';
import { AppText } from '@/shared/components/AppText';
import { PageHeader } from '@/shared/components/PageHeader';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { spacing } from '@/core/theme/tokens';

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

  const { data: clients = [], refetch, isFetching, isLoading } = useQuery({
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

  const header = (
    <PageHeader title="مشتریان" topInset={insets.top + spacing.xs}>
      <SearchBar
        value={search}
        onChangeText={setSearch}
        placeholder="نام، شرکت، موبایل یا ایمیل..."
        loading={isPendingSearch}
      />
      {resultLabel ? (
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
          <AppText variant="caption" color={clients.length > 0 ? 'primary' : 'muted'}>
            {resultLabel}
          </AppText>
        </View>
      ) : null}
    </PageHeader>
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScreenContainer
        scrollable={false}
        padded={false}
        style={{ paddingHorizontal: spacing.lg }}
        header={header}
      >
        {isLoading && !isSearching ? (
          <SkeletonList count={6} />
        ) : clients.length === 0 ? (
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
            initialNumToRender={10}
            maxToRenderPerBatch={8}
            windowSize={7}
            removeClippedSubviews
            contentContainerStyle={{ paddingBottom: 100 }}
            onRefresh={refetch}
            refreshing={isFetching && !isLoading}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => {
              const subtitle = clientSubtitle(item, isSearching);
              return (
                <ListCard
                  title={item.fullName}
                  subtitle={subtitle}
                  onPress={() => navigation.navigate('ClientDetail', { clientId: item.id })}
                  right={
                    <Avatar.Text
                      size={40}
                      label={item.fullName.charAt(0)}
                      style={{ backgroundColor: theme.colors.primary }}
                    />
                  }
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
  resultRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.xs + 2,
    marginBottom: spacing.sm + 2,
    marginTop: spacing.sm,
  },
});
