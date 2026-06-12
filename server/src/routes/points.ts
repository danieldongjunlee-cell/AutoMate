import { Router } from 'express';

import { POINT_VALUE_USD } from '../config';
import { awardPoints, prisma } from '../db';

export const pointsRouter = Router();

// GET /points → { balance, dollarValue, pointValueUsd, ledger }
pointsRouter.get('/', async (req, res) => {
  const ledger = await prisma.pointsLedgerEntry.findMany({
    where: { userId: req.user!.id },
    orderBy: { createdAt: 'desc' },
  });
  const balance = ledger.reduce((sum, e) => sum + e.delta, 0);
  return res.json({
    balance,
    pointValueUsd: POINT_VALUE_USD,
    dollarValue: Number((balance * POINT_VALUE_USD).toFixed(2)),
    ledger,
  });
});

// POST /points/earn { points, reason }
pointsRouter.post('/earn', async (req, res) => {
  const points = Number(req.body?.points ?? 0);
  if (!Number.isFinite(points) || points <= 0) {
    return res.status(400).json({ error: 'points must be a positive number' });
  }
  const balance = await awardPoints(req.user!.id, Math.round(points), String(req.body?.reason ?? 'Earned points'));
  return res.json({ ok: true, balance });
});

// POST /points/redeem { points, reason }
pointsRouter.post('/redeem', async (req, res) => {
  const points = Number(req.body?.points ?? 0);
  if (!Number.isFinite(points) || points <= 0) {
    return res.status(400).json({ error: 'points must be a positive number' });
  }
  try {
    const balance = await awardPoints(
      req.user!.id,
      -Math.round(points),
      String(req.body?.reason ?? 'Redeemed points'),
    );
    return res.json({ ok: true, balance, dollarValue: Number((points * POINT_VALUE_USD).toFixed(2)) });
  } catch (err) {
    const status = (err as { status?: number }).status ?? 500;
    return res.status(status).json({ error: (err as Error).message });
  }
});
