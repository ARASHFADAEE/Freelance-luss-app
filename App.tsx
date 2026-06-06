import React from 'react';
import { I18nManager, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { AppProviders } from '@/shared/providers/AppProviders';
import { ResponsiveShell } from '@/shared/components/ResponsiveShell';
import { AppGate } from '@/shared/components/AppGate';
import { useAuthStore } from '@/stores/authStore';

if (Platform.OS !== 'web' && !I18nManager.isRTL) {
  I18nManager.allowRTL(true);
  I18nManager.forceRTL(true);
}

function AppNavigation() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isReady = useAuthStore((s) => s.isReady);

  return (
    <NavigationContainer
      key={isReady ? (isAuthenticated ? 'nav-authenticated' : 'nav-guest') : 'nav-loading'}
      direction={I18nManager.isRTL ? 'rtl' : 'ltr'}
    >
      <ResponsiveShell>
        <AppGate />
      </ResponsiveShell>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AppProviders>
      <AppNavigation />
    </AppProviders>
  );
}
