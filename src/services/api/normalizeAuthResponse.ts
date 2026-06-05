import type {
  AuthUser,
  MeResponse,
  SendOtpResponse,
  SubscriptionPayload,
  VerifyOtpResponse,
} from './types';
import type { SubscriptionPlan } from '@/core/types';

function pickString(obj: Record<string, unknown>, ...keys: string[]): string {
  for (const key of keys) {
    const value = obj[key];
    if (typeof value === 'string') return value;
  }
  return '';
}

function pickNumber(obj: Record<string, unknown>, ...keys: string[]): number | undefined {
  for (const key of keys) {
    const value = obj[key];
    if (typeof value === 'number') return value;
    if (typeof value === 'string' && value !== '') {
      const n = Number(value);
      if (!Number.isNaN(n)) return n;
    }
  }
  return undefined;
}

function pickNullableString(obj: Record<string, unknown>, ...keys: string[]): string | null {
  for (const key of keys) {
    const value = obj[key];
    if (value === null) return null;
    if (typeof value === 'string') return value;
  }
  return null;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function normalizeUser(raw: unknown): AuthUser {
  const obj = asRecord(raw);
  const idValue = obj.id ?? obj.uuid;
  return {
    id: idValue !== undefined && idValue !== null ? String(idValue) : '',
    phone: pickString(obj, 'phone', 'mobile'),
    fullName: pickNullableString(obj, 'fullName', 'full_name', 'name'),
    isNewUser: obj.isNewUser === true || obj.is_new_user === true,
  };
}

function normalizeSubscription(raw: unknown): SubscriptionPayload {
  const obj = asRecord(raw);
  const plan = (pickString(obj, 'plan') || 'free') as SubscriptionPlan;
  return {
    plan: plan === 'pro' ? 'pro' : 'free',
    expiresAt: pickNullableString(obj, 'expiresAt', 'expires_at'),
    subscriptionType: pickNullableString(obj, 'subscriptionType', 'subscription_type'),
    userAccess: (pickString(obj, 'userAccess', 'user_access') || 'free') as 'free' | 'premium',
    isActive: obj.isActive === true || obj.is_active === true || obj.active === true,
  };
}

export function normalizeSendOtpResponse(raw: unknown): SendOtpResponse {
  const obj = asRecord(raw);
  const data = asRecord(obj.data);
  const source = Object.keys(data).length > 0 ? data : obj;

  return {
    success: source.success === true || obj.success === true || obj.status === 'ok',
    expiresIn: pickNumber(source, 'expiresIn', 'expires_in') ?? 120,
    message: pickString(source, 'message', 'msg') || 'کد تأیید ارسال شد',
    debugCode: pickString(source, 'debugCode', 'debug_code') || undefined,
  };
}

export function normalizeVerifyOtpResponse(raw: unknown): VerifyOtpResponse {
  const obj = asRecord(raw);
  const data = asRecord(obj.data);
  const source = Object.keys(data).length > 0 ? data : obj;

  const accessToken = pickString(source, 'accessToken', 'access_token', 'token');
  const refreshToken = pickString(source, 'refreshToken', 'refresh_token');
  if (!accessToken) {
    throw new Error('توکن دریافت نشد — پاسخ سرور نامعتبر است');
  }

  const user = normalizeUser(
    source.user
    ?? obj.user
    ?? {
      id: source.id ?? obj.id,
      phone: source.phone ?? obj.phone,
      full_name: source.full_name ?? obj.full_name,
      fullName: source.fullName ?? obj.fullName,
    },
  );
  if (!user.phone) {
    throw new Error('اطلاعات کاربر دریافت نشد');
  }

  return {
    accessToken,
    refreshToken,
    expiresIn: pickNumber(source, 'expiresIn', 'expires_in') ?? 3600,
    user,
    subscription: normalizeSubscription(source.subscription ?? obj.subscription),
  };
}

export function normalizeMeResponse(raw: unknown): MeResponse {
  const obj = asRecord(raw);
  const data = asRecord(obj.data);
  const source = Object.keys(data).length > 0 ? data : obj;

  return {
    user: normalizeUser(source.user ?? obj.user),
    subscription: normalizeSubscription(source.subscription ?? obj.subscription),
  };
}

export function normalizeTokenRefreshResponse(raw: unknown): { accessToken: string; refreshToken?: string } {
  const obj = asRecord(raw);
  const data = asRecord(obj.data);
  const source = Object.keys(data).length > 0 ? data : obj;

  const accessToken = pickString(source, 'accessToken', 'access_token', 'token');
  if (!accessToken) throw new Error('توکن جدید دریافت نشد');

  const refreshToken = pickString(source, 'refreshToken', 'refresh_token') || undefined;
  return { accessToken, refreshToken };
}
