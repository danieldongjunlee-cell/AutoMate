import { supabase } from '../../lib/supabase';
import {
  ConnectResult,
  Policy,
  PolicyInput,
  insuranceService as mockInsuranceService,
} from '../mock/insuranceService';

interface Row {
  id: string;
  carrier: string | null;
  coverage: string | null;
  policy_number: string | null;
  deductible: number | null;
  premium_per_year: number | null;
  covers: string | null;
  renewal: string | null;
  status: string | null;
}

const COLS =
  'id, carrier, coverage, policy_number, deductible, premium_per_year, covers, renewal, status';

const toPolicy = (r: Row): Policy => ({
  id: r.id,
  carrier: r.carrier ?? '',
  coverage: r.coverage ?? '',
  policyNumber: r.policy_number ?? '',
  deductible: r.deductible ?? 0,
  premiumPerYear: r.premium_per_year ?? 0,
  covers: r.covers ?? '',
  renewal: r.renewal ?? '',
  status: r.status ?? 'Active',
});

const toRow = (input: Partial<PolicyInput>): Record<string, unknown> => {
  const r: Record<string, unknown> = {};
  if (input.carrier !== undefined) r.carrier = input.carrier;
  if (input.coverage !== undefined) r.coverage = input.coverage;
  if (input.policyNumber !== undefined) r.policy_number = input.policyNumber;
  if (input.deductible !== undefined) r.deductible = input.deductible;
  if (input.premiumPerYear !== undefined) r.premium_per_year = input.premiumPerYear;
  if (input.covers !== undefined) r.covers = input.covers;
  if (input.renewal !== undefined) r.renewal = input.renewal;
  return r;
};

function client() {
  if (!supabase) throw new Error('Supabase is not configured.');
  return supabase;
}

/** Demo aggregator policies for "Connect my insurer" (mirrors the mock). */
const AGGREGATOR: PolicyInput[] = [
  {
    carrier: 'State Farm',
    coverage: 'Comprehensive + Collision',
    policyNumber: 'SF-8847234',
    deductible: 500,
    premiumPerYear: 1200,
    covers: '2019 Honda Accord',
    renewal: 'Aug 15, 2027',
  },
  {
    carrier: 'Geico',
    coverage: 'Liability + Collision',
    policyNumber: 'GC-4419208',
    deductible: 1000,
    premiumPerYear: 980,
    covers: '2019 Honda Accord',
    renewal: 'Mar 3, 2027',
  },
];

/** Supabase-backed twin of the mock insuranceService. */
export const insuranceService: typeof mockInsuranceService = {
  async listPolicies(): Promise<Policy[]> {
    const { data, error } = await client()
      .from('insurance_policies')
      .select(COLS)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return (data as Row[]).map(toPolicy);
  },

  async addPolicy(input: PolicyInput): Promise<{ ok: boolean; policy: Policy }> {
    const { data, error } = await client()
      .from('insurance_policies')
      .insert({ ...toRow(input), status: 'Active' })
      .select(COLS)
      .single();
    if (error) throw error;
    return { ok: true, policy: toPolicy(data as Row) };
  },

  async updatePolicy(
    id: string,
    patch: Partial<PolicyInput>,
  ): Promise<{ ok: boolean; policy: Policy }> {
    const { data, error } = await client()
      .from('insurance_policies')
      .update(toRow(patch))
      .eq('id', id)
      .select(COLS)
      .single();
    if (error) throw error;
    return { ok: true, policy: toPolicy(data as Row) };
  },

  async removePolicy(id: string): Promise<{ ok: boolean }> {
    const { error } = await client().from('insurance_policies').delete().eq('id', id);
    if (error) throw error;
    return { ok: true };
  },

  // Card OCR + provider list are demo helpers with no persistence — reuse the mock.
  scanCard: mockInsuranceService.scanCard,
  getProviders: mockInsuranceService.getProviders,

  /** Import the aggregator's demo policies into Supabase (upsert by number). */
  async connect(providerId?: string): Promise<ConnectResult> {
    const c = client();
    const existing = await this.listPolicies();
    let added = 0;
    for (const input of AGGREGATOR) {
      const match = existing.find((p) => p.policyNumber === input.policyNumber);
      if (match) {
        await c.from('insurance_policies').update(toRow(input)).eq('id', match.id);
      } else {
        await c.from('insurance_policies').insert({ ...toRow(input), status: 'Active' });
        added += 1;
      }
    }
    return { ok: true, provider: providerId ?? 'mock', added, policies: await this.listPolicies() };
  },
};
