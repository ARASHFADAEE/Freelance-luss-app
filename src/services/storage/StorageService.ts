import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

export const StorageKeys = {
  ACCESS_TOKEN: 'fp_access_token',
  REFRESH_TOKEN: 'fp_refresh_token',
  DEVICE_ID: 'fp_device_id',
  PURCHASE_TOKEN: 'fp_purchase_token',
  SUBSCRIPTION_TYPE: 'fp_subscription_type',
  SUBSCRIPTION_EXPIRES_AT: 'fp_subscription_expires_at',
  USER_ACCESS: 'fp_user_access',
  LAST_VALIDATION_AT: 'fp_last_validation_at',
  USER_PHONE: 'fp_user_phone',
  USER_ID: 'fp_user_id',
} as const;

type StorageKey = (typeof StorageKeys)[keyof typeof StorageKeys];

const memoryFallback = new Map<string, string>();

async function setItem(key: StorageKey, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    memoryFallback.set(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value, {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
}

async function getItem(key: StorageKey): Promise<string | null> {
  if (Platform.OS === 'web') {
    return memoryFallback.get(key) ?? null;
  }
  return SecureStore.getItemAsync(key);
}

async function deleteItem(key: StorageKey): Promise<void> {
  if (Platform.OS === 'web') {
    memoryFallback.delete(key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
}

export const storageService = {
  setItem,
  getItem,
  deleteItem,

  async setTokens(accessToken: string, refreshToken: string): Promise<void> {
    await setItem(StorageKeys.ACCESS_TOKEN, accessToken);
    await setItem(StorageKeys.REFRESH_TOKEN, refreshToken);
  },

  async getAccessToken(): Promise<string | null> {
    return getItem(StorageKeys.ACCESS_TOKEN);
  },

  async getRefreshToken(): Promise<string | null> {
    return getItem(StorageKeys.REFRESH_TOKEN);
  },

  async clearAuth(): Promise<void> {
    await Promise.all([
      deleteItem(StorageKeys.ACCESS_TOKEN),
      deleteItem(StorageKeys.REFRESH_TOKEN),
      deleteItem(StorageKeys.USER_PHONE),
      deleteItem(StorageKeys.USER_ID),
    ]);
  },

  async setSubscriptionMeta(data: {
    purchaseToken?: string | null;
    subscriptionType?: string | null;
    expiresAt?: string | null;
    userAccess?: string | null;
    lastValidationAt?: string | null;
  }): Promise<void> {
    const entries: [StorageKey, string | null | undefined][] = [
      [StorageKeys.PURCHASE_TOKEN, data.purchaseToken],
      [StorageKeys.SUBSCRIPTION_TYPE, data.subscriptionType],
      [StorageKeys.SUBSCRIPTION_EXPIRES_AT, data.expiresAt],
      [StorageKeys.USER_ACCESS, data.userAccess],
      [StorageKeys.LAST_VALIDATION_AT, data.lastValidationAt],
    ];
    for (const [key, value] of entries) {
      if (value === undefined) continue;
      if (value === null) await deleteItem(key);
      else await setItem(key, value);
    }
  },

  async getSubscriptionMeta(): Promise<{
    purchaseToken: string | null;
    subscriptionType: string | null;
    expiresAt: string | null;
    userAccess: string | null;
    lastValidationAt: string | null;
  }> {
    const [purchaseToken, subscriptionType, expiresAt, userAccess, lastValidationAt] = await Promise.all([
      getItem(StorageKeys.PURCHASE_TOKEN),
      getItem(StorageKeys.SUBSCRIPTION_TYPE),
      getItem(StorageKeys.SUBSCRIPTION_EXPIRES_AT),
      getItem(StorageKeys.USER_ACCESS),
      getItem(StorageKeys.LAST_VALIDATION_AT),
    ]);
    return { purchaseToken, subscriptionType, expiresAt, userAccess, lastValidationAt };
  },

  async clearSubscriptionMeta(): Promise<void> {
    await Promise.all([
      deleteItem(StorageKeys.PURCHASE_TOKEN),
      deleteItem(StorageKeys.SUBSCRIPTION_TYPE),
      deleteItem(StorageKeys.SUBSCRIPTION_EXPIRES_AT),
      deleteItem(StorageKeys.USER_ACCESS),
      deleteItem(StorageKeys.LAST_VALIDATION_AT),
    ]);
  },
};
