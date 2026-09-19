/**
 * Vercel serverless function: GET /api/car-image?year=&make=&model=&trim=
 *
 * The web app on Vercel is a static export, so this thin wrapper runs the
 * same lookup as the Express route (server/src/routes/carImage.ts) on the
 * same origin. Set CAR_IMAGES_API_KEY (and optionally CAR_IMAGES_API_SECRET)
 * in the Vercel project environment; the key never reaches the client.
 */
import { getCarImageUrl, parseCarImageQuery } from '../server/src/carImage';

interface Req {
  query: Record<string, unknown>;
}
interface Res {
  status: (code: number) => Res;
  setHeader: (name: string, value: string) => void;
  json: (body: unknown) => void;
}

export default async function handler(req: Req, res: Res) {
  const q = parseCarImageQuery(req.query ?? {});
  if (!q) {
    res.status(400).json({ url: null, error: 'year (4 digits), make and model are required' });
    return;
  }
  const url = await getCarImageUrl(q, {
    fetch: globalThis.fetch,
    now: Date.now,
    apiKey: process.env.CAR_IMAGES_API_KEY,
    apiSecret: process.env.CAR_IMAGES_API_SECRET,
    baseUrl: process.env.CAR_IMAGES_API_URL,
  });
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.status(200).json({ url });
}
