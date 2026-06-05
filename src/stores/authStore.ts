import { create } from 'zustand';
import { IS_API_CONFIGURED } from '@/core/config/env';
import type { AuthUser } from '@/services/api/types';
import { authService } from '@/services/auth/AuthService';
import { syncAuthUserToProfile } from '@/services/auth/syncAuthProfile';
import { storageService } from '@/services/storage/StorageService';
import { subscriptionSyncService } from '@/services/subscription/SubscriptionSyncService';
import { trialService } from '@/services/subscription/trialService';
import { useSubscriptionStore } from '@/stores/subscriptionStore';

interface AuthState {
  isReady: boolean;
  isAuthenticated: boolean;
  user: AuthUser | null;
  phone: string | null;
  initialize: () => Promise<void>;
  sendOtp: (phone: string) => Promise<{ expiresIn: number; debugCode?: string }>;
  verifyOtp: (phone: string, code: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

async function applyAuthenticatedUser(user: AuthUser, withSubscriptionFromApi = true): Promise<void> {
  await trialService.startTrialIfNeeded(user.id);
  await syncAuthUserToProfile(user);
  if (withSubscriptionFromApi) {
    await useSubscriptionStore.getState().load();
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isReady: false,
  isAuthenticated: false,
  user: null,
  phone: null,

  initialize: async () => {
    try {
      if (!IS_API_CONFIGURED) {
        set({ isAuthenticated: false, user: null, phone: null, isReady: true });
        return;
      }

      const token = await storageService.getAccessToken();
      if (!token) {
        set({ isAuthenticated: false, user: null, phone: null, isReady: true });
        return;
      }

      try {
        const me = await authService.fetchMe();
        await subscriptionSyncService.applyFromMe(me.subscription);
        await applyAuthenticatedUser(me.user);
        set({
          isAuthenticated: true,
          user: me.user,
          phone: me.user.phone,
          isReady: true,
        });
        return;
      } catch {
        const cached = await authService.restoreUserFromStorage();
        if (cached) {
          await subscriptionSyncService.syncOnLaunch();
          await applyAuthenticatedUser(cached.user, false);
          set({
            isAuthenticated: true,
            user: cached.user,
            phone: cached.user.phone,
            isReady: true,
          });
          return;
        }

        await authService.logout();
        set({ isAuthenticated: false, user: null, phone: null, isReady: true });
      }
    } catch {
      set({ isAuthenticated: false, user: null, phone: null, isReady: true });
    }
  },

  sendOtp: async (phone) => {
    const res = await authService.sendOtp(phone);
    set({ phone });
    return { expiresIn: res.expiresIn, debugCode: res.debugCode };
  },

  verifyOtp: async (phone, code) => {
    const res = await authService.verifyOtp(phone, code);
    await subscriptionSyncService.applyFromMe(res.subscription);
    await applyAuthenticatedUser(res.user);
    set({ isAuthenticated: true, user: res.user, phone: res.user.phone });
  },

  logout: async () => {
    try {
      await authService.logout();
    } finally {
      await storageService.clearSubscriptionMeta();
      await useSubscriptionStore.getState().load();
      set({ isAuthenticated: false, user: null, phone: null, isReady: true });
    }
  },

  refreshSession: async () => {
    if (!get().isAuthenticated) return;
    try {
      const me = await authService.fetchMe();
      await subscriptionSyncService.applyFromMe(me.subscription);
      await applyAuthenticatedUser(me.user);
      set({ user: me.user, phone: me.user.phone });
    } catch {
      const cached = await authService.restoreUserFromStorage();
      if (cached) {
        await syncAuthUserToProfile(cached.user);
        set({ user: cached.user, phone: cached.user.phone });
      }
    }
  },
}));
