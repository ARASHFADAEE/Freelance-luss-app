import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useStorageModeStore } from '@/stores/storageModeStore';
import { subscriptionService } from '@/services/subscription/SubscriptionService';
import { storageModeService } from '@/services/cloud/storageModeService';
import { AuthNavigator } from '@/modules/auth/AuthNavigator';
import { RootNavigator } from '@/navigation/RootNavigator';
import { StorageModeSetupScreen } from '@/modules/settings/StorageModeSetupScreen';
import { AppSplash } from '@/shared/components/AppSplash';

export function AppGate() {
  const isReady = useAuthStore((s) => s.isReady);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const initialize = useAuthStore((s) => s.initialize);
  const storageLoaded = useStorageModeStore((s) => s.isLoaded);
  const needsStorageSetup = useStorageModeStore((s) => s.needsSetup());
  const loadStorageMode = useStorageModeStore((s) => s.load);
  const [setupDone, setSetupDone] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) setSetupDone(false);
  }, [isAuthenticated]);

  useEffect(() => {
    initialize().then(async () => {
      await loadStorageMode();
      if (useAuthStore.getState().isAuthenticated) {
        subscriptionService.syncOnLaunch().catch(() => undefined);
        storageModeService.syncFromServerIfCloud().catch(() => undefined);
      }
    });

    return () => {
      subscriptionService.disconnectBilling().catch(() => undefined);
    };
  }, [initialize, loadStorageMode]);

  if (!isReady || (isAuthenticated && !storageLoaded)) {
    return <AppSplash message="بررسی حساب کاربری..." />;
  }

  if (!isAuthenticated) {
    return <AuthNavigator key="auth-stack" />;
  }

  if (needsStorageSetup && !setupDone) {
    return (
      <StorageModeSetupScreen
        key="storage-setup"
        onComplete={() => setSetupDone(true)}
      />
    );
  }

  return <RootNavigator key="root-stack" />;
}
