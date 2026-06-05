import { create } from 'zustand';
import { FREE_PLAN_LIMITS } from '@/core/constants';
import type { SubscriptionPlan } from '@/core/types';
import {
  clientRepository,
  invoiceRepository,
  projectRepository,
  settingsRepository,
} from '@/database';

interface SubscriptionState {
  plan: SubscriptionPlan;
  expiresAt: string | null;
  isLoaded: boolean;
  load: () => Promise<void>;
  upgradeToPro: () => Promise<void>;
  canAddClient: () => Promise<boolean>;
  canAddProject: () => Promise<boolean>;
  canAddInvoice: () => Promise<boolean>;
  canUsePdf: () => boolean;
  canUseReports: () => boolean;
  canUseBackup: () => boolean;
  canUseCharts: () => boolean;
  canUseMultiCurrency: () => boolean;
}

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  plan: 'free',
  expiresAt: null,
  isLoaded: false,

  load: async () => {
    const settings = await settingsRepository.get();
    set({
      plan: settings.subscriptionPlan,
      expiresAt: settings.subscriptionExpiresAt,
      isLoaded: true,
    });
  },

  upgradeToPro: async () => {
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    await settingsRepository.update({
      subscriptionPlan: 'pro',
      subscriptionExpiresAt: expiresAt.toISOString(),
    });
    set({ plan: 'pro', expiresAt: expiresAt.toISOString() });
  },

  canAddClient: async () => {
    if (get().plan === 'pro') return true;
    const count = await clientRepository.count();
    return count < FREE_PLAN_LIMITS.clients;
  },

  canAddProject: async () => {
    if (get().plan === 'pro') return true;
    const count = await projectRepository.count();
    return count < FREE_PLAN_LIMITS.projects;
  },

  canAddInvoice: async () => {
    if (get().plan === 'pro') return true;
    const count = await invoiceRepository.count();
    return count < FREE_PLAN_LIMITS.invoices;
  },

  canUsePdf: () => get().plan === 'pro',
  canUseReports: () => get().plan === 'pro',
  canUseBackup: () => get().plan === 'pro',
  canUseCharts: () => get().plan === 'pro',
  canUseMultiCurrency: () => get().plan === 'pro',
}));
