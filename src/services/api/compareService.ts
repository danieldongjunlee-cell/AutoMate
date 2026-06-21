/** Real compare service (server /compare/estimate) — mirrors services/mock/compareService. */
import { acceptedQuoteById } from '../mock/data';
import { Comparison, ComparisonRequest } from '../mock/compareService';
import { request } from './client';

export const compareService = {
  async getComparison(req: ComparisonRequest = {}): Promise<Comparison> {
    // The accepted-quote catalog is app-side wireframe data, so the claim
    // amount is resolved here; deductible/premium are intentionally omitted
    // so the server fills them from the user's stored policy — editing the
    // policy deductible changes the deep-dive math.
    const quote = acceptedQuoteById(req.quoteId);
    return request<Comparison>('/compare/estimate', {
      body: {
        claimType: req.claimType ?? 'collision',
        claimAmount: req.claimAmount ?? quote.priceLow,
        state: 'VA',
      },
    });
  },
};
