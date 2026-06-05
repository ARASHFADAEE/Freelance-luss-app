import { create } from 'zustand';
import { settingsRepository } from '@/database';

interface OnboardingState {
  showOnboarding: boolean;
  isLoaded: boolean;
  load: () => Promise<void>;
  complete: () => void;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  showOnboarding: false,
  isLoaded: false,

  load: async () => {
    const settings = await settingsRepository.get();
    set({
      showOnboarding: !settings.onboardingCompleted,
      isLoaded: true,
    });
  },

  complete: () => set({ showOnboarding: false }),
}));
