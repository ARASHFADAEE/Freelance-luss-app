import { toLatinDigits } from '@/core/utils/persian';

const IRAN_MOBILE = /^09\d{9}$/;

export function normalizeIranPhone(input: string): string | null {
  const digits = toLatinDigits(input).replace(/\D/g, '');
  if (IRAN_MOBILE.test(digits)) return digits;
  if (digits.length === 10 && digits.startsWith('9')) return `0${digits}`;
  return null;
}

export function maskPhone(phone: string): string {
  if (phone.length !== 11) return phone;
  return `${phone.slice(0, 4)} *** ${phone.slice(9)}`;
}

export function isValidOtpCode(code: string): boolean {
  const digits = toLatinDigits(code).replace(/\D/g, '');
  return digits.length >= 5 && digits.length <= 6;
}

export function normalizeOtpCode(code: string): string {
  return toLatinDigits(code).replace(/\D/g, '').slice(0, 6);
}
