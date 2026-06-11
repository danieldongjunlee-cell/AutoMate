import { BOOKING_MONTH } from '../services/mock/data';

/** "2027-04-07" → "Mon, Apr 7". Returns fallback when no date is set. */
export function formatDayLabel(iso: string | null | undefined, fallback = ''): string {
  if (!iso) return fallback;
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

/** Short weekday name for a day of the booking month (April 2027). */
export function weekdayOf(day: number): string {
  return new Date(BOOKING_MONTH.year, BOOKING_MONTH.month - 1, day).toLocaleDateString('en-US', {
    weekday: 'short',
  });
}
