import { useSubscriptionStore } from '@/stores/subscriptionStore';
import { subscriptionService } from '@/services/subscription/SubscriptionService';
import {
  getPaymentProvider,
  getPaymentProviderLabel,
  isPaymentSupported,
} from '@/core/platform/paymentPlatform';

export function useSubscription() {
  const plan = useSubscriptionStore((s) => s.plan);
  const expiresAt = useSubscriptionStore((s) => s.expiresAt);
  const subscriptionType = useSubscriptionStore((s) => s.subscriptionType);
  const isLoaded = useSubscriptionStore((s) => s.isLoaded);
  const isPremium = useSubscriptionStore((s) => s.isPremium);
  const load = useSubscriptionStore((s) => s.load);

  const paymentProvider = getPaymentProvider();

  return {
    plan,
    expiresAt,
    subscriptionType,
    isLoaded,
    isPremium: isPremium(),
    isPremiumFn: isPremium,
    load,
    paymentProvider,
    paymentProviderLabel: getPaymentProviderLabel(),
    purchasePlan: subscriptionService.purchasePlan,
    restorePurchases: subscriptionService.restorePurchases,
    confirmWebPayment: subscriptionService.confirmWebPayment,
    handleWebPaymentReturn: subscriptionService.handleWebPaymentReturn,
    isBillingSupported: isPaymentSupported(),
    isBazaar: paymentProvider === 'bazaar',
    isZibal: paymentProvider === 'zibal',
  };
}
