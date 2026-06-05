/** ISO YYYY-MM-DD → local Date (no timezone drift) */
export function isoToLocalDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** Date → ISO YYYY-MM-DD in local timezone */
export function dateToISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Normalize picker output to ISO string */
export function pickerDateToISO(date: unknown): string | null {
  if (!date) return null;
  if (date instanceof Date) return dateToISO(date);
  if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}/.test(date)) {
    return date.slice(0, 10);
  }
  if (typeof date === 'number') return dateToISO(new Date(date));
  if (typeof date === 'object' && date !== null && 'toDate' in date) {
    const d = (date as { toDate: () => Date }).toDate();
    if (d instanceof Date && !Number.isNaN(d.getTime())) return dateToISO(d);
  }
  return null;
}
