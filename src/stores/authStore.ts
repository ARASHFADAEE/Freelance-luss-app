import { create } from 'zustand';
import { IS_API_CONFIGURED } from '@/core/config/env';
import type { AuthUser, SubscriptionPayload } from '@/services/api/types';
import { authService } from '@/services/auth/AuthService';
import { storageService, StorageKeys } from '@/services/storage/StorageService';
import { subscriptionSyncService } from '@/services/subscription/SubscriptionSyncService';
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

export const useAuthStore = create<AuthState>((set, get) => ({
  isReady: false,
  isAuthenticated: false,
  user: null,
  phone: null,

  initialize: async () => {
    try {
      const token = await storageService.getAccessToken();
      const phone = await storageService.getItem(StorageKeys.USER_PHONE);
      const userId = await storageService.getItem(StorageKeys.USER_ID);

      if (token && IS_API_CONFIGURED) {
        try {
          const me = await authService.fetchMe();
          await subscriptionSyncService.applyFromMe(me.subscription);
          await useSubscriptionStore.getState().load();
          set({
            isAuthenticated: true,
            user: me.user,
            phone: me.user.phone,
            isReady: true,
          });
          return;
        } catch {
          await authService.logout();
        }
      } else if (token && phone && userId) {
        set({
          isAuthenticated: true,
          user: { id: userId, phone, fullName: null },
          phone,
          isReady: true,
        });
        await subscriptionSyncService.syncOnLaunch();
        await useSubscriptionStore.getState().load();
        return;
      }

      set({ isAuthenticated: false, user: null, phone: null, isReady: true });
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
    await useSubscriptionStore.getState().load();
    set({ isAuthenticated: true, user: res.user, phone: res.user.phone });
  },

  logout: async () => {
    await authService.logout();
    await storageService.clearSubscriptionMeta();
    await useSubscriptionStore.getState().load();
    set({ isAuthenticated: false, user: null, phone: null });
  },

  refreshSession: async () => {
    if (!get().isAuthenticated) return;
    const me = await authService.fetchMe();
    await subscriptionSyncService.applyFromMe(me.subscription);
    await useSubscriptionStore.getState().load();
    set({ user: me.user, phone: me.user.phone });
  },
}));
