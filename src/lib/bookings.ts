import type { AppBooking } from '../store/useAppStore';
import { supabase } from './supabase';

interface Row {
  id: string;
  kind: string;
  dealer_id: string | null;
  brand: string | null;
  icon: string | null;
  title: string | null;
  dealer_name: string | null;
  date_label: string | null;
  mon: string | null;
  day: string | null;
  time: string | null;
  price_label: string | null;
  status: string | null;
  proposed_time: string | null;
  reason: string | null;
  created_at_ms: number | null;
}

const COLS =
  'id, kind, dealer_id, brand, icon, title, dealer_name, date_label, mon, day, time, price_label, status, proposed_time, reason, created_at_ms';

const toBooking = (r: Row): AppBooking => ({
  id: r.id,
  kind: (r.kind as AppBooking['kind']) ?? 'maintenance',
  dealerId: r.dealer_id ?? undefined,
  brand: r.brand ?? '',
  icon: r.icon ?? '📅',
  title: r.title ?? '',
  dealerName: r.dealer_name ?? '',
  dateLabel: r.date_label ?? '',
  mon: r.mon ?? '',
  day: r.day ?? '',
  time: r.time ?? '',
  priceLabel: r.price_label ?? '',
  status: (r.status as AppBooking['status']) ?? 'confirmed',
  proposedTime: r.proposed_time ?? undefined,
  reason: r.reason ?? undefined,
  createdAt: r.created_at_ms ?? Date.now(),
});

const toRow = (b: AppBooking): Record<string, unknown> => ({
  id: b.id,
  kind: b.kind,
  dealer_id: b.dealerId ?? null,
  brand: b.brand,
  icon: b.icon,
  title: b.title,
  dealer_name: b.dealerName,
  date_label: b.dateLabel,
  mon: b.mon,
  day: b.day,
  time: b.time,
  price_label: b.priceLabel,
  status: b.status,
  proposed_time: b.proposedTime ?? null,
  reason: b.reason ?? null,
  created_at_ms: b.createdAt,
});

/** Load the user's bookings (newest first). [] if Supabase isn't configured. */
export async function fetchBookings(): Promise<AppBooking[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('bookings')
    .select(COLS)
    .order('created_at_ms', { ascending: false });
  if (error) throw error;
  return (data as Row[]).map(toBooking);
}

/** Write-through helpers — no-ops when Supabase isn't configured. */
export async function insertBooking(b: AppBooking): Promise<void> {
  await supabase?.from('bookings').insert(toRow(b));
}

export async function deleteBookingRow(id: string): Promise<void> {
  await supabase?.from('bookings').delete().eq('id', id);
}

export async function updateBookingRow(
  id: string,
  patch: { status?: string; date_label?: string; time?: string; proposed_time?: string | null },
): Promise<void> {
  await supabase?.from('bookings').update(patch).eq('id', id);
}
