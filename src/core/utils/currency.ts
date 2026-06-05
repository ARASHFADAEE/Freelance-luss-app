import { CURRENCY_LABELS } from '../constants';
import type { Currency } from '../types';
import { formatAmountDisplay } from './amount';

export function formatCurrency(amount: number, currency: Currency = 'TOMAN'): string {
  const label = CURRENCY_LABELS[currency];
  return `${formatAmountDisplay(amount)} ${label}`;
}

export function convertToToman(amount: number, currency: Currency): number {
  const rates: Record<Currency, number> = {
    TOMAN: 1,
    RIAL: 0.1,
    USD: 85_000,
    EUR: 92_000,
    AED: 23_000,
  };
  return Math.round(amount * rates[currency]);
}
