import { useSubscriptionStore } from '@/stores/subscriptionStore';

/** مقدار boolean — reactive برخلاف انتخاب تابع hasProFeatures */
export function useHasProFeatures(): boolean {
  return useSubscriptionStore((s) => s.hasProFeatures());
}

export function useIsInTrial(): boolean {
  return useSubscriptionStore((s) => s.isInTrial());
}
