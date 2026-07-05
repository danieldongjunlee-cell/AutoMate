import { INSURANCE_POLICY, VEHICLE } from './data';
import { delay } from './delay';

/** App-level policy shape (mirror of the server's insurance_policies rows). */
export interface Policy {
  id: string;
  carrier: string;
  coverage: string;
  policyNumber: string;
  deductible: number;
  premiumPerYear: number;
  covers: string;
  renewal: string;
  status: string;
}

export type PolicyInput = Omit<Policy, 'id' | 'status'>;

/** Fields the card-scan autofill returns (POST /insurance/scan-card). */
export interface ScannedInsuranceCard {
  provider: string;
  policyNumber: string;
  deductible: number;
  premiumPerYear: number;
  coverageType: string;
  renewalDate: string;
}

/** Aggregator adapter entry (GET /insurance/providers). */
export interface InsuranceProviderInfo {
  id: string;
  name: string;
  active: boolean;
}

export interface ConnectResult {
  ok: boolean;
  provider: string;
  /** Newly imported policies (existing ones are updated in place). */
  added: number;
  policies: Policy[];
  /** Hosted consent-widget URL when the vendor needs the user to log in first. */
  linkUrl?: string;
}

/**
 * Module-state policy list seeded with the State Farm policy, so edits and
 * additions survive navigation. Renewal follows the DB seed / prof-ins-edit
 * value (Aug 15, 2027) — the wireframe's prof-insurance row said Dec 15, 2025,
 * but with one live policy record a single date has to win.
 */
let policies: Policy[] = [
  {
    id: 'pol-statefarm',
    carrier: INSURANCE_POLICY.carrier,
    coverage: INSURANCE_POLICY.coverage,
    policyNumber: INSURANCE_POLICY.accountNumber, // SF-8847234 (prof-insurance row)
    deductible: INSURANCE_POLICY.deductible,
    premiumPerYear: INSURANCE_POLICY.premiumPerYear,
    covers: INSURANCE_POLICY.covers,
    renewal: 'Aug 15, 2027',
    status: 'Active',
  },
  {
    id: 'pol-geico-rav4',
    carrier: 'Geico',
    coverage: 'Liability + Collision',
    policyNumber: 'GC-4419208',
    deductible: 1000,
    premiumPerYear: 1040,
    covers: '2021 Toyota RAV4',
    renewal: 'Nov 2, 2027',
    status: 'Active',
  },
];
let nextId = 1;

/**
 * Synchronous snapshot of the user's primary policy for the mock
 * compareService — deductible/premium edits flow straight into the
 * cash-vs-insurance math, mirroring how the server resolves the stored
 * policy on /compare/estimate.
 */
export const primaryPolicy = (): Policy => policies[0];

/** Demo card — same fields as the damage-ai mock (app/mock_engine.py). */
const SCANNED_CARD: ScannedInsuranceCard = {
  provider: 'State Farm',
  policyNumber: 'SF-8847234',
  deductible: 500,
  premiumPerYear: 1200,
  coverageType: 'Comprehensive + Collision',
  renewalDate: 'Aug 15, 2027',
};

/** Mirror of server/src/insurance/mockProvider.ts MOCK_POLICIES. */
const AGGREGATOR_POLICIES: PolicyInput[] = [
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

export const insuranceService = {
  async listPolicies(): Promise<Policy[]> {
    await delay(250);
    return policies.map((p) => ({ ...p }));
  },

  async addPolicy(input: PolicyInput): Promise<{ ok: boolean; policy: Policy }> {
    await delay(450);
    const policy: Policy = {
      ...input,
      covers: input.covers || VEHICLE.name,
      id: `pol-new-${nextId++}`,
      status: 'Active',
    };
    policies = [...policies, policy];
    return { ok: true, policy };
  },

  async updatePolicy(id: string, patch: Partial<PolicyInput>): Promise<{ ok: boolean; policy: Policy }> {
    await delay(450);
    const idx = policies.findIndex((p) => p.id === id);
    if (idx < 0) throw new Error('Policy not found');
    const policy = { ...policies[idx], ...patch };
    policies = [...policies.slice(0, idx), policy, ...policies.slice(idx + 1)];
    return { ok: true, policy };
  },

  async removePolicy(id: string): Promise<{ ok: boolean }> {
    await delay(350);
    policies = policies.filter((p) => p.id !== id);
    return { ok: true };
  },

  /** "OCR" an insurance card — autofills the prof-ins-add form after a scan
   * delay (api twin posts to /insurance/scan-card → damage-ai). */
  async scanCard(): Promise<ScannedInsuranceCard> {
    await delay(1100);
    return { ...SCANNED_CARD };
  },

  /** Aggregator adapters for the "Connect my insurer" row. */
  async getProviders(): Promise<InsuranceProviderInfo[]> {
    await delay(200);
    return [
      { id: 'mock', name: 'AutoMate Demo Aggregator (sandbox)', active: true },
      { id: 'axle', name: 'Axle', active: false },
    ];
  },

  /** Link with the aggregator and import policies (mock: State Farm is
   * refreshed in place, the Geico sample is added). */
  async connect(providerId?: string): Promise<ConnectResult> {
    await delay(900);
    let added = 0;
    for (const input of AGGREGATOR_POLICIES) {
      const existing = policies.find((p) => p.policyNumber === input.policyNumber);
      if (existing) {
        policies = policies.map((p) =>
          p.policyNumber === input.policyNumber ? { ...p, ...input } : p,
        );
      } else {
        policies = [...policies, { ...input, id: `pol-new-${nextId++}`, status: 'Active' }];
        added += 1;
      }
    }
    return {
      ok: true,
      provider: providerId ?? 'mock',
      added,
      policies: policies.map((p) => ({ ...p })),
    };
  },
};
