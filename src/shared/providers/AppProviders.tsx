import React from 'react';
import { StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PaperProvider } from 'react-native-paper';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { darkTheme, lightTheme } from '@/core/theme';
import { useThemeStore } from '@/stores/themeStore';
import { DatabaseProvider } from './DatabaseProvider';
import { AppSplash } from '@/shared/components/AppSplash';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1 },
  },
});

export function AppProviders({ children }: { children: React.ReactNode }) {
  const isDark = useThemeStore((s) => s.isDark);
  const theme = isDark ? darkTheme : lightTheme;
  const [fontsLoaded] = useFonts({
    IRANYekanX: require('../../../assets/fonts/IRANYekanXVFaNumVF.ttf'),
  });

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <PaperProvider theme={theme}>
          <StatusBar style={isDark ? 'light' : 'dark'} />
          {!fontsLoaded ? (
            <View style={styles.root}>
              <AppSplash message="بارگذاری فونت‌ها..." />
            </View>
          ) : (
            <QueryClientProvider client={queryClient}>
              <DatabaseProvider>{children}</DatabaseProvider>
            </QueryClientProvider>
          )}
        </PaperProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
