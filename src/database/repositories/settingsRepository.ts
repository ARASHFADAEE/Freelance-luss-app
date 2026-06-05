import type { AppSettings } from '@/core/types';
import { BaseRepository } from './base';

const DEFAULT_SETTINGS_ID = 'default-settings';

export class SettingsRepository extends BaseRepository {
  async get(): Promise<AppSettings> {
    const db = await this.getDb();
    const row = await db.getFirstAsync<{
      id: string;
      darkMode: number;
      subscriptionPlan: string;
      subscriptionExpiresAt: string | null;
      notificationsEnabled: number;
      onboardingCompleted?: number;
    }>('SELECT * FROM app_settings LIMIT 1');

    if (row) {
      return {
        id: row.id,
        darkMode: row.darkMode === 1,
        subscriptionPlan: row.subscriptionPlan as AppSettings['subscriptionPlan'],
        subscriptionExpiresAt: row.subscriptionExpiresAt,
        notificationsEnabled: row.notificationsEnabled === 1,
        onboardingCompleted: (row.onboardingCompleted ?? 0) === 1,
      };
    }

    const defaults: AppSettings = {
      id: DEFAULT_SETTINGS_ID,
      darkMode: false,
      subscriptionPlan: 'free',
      subscriptionExpiresAt: null,
      notificationsEnabled: true,
      onboardingCompleted: false,
    };
    await db.runAsync(
      `INSERT INTO app_settings (id, darkMode, subscriptionPlan, subscriptionExpiresAt, notificationsEnabled, onboardingCompleted)
       VALUES (?, ?, ?, ?, ?, ?)`,
      defaults.id, 0, defaults.subscriptionPlan, null, 1, 0,
    );
    return defaults;
  }

  async update(data: Partial<Omit<AppSettings, 'id'>>): Promise<AppSettings> {
    const db = await this.getDb();
    const existing = await this.get();
    const updated = { ...existing, ...data };
    await db.runAsync(
      `UPDATE app_settings SET darkMode = ?, subscriptionPlan = ?,
        subscriptionExpiresAt = ?, notificationsEnabled = ?, onboardingCompleted = ? WHERE id = ?`,
      updated.darkMode ? 1 : 0,
      updated.subscriptionPlan,
      updated.subscriptionExpiresAt,
      updated.notificationsEnabled ? 1 : 0,
      updated.onboardingCompleted ? 1 : 0,
      updated.id,
    );
    return updated;
  }
}

export const settingsRepository = new SettingsRepository();
