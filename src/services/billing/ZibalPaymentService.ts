import { Platform, Linking } from 'react-native';
import { apiRequest } from '@/services/api/ApiClient';
import type { CheckoutResponse, CheckoutStatusResponse } from '@/services/api/types';
import { WEB_APP_URL } from '@/core/config/env';
import { clearWebQueryParams } from '@/core/platform/webQuery';

export type ZibalPaymentErrorCode = 'NOT_AVAILABLE' | 'CHECKOUT_FAILED' | 'PAYMENT_FAILED' | 'UNKNOWN';

export class ZibalPaymentError extends Error {
  constructor(
    message: string,
    public code: ZibalPaymentErrorCode,
  ) {
    super(message);
    this.name = 'ZibalPaymentError';
  }
}

function buildCallbackUrl(): string {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    const url = new URL(window.location.href);
    url.search = '';
    url.hash = '';
    return url.toString();
  }
  return WEB_APP_URL;
}

export const zibalPaymentService = {
  isSupported(): boolean {
    return Platform.OS === 'web';
  },

  async createCheckout(productId: string): Promise<CheckoutResponse> {
    if (!this.isSupported()) {
      throw new ZibalPaymentError('پرداخت زیبال فقط در نسخه وب فعال است', 'NOT_AVAILABLE');
    }

    return apiRequest<CheckoutResponse>('POST', '/api/subscriptions/checkout', {
      product_id: productId,
      platform: 'zibal',
      callback_url: buildCallbackUrl(),
    });
  },

  async redirectToGateway(paymentUrl: string): Promise<void> {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.location.assign(paymentUrl);
      return;
    }
    await Linking.openURL(paymentUrl);
  },

  async startCheckout(productId: string): Promise<CheckoutResponse> {
    const checkout = await this.createCheckout(productId);
    if (!checkout.paymentUrl) {
      throw new ZibalPaymentError('آدرس درگاه پرداخت دریافت نشد', 'CHECKOUT_FAILED');
    }
    await this.redirectToGateway(checkout.paymentUrl);
    return checkout;
  },

  async getCheckoutStatus(orderId: string): Promise<CheckoutStatusResponse> {
    return apiRequest<CheckoutStatusResponse>('GET', `/api/subscriptions/checkout/${orderId}`);
  },

  async confirmReturn(orderId: string): Promise<CheckoutStatusResponse> {
    const status = await this.getCheckoutStatus(orderId);
    if (status.status === 'failed') {
      throw new ZibalPaymentError(status.message ?? 'پرداخت ناموفق بود', 'PAYMENT_FAILED');
    }
    if (status.status !== 'paid') {
      throw new ZibalPaymentError('وضعیت پرداخت هنوز تأیید نشده است', 'CHECKOUT_FAILED');
    }
    return status;
  },

  clearReturnParams(): void {
    clearWebQueryParams(['subscription', 'order_id', 'payment', 'trackId', 'success']);
  },
};
