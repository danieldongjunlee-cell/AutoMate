import { Router } from 'express';

import { getCarImageUrl, parseCarImageQuery } from '../carImage';

export const carImageRouter = Router();

// GET /api/car-image?year=&make=&model=&trim= → { url } (url null on any failure).
// Public: it never exposes the upstream key, only a (signed, expiring) image URL.
carImageRouter.get('/', async (req, res) => {
  const q = parseCarImageQuery(req.query as Record<string, unknown>);
  if (!q) return res.status(400).json({ url: null, error: 'year (4 digits), make and model are required' });
  const url = await getCarImageUrl(q, {
    fetch: globalThis.fetch,
    now: Date.now,
    apiKey: process.env.CAR_IMAGES_API_KEY,
    apiSecret: process.env.CAR_IMAGES_API_SECRET,
    baseUrl: process.env.CAR_IMAGES_API_URL,
  });
  res.setHeader('Cache-Control', 'public, max-age=3600');
  return res.json({ url });
});
