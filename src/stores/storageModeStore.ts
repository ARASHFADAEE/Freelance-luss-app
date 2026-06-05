import { create } from 'zustand';
import type { DataStorageMode } from '@/core/types';
import { settingsRepository } from '@/database';

interface StorageModeState {
  mode: DataStorageMode;
  isConfirmed: boolean;
  isLoaded: boolean;
  load: () => Promise<void>;
  needsSetup: () => boolean;
  isCloud: () => boolean;
}

export const useStorageModeStore = create<StorageModeState>((set, get) => ({
  mode: 'local',
  isConfirmed: true,
  isLoaded: false,

  load: async () => {
    const settings = await settingsRepository.get();
    set({
      mode: settings.dataStorageMode,
      isConfirmed: settings.dataStorageModeConfirmed,
      isLoaded: true,
    });
  },

  needsSetup: () => get().isLoaded && !get().isConfirmed,

  isCloud: () => get().mode === 'cloud',
}));

export const STORAGE_MODE_LABELS: Record<DataStorageMode, { title: string; subtitle: string; icon: string }> = {
  local: {
    title: 'ذخیره روی دستگاه',
    subtitle: 'داده‌ها فقط در مرورگر یا موبایل شما (SQLite / IndexedDB). حریم خصوصی بیشتر.',
    icon: 'cellphone-link',
  },
  cloud: {
    title: 'فضای ابری فریلنس پلاس',
    subtitle: 'داده‌ها روی سرور امن. با ورود از هر دستگاه به حساب خود دسترسی دارید.',
    icon: 'cloud-sync-outline',
  },
};
