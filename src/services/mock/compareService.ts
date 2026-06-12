import {
  ClaimType,
  predictPremiumImpact,
  PremiumImpactInput,
  PremiumImpactResult,
} from '../actuarial/predict';
import { acceptedQuoteById, INSURANCE_POLICY } from './data';
import { delay } from './delay';

export interface ComparisonRequest {
  /** Accepted quote whose low estimate is the repair (claim) amount. */
  quoteId?: string | null;
  claimType?: ClaimType;
}

export interface Comparison {
  /** Fully-resolved model input (claim + policy numbers actually used). */
  input: PremiumImpactInput;
  result: PremiumImpactResult;
}

/**
 * Mock twin of the server's /compare/estimate route. Runs the SAME pure
 * actuarial module (src/services/actuarial ↔ server/src/actuarial are
 * byte-identical twins) against the wireframe accepted quote + State Farm
 * policy, so the Compare tab shows the exact s-comp-deep-dive numbers:
 * $320 cash vs $1,040 insurance, break-even month 1, verdict cash.
 */
export const compareService = {
  async getComparison(req: ComparisonRequest = {}): Promise<Comparison> {
    await delay(300);
    const quote = acceptedQuoteById(req.quoteId);
    const input: PremiumImpactInput = {
      claimType: req.claimType ?? 'collision',
      claimAmount: quote.priceLow,
      premiumPerYear: INSURANCE_POLICY.premiumPerYear,
      deductible: INSURANCE_POLICY.deductible,
      state: 'VA',
    };
    return { input, result: predictPremiumImpact(input) };
  },
};
