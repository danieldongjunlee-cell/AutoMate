/**
 * Car Images API (https://carimagesapi.com) lookup with a 24h in-memory cache.
 *
 * The public key (`CAR_IMAGES_API_KEY`, "ci_…") and the optional server secret
 * (`CAR_IMAGES_API_SECRET`) are read from the environment here and never leave
 * the server: the client only ever receives `{ url }`.
 *
 * Endpoint per the CarImages docs: `POST /api/v1/signed-urls` with the key,
 * make / model / year (+ trim, angle) — the secret goes in the `X-Api-Secret`
 * header so domain verification is bypassed for server-side calls. The
 * response carries one or more signed image URLs; we take the first one. The
 * response is parsed defensively (any `url`-like string field) so a field
 * rename upstream degrades to "no image" rather than a crash.
 */

export interface CarImageQuery {
  year: string;
  make: string;
  model: string;
  trim?: string;
}

export interface CarImageDeps {
  fetch: typeof fetch;
  now: () => number;
  apiKey?: string;
  apiSecret?: string;
  /** Override the upstream origin (tests / staging). */
  baseUrl?: string;
}

export const CAR_IMAGE_TTL_MS = 24 * 60 * 60 * 1000;
const DEFAULT_BASE = 'https://carimagesapi.com';

interface CacheEntry {
  url: string | null;
  expires: number;
}

const cache = new Map<string, CacheEntry>();

export function resetCarImageCache() {
  cache.clear();
}

export function cacheKey(q: CarImageQuery) {
  return [q.year, q.make, q.model].map((s) => s.trim().toLowerCase()).join('|');
}

/** Pull the first http(s) URL out of an arbitrary JSON payload, preferring `url`-ish keys. */
export function extractImageUrl(payload: unknown): string | null {
  const preferred = ['signed_url', 'signedUrl', 'url', 'image_url', 'imageUrl', 'src'];
  const seen = new Set<unknown>();
  const walk = (v: unknown, depth: number): string | null => {
    if (depth > 6 || v == null) return null;
    if (typeof v === 'string') return /^https?:\/\//i.test(v) ? v : null;
    if (typeof v !== 'object' || seen.has(v)) return null;
    seen.add(v);
    if (Array.isArray(v)) {
      for (const item of v) {
        const hit = walk(item, depth + 1);
        if (hit) return hit;
      }
      return null;
    }
    const obj = v as Record<string, unknown>;
    for (const k of preferred) {
      const hit = walk(obj[k], depth + 1);
      if (hit) return hit;
    }
    for (const k of Object.keys(obj)) {
      if (preferred.includes(k)) continue;
      const hit = walk(obj[k], depth + 1);
      if (hit) return hit;
    }
    return null;
  };
  return walk(payload, 0);
}

/**
 * Resolve the image URL for a car. Returns `null` when the key is missing,
 * the upstream call fails, or no URL is found — the client then shows its
 * drawn silhouette. Results (including misses) are cached for 24h.
 */
export async function getCarImageUrl(q: CarImageQuery, deps: CarImageDeps): Promise<string | null> {
  const key = cacheKey(q);
  const hit = cache.get(key);
  const now = deps.now();
  if (hit && hit.expires > now) return hit.url;

  const apiKey = deps.apiKey;
  if (!apiKey) return null;

  let url: string | null = null;
  try {
    const body: Record<string, string> = {
      api_key: apiKey,
      make: q.make.trim(),
      model: q.model.trim(),
      year: q.year.trim(),
      angle: 'side',
      format: 'png',
    };
    if (q.trim?.trim()) body.trim = q.trim.trim();
    const res = await deps.fetch(`${(deps.baseUrl ?? DEFAULT_BASE).replace(/\/+$/, '')}/api/v1/signed-urls`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(deps.apiSecret ? { 'X-Api-Secret': deps.apiSecret } : {}),
      },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      url = extractImageUrl(await res.json());
    }
  } catch {
    url = null;
  }
  cache.set(key, { url, expires: now + CAR_IMAGE_TTL_MS });
  return url;
}

/** Validate the query string once, shared by the Express route and the Vercel function. */
export function parseCarImageQuery(query: Record<string, unknown>): CarImageQuery | null {
  const str = (v: unknown) => (typeof v === 'string' ? v.trim() : Array.isArray(v) && typeof v[0] === 'string' ? v[0].trim() : '');
  const year = str(query.year);
  const make = str(query.make);
  const model = str(query.model);
  const trim = str(query.trim);
  if (!/^\d{4}$/.test(year) || !make || !model) return null;
  return { year, make, model, trim: trim || undefined };
}
