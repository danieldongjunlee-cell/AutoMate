import { Router } from 'express';

import { DIY_ONLY_PRICE_CENTS, PRO_PLANS, ProPlan } from '../config';
import { prisma } from '../db';

export const proRouter = Router();

const planOf = (v: unknown): ProPlan => (v === 'monthly' ? 'monthly' : 'annual');

/**
 * Create (or return the existing) Pro subscription membership and record the
 * payment. Pro is a subscription, so `lifetime` is false and `priceCents` is
 * the plan's price (annual $48 / monthly $9.99) — not the legacy $10.
 */
async function activatePro(userId: string, plan: ProPlan) {
  const existing = await prisma.proMembership.findFirst({ where: { userId } });
  if (existing) return { priceCents: existing.priceCents, alreadyPro: true };
  const priceCents = PRO_PLANS[plan].priceCents;
  await prisma.proMembership.create({
    data: { userId, priceCents, lifetime: false },
  });
  await prisma.payment.create({
    data: { userId, amountCents: priceCents, purpose: 'pro_membership' },
  });
  return { priceCents, alreadyPro: false };
}

// GET /pro — membership status
proRouter.get('/', async (req, res) => {
  const membership = await prisma.proMembership.findFirst({ where: { userId: req.user!.id } });
  return res.json({ isPro: Boolean(membership), membership });
});

// POST /pro/subscribe { plan: 'annual' | 'monthly' }
proRouter.post('/subscribe', async (req, res) => {
  const plan = planOf(req.body?.plan);
  const { priceCents, alreadyPro } = await activatePro(req.user!.id, plan);
  return res.json({ ok: true, plan, priceCents, alreadyPro });
});

// POST /pro/purchase { plan? } — legacy unlockPro entry (defaults to annual)
proRouter.post('/purchase', async (req, res) => {
  const plan = planOf(req.body?.plan);
  const { priceCents, alreadyPro } = await activatePro(req.user!.id, plan);
  return res.json({ ok: true, plan, priceCents, lifetime: false, alreadyPro });
});

// POST /pro/diy-unlock — $10 one-time DIY-only unlock (records the payment;
// DIY-only is a lighter entitlement than Pro and doesn't create a membership).
proRouter.post('/diy-unlock', async (req, res) => {
  await prisma.payment.create({
    data: { userId: req.user!.id, amountCents: DIY_ONLY_PRICE_CENTS, purpose: 'diy_unlock' },
  });
  return res.json({ ok: true, priceCents: DIY_ONLY_PRICE_CENTS });
});
