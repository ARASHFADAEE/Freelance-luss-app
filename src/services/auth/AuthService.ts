import { apiRequest } from '@/services/api/ApiClient';
import type { MeResponse, SendOtpResponse, VerifyOtpResponse } from '@/services/api/types';
import {
  normalizeMeResponse,
  normalizeSendOtpResponse,
  normalizeTokenRefreshResponse,
  normalizeVerifyOtpResponse,
} from '@/services/api/normalizeAuthResponse';
import { storageService, StorageKeys } from '@/services/storage/StorageService';
import { getOrCreateDeviceId } from './DeviceService';
import { normalizeIranPhone, normalizeOtpCode } from './OtpService';

export const authService = {
  async sendOtp(phoneInput: string): Promise<SendOtpResponse> {
    const phone = normalizeIranPhone(phoneInput);
    if (!phone) throw new Error('شماره موبایل معتبر نیست');

    const raw = await apiRequest<unknown>('POST', '/api/auth/otp/send', { phone }, { auth: false });
    return normalizeSendOtpResponse(raw);
  },

  async verifyOtp(phoneInput: string, codeInput: string): Promise<VerifyOtpResponse> {
    const phone = normalizeIranPhone(phoneInput);
    if (!phone) throw new Error('شماره موبایل معتبر نیست');

    const code = normalizeOtpCode(codeInput);
    const deviceId = await getOrCreateDeviceId();

    const raw = await apiRequest<unknown>(
      'POST',
      '/api/auth/otp/verify',
      { phone, code, device_id: deviceId, deviceId },
      { auth: false },
    );

    const response = normalizeVerifyOtpResponse(raw);

    await storageService.setTokens(response.accessToken, response.refreshToken);
    await storageService.setItem(StorageKeys.USER_PHONE, response.user.phone);
    await storageService.setItem(StorageKeys.USER_ID, response.user.id);
    if (response.user.fullName) {
      await storageService.setItem(StorageKeys.USER_NAME, response.user.fullName);
    }

    return response;
  },

  async fetchMe(): Promise<MeResponse> {
    const raw = await apiRequest<unknown>('GET', '/api/auth/me');
    return normalizeMeResponse(raw);
  },

  async restoreUserFromStorage(): Promise<MeResponse | null> {
    const [phone, id, fullName] = await Promise.all([
      storageService.getItem(StorageKeys.USER_PHONE),
      storageService.getItem(StorageKeys.USER_ID),
      storageService.getItem(StorageKeys.USER_NAME),
    ]);
    if (!phone || !id) return null;

    return {
      user: { id, phone, fullName: fullName ?? null },
      subscription: { plan: 'free', expiresAt: null, userAccess: 'free' },
    };
  },

  async logout(): Promise<void> {
    const refreshToken = await storageService.getRefreshToken();
    try {
      await apiRequest<void>('POST', '/api/auth/logout', {
        refreshToken,
        refresh_token: refreshToken,
      });
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
