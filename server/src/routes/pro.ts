import { Router } from 'express';

import { prisma } from '../db';

export const proRouter = Router();

const PRO_PRICE_CENTS = 1000; // $10 lifetime (diy-unlock chain)

// GET /pro — membership status
proRouter.get('/', async (req, res) => {
  const membership = await prisma.proMembership.findFirst({ where: { userId: req.user!.id } });
  return res.json({ isPro: Boolean(membership), membership });
});

// POST /pro/purchase — $10 lifetime unlock
proRouter.post('/purchase', async (req, res) => {
  const existing = await prisma.proMembership.findFirst({ where: { userId: req.user!.id } });
  if (existing) return res.json({ ok: true, price: 10, lifetime: true, alreadyPro: true });

  await prisma.proMembership.create({
    data: { userId: req.user!.id, priceCents: PRO_PRICE_CENTS, lifetime: true },
  });
  await prisma.payment.create({
    data: { userId: req.user!.id, amountCents: PRO_PRICE_CENTS, purpose: 'pro_membership' },
  });
  return res.json({ ok: true, price: 10, lifetime: true });
});
