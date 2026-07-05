import { Router } from 'express';

import { predictPremiumImpact, PremiumImpactInput, PremiumImpactResult } from '../actuarial/predict';
import { prisma } from '../db';

export const compareRouter = Router();

const toNumber = (v: unknown): number | undefined => {
  const n = typeof v === 'string' ? Number(v) : typeof v === 'number' ? v : NaN;
  return Number.isFinite(n) && n >= 0 ? n : undefined;
};

/**
 * Resolve a full model input from a (possibly partial) request: missing
 * policy fields come from the user's seeded insurance policy, a missing
 * claim amount from their accepted quote (else the latest AI estimate).
 */
async function resolveInput(
  userId: string,
  body: Record<string, unknown>,
): Promise<PremiumImpactInput> {
  const claimType = body.claimType === 'comprehensive' ? 'comprehensive' : 'collision';
  let claimAmount = toNumber(body.claimAmount);
  let deductible = toNumber(body.deductible);
  let premiumPerYear = toNumber(body.premiumPerYear);

  if (deductible === undefined || premiumPerYear === undefined) {
    const policy = await prisma.insurancePolicy.findFirst({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });
    deductible ??= policy?.deductible ?? 500;
    premiumPerYear ??= policy?.premiumPerYear ?? 1200;
  }

  if (claimAmount === undefined) {
    const accepted = await prisma.quote.findFirst({
      where: { status: 'accepted', damageRequest: { userId } },
      orderBy: { createdAt: 'desc' },
    });
    if (accepted) {
      claimAmount = accepted.price;
    } else {
      const request = await prisma.damageRequest.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });
      claimAmount = request?.aiPriceLow ?? 320; // wireframe demo repair cost
    }
  }

  const state = typeof body.state === 'string' && body.state ? body.state : 'VA';
  return { claimType, claimAmount, premiumPerYear, deductible, state };
}

export interface ComparisonResponse {
  input: PremiumImpactInput;
  result: PremiumImpactResult;
}

const handler = async (
  userId: string,
  body: Record<string, unknown>,
): Promise<ComparisonResponse> => {
  const input = await resolveInput(userId, body);
  return { input, result: predictPremiumImpact(input) };
};

// GET /compare/estimate — comparison from the user's seeded policy + accepted quote
compareRouter.get('/estimate', async (req, res) => {
  res.json(await handler(req.user!.id, {}));
});

// POST /compare/estimate { claimType?, claimAmount?, deductible?, premiumPerYear?, state? }
// — any omitted field falls back to the user's stored data.
compareRouter.post('/estimate', async (req, res) => {
  res.json(await handler(req.user!.id, req.body ?? {}));
});
