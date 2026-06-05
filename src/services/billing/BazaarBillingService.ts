import { Platform } from 'react-native';
import { BAZAAR_RSA_PUBLIC_KEY } from '@/core/config/env';

export interface BazaarPurchaseResult {
  productId: string;
  purchaseToken: string;
  orderId?: string;
  purchaseTime?: number;
}

export type BazaarPurchaseErrorCode =
  | 'NOT_AVAILABLE'
  | 'USER_CANCELLED'
  | 'NETWORK'
  | 'INVALID_TOKEN'
  | 'NOT_CONNECTED'
  | 'UNKNOWN';

export class BazaarPurchaseError extends Error {
  constructor(
    message: string,
    public code: BazaarPurchaseErrorCode,
  ) {
    super(message);
    this.name = 'BazaarPurchaseError';
  }
}

type BillingModule = {
  connect: (options: { rsaPublicKey: string }) => Promise<void>;
  disconnect: () => Promise<void>;
  subscribeProduct: (productId: string) => Promise<{
    purchaseToken?: string;
    productId?: string;
    orderId?: string;
    purchaseTime?: number;
  }>;
  getPurchasedSubscriptions?: () => Promise<Array<{ productId: string; purchaseToken: string }>>;
};

let connected = false;
let billingModule: BillingModule | null = null;

async function loadBillingModule(): Promise<BillingModule | null> {
  if (Platform.OS !== 'android') return null;
  if (billingModule) return billingModule;

  try {
    const mod = await import('expo-cafebazaar-billing').catch(() => null);
    if (mod?.default) {
      billingModule = mod.default as BillingModule;
      return billingModule;
    }

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const poolakey = require('@cafebazaar/react-native-poolakey') as {
      connect: (rsa: string) => Promise<void>;
      disconnect: () => Promise<void>;
      subscribeProduct: (id: string) => Promise<{ purchaseToken: string; productId: string }>;
      getAllSubscribedProducts?: () => Promise<Array<{ productId: string; purchaseToken: string }>>;
    };
    billingModule = {
      connect: async ({ rsaPublicKey }) => { await poolakey.connect(rsaPublicKey); },
      disconnect: async () => { await poolakey.disconnect(); },
      subscribeProduct: async (productId) => poolakey.subscribeProduct(productId),
      getPurchasedSubscriptions: async () => poolakey.getAllSubscribedProducts?.() ?? [],
    };
    return billingModule;
  } catch {
    return null;
  }
}

export const bazaarBillingService = {
  isSupported(): boolean {
    return Platform.OS === 'android';
  },

  async connect(): Promise<void> {
    if (!this.isSupported()) {
      throw new BazaarPurchaseError('خرید درون‌برنامه‌ای فقط روی اندروید پشتیبانی می‌شود', 'NOT_AVAILABLE');
    }
    if (!BAZAAR_RSA_PUBLIC_KEY) {
      throw new BazaarPurchaseError('کلید RSA بازار تنظیم نشده است', 'NOT_AVAILABLE');
    }

    const mod = await loadBillingModule();
    if (!mod) {
      throw new BazaarPurchaseError(
        'ماژول پرداخت بازار نصب نیست. از EAS Build با expo-cafebazaar-billing استفاده کنید',
        'NOT_AVAILABLE',
      );
    }

    if (!connected) {
      await mod.connect({ rsaPublicKey: BAZAAR_RSA_PUBLIC_KEY });
      connected = true;
    }
  },

  async disconnect(): Promise<void> {
    if (!connected || !billingModule) return;
    try {
      await billingModule.disconnect();
    } finally {
      connected = false;
    }
  },

  async purchaseSubscription(productId: string): Promise<BazaarPurchaseResult> {
    await this.connect();
    if (!billingModule) throw new BazaarPurchaseError('اتصال به بازار برقرار نیست', 'NOT_CONNECTED');

    try {
      const result = await billingModule.subscribeProduct(productId);
      if (!result?.purchaseToken) {
        throw new BazaarPurchaseError('توکن خرید دریافت نشد', 'INVALID_TOKEN');
      }
      return {
        productId: result.productId ?? productId,
        purchaseToken: result.purchaseToken,
        orderId: result.orderId,
        purchaseTime: result.purchaseTime,
      };
    } catch (e) {
      if (e instanceof BazaarPurchaseError) throw e;
      const message = e instanceof Error ? e.message : 'خطای ناشناخته';
      if (/cancel/i.test(message)) {
        throw new BazaarPurchaseError('خرید توسط کاربر لغو شد', 'USER_CANCELLED');
      }
      if (/network|timeout/i.test(message)) {
        throw new BazaarPurchaseError('خطای شبکه. اتصال اینترنت را بررسی کنید', 'NETWORK');
      }
      throw new BazaarPurchaseError(message, 'UNKNOWN');
    }
  },

  async restorePurchases(): Promise<BazaarPurchaseResult[]> {
    await this.connect();
    if (!billingModule?.getPurchasedSubscriptions) return [];

    const items = await billingModule.getPurchasedSubscriptions();
    return items
      .filter((i) => i.purchaseToken)
      .map((i) => ({ productId: i.productId, purchaseToken: i.purchaseToken }));
  },
};
