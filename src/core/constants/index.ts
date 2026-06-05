import type { Currency, ProjectStatus } from '../types';

export const APP_NAME = 'فریلنس پلاس';

export const COLORS = {
  primary: '#1e3a8a',
  secondary: '#10b981',
  success: '#059669',
  warning: '#f59e0b',
  danger: '#ef4444',
  background: '#f8fafc',
  card: '#ffffff',
  text: '#111827',
  subtext: '#6b7280',
  border: '#e5e7eb',
} as const;

export const DARK_COLORS = {
  primary: '#3b82f6',
  secondary: '#34d399',
  success: '#10b981',
  warning: '#fbbf24',
  danger: '#f87171',
  background: '#0f172a',
  card: '#1e293b',
  text: '#f1f5f9',
  subtext: '#94a3b8',
  border: '#334155',
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
