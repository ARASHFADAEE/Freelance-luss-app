import type { Currency, ProjectStatus } from '../types';
import { semanticDark, semanticLight } from '../theme/tokens';

export const APP_NAME = 'فریلنس پلاس';

/** @deprecated Prefer theme.custom from useAppTheme — kept for gradual migration */
export const COLORS = {
  primary: semanticLight.primary,
  secondary: semanticLight.secondary,
  success: semanticLight.success,
  warning: semanticLight.warning,
  danger: semanticLight.danger,
  background: semanticLight.background,
  card: semanticLight.card,
  text: semanticLight.text,
  subtext: semanticLight.textSecondary,
  border: semanticLight.border,
} as const;

/** @deprecated Prefer theme.custom from useAppTheme */
export const DARK_COLORS = {
  primary: semanticDark.primary,
  secondary: semanticDark.secondary,
  success: semanticDark.success,
  warning: semanticDark.warning,
  danger: semanticDark.danger,
  background: semanticDark.background,
  card: semanticDark.card,
  text: semanticDark.text,
  subtext: semanticDark.textSecondary,
  border: semanticDark.border,
} as const;

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  negotiating: 'در حال مذاکره',
  active: 'فعال',
  delivered: 'تحویل شده',
  completed: 'تکمیل شده',
  cancelled: 'لغو شده',
};

export const PROJECT_STATUS_COLORS: Record<ProjectStatus, string> = {
  negotiating: '#f59e0b',
  active: '#3b82f6',
  delivered: '#8b5cf6',
  completed: '#059669',
  cancelled: '#ef4444',
};

export const EXPENSE_CATEGORIES = [
  'هاست',
  'دامنه',
  'تبلیغات',
  'ChatGPT',
  'Cursor',
  'سرور',
  'مالیات',
  'سایر',
] as const;

export const CURRENCY_LABELS: Record<Currency, string> = {
  TOMAN: 'تومان',
  RIAL: 'ریال',
  USD: 'دلار',
  EUR: 'یورو',
  AED: 'درهم',
};

export const FREE_PLAN_LIMITS = {
  clients: 3,
  projects: 5,
  invoices: 10,
} as const;

/** روزهای دسترسی رایگان به امکانات Pro (گزارش، PDF، ...) */
export const TRIAL_DAYS = 3;

export const PRO_PLAN_PRICE = 690_000;

export const SERVICE_CATEGORIES = [
  'طراحی وب',
  'توسعه',
  'سئو',
  'مشاوره',
  'طراحی UI/UX',
  'سایر',
] as const;
