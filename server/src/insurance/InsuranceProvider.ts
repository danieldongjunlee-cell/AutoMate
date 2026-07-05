/**
 * Consumer-permissioned insurance-data aggregator adapter (Phase 4).
 *
 * Every aggregator (Axle, Canopy Connect, Covie, …) follows the same shape:
 * start a consent/link session for the user, then exchange the resulting
 * token for structured policy data. Concrete adapters normalize whatever the
 * vendor returns into `NormalizedPolicy`, which is what the /insurance
 * routes upsert into the `insurance_policies` table.
 *
 * Vendor research + the pick rationale live in docs/insurance-aggregators.md.
 */

/** Aggregator-agnostic policy shape (mirrors the prof-ins form fields). */
export interface NormalizedPolicy {
  /** Carrier name, e.g. "State Farm". */
  provider: string;
  policyNumber: string;
  /** Collision deductible in whole dollars. */
  deductible: number;
  /** Annualized premium in whole dollars. */
  premiumPerYear: number;
  /** e.g. "Comprehensive + Collision". */
  coverageType: string;
  /** Display date, e.g. "Aug 15, 2027". */
  renewalDate: string;
  /** e.g. "2019 Honda Accord". */
  coveredVehicle: string;
}

/** Result of starting a consent/link session with the aggregator. */
export interface LinkSession {
  /** Adapter id that produced the session ("mock" | "axle" | …). */
  provider: string;
  /**
   * Opaque token the adapter can later redeem in fetchPolicies(). For Axle
   * this is the ignitionToken (and after the user finishes consent, the
   * authCode); for the mock it's synthetic and immediately redeemable.
   */
  linkToken: string;
  /** Hosted consent-widget URL the client should open, when the vendor has one. */
  linkUrl?: string;
}

export interface InsuranceProvider {
  /** Stable id used by the INSURANCE_PROVIDER env + GET /insurance/providers. */
  id: string;
  /** Human-readable vendor name for the provider picker. */
  name: string;
  /** Start a consent/link session for this user. */
  connect(userId: string, credentials?: Record<string, string>): Promise<LinkSession>;
  /** Redeem a link token for the user's normalized policies. */
  fetchPolicies(linkToken: string): Promise<NormalizedPolicy[]>;
}
