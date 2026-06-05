import React, { useEffect } from 'react';
import { IS_API_CONFIGURED } from '@/core/config/env';
import { useAuthStore } from '@/stores/authStore';
import { subscriptionService } from '@/services/subscription/SubscriptionService';
import { AuthNavigator } from '@/modules/auth/AuthNavigator';
import { RootNavigator } from '@/navigation/RootNavigator';
import { AppSplash } from '@/shared/components/AppSplash';

export function AppGate() {
  const isReady = useAuthStore((s) => s.isReady);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const initialize = useAuthStore((s) => s.initialize);

  useEffect(() => {
    initialize().then(() => {
      subscriptionService.syncOnLaunch().catch(() => undefined);
    });

    return () => {
      subscriptionService.disconnectBilling().catch(() => undefined);
    };
  }, [initialize]);

  if (!isReady) {
    return <AppSplash message="بررسی حساب کاربری..." />;
  }

  if (IS_API_CONFIGURED && !isAuthenticated) {
    return <AuthNavigator />;
  }

  return <RootNavigator />;
}
