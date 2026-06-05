import React, { createContext, useContext, useEffect, useState } from 'react';
import { I18nManager, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { getDatabase, seedSampleData } from '@/database';
import { useThemeStore } from '@/stores/themeStore';
import { useProfileStore } from '@/stores/profileStore';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { OnboardingOverlay } from '@/shared/components/OnboardingOverlay';
import { AppSplash } from '@/shared/components/AppSplash';

interface DatabaseContextValue {
  isReady: boolean;
}

const DatabaseContext = createContext<DatabaseContextValue>({ isReady: false });

export function useDatabase() {
  return useContext(DatabaseContext);
}

export function DatabaseProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const showOnboarding = useOnboardingStore((s) => s.showOnboarding);
  const completeOnboarding = useOnboardingStore((s) => s.complete);

  useEffect(() => {
    if (!I18nManager.isRTL) {
      I18nManager.allowRTL(true);
      I18nManager.forceRTL(true);
    }

    let cancelled = false;

    async function init() {
      try {
        await getDatabase();
        await seedSampleData();
        await useThemeStore.getState().load();
        await useProfileStore.getState().load();
        await useSubscriptionStore.getState().load();
        await useOnboardingStore.getState().load();
        if (!cancelled) setIsReady(true);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'خطا در بارگذاری دیتابیس');
        }
      }
    }

    init();
    return () => { cancelled = true; };
  }, []);

  if (error) {
    return (
      <View style={styles.center}>
        <Text variant="titleMedium">{error}</Text>
      </View>
    );
  }

  if (!isReady) {
    return <AppSplash />;
  }

  return (
    <DatabaseContext.Provider value={{ isReady }}>
      {children}
      <OnboardingOverlay visible={showOnboarding} onComplete={completeOnboarding} />
    </DatabaseContext.Provider>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
