import jalaali from 'jalaali-js';

const PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
const PERSIAN_DIGIT_CHARS = '۰۱۲۳۴۵۶۷۸۹';
const ARABIC_DIGIT_CHARS = '٠١٢٣٤٥٦٧٨٩';

export function toLatinDigits(value: string): string {
  return value
    .replace(/[۰-۹]/g, (d) => String(PERSIAN_DIGIT_CHARS.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String(ARABIC_DIGIT_CHARS.indexOf(d)));
}

export function toPersianDigits(value: string | number): string {
  return String(value).replace(/\d/g, (d) => PERSIAN_DIGITS[parseInt(d, 10)]);
}

export function formatPersianNumber(value: number, decimals = 0): string {
  const formatted = value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return toPersianDigits(formatted);
}

function parseISODateParts(dateStr: string): { gy: number; gm: number; gd: number } {
  const [gy, gm, gd] = dateStr.slice(0, 10).split('-').map(Number);
  return { gy, gm, gd };
}

export function formatJalaliDate(dateStr: string): string {
  const { gy, gm, gd } = parseISODateParts(dateStr);
  const { jy, jm, jd } = jalaali.toJalaali(gy, gm, gd);
  return toPersianDigits(`${jy}/${String(jm).padStart(2, '0')}/${String(jd).padStart(2, '0')}`);
}

export function formatJalaliMonth(dateStr: string): string {
  const { gy, gm, gd } = parseISODateParts(dateStr);
  const { jy, jm } = jalaali.toJalaali(gy, gm, gd);
  const months = [
    'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
    'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند',
  ];
  return `${months[jm - 1]} ${toPersianDigits(jy)}`;
}

export function getJalaliMonthKey(dateStr: string): string {
  const { gy, gm, gd } = parseISODateParts(dateStr);
  const { jy, jm } = jalaali.toJalaali(gy, gm, gd);
  return `${jy}-${String(jm).padStart(2, '0')}`;
}

export function getJalaliYear(dateStr: string): number {
  const { gy, gm, gd } = parseISODateParts(dateStr);
  return jalaali.toJalaali(gy, gm, gd).jy;
}

export function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

export function addDaysISO(dateStr: string, days: number): string {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}
