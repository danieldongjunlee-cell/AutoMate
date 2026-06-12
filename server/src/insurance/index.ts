/**
 * Aggregator adapter registry. INSURANCE_PROVIDER selects the active adapter
 * (default "mock" — no API keys ever required for the app to run).
 */
import { axleProvider } from './axleProvider';
import { InsuranceProvider } from './InsuranceProvider';
import { mockProvider } from './mockProvider';

export const PROVIDERS: Record<string, InsuranceProvider> = {
  [mockProvider.id]: mockProvider,
  [axleProvider.id]: axleProvider,
};

const configured = (process.env.INSURANCE_PROVIDER ?? 'mock').trim().toLowerCase();

/** Id of the adapter selected via env (unknown values fall back to mock). */
export const activeProviderId: string = PROVIDERS[configured] ? configured : 'mock';

/** Resolve an adapter by id; no id (or an unknown one) → the active adapter. */
export function getProvider(id?: string): InsuranceProvider {
  if (id && PROVIDERS[id]) return PROVIDERS[id];
  return PROVIDERS[activeProviderId];
}

/** Provider list for GET /insurance/providers (the "Connect my insurer" row). */
export const listProviders = (): { id: string; name: string; active: boolean }[] =>
  Object.values(PROVIDERS).map((p) => ({
    id: p.id,
    name: p.name,
    active: p.id === activeProviderId,
  }));

export type { InsuranceProvider, LinkSession, NormalizedPolicy } from './InsuranceProvider';
