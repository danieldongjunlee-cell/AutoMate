/**
 * Client for services/damage-ai (FastAPI) + graceful-degrade mock fallback.
 *
 * The fallback implements the SAME deterministic scheme as the Python mock
 * engine (services/damage-ai/app/mock_engine.py): a SHA-256 hash of
 * part | damage_type | sorted per-image digests, mapped through the shared
 * pricing constants below (mirror of services/damage-ai/config/pricing.yaml).
 * Identical inputs therefore produce identical numbers whether the service
 * answered or the server degraded — and /quotes/submit can never 500 because
 * the AI service is down. Keep the two tables in sync when editing.
 */
import { createHash } from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';

import { DAMAGE_AI_URL } from './config';
import { uploadsRoot } from './storage';

export type SeverityBucket = 'minor' | 'moderate' | 'severe';

export interface AiEstimate {
  part: string;
  damageType: string;
  severity: number; // 0..1
  severityLabel: SeverityBucket;
  priceLow: number;
  priceHigh: number;
  confidencePct: number;
  modelMode: string; // 'mock' | 'yolo' | 'mock-fallback' (service unreachable)
}

export interface AiReceipt {
  vendor: string;
  date: string;
  serviceType: string;
  lineItems: { desc: string; amount: number }[];
  total: number;
  mileage: string;
  modelMode: string;
}

export interface AiInsuranceCard {
  provider: string;
  policyNumber: string;
  deductible: number;
  premiumPerYear: number;
  coverageType: string;
  renewalDate: string;
  modelMode: string;
}

// ── Shared pricing constants (mirror of config/pricing.yaml) ─────────────

type Range = [number, number];
type TypeTable = Record<string, Record<SeverityBucket, Range>>;

const PRICING_PARTS: Record<string, TypeTable> = {
  'rear bumper': {
    dent: { minor: [140, 260], moderate: [285, 480], severe: [520, 980] },
    scratch: { minor: [90, 180], moderate: [180, 360], severe: [380, 700] },
    crack: { minor: [220, 380], moderate: [380, 620], severe: [650, 1100] },
    paint: { minor: [120, 240], moderate: [250, 450], severe: [480, 850] },
  },
  'front bumper': {
    dent: { minor: [150, 280], moderate: [300, 520], severe: [550, 1050] },
    scratch: { minor: [90, 190], moderate: [190, 380], severe: [400, 720] },
    crack: { minor: [240, 400], moderate: [400, 660], severe: [700, 1200] },
    paint: { minor: [130, 250], moderate: [260, 470], severe: [500, 880] },
  },
  fender: {
    dent: { minor: [120, 230], moderate: [250, 430], severe: [480, 900] },
    scratch: { minor: [80, 170], moderate: [170, 330], severe: [350, 650] },
    crack: { minor: [260, 430], moderate: [430, 700], severe: [750, 1300] },
    paint: { minor: [110, 220], moderate: [230, 420], severe: [450, 800] },
  },
  door: {
    dent: { minor: [130, 250], moderate: [270, 460], severe: [500, 950] },
    scratch: { minor: [85, 180], moderate: [180, 350], severe: [370, 680] },
    crack: { minor: [280, 460], moderate: [460, 750], severe: [800, 1400] },
    paint: { minor: [120, 240], moderate: [250, 450], severe: [480, 850] },
  },
  hood: {
    dent: { minor: [150, 280], moderate: [300, 510], severe: [550, 1000] },
    scratch: { minor: [90, 190], moderate: [190, 370], severe: [390, 700] },
    crack: { minor: [320, 520], moderate: [520, 850], severe: [900, 1600] },
    paint: { minor: [140, 270], moderate: [280, 500], severe: [530, 950] },
  },
  trunk: {
    dent: { minor: [140, 260], moderate: [280, 480], severe: [520, 960] },
    scratch: { minor: [85, 180], moderate: [180, 350], severe: [370, 680] },
    crack: { minor: [280, 460], moderate: [460, 750], severe: [800, 1400] },
    paint: { minor: [120, 240], moderate: [250, 450], severe: [480, 850] },
  },
  roof: {
    dent: { minor: [180, 330], moderate: [350, 600], severe: [650, 1250] },
    scratch: { minor: [100, 210], moderate: [210, 410], severe: [430, 780] },
    crack: { minor: [350, 580], moderate: [580, 950], severe: [1000, 1800] },
    paint: { minor: [160, 300], moderate: [310, 560], severe: [600, 1100] },
  },
  windshield: {
    dent: { minor: [180, 320], moderate: [320, 550], severe: [600, 1100] },
    scratch: { minor: [60, 140], moderate: [140, 300], severe: [320, 600] },
    crack: { minor: [80, 160], moderate: [250, 450], severe: [480, 900] },
    paint: { minor: [60, 140], moderate: [140, 300], severe: [320, 600] },
  },
  'rear window': {
    dent: { minor: [160, 300], moderate: [300, 520], severe: [560, 1050] },
    scratch: { minor: [60, 140], moderate: [140, 290], severe: [310, 580] },
    crack: { minor: [80, 160], moderate: [230, 420], severe: [450, 850] },
    paint: { minor: [60, 140], moderate: [140, 290], severe: [310, 580] },
  },
};

const PRICING_DEFAULT: TypeTable = {
  dent: { minor: [130, 250], moderate: [270, 460], severe: [500, 950] },
  scratch: { minor: [85, 180], moderate: [180, 350], severe: [370, 680] },
  crack: { minor: [260, 430], moderate: [430, 700], severe: [750, 1300] },
  paint: { minor: [120, 240], moderate: [250, 450], severe: [480, 850] },
};

const DAMAGE_TYPES = ['dent', 'scratch', 'crack', 'paint'];
const CONFIDENCE_BASE = 80;
const CONFIDENCE_SPREAD = 16;

const normalizeType = (t: string) => {
  const dt = t.trim().toLowerCase();
  return DAMAGE_TYPES.includes(dt) ? dt : 'dent';
};

const severityBucket = (score: number): SeverityBucket =>
  score < 0.33 ? 'minor' : score < 0.66 ? 'moderate' : 'severe';

const priceRange = (part: string, damageType: string, bucket: SeverityBucket): Range => {
  const name = part.trim().toLowerCase();
  const key = Object.keys(PRICING_PARTS)
    .sort((a, b) => b.length - a.length)
    .find((k) => name.includes(k));
  const rows = key ? PRICING_PARTS[key] : PRICING_DEFAULT;
  const byType = rows[normalizeType(damageType)] ?? PRICING_DEFAULT.dent;
  return byType[bucket];
};

// ── Deterministic mock (same scheme as the Python mock engine) ───────────

const stableHash = (part: string, damageType: string, images: Buffer[]): bigint => {
  const h = createHash('sha256');
  h.update(part.trim().toLowerCase(), 'utf8');
  h.update('|');
  h.update(normalizeType(damageType), 'utf8');
  const digests = images
    .map((b) => createHash('sha256').update(b).digest())
    .sort(Buffer.compare);
  for (const d of digests) h.update(d);
  return h.digest().readBigUInt64BE(0);
};

export function mockEstimate(part: string, damageType: string, images: Buffer[]): AiEstimate {
  const h = stableHash(part, damageType, images);
  const severity = Number(h % 1000n) / 1000;
  const severityLabel = severityBucket(severity);
  const [priceLow, priceHigh] = priceRange(part, damageType, severityLabel);
  const confidencePct = CONFIDENCE_BASE + Number((h >> 16n) % BigInt(CONFIDENCE_SPREAD));
  return {
    part,
    damageType: normalizeType(damageType),
    severity: Math.round(severity * 100) / 100,
    severityLabel,
    priceLow,
    priceHigh,
    confidencePct,
    modelMode: 'mock-fallback',
  };
}

/** Canonical demo receipt — matches the app's SCANNED_RECEIPT mock. */
export const MOCK_RECEIPT: AiReceipt = {
  vendor: 'AutoFix Pro',
  date: 'Mar 12, 2025',
  serviceType: 'Oil change — synthetic',
  lineItems: [
    { desc: 'Full synthetic oil change (0W-20)', amount: 39 },
    { desc: 'Oil filter + disposal fee', amount: 10 },
  ],
  total: 49,
  mileage: '44,500 mi',
  modelMode: 'mock-fallback',
};

/** Canonical demo insurance card — matches the seeded State Farm policy and
 * the Python mock (services/damage-ai/app/mock_engine.py MOCK_INSURANCE_CARD). */
export const MOCK_INSURANCE_CARD: AiInsuranceCard = {
  provider: 'State Farm',
  policyNumber: 'SF-8847234',
  deductible: 500,
  premiumPerYear: 1200,
  coverageType: 'Comprehensive + Collision',
  renewalDate: 'Aug 15, 2027',
  modelMode: 'mock-fallback',
};

// ── Photo loading ─────────────────────────────────────────────────────────

/** 1x1 grey PNG used when a request has no stored photo files (the RN camera
 * is still simulated) — keeps the AI input, and therefore the hash, stable. */
const PLACEHOLDER_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGNoaGgAAAMEAYHB3o1bAAAAAElFTkSuQmCC',
  'base64',
);

/** Read stored upload refs from disk; pad with placeholders up to minCount. */
async function loadPhotoBuffers(photoRefs: string[], minCount: number): Promise<Buffer[]> {
  const buffers: Buffer[] = [];
  for (const ref of photoRefs) {
    const abs = path.resolve(uploadsRoot, ref);
    if (!abs.startsWith(uploadsRoot + path.sep)) continue; // no path escapes
    try {
      buffers.push(await fs.readFile(abs));
    } catch {
      // missing/unreadable upload — skip, placeholders cover the gap
    }
  }
  while (buffers.length < Math.max(1, minCount)) buffers.push(PLACEHOLDER_PNG);
  return buffers;
}

// ── Service calls (with fallback) ─────────────────────────────────────────

const AI_TIMEOUT_MS = 5000;

/**
 * Estimate one damaged part from its photos via the damage-ai service.
 * Never throws: an unreachable/broken service logs a warning and answers
 * with the deterministic TS mock instead.
 */
export async function estimateDamage(
  part: { part: string; type: string; photos: number },
  photoRefs: string[],
): Promise<AiEstimate> {
  const images = await loadPhotoBuffers(photoRefs, part.photos);
  try {
    const form = new FormData();
    form.append('part', part.part);
    form.append('damage_type', part.type);
    images.forEach((buf, i) =>
      form.append('images', new Blob([new Uint8Array(buf)], { type: 'image/png' }), `photo-${i}.png`),
    );
    const res = await fetch(`${DAMAGE_AI_URL}/estimate`, {
      method: 'POST',
      body: form,
      signal: AbortSignal.timeout(AI_TIMEOUT_MS),
    });
    if (!res.ok) throw new Error(`damage-ai /estimate responded ${res.status}`);
    const data = (await res.json()) as {
      part: string;
      damage_type: string;
      severity: number;
      severity_label: SeverityBucket;
      price_low: number;
      price_high: number;
      confidence_pct: number;
      model_mode: string;
    };
    return {
      part: data.part,
      damageType: data.damage_type,
      severity: data.severity,
      severityLabel: data.severity_label,
      priceLow: data.price_low,
      priceHigh: data.price_high,
      confidencePct: data.confidence_pct,
      modelMode: data.model_mode,
    };
  } catch (err) {
    console.warn(`damage-ai unreachable (${DAMAGE_AI_URL}) — using mock fallback:`, err);
    return mockEstimate(part.part, part.type, images);
  }
}

/**
 * Extract receipt fields via the damage-ai service. Never throws — degrades
 * to the canonical mock receipt when the service is down.
 */
export async function extractReceipt(file?: { buffer: Buffer; mimeType: string }): Promise<AiReceipt> {
  const buffer = file?.buffer ?? PLACEHOLDER_PNG;
  const mimeType = file?.mimeType ?? 'image/png';
  try {
    const form = new FormData();
    const ext = mimeType === 'application/pdf' ? 'pdf' : 'png';
    form.append('file', new Blob([new Uint8Array(buffer)], { type: mimeType }), `receipt.${ext}`);
    const res = await fetch(`${DAMAGE_AI_URL}/receipt`, {
      method: 'POST',
      body: form,
      signal: AbortSignal.timeout(AI_TIMEOUT_MS),
    });
    if (!res.ok) throw new Error(`damage-ai /receipt responded ${res.status}`);
    const data = (await res.json()) as {
      vendor: string;
      date: string;
      service_type: string;
      line_items: { desc: string; amount: number }[];
      total: number;
      mileage?: string;
      model_mode: string;
    };
    return {
      vendor: data.vendor,
      date: data.date,
      serviceType: data.service_type,
      lineItems: data.line_items ?? [],
      total: data.total,
      mileage: data.mileage ?? '',
      modelMode: data.model_mode,
    };
  } catch (err) {
    console.warn(`damage-ai unreachable (${DAMAGE_AI_URL}) — using mock receipt:`, err);
    return MOCK_RECEIPT;
  }
}

/**
 * Extract insurance-card fields via the damage-ai service (the card-scan
 * autofill on prof-ins-add). Never throws — degrades to the canonical mock
 * card when the service is down.
 */
export async function extractInsuranceCard(file?: {
  buffer: Buffer;
  mimeType: string;
}): Promise<AiInsuranceCard> {
  const buffer = file?.buffer ?? PLACEHOLDER_PNG;
  const mimeType = file?.mimeType ?? 'image/png';
  try {
    const form = new FormData();
    const ext = mimeType === 'application/pdf' ? 'pdf' : 'png';
    form.append('file', new Blob([new Uint8Array(buffer)], { type: mimeType }), `card.${ext}`);
    const res = await fetch(`${DAMAGE_AI_URL}/insurance-card`, {
      method: 'POST',
      body: form,
      signal: AbortSignal.timeout(AI_TIMEOUT_MS),
    });
    if (!res.ok) throw new Error(`damage-ai /insurance-card responded ${res.status}`);
    const data = (await res.json()) as {
      provider: string;
      policy_number: string;
      deductible: number;
      premium_per_year: number;
      coverage_type: string;
      renewal_date: string;
      model_mode: string;
    };
    return {
      provider: data.provider,
      policyNumber: data.policy_number,
      deductible: data.deductible,
      premiumPerYear: data.premium_per_year,
      coverageType: data.coverage_type,
      renewalDate: data.renewal_date,
      modelMode: data.model_mode,
    };
  } catch (err) {
    console.warn(`damage-ai unreachable (${DAMAGE_AI_URL}) — using mock insurance card:`, err);
    return MOCK_INSURANCE_CARD;
  }
}
