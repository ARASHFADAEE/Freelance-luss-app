export type SubscriptionPlanId = 'pro_monthly' | 'pro_quarterly' | 'pro_yearly';

export interface SubscriptionPlanDefinition {
  id: SubscriptionPlanId;
  productId: string;
  label: string;
  durationLabel: string;
  durationMonths: number;
  /** قیمت نمایشی وب (تومان) — مبلغ نهایی از سرور */
  priceToman?: number;
  badge?: string;
}

export const SUBSCRIPTION_PLANS: SubscriptionPlanDefinition[] = [
  {
    id: 'pro_monthly',
    productId: 'freelancerpro_pro_monthly',
    label: 'ماهانه',
    durationLabel: '۱ ماه',
    durationMonths: 1,
    priceToman: 79_000,
  },
  {
    id: 'pro_quarterly',
    productId: 'freelancerpro_pro_3month',
    label: '۳ ماهه',
    durationLabel: '۳ ماه',
    durationMonths: 3,
    priceToman: 199_000,
    badge: 'محبوب',
  },
  {
    id: 'pro_yearly',
    productId: 'freelancerpro_pro_yearly',
    label: 'سالانه',
    durationLabel: '۱۲ ماه',
    durationMonths: 12,
    priceToman: 690_000,
    badge: 'به‌صرفه',
  },
];

export function findPlanByProductId(productId: string): SubscriptionPlanDefinition | undefined {
  return SUBSCRIPTION_PLANS.find((p) => p.productId === productId);
}

export function findPlanById(id: SubscriptionPlanId): SubscriptionPlanDefinition | undefined {
  return SUBSCRIPTION_PLANS.find((p) => p.id === id);
}
