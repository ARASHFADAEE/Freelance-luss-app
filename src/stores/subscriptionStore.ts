import { create } from 'zustand';
import { FREE_PLAN_LIMITS } from '@/core/constants';
import type { SubscriptionPlan } from '@/core/types';
import {
  clientRepository,
  invoiceRepository,
  projectRepository,
  settingsRepository,
} from '@/database';
import { storageService, StorageKeys } from '@/services/storage/StorageService';
import { trialService } from '@/services/subscription/trialService';

interface SubscriptionState {
  plan: SubscriptionPlan;
  expiresAt: string | null;
  subscriptionType: string | null;
  userAccess: 'free' | 'premium';
  lastValidationAt: string | null;
  trialStartedAt: string | null;
  isLoaded: boolean;
  load: () => Promise<void>;
  isPremium: () => boolean;
  isInTrial: () => boolean;
  hasProFeatures: () => boolean;
  getTrialDaysRemaining: () => number;
  canAddClient: () => Promise<boolean>;
  canAddProject: () => Promise<boolean>;
  canAddInvoice: () => Promise<boolean>;
  canUsePdf: () => boolean;
  canUseReports: () => boolean;
  canUseBackup: () => boolean;
  canUseCharts: () => boolean;
  canUseMultiCurrency: () => boolean;
}

function computeIsPremium(plan: SubscriptionPlan, expiresAt: string | null): boolean {
  if (plan !== 'pro') return false;
  if (!expiresAt) return true;
  return new Date(expiresAt) > new Date();
}

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  plan: 'free',
  expiresAt: null,
  subscriptionType: null,
  userAccess: 'free',
  lastValidationAt: null,
  trialStartedAt: null,
  isLoaded: false,

  load: async () => {
    const [settings, meta, userId] = await Promise.all([
      settingsRepository.get(),
      storageService.getSubscriptionMeta(),
      storageService.getItem(StorageKeys.USER_ID),
    ]);

    const trialStartedAt = await trialService.getTrialStartedAtForUser(userId);
    const plan = settings.subscriptionPlan;
    const expiresAt = settings.subscriptionExpiresAt;
    const premium = computeIsPremium(plan, expiresAt);

    set({
      plan: premium ? 'pro' : 'free',
      expiresAt,
      subscriptionType: meta.subscriptionType,
      userAccess: premium ? 'premium' : 'free',
      lastValidationAt: meta.lastValidationAt,
      trialStartedAt,
      isLoaded: true,
    });
  },

  isPremium: () => computeIsPremium(get().plan, get().expiresAt),

  isInTrial: () => trialService.isInTrial(get().trialStartedAt),

  hasProFeatures: () => get().isPremium() || trialService.isInTrial(get().trialStartedAt),

  getTrialDaysRemaining: () => trialService.getTrialDaysRemaining(get().trialStartedAt),

  canAddClient: async () => {
    if (get().isPremium()) return true;
    const count = await clientRepository.count();
    return count < FREE_PLAN_LIMITS.clients;
  },

  canAddProject: async () => {
    if (get().isPremium()) return true;
    const count = await projectRepository.count();
    return count < FREE_PLAN_LIMITS.projects;
  },

  canAddInvoice: async () => {
    if (get().isPremium()) return true;
    const count = await invoiceRepository.count();
    return count < FREE_PLAN_LIMITS.invoices;
  },

  canUsePdf: () => get().hasProFeatures(),
  canUseReports: () => get().hasProFeatures(),
  canUseBackup: () => get().hasProFeatures(),
  canUseCharts: () => get().hasProFeatures(),
  canUseMultiCurrency: () => get().hasProFeatures(),
}));
