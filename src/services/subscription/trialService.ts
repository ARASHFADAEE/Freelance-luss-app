import { TRIAL_DAYS } from '@/core/constants';
import { storageService, StorageKeys } from '@/services/storage/StorageService';

export const trialService = {
  async startTrialIfNeeded(userId: string): Promise<void> {
    const existingUserId = await storageService.getItem(StorageKeys.TRIAL_USER_ID);
    const existingStart = await storageService.getItem(StorageKeys.TRIAL_STARTED_AT);

    if (existingUserId === userId && existingStart) return;

    const now = new Date().toISOString();
    await storageService.setItem(StorageKeys.TRIAL_USER_ID, userId);
    await storageService.setItem(StorageKeys.TRIAL_STARTED_AT, now);
  },

  async getTrialStartedAtForUser(userId: string | null): Promise<string | null> {
    if (!userId) return null;
    const trialUserId = await storageService.getItem(StorageKeys.TRIAL_USER_ID);
    if (trialUserId !== userId) return null;
    return storageService.getItem(StorageKeys.TRIAL_STARTED_AT);
  },

  isInTrial(trialStartedAt: string | null): boolean {
    if (!trialStartedAt) return false;
    const endsAt = this.getTrialEndsAt(trialStartedAt);
    return endsAt !== null && new Date() < endsAt;
  },

  getTrialEndsAt(trialStartedAt: string | null): Date | null {
    if (!trialStartedAt) return null;
    const ends = new Date(trialStartedAt);
    ends.setDate(ends.getDate() + TRIAL_DAYS);
    return ends;
  },

  getTrialDaysRemaining(trialStartedAt: string | null): number {
    const endsAt = this.getTrialEndsAt(trialStartedAt);
    if (!endsAt) return 0;
    const diffMs = endsAt.getTime() - Date.now();
    if (diffMs <= 0) return 0;
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  },
};
