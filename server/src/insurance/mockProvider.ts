/**
 * Default aggregator adapter (INSURANCE_PROVIDER=mock or unset).
 *
 * Demos the full "Connect my insurer" flow with zero external dependencies:
 * connect() hands back an immediately-redeemable link token and
 * fetchPolicies() returns the seeded State Farm policy (identical to
 * prisma/seed.ts) plus a Geico sample, so the connect flow visibly adds a
 * second policy.
 */
import { InsuranceProvider, NormalizedPolicy } from './InsuranceProvider';

export const MOCK_POLICIES: NormalizedPolicy[] = [
  {
    provider: 'State Farm',
    policyNumber: 'SF-8847234',
    deductible: 500,
    premiumPerYear: 1200,
    coverageType: 'Comprehensive + Collision',
    renewalDate: 'Aug 15, 2027',
    coveredVehicle: '2019 Honda Accord',
  },
  {
    provider: 'Geico',
    policyNumber: 'GC-4419208',
    deductible: 1000,
    premiumPerYear: 980,
    coverageType: 'Liability + Collision',
    renewalDate: 'Mar 3, 2027',
    coveredVehicle: '2019 Honda Accord',
  },
];

export const mockProvider: InsuranceProvider = {
  id: 'mock',
  name: 'AutoMate Demo Aggregator (sandbox)',

  async connect(userId: string) {
    return {
      provider: 'mock',
      linkToken: `mock-link-${userId}`,
      // No hosted widget — the token is immediately redeemable.
    };
  },

  async fetchPolicies(_linkToken: string) {
    return MOCK_POLICIES.map((p) => ({ ...p }));
  },
};
