import * as Crypto from 'expo-crypto';
import { storageService, StorageKeys } from '@/services/storage/StorageService';

export async function getOrCreateDeviceId(): Promise<string> {
  const existing = await storageService.getItem(StorageKeys.DEVICE_ID);
  if (existing) return existing;

  const id = Crypto.randomUUID();
  await storageService.setItem(StorageKeys.DEVICE_ID, id);
  return id;
}
