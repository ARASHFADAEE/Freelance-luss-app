import { create } from 'zustand';
import type { Profile } from '@/core/types';
import { profileRepository } from '@/database';

interface ProfileState {
  profile: Profile | null;
  isLoaded: boolean;
  load: () => Promise<void>;
  update: (data: Partial<Omit<Profile, 'id'>>) => Promise<void>;
}

export const useProfileStore = create<ProfileState>((set) => ({
  profile: null,
  isLoaded: false,

  load: async () => {
    const profile = await profileRepository.get();
    set({ profile, isLoaded: true });
  },

  update: async (data) => {
    const profile = await profileRepository.update(data);
    set({ profile });
  },
}));
