/**
 * Insurance module routes (Phase 4).
 *
 *   GET  /insurance/providers  — registered aggregator adapters (+ active one)
 *   POST /insurance/connect    — link with an aggregator, pull policies, upsert
 *   POST /insurance/scan-card  — insurance-card OCR via damage-ai (TS fallback)
 *
 * Policy CRUD itself stays on /profile/policies (Phase 2); these routes feed
 * it: connect/scan are just two more ways to fill the same table.
 */
import { Router } from 'express';

import { extractInsuranceCard } from '../damageAi';
import { prisma } from '../db';
import { getProvider, listProviders, NormalizedPolicy } from '../insurance';

export const insuranceRouter = Router();

// GET /insurance/providers — the "Connect my insurer" picker
insuranceRouter.get('/providers', (_req, res) => {
  res.json(listProviders());
});

// POST /insurance/scan-card {} — the RN camera is still simulated, so no file
// is attached yet; the server forwards a placeholder to damage-ai and returns
// the extracted fields (mock-mode: the State Farm demo card).
insuranceRouter.post('/scan-card', async (_req, res) => {
  res.json(await extractInsuranceCard());
});

/** Upsert normalized aggregator policies keyed by (userId, policyNumber). */
async function upsertPolicies(userId: string, fetched: NormalizedPolicy[]): Promise<number> {
  let added = 0;
  for (const p of fetched) {
    const data = {
      carrier: p.provider,
      coverage: p.coverageType,
      deductible: p.deductible,
      premiumPerYear: p.premiumPerYear,
      covers: p.coveredVehicle || null,
      renewal: p.renewalDate || null,
    };
    const existing = await prisma.insurancePolicy.findFirst({
      where: { userId, policyNumber: p.policyNumber },
    });
    if (existing) {
      await prisma.insurancePolicy.update({ where: { id: existing.id }, data });
    } else {
      await prisma.insurancePolicy.create({
        data: { ...data, userId, policyNumber: p.policyNumber },
      });
      added += 1;
    }
  }
  return added;
}

// POST /insurance/connect { providerId?, linkToken? }
// — start a link session with the aggregator and import the user's policies.
//   Vendors with a hosted consent widget answer { ok:false, linkUrl } first;
//   the client reopens this route with the post-consent linkToken (authCode).
//   The mock adapter's token is immediately redeemable, so one call suffices.
insuranceRouter.post('/connect', async (req, res) => {
  const { providerId, linkToken } = (req.body ?? {}) as {
    providerId?: string;
    linkToken?: string;
  };
  const provider = getProvider(providerId);
  const userId = req.user!.id;

  let token = linkToken;
  if (!token) {
    const session = await provider.connect(userId);
    if (session.linkUrl) {
      const policies = await prisma.insurancePolicy.findMany({
        where: { userId },
        orderBy: { createdAt: 'asc' },
      });
      return res.json({
        ok: false,
        provider: provider.id,
        added: 0,
        policies,
        linkUrl: session.linkUrl,
        linkToken: session.linkToken,
      });
    }
    token = session.linkToken;
  }

  const fetched = await provider.fetchPolicies(token);
  const added = await upsertPolicies(userId, fetched);
  const policies = await prisma.insurancePolicy.findMany({
    where: { userId },
    orderBy: { createdAt: 'asc' },
  });
  return res.json({ ok: true, provider: provider.id, added, policies });
});
