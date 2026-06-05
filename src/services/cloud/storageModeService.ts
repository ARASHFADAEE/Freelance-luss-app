import type { DataStorageMode } from '@/core/types';
import { IS_API_CONFIGURED } from '@/core/config/env';
import { settingsRepository } from '@/database';
import { apiRequest } from '@/services/api/ApiClient';
import { useStorageModeStore } from '@/stores/storageModeStore';

export interface CloudPreferencesPayload {
  data_storage_mode: DataStorageMode;
}

export const cloudPreferencesApi = {
  async updatePreferences(mode: DataStorageMode): Promise<void> {
    if (!IS_API_CONFIGURED) return;
    try {
      await apiRequest<void>('PUT', '/api/user/preferences', {
        data_storage_mode: mode,
      });
    } catch {
      /* backend may not be ready yet */
    }
  },

  async fetchPreferences(): Promise<DataStorageMode | null> {
    if (!IS_API_CONFIGURED) return null;
    try {
      const res = await apiRequest<{ data_storage_mode?: DataStorageMode; dataStorageMode?: DataStorageMode }>(
        'GET',
        '/api/user/preferences',
      );
      return res.data_storage_mode ?? res.dataStorageMode ?? null;
    } catch {
      return null;
    }
  },
};

export const storageModeService = {
  async applyMode(mode: DataStorageMode, options?: { markConfirmed?: boolean }): Promise<void> {
    const markConfirmed = options?.markConfirmed !== false;
    await settingsRepository.update({
      dataStorageMode: mode,
      ...(markConfirmed ? { dataStorageModeConfirmed: true } : {}),
    });
    await useStorageModeStore.getState().load();

    if (mode === 'cloud') {
      await cloudPreferencesApi.updatePreferences(mode);
    }
  },

  async prepareNewUserSetup(): Promise<void> {
    await settingsRepository.update({
      dataStorageModeConfirmed: false,
    });
    await useStorageModeStore.getState().load();
  },

  async syncFromServerIfCloud(): Promise<void> {
    const { mode, isConfirmed } = useStorageModeStore.getState();
    if (!isConfirmed || mode !== 'cloud') return;

    const serverMode = await cloudPreferencesApi.fetchPreferences();
    if (serverMode && serverMode !== mode) {
      await settingsRepository.update({ dataStorageMode: serverMode });
      await useStorageModeStore.getState().load();
    }
  },
};
