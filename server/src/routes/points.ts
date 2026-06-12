import { Router } from 'express';

import { EARN_RULES, POINT_VALUE_USD } from '../config';
import { awardPoints, prisma } from '../db';

export const pointsRouter = Router();

const CHECK_IN_REASON = 'Daily check-in';

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

// POST /points/check-in → award the daily check-in once per calendar day
// (idempotent: repeat calls the same day return awarded:false).
pointsRouter.post('/check-in', async (req, res) => {
  const userId = req.user!.id;
  const entries = await prisma.pointsLedgerEntry.findMany({
    where: { userId, reason: CHECK_IN_REASON },
    select: { createdAt: true },
  });
  const days = new Set(entries.map((e) => e.createdAt.toDateString()));
  const alreadyToday = days.has(new Date().toDateString());

  // Consecutive-day streak ending today (today's check-in counts as day N).
  let streakDay = 1;
  const cursor = new Date();
  for (;;) {
    cursor.setDate(cursor.getDate() - 1);
    if (!days.has(cursor.toDateString())) break;
    streakDay += 1;
  }

  if (alreadyToday) {
    const agg = await prisma.pointsLedgerEntry.aggregate({
      where: { userId },
      _sum: { delta: true },
    });
    return res.json({
      ok: true,
      awarded: false,
      pointsEarned: 0,
      streakDay,
      balance: agg._sum.delta ?? 0,
    });
  }

  const balance = await awardPoints(userId, EARN_RULES.dailyCheckIn, CHECK_IN_REASON);
  return res.json({
    ok: true,
    awarded: true,
    pointsEarned: EARN_RULES.dailyCheckIn,
    streakDay,
    balance,
  });
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
