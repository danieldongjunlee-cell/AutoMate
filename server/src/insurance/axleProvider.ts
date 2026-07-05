/**
 * Axle (axle.insure) — reference aggregator adapter (INSURANCE_PROVIDER=axle).
 *
 * Coded to Axle's documented REST shape (docs.axle.insure):
 *   1. POST /ignition                → { ignitionToken, ignitionUri } — the
 *      hosted consent widget the user logs into their carrier through.
 *   2. (user completes consent)      → Axle hands back an authCode.
 *   3. POST /token/exchange          → { accessToken, policies: [ids] }.
 *   4. GET  /policies/{id}           → full policy object (carrier, premium,
 *      coverages[] with per-coverage deductible, properties[] with vehicles).
 *
 * Auth headers: x-client-id / x-client-secret on every call, plus
 * x-access-token after the exchange.
 *
 * Envs (never required — the app defaults to the mock provider):
 *   AXLE_API_URL        default https://api.axle.insure
 *   AXLE_CLIENT_ID      sandbox or production client id
 *   AXLE_CLIENT_SECRET  matching secret
 *
 * Vendor comparison + pick rationale: docs/insurance-aggregators.md.
 */
import { InsuranceProvider, LinkSession, NormalizedPolicy } from './InsuranceProvider';

const AXLE_API_URL = (process.env.AXLE_API_URL ?? 'https://api.axle.insure').replace(/\/+$/, '');
const AXLE_CLIENT_ID = process.env.AXLE_CLIENT_ID ?? '';
const AXLE_CLIENT_SECRET = process.env.AXLE_CLIENT_SECRET ?? '';

const AXLE_TIMEOUT_MS = 10_000;

// ── Axle response shapes (per docs.axle.insure API reference) ────────────

interface AxleEnvelope<T> {
  success: boolean;
  data: T;
}

interface AxleIgnition {
  ignitionToken: string;
  ignitionUri: string;
}

interface AxleTokenExchange {
  accessToken: string;
  /** Ids of the policies the user granted access to. */
  policies: string[];
}

interface AxleCoverage {
  code: string; // "BI" | "PD" | "COMP" | "COLL" | ...
  label?: string;
  deductible?: number | null;
}

interface AxleVehicleProperty {
  id: string;
  type: string; // "vehicle"
  data?: { vin?: string; year?: number | string; make?: string; model?: string };
}

interface AxlePolicy {
  id: string;
  type?: string; // "auto"
  carrier?: string; // carrier id, e.g. "state-farm"
  policyNumber?: string;
  isActive?: boolean;
  effectiveDate?: string; // ISO
  expirationDate?: string; // ISO
  /** Premium for the policy term, annualized by Axle for auto policies. */
  premium?: number | string | null;
  coverages?: AxleCoverage[];
  properties?: AxleVehicleProperty[];
}

// ── Helpers ───────────────────────────────────────────────────────────────

function requireCredentials(): void {
  if (!AXLE_CLIENT_ID || !AXLE_CLIENT_SECRET) {
    throw Object.assign(
      new Error(
        'Axle is selected (INSURANCE_PROVIDER=axle) but AXLE_CLIENT_ID / AXLE_CLIENT_SECRET are not set',
      ),
      { status: 503 },
    );
  }
}

async function axleFetch<T>(
  path: string,
  options: { method?: 'GET' | 'POST'; body?: unknown; accessToken?: string } = {},
): Promise<T> {
  const res = await fetch(`${AXLE_API_URL}${path}`, {
    method: options.method ?? (options.body !== undefined ? 'POST' : 'GET'),
    headers: {
      'Content-Type': 'application/json',
      'x-client-id': AXLE_CLIENT_ID,
      'x-client-secret': AXLE_CLIENT_SECRET,
      ...(options.accessToken ? { 'x-access-token': options.accessToken } : {}),
    },
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    signal: AbortSignal.timeout(AXLE_TIMEOUT_MS),
  });
  if (!res.ok) {
    throw Object.assign(new Error(`Axle ${path} responded ${res.status}`), { status: 502 });
  }
  const json = (await res.json()) as AxleEnvelope<T> | T;
  // Axle wraps responses in { success, data }; unwrap when present.
  return json !== null && typeof json === 'object' && 'data' in (json as object)
    ? (json as AxleEnvelope<T>).data
    : (json as T);
}

/** "state-farm" → "State Farm". */
const titleCaseCarrier = (carrier: string): string =>
  carrier
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

/** ISO date → display date, e.g. "2027-08-15" → "Aug 15, 2027". */
function displayDate(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

/** Map coverage codes to the wireframe's coverage-type label. */
function coverageType(coverages: AxleCoverage[] = []): string {
  const codes = new Set(coverages.map((c) => c.code.toUpperCase()));
  const hasComp = codes.has('COMP');
  const hasColl = codes.has('COLL');
  if (hasComp && hasColl) return 'Comprehensive + Collision';
  if (hasColl) return 'Liability + Collision';
  if (hasComp) return 'Liability + Comprehensive';
  return 'Liability';
}

export function normalizeAxlePolicy(p: AxlePolicy): NormalizedPolicy {
  const coverages = p.coverages ?? [];
  // Collision deductible is the one our compare math uses; fall back to any
  // coverage that carries a deductible.
  const collision = coverages.find((c) => c.code.toUpperCase() === 'COLL');
  const withDeductible = collision ?? coverages.find((c) => c.deductible != null);
  const vehicle = (p.properties ?? []).find((pr) => pr.type === 'vehicle')?.data;
  return {
    provider: titleCaseCarrier(p.carrier ?? 'Unknown carrier'),
    policyNumber: p.policyNumber ?? p.id,
    deductible: Number(withDeductible?.deductible ?? 500),
    premiumPerYear: Math.round(Number(p.premium ?? 0)),
    coverageType: coverageType(coverages),
    renewalDate: displayDate(p.expirationDate),
    coveredVehicle: vehicle
      ? [vehicle.year, vehicle.make, vehicle.model].filter(Boolean).join(' ')
      : '',
  };
}

// ── Adapter ───────────────────────────────────────────────────────────────

export const axleProvider: InsuranceProvider = {
  id: 'axle',
  name: 'Axle',

  /** Start an ignition (consent) session; the client opens linkUrl. */
  async connect(userId: string): Promise<LinkSession> {
    requireCredentials();
    const ignition = await axleFetch<AxleIgnition>('/ignition', {
      body: { user: { id: userId } },
    });
    return {
      provider: 'axle',
      linkToken: ignition.ignitionToken,
      linkUrl: ignition.ignitionUri,
    };
  },

  /**
   * Redeem the post-consent authCode for an access token, then pull and
   * normalize every granted policy.
   */
  async fetchPolicies(linkToken: string): Promise<NormalizedPolicy[]> {
    requireCredentials();
    const exchange = await axleFetch<AxleTokenExchange>('/token/exchange', {
      body: { authCode: linkToken },
    });
    const policies = await Promise.all(
      (exchange.policies ?? []).map((id) =>
        axleFetch<AxlePolicy>(`/policies/${id}`, { accessToken: exchange.accessToken }),
      ),
    );
    // Only auto policies map onto AutoMate's insurance_policies table.
    return policies.filter((p) => (p.type ?? 'auto') === 'auto').map(normalizeAxlePolicy);
  },
};
