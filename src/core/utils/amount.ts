import { toLatinDigits, toPersianDigits } from './persian';

export function parseAmount(value: string): number {
  const digits = toLatinDigits(value).replace(/[^\d]/g, '');
  return digits ? parseInt(digits, 10) : 0;
}

export function formatAmountDisplay(value: number | string, usePersianDigits = true): string {
  const num = typeof value === 'string' ? parseAmount(value) : value;
  const formatted = num.toLocaleString('en-US');
  return usePersianDigits ? toPersianDigits(formatted) : formatted;
}

export function formatAmountInput(raw: string): string {
  const digits = raw.replace(/[^\d]/g, '');
  if (!digits) return '';
  return formatAmountDisplay(parseInt(digits, 10));
}
