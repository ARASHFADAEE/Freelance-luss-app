import { API_BASE_URL, getAppHeaders, IS_API_CONFIGURED } from '@/core/config/env';
import { storageService } from '@/services/storage/StorageService';
import { normalizeTokenRefreshResponse } from '@/services/api/normalizeAuthResponse';
import { ApiError, type ApiErrorBody } from './types';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

interface RequestOptions {
  auth?: boolean;
  retryOnUnauthorized?: boolean;
}

let refreshPromise: Promise<string | null> | null = null;

async function parseError(res: Response): Promise<ApiError> {
  let body: ApiErrorBody = {};
  try {
    body = await res.json();
  } catch {
    /* ignore */
  }
  const message = body.error?.message ?? body.message ?? `خطای سرور (${res.status})`;
  return new ApiError(message, res.status, body.error?.code);
}

async function refreshAccessToken(): Promise<string | null> {
  if (!IS_API_CONFIGURED) return null;
  const refreshToken = await storageService.getRefreshToken();
  if (!refreshToken) return null;

  const res = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
    method: 'POST',
    headers: getAppHeaders(),
    body: JSON.stringify({ refreshToken, refresh_token: refreshToken }),
  });

  if (!res.ok) {
    await storageService.clearAuth();
    return null;
  }

  const data = normalizeTokenRefreshResponse(await res.json());
  await storageService.setTokens(data.accessToken, data.refreshToken ?? refreshToken);
  return data.accessToken;
}

async function getValidAccessToken(): Promise<string | null> {
  return storageService.getAccessToken();
}

export async function apiRequest<T>(
  method: HttpMethod,
  path: string,
  body?: unknown,
  options: RequestOptions = { auth: true, retryOnUnauthorized: true },
): Promise<T> {
  if (!IS_API_CONFIGURED) {
    throw new ApiError('آدرس API تنظیم نشده است', 0, 'API_NOT_CONFIGURED');
  }

  const headers: Record<string, string> = { ...getAppHeaders() };
  if (options.auth !== false) {
    const token = await getValidAccessToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401 && options.auth !== false && options.retryOnUnauthorized) {
    if (!refreshPromise) {
      refreshPromise = refreshAccessToken().finally(() => {
        refreshPromise = null;
      });
    }
    const newToken = await refreshPromise;
    if (newToken) {
      return apiRequest<T>(method, path, body, { ...options, retryOnUnauthorized: false });
    }
  }

  if (!res.ok) throw await parseError(res);
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}
