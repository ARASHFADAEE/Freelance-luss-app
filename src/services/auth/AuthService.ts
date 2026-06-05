import { apiRequest } from '@/services/api/ApiClient';
import type { MeResponse, SendOtpResponse, VerifyOtpResponse } from '@/services/api/types';
import { storageService, StorageKeys } from '@/services/storage/StorageService';
import { getOrCreateDeviceId } from './DeviceService';
import { normalizeIranPhone, normalizeOtpCode } from './OtpService';

export const authService = {
  async sendOtp(phoneInput: string): Promise<SendOtpResponse> {
    const phone = normalizeIranPhone(phoneInput);
    if (!phone) throw new Error('شماره موبایل معتبر نیست');

    return apiRequest<SendOtpResponse>('POST', '/api/auth/send-otp', { phone }, { auth: false });
  },

  async verifyOtp(phoneInput: string, codeInput: string): Promise<VerifyOtpResponse> {
    const phone = normalizeIranPhone(phoneInput);
    if (!phone) throw new Error('شماره موبایل معتبر نیست');

    const code = normalizeOtpCode(codeInput);
    const deviceId = await getOrCreateDeviceId();

    const response = await apiRequest<VerifyOtpResponse>(
      'POST',
      '/api/auth/verify-otp',
      { phone, code, deviceId },
      { auth: false },
    );

    await storageService.setTokens(response.accessToken, response.refreshToken);
    await storageService.setItem(StorageKeys.USER_PHONE, response.user.phone);
    await storageService.setItem(StorageKeys.USER_ID, response.user.id);

    return response;
  },

  async fetchMe(): Promise<MeResponse> {
    return apiRequest<MeResponse>('GET', '/api/auth/me');
  },

  async logout(): Promise<void> {
    try {
      await apiRequest<void>('POST', '/api/auth/logout', {});
    } catch {
      /* offline logout allowed */
    } finally {
      await storageService.clearAuth();
    }
  },

  async hasSession(): Promise<boolean> {
    const token = await storageService.getAccessToken();
    return !!token;
  },
};
