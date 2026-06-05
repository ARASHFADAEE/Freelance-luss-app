import { getPaymentProvider } from '@/core/platform/paymentPlatform';
import { bazaarBillingService } from '@/services/billing/BazaarBillingService';
import { zibalPaymentService } from '@/services/billing/ZibalPaymentService';
import { subscriptionSyncService } from '@/services/subscription/SubscriptionSyncService';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import type { CheckoutStatusResponse } from '@/services/api/types';

export const subscriptionService = {
  getPaymentProvider,

  async purchasePlan(productId: string) {
    const provider = getPaymentProvider();

    if (provider === 'bazaar') {
      const purchase = await bazaarBillingService.purchaseSubscription(productId);
      await subscriptionSyncService.verifyPurchase(purchase.purchaseToken, purchase.productId);
      await useSubscriptionStore.getState().load();
      return purchase;
    }

    if (provider === 'zibal') {
      return zibalPaymentService.startCheckout(productId);
    }

    throw new Error('پرداخت در این پلتفرم پشتیبانی نمی‌شود');
  },

  async confirmWebPayment(orderId: string): Promise<CheckoutStatusResponse> {
    const status = await zibalPaymentService.confirmReturn(orderId);
    if (status.subscription) {
      await subscriptionSyncService.applyServerSubscription({
        active: status.subscription.active,
        expires_at: status.subscription.expires_at,
        subscription_type: status.subscription.subscription_type,
        user_access: status.subscription.user_access,
      });
    } else {
      await subscriptionSyncService.syncOnLaunch();
    }
    await useSubscriptionStore.getState().load();
    zibalPaymentService.clearReturnParams();
    return status;
  },

  async handleWebPaymentReturn(): Promise<'success' | 'failed' | 'none'> {
    if (getPaymentProvider() !== 'zibal') return 'none';

    const { getWebQueryParams } = await import('@/core/platform/webQuery');
    const params = getWebQueryParams();
    const orderId = params.order_id ?? params.orderId;
    const result = params.subscription ?? params.payment;

    if (!orderId) return 'none';

    if (result === 'failed' || result === 'cancelled') {
      zibalPaymentService.clearReturnParams();
      return 'failed';
    }

    if (result === 'success' || result === 'paid') {
      await this.confirmWebPayment(orderId);
      return 'success';
    }

    try {
      await this.confirmWebPayment(orderId);
      return 'success';
    } catch {
      zibalPaymentService.clearReturnParams();
      return 'failed';
    }
  },

  async restorePurchases() {
    if (getPaymentProvider() === 'bazaar') {
      const purchases = await bazaarBillingService.restorePurchases();
      if (purchases.length === 0) return [];

      for (const p of purchases) {
        try {
          await subscriptionSyncService.verifyPurchase(p.purchaseToken, p.productId);
        } catch {
          /* skip invalid tokens */
        }
      }

      await useSubscriptionStore.getState().load();
      return purchases;
    }

    await subscriptionSyncService.syncOnLaunch();
    await useSubscriptionStore.getState().load();
    return [];
  },

  async syncOnLaunch() {
    await subscriptionSyncService.syncOnLaunch();
    await useSubscriptionStore.getState().load();
  },

  async disconnectBilling() {
    if (getPaymentProvider() === 'bazaar') {
      await bazaarBillingService.disconnect();
    }
  },
};
