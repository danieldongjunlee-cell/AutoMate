import { supabase } from './supabase';

/** One row of public.points_ledger. */
export interface PointsLedgerRow {
  id: string;
  delta: number;
  reason: string | null;
  balance_after: number | null;
  created_at: string;
}

/** Append a ledger row (write-through). No-op when Supabase isn't configured. */
export async function recordPoints(delta: number, reason: string, balanceAfter: number): Promise<void> {
  await supabase?.from('points_ledger').insert({ delta, reason, balance_after: balanceAfter });
}

/** Current balance = the most recent row's running total (0 if none / unconfigured). */
export async function fetchPointsBalance(): Promise<number> {
  if (!supabase) return 0;
  const { data, error } = await supabase
    .from('points_ledger')
    .select('balance_after')
    .order('created_at', { ascending: false })
    .limit(1);
  if (error) throw error;
  return data?.[0]?.balance_after ?? 0;
}

/** Full earn/redeem history, newest first. */
export async function fetchLedger(): Promise<PointsLedgerRow[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('points_ledger')
    .select('id, delta, reason, balance_after, created_at')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data as PointsLedgerRow[]) ?? [];
}
