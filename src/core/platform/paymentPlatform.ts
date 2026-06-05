import { Platform } from 'react-native';

export type PaymentProvider = 'bazaar' | 'zibal' | 'unsupported';

export function getPaymentProvider(): PaymentProvider {
  if (Platform.OS === 'android') return 'bazaar';
  if (Platform.OS === 'web') return 'zibal';
  return 'unsupported';
}

export function isPaymentSupported(): boolean {
  return getPaymentProvider() !== 'unsupported';
}

export function getPaymentProviderLabel(): string {
  switch (getPaymentProvider()) {
    case 'bazaar':
      return 'کافه‌بازار';
    case 'zibal':
      return 'زیبال';
    default:
      return '';
  }
}
