import React from 'react';
import { I18nManager } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { AppProviders } from '@/shared/providers/AppProviders';
import { ResponsiveShell } from '@/shared/components/ResponsiveShell';
import { AppGate } from '@/shared/components/AppGate';

if (!I18nManager.isRTL) {
  I18nManager.allowRTL(true);
  I18nManager.forceRTL(true);
}

export default function App() {
  return (
    <AppProviders>
      <NavigationContainer direction={I18nManager.isRTL ? 'rtl' : 'ltr'}>
        <ResponsiveShell>
          <AppGate />
        </ResponsiveShell>
      </NavigationContainer>
    </AppProviders>
  );
}
