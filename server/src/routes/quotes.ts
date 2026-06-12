import { Router } from 'express';

import { awardPoints, prisma } from '../db';
import { isAfterHours } from '../staticData';

export const quotesRouter = Router();

const toApiQuote = (q: {
  id: string;
  dealerId: string;
  price: number;
  priceHigh: number | null;
  note: string;
  parts: string;
  pinTop: number;
  pinLeft: number;
  tier: string;
}) => ({
  id: q.id,
  dealerId: q.dealerId,
  price: q.price,
  ...(q.priceHigh != null ? { priceHigh: q.priceHigh } : {}),
  note: q.note,
  parts: q.parts as 'OEM' | 'Aftermarket',
  pin: { top: q.pinTop, left: q.pinLeft },
  tier: q.tier as 'best' | 'recommended' | 'other',
});

// GET /quotes/request — summary card for the latest damage request
quotesRouter.get('/request', async (req, res) => {
  const request = await prisma.damageRequest.findFirst({
    where: { userId: req.user!.id },
    orderBy: { createdAt: 'desc' },
    include: { quotes: true },
  });
  if (!request) return res.status(404).json({ error: 'No damage request yet' });

  const prices = request.quotes.map((q) => q.priceHigh ?? q.price);
  const lows = request.quotes.map((q) => q.price);
  return res.json({
    id: request.id,
    title: request.title,
    shopsNotified: request.shopsNotified,
    quotesReceived: request.quotes.length,
    newQuotes: request.quotes.filter((q) => q.status === 'new').length,
    priceRange: {
      low: lows.length ? Math.min(...lows) : (request.aiPriceLow ?? 0),
      high: prices.length ? Math.max(...prices) : (request.aiPriceHigh ?? 0),
    },
    aiConfidencePct: Math.round((request.aiConfidence ?? 0) * 100),
    city: request.city ?? 'Fairfax, VA',
  });
});

// GET /quotes — quotes on the latest damage request, cheapest first
quotesRouter.get('/', async (req, res) => {
  const request = await prisma.damageRequest.findFirst({
    where: { userId: req.user!.id },
    orderBy: { createdAt: 'desc' },
    include: { quotes: { orderBy: { price: 'asc' } } },
  });
  return res.json((request?.quotes ?? []).map(toApiQuote));
});

// POST /quotes/submit { parts: [{ part, type, photos }], photoRefs? }
quotesRouter.post('/submit', async (req, res) => {
  const parts: { part: string; type: string; photos: number }[] = req.body?.parts ?? [];
  if (!Array.isArray(parts) || parts.length === 0) {
    return res.status(400).json({ error: 'At least one damaged part is required' });
  }
  const afterHours = isAfterHours();
  const shopsNotified = 12;
  await prisma.damageRequest.create({
    data: {
      userId: req.user!.id,
      title: parts.map((p) => `${p.part} ${p.type.toLowerCase()}`).join(', '),
      city: 'Fairfax, VA',
      parts,
      photoRefs: Array.isArray(req.body?.photoRefs) ? req.body.photoRefs.map(String) : [],
      shopsNotified,
      afterHours,
      status: 'open',
    },
  });
  const pointsEarned = 20; // "Submit damage photos" (s-prof-earn)
  await awardPoints(req.user!.id, pointsEarned, 'Submit damage photos');
  return res.json({
    shopsNotified,
    etaHours: '1–3',
    submittedAt: new Date().toISOString(),
    afterHours,
    pointsEarned,
  });
});

// POST /quotes/:id/accept
quotesRouter.post('/:id/accept', async (req, res) => {
  const quote = await prisma.quote.findFirst({
    where: { id: req.params.id, damageRequest: { userId: req.user!.id } },
  });
  if (!quote) return res.status(404).json({ error: 'Quote not found' });
  await prisma.quote.update({ where: { id: quote.id }, data: { status: 'accepted' } });
  return res.json({ ok: true, quoteId: quote.id });
});
