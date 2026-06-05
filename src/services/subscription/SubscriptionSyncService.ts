import { apiRequest } from '@/services/api/ApiClient';
import type { MeResponse, VerifyPurchaseResponse } from '@/services/api/types';
import { authService } from '@/services/auth/AuthService';
import { storageService } from '@/services/storage/StorageService';
import { settingsRepository } from '@/database';
import type { SubscriptionPlan } from '@/core/types';

function isPremiumActive(userAccess: string | null, expiresAt: string | null): boolean {
  if (userAccess === 'premium') {
    if (!expiresAt) return true;
    return new Date(expiresAt) > new Date();
  }
  return false;
}

function planFromMe(sub: MeResponse['subscription']): SubscriptionPlan {
  if (sub.isActive === false) return 'free';
  if (sub.userAccess === 'premium') return 'pro';
  if (sub.plan === 'pro') {
    if (!sub.expiresAt) return 'pro';
    return new Date(sub.expiresAt) > new Date() ? 'pro' : 'free';
  }
  return 'free';
}

export const subscriptionSyncService = {
  async applyFromMe(data: MeResponse['subscription']): Promise<void> {
    const plan = planFromMe(data);
    const now = new Date().toISOString();

    await storageService.setSubscriptionMeta({
      subscriptionType: data.subscriptionType ?? null,
      expiresAt: data.expiresAt,
      userAccess: data.userAccess ?? (plan === 'pro' ? 'premium' : 'free'),
      lastValidationAt: now,
    });

    await settingsRepository.update({
      subscriptionPlan: plan,
      subscriptionExpiresAt: data.expiresAt,
    });
  },

  async applyServerSubscription(data: VerifyPurchaseResponse): Promise<void> {
    const now = new Date().toISOString();
    const plan: SubscriptionPlan = data.active && data.user_access === 'premium' ? 'pro' : 'free';

    await storageService.setSubscriptionMeta({
      subscriptionType: data.subscription_type,
      expiresAt: data.expires_at,
      userAccess: data.user_access,
      lastValidationAt: now,
    });

    await settingsRepository.update({
      subscriptionPlan: plan,
      subscriptionExpiresAt: data.expires_at,
    });
  },

  async verifyPurchase(purchaseToken: string, productId: string): Promise<VerifyPurchaseResponse> {
    const response = await apiRequest<VerifyPurchaseResponse>('POST', '/api/subscriptions/verify', {
      purchase_token: purchaseToken,
      product_id: productId,
      platform: 'cafebazaar',
    });

    await storageService.setSubscriptionMeta({
      purchaseToken,
      subscriptionType: response.subscription_type,
      expiresAt: response.expires_at,
      userAccess: response.user_access,
      lastValidationAt: new Date().toISOString(),
    });

    await this.applyServerSubscription(response);
    return response;
  },

  async syncOnLaunch(): Promise<void> {
    const meta = await storageService.getSubscriptionMeta();
    const hasSession = await authService.hasSession();

    if (hasSession) {
      try {
        const me = await authService.fetchMe();
        await this.applyFromMe(me.subscription);
        return;
      } catch {
        /* offline — use cache */
      }
    }

    const plan: SubscriptionPlan = isPremiumActive(meta.userAccess, meta.expiresAt) ? 'pro' : 'free';
    await settingsRepository.update({
      subscriptionPlan: plan,
      subscriptionExpiresAt: meta.expiresAt,
    });
  },
};
