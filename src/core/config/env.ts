import { Platform } from 'react-native';

export const API_BASE_URL = (process.env.EXPO_PUBLIC_API_URL ?? '').replace(/\/$/, '');

export const BAZAAR_RSA_PUBLIC_KEY = process.env.EXPO_PUBLIC_BAZAAR_RSA_KEY ?? '';

export const WEB_APP_URL = (process.env.EXPO_PUBLIC_WEB_APP_URL ?? '').replace(/\/$/, '');

export const IS_API_CONFIGURED = API_BASE_URL.length > 0;

export function getAppPlatform(): 'android' | 'ios' | 'web' {
  if (Platform.OS === 'web') return 'web';
  if (Platform.OS === 'android') return 'android';
  return 'ios';
}

export function getAppHeaders(): Record<string, string> {
  return {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'Accept-Language': 'fa',
    'X-App-Version': '1.0.0',
    'X-Platform': getAppPlatform(),
  };
}

/** @deprecated use getAppHeaders() */
export const APP_HEADERS = getAppHeaders();
