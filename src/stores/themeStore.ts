import { create } from 'zustand';
import { settingsRepository } from '@/database';

interface ThemeState {
  isDark: boolean;
  isLoaded: boolean;
  load: () => Promise<void>;
  toggle: () => Promise<void>;
  setDark: (value: boolean) => Promise<void>;
}

export const useThemeStore = create<ThemeState>((set) => ({
  isDark: false,
  isLoaded: false,

  load: async () => {
    const settings = await settingsRepository.get();
    set({ isDark: settings.darkMode, isLoaded: true });
  },

  toggle: async () => {
    const settings = await settingsRepository.get();
    const newValue = !settings.darkMode;
    await settingsRepository.update({ darkMode: newValue });
    set({ isDark: newValue });
  },

  setDark: async (value: boolean) => {
    await settingsRepository.update({ darkMode: value });
    set({ isDark: value });
  },
}));
