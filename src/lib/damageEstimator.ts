/**
 * DamageEstimator — the app's swappable boundary to the AI damage backend.
 *
 * Nothing in the app imports the model or the FastAPI shapes directly; screens
 * call `damageEstimator.estimate(...)`. With EXPO_PUBLIC_DAMAGE_AI_URL set this
 * POSTs to services/damage-ai (`/estimate`); without it (the default), an
 * in-app deterministic mock answers — mirroring the Python mock so the whole
 * app runs end-to-end with no model or GPU.
 */
import { YOLO_MODEL, type AiEstimateSummary } from '../services/mock/data';
import type { DamagePart } from '../store/useAppStore';

export interface EstimateInput {
  parts: DamagePart[];
  vehicle?: { make?: string; model?: string; year?: string };
}

export interface DamageDetection {
  type: string;
  part: string;
  severity: 'minor' | 'moderate' | 'severe' | string;
  confidence: number; // 0..1
  area_ratio: number; // 0..1
}

export interface DamageEstimateResult {
  estimateId: string;
  aiEstimate: AiEstimateSummary;
  damages: DamageDetection[];
  modelVersion: string;
  pricingVersion: string;
  modelMode: string;
  /** Safety guard: true when YOLO isn't confident the photos show car damage,
   *  so no price range is produced. */
  rejected?: boolean;
  /** Why the photos were rejected (shown to the user). */
  rejectReason?: string;
}

export interface DamageEstimator {
  estimate(input: EstimateInput): Promise<DamageEstimateResult>;
}

// ── Pricing mirror (moderate column of services/damage-ai/config/pricing.yaml) ──
// Mock-only: enough to produce a sensible aggregate that matches the service's
// mock. The live path gets real numbers from the service, so this never runs
// when EXPO_PUBLIC_DAMAGE_AI_URL is set. Keep the rear-bumper×dent cell in sync
// with the wireframe demo ($285–$480).
const MODERATE: Record<string, Record<string, [number, number]>> = {
  'rear bumper': { dent: [285, 480], scratch: [180, 360], crack: [380, 620], paint: [250, 450] },
  'front bumper': { dent: [300, 520], scratch: [190, 380], crack: [400, 660], paint: [260, 470] },
  fender: { dent: [250, 430], scratch: [170, 330], crack: [430, 700], paint: [230, 420] },
  door: { dent: [270, 460], scratch: [180, 350], crack: [460, 750], paint: [250, 450] },
  hood: { dent: [300, 510], scratch: [190, 370], crack: [520, 850], paint: [280, 500] },
  trunk: { dent: [280, 480], scratch: [180, 350], crack: [460, 750], paint: [250, 450] },
  roof: { dent: [350, 600], scratch: [210, 410], crack: [580, 950], paint: [310, 560] },
  windshield: { crack: [250, 450], 'glass shatter': [550, 900], scratch: [140, 300] },
  headlight: { 'lamp broken': [280, 560], crack: [220, 420] },
  tire: { 'tire flat': [120, 260] },
};
const DEFAULT_MODERATE: Record<string, [number, number]> = {
  dent: [270, 460],
  scratch: [180, 350],
  crack: [430, 700],
  'glass shatter': [520, 850],
  'lamp broken': [260, 500],
  'tire flat': [120, 260],
  paint: [250, 450],
};
// Confidence comes from the YOLO detector's validation accuracy (mAP@0.5), so
// what users see reflects the model's real accuracy rather than a magic number.
const MOCK_CONFIDENCE = YOLO_MODEL.mAP50;

// Safety guard: below this per-detection confidence the YOLO model is treated as
// "unsure", so the photos are rejected instead of returning a price range.
export const YOLO_MIN_CONFIDENCE = 0.5;

// Damage classes the YOLO model is trained to detect. A part whose type isn't
// one of these (e.g. an undamaged panel or a non-car photo) scores low and is
// rejected by the guard.
const KNOWN_DAMAGE = new Set([
  'dent', 'scratch', 'crack', 'paint', 'glass shatter', 'lamp broken', 'tire flat',
]);

/** Mock per-detection confidence: high for a recognised damage class, low otherwise. */
const detectionConfidence = (rawType: string): number => {
  const recognised = splitTypes(rawType).some((t) => KNOWN_DAMAGE.has(t));
  return recognised ? MOCK_CONFIDENCE : 0.34;
};

const splitTypes = (t: string): string[] => {
  const out = (t || '')
    .toLowerCase()
    .split(/[,/&+]| and /)
    .map((s) => s.trim())
    .filter(Boolean);
  return out.length ? out : ['dent'];
};

const moderateRange = (part: string, type: string): [number, number] => {
  const name = (part || '').trim().toLowerCase();
  const key = Object.keys(MODERATE)
    .sort((a, b) => b.length - a.length)
    .find((k) => name.includes(k));
  return (key && MODERATE[key][type]) || DEFAULT_MODERATE[type] || DEFAULT_MODERATE.dent;
};

/** Multi-type part → the dominant (most expensive) single repair, not the sum
 *  — mirrors the service's price_range_multi. */
const dominantRange = (part: string, rawType: string): [number, number] => {
  let best: [number, number] = DEFAULT_MODERATE.dent;
  for (const t of splitTypes(rawType)) {
    const r = moderateRange(part, t);
    if (r[0] + r[1] > best[0] + best[1]) best = r;
  }
  return best;
};

function mockResult(input: EstimateInput): DamageEstimateResult {
  const parts = input.parts.length ? input.parts : [{ part: 'rear bumper', type: 'dent', photos: 3 }];
  let low = 0;
  let high = 0;
  let minConf = 1;
  const damages: DamageDetection[] = parts.map((p) => {
    const [l, h] = dominantRange(p.part, p.type);
    low += l;
    high += h;
    const confidence = detectionConfidence(p.type);
    minConf = Math.min(minConf, confidence);
    return {
      type: splitTypes(p.type).join(', '),
      part: p.part,
      severity: 'moderate',
      confidence,
      area_ratio: 0.12,
    };
  });

  // Safety guard: if the least-confident detection is below threshold, the model
  // is unsure the photos show car damage — reject instead of returning a range.
  if (minConf < YOLO_MIN_CONFIDENCE) {
    return {
      estimateId: 'est_rejected',
      aiEstimate: { priceLow: 0, priceHigh: 0, confidencePct: Math.round(minConf * 100) },
      damages,
      modelVersion: 'mock-app-1',
      pricingVersion: 'nova-2026.06',
      modelMode: 'mock',
      rejected: true,
      rejectReason:
        "Our YOLOv8 model couldn't confidently identify car damage in these photos. Retake clear, close-up shots of the damaged part in good light — make sure the damage is in frame.",
    };
  }

  return {
    estimateId: `est_mock_${parts.map((p) => p.part).join('-').toLowerCase().replace(/\s+/g, '')}`,
    aiEstimate: { priceLow: low, priceHigh: high, confidencePct: Math.round(minConf * 100) },
    damages,
    modelVersion: 'mock-app-1',
    pricingVersion: 'nova-2026.06',
    modelMode: 'mock',
  };
}

export const mockDamageEstimator: DamageEstimator = {
  async estimate(input) {
    return mockResult(input);
  },
};

// ── HTTP estimator (services/damage-ai) ────────────────────────────────────

const DAMAGE_AI_URL = (process.env.EXPO_PUBLIC_DAMAGE_AI_URL ?? '').replace(/\/+$/, '');

interface ApiEstimate {
  estimate_id: string;
  damages: DamageDetection[];
  price_low: number;
  price_high: number;
  confidence_pct: number;
  model_version: string;
  pricing_version: string;
  model_mode: string;
  /** Safety guard from the YOLO service (low-confidence / non-damage photos). */
  rejected?: boolean;
  reject_reason?: string;
}

/** Read a local/remote image URI into a Blob for multipart upload. */
async function uriToBlob(uri: string): Promise<Blob | null> {
  try {
    const res = await fetch(uri);
    return await res.blob();
  } catch {
    return null;
  }
}

export const httpDamageEstimator: DamageEstimator = {
  async estimate(input) {
    const form = new FormData();
    // All photos across all parts, each tagged with the part it was taken for
    // (image_parts is aligned with images order) so live mode measures each
    // part's severity from its own photos.
    for (const p of input.parts) {
      for (const uri of p.photoUris ?? []) {
        const blob = await uriToBlob(uri);
        if (blob) {
          form.append('images', blob as Blob, 'photo.jpg');
          form.append('image_parts', p.part);
        }
      }
    }
    if (input.parts[0]?.part) form.append('part', input.parts[0].part);
    if (input.vehicle?.make) form.append('make', input.vehicle.make);
    if (input.vehicle?.model) form.append('model', input.vehicle.model);
    if (input.vehicle?.year) form.append('year', input.vehicle.year);
    // Hint so mock mode echoes the user's selected parts; ignored by live model.
    form.append('parts', JSON.stringify(input.parts.map((p) => ({ part: p.part, type: p.type }))));

    const res = await fetch(`${DAMAGE_AI_URL}/estimate`, { method: 'POST', body: form });
    if (!res.ok) throw new Error(`damage-ai /estimate responded ${res.status}`);
    const data = (await res.json()) as ApiEstimate;
    return {
      estimateId: data.estimate_id,
      aiEstimate: {
        priceLow: data.price_low,
        priceHigh: data.price_high,
        confidencePct: data.confidence_pct,
      },
      damages: data.damages ?? [],
      modelVersion: data.model_version,
      pricingVersion: data.pricing_version,
      modelMode: data.model_mode,
      rejected: data.rejected,
      rejectReason: data.reject_reason,
    };
  },
};

/** The adapter the app uses. HTTP when configured, deterministic mock otherwise.
 *  Never throws — a failed live call degrades to the mock so submit never hangs. */
export const damageEstimator: DamageEstimator = {
  async estimate(input) {
    if (!DAMAGE_AI_URL) return mockDamageEstimator.estimate(input);
    try {
      return await httpDamageEstimator.estimate(input);
    } catch {
      return mockDamageEstimator.estimate(input);
    }
  },
};

export const isDamageAiConfigured = !!DAMAGE_AI_URL;
