import { supabase } from '../../lib/supabase';
import {
  PaymentCard,
  PaymentCardInput,
  paymentMethodsService as mockPaymentMethodsService,
} from '../mock/paymentMethodsService';

interface Row {
  id: string;
  brand: string | null;
  last4: string | null;
  holder: string | null;
  expires: string | null;
  is_default: boolean | null;
}

const COLS = 'id, brand, last4, holder, expires, is_default';

const toCard = (r: Row): PaymentCard => ({
  id: r.id,
  brand: r.brand ?? 'VISA',
  last4: r.last4 ?? '',
  holder: r.holder ?? '',
  expires: r.expires ?? '',
  isDefault: r.is_default ?? false,
});

function client() {
  if (!supabase) throw new Error('Supabase is not configured.');
  return supabase;
}

/** Clear the default flag on every card the user owns (RLS scopes to them). */
async function clearDefaults() {
  await client().from('payment_methods').update({ is_default: false }).eq('is_default', true);
}

/** Supabase-backed twin of the mock paymentMethodsService. */
export const paymentMethodsService: typeof mockPaymentMethodsService = {
  async listCards(): Promise<PaymentCard[]> {
    const { data, error } = await client()
      .from('payment_methods')
      .select(COLS)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return (data as Row[]).map(toCard);
  },

  async addCard(input: PaymentCardInput): Promise<{ ok: boolean; card: PaymentCard }> {
    const c = client();
    const { count } = await c.from('payment_methods').select('id', { count: 'exact', head: true });
    const makeDefault = input.isDefault === true || (count ?? 0) === 0;
    if (makeDefault) await clearDefaults();
    const { data, error } = await c
      .from('payment_methods')
      .insert({
        brand: input.brand?.trim() || 'VISA',
        last4: input.last4,
        holder: input.holder,
        expires: input.expires,
        is_default: makeDefault,
      })
      .select(COLS)
      .single();
    if (error) throw error;
    return { ok: true, card: toCard(data as Row) };
  },

  async updateCard(
    id: string,
    patch: Partial<Pick<PaymentCardInput, 'holder' | 'expires'>>,
  ): Promise<{ ok: boolean; card: PaymentCard }> {
    const dbPatch: Record<string, unknown> = {};
    if (patch.holder !== undefined) dbPatch.holder = patch.holder;
    if (patch.expires !== undefined) dbPatch.expires = patch.expires;
    const { data, error } = await client()
      .from('payment_methods')
      .update(dbPatch)
      .eq('id', id)
      .select(COLS)
      .single();
    if (error) throw error;
    return { ok: true, card: toCard(data as Row) };
  },

  async setDefault(id: string): Promise<{ ok: boolean }> {
    await clearDefaults();
    const { error } = await client().from('payment_methods').update({ is_default: true }).eq('id', id);
    if (error) throw error;
    return { ok: true };
  },

  async removeCard(id: string): Promise<{ ok: boolean }> {
    const { error } = await client().from('payment_methods').delete().eq('id', id);
    if (error) throw error;
    return { ok: true };
  },
};
