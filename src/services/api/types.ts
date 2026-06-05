import type { SubscriptionPlan } from '@/core/types';

export interface ApiErrorBody {
  error?: {
    code?: string;
    message?: string;
    details?: Record<string, unknown>;
  };
  message?: string;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export interface AuthUser {
  id: string;
  phone: string;
  fullName: string | null;
  isNewUser?: boolean;
}

export interface SubscriptionFeatures {
  maxClients: number;
  maxProjects: number;
  maxInvoices: number;
  pdfExport: boolean;
  reports: boolean;
  backup: boolean;
  charts: boolean;
  multiCurrency: boolean;
}

export interface SubscriptionPayload {
  plan: SubscriptionPlan;
  expiresAt: string | null;
  subscriptionType?: string | null;
  userAccess?: 'free' | 'premium';
  isActive?: boolean;
  features?: SubscriptionFeatures;
}

export interface SendOtpResponse {
  success: boolean;
  expiresIn: number;
  message: string;
  debugCode?: string;
}

export interface VerifyOtpResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: AuthUser;
  subscription: SubscriptionPayload;
}

export interface MeResponse {
  user: AuthUser;
  subscription: SubscriptionPayload;
}

export interface VerifyPurchaseResponse {
  active: boolean;
  expires_at: string | null;
  subscription_type: string;
  user_access: 'free' | 'premium';
}

export interface CheckoutResponse {
  orderId: string;
  paymentUrl: string;
  amount: number;
  currency: string;
}

export type CheckoutPaymentStatus = 'pending' | 'paid' | 'failed' | 'expired';

export interface CheckoutStatusResponse {
  orderId: string;
  status: CheckoutPaymentStatus;
  message?: string;
  subscription?: {
    active: boolean;
    expires_at: string | null;
    subscription_type: string;
    user_access: 'free' | 'premium';
  };
}
