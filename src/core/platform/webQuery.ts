import { Platform } from 'react-native';

export function getWebQueryParams(): Record<string, string> {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return {};

  const params: Record<string, string> = {};
  for (const [key, value] of new URLSearchParams(window.location.search)) {
    params[key] = value;
  }
  return params;
}

export function clearWebQueryParams(keys?: string[]): void {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return;

  const url = new URL(window.location.href);
  const toRemove = keys ?? [...url.searchParams.keys()];
  for (const key of toRemove) {
    url.searchParams.delete(key);
  }
  window.history.replaceState({}, '', url.pathname + url.search + url.hash);
}
