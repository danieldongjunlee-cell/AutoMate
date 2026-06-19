import type { AiEstimateSummary } from '../services/mock/data';
import { QUOTE_REQUEST } from '../services/mock/data';
import type { DamageEstimateResult } from './damageEstimator';
import type { DamagePart } from '../store/useAppStore';
import { supabase } from './supabase';

const BUCKET = 'damage-photos';

/**
 * Upload one local image (file:// or blob:) to the damage-photos bucket.
 * Returns the storage path, or null on failure (so one bad photo doesn't sink
 * the whole save). Uses ArrayBuffer, which works on web and React Native.
 */
async function uploadPhoto(uri: string, path: string): Promise<string | null> {
  if (!supabase) return null;
  try {
    const res = await fetch(uri);
    const body = await res.arrayBuffer();
    const contentType = res.headers.get('content-type') || 'image/jpeg';
    const { error } = await supabase.storage.from(BUCKET).upload(path, body, {
      contentType,
      upsert: true,
    });
    return error ? null : path;
  } catch {
    return null;
  }
}

/**
 * Persist a submitted damage estimate: the request + AI price range + the full
 * model JSON / versions, one row per part, and each part's photos uploaded to
 * Storage (paths saved on the row). No-op when Supabase isn't configured. Safe
 * to fire-and-forget. Accepts either the full DamageEstimator result (preferred,
 * stores model_json/model_version/pricing_version) or a bare AiEstimateSummary.
 */
export async function saveDamageEstimate(
  parts: DamagePart[],
  result: DamageEstimateResult | AiEstimateSummary | null,
): Promise<void> {
  if (!supabase) return;
  const uid = (await supabase.auth.getUser()).data.user?.id;
  if (!uid) return;

  // Normalize: a full result carries aiEstimate + versions + raw model JSON.
  const full = result && 'aiEstimate' in result ? (result as DamageEstimateResult) : null;
  const estimate: AiEstimateSummary | null = full
    ? full.aiEstimate
    : (result as AiEstimateSummary | null);

  const { data: req, error } = await supabase
    .from('damage_requests')
    .insert({
      price_low: estimate?.priceLow ?? null,
      price_high: estimate?.priceHigh ?? null,
      confidence_pct: estimate?.confidencePct ?? null,
      shops_notified: QUOTE_REQUEST.shopsNotified,
      estimate_id: full?.estimateId ?? null,
      model_version: full?.modelVersion ?? null,
      pricing_version: full?.pricingVersion ?? null,
      model_json: full ?? null,
    })
    .select('id')
    .single();
  if (error || !req) return;
  const requestId = (req as { id: string }).id;

  for (let i = 0; i < parts.length; i += 1) {
    const p = parts[i];
    const uris = p.photoUris ?? [];
    const paths: string[] = [];
    for (let j = 0; j < uris.length; j += 1) {
      const stored = await uploadPhoto(uris[j], `${uid}/${requestId}/${i}_${j}.jpg`);
      if (stored) paths.push(stored);
    }
    await supabase.from('damage_parts').insert({
      request_id: requestId,
      part: p.part,
      damage_type: p.type,
      note: p.note ?? null,
      photo_count: p.photos,
      photo_paths: paths,
    });
  }
}

export interface SavedDamagePart {
  part: string;
  damageType: string | null;
  note: string | null;
  photoUrls: string[];
}

export interface SavedDamageRequest {
  id: string;
  priceLow: number | null;
  priceHigh: number | null;
  confidencePct: number | null;
  createdAt: string;
  parts: SavedDamagePart[];
}

/** Load past estimates with signed (temporary) URLs for each stored photo. */
export async function fetchDamageEstimates(): Promise<SavedDamageRequest[]> {
  if (!supabase) return [];
  const { data: reqs, error } = await supabase
    .from('damage_requests')
    .select('id, price_low, price_high, confidence_pct, created_at')
    .order('created_at', { ascending: false });
  if (error || !reqs) return [];

  const out: SavedDamageRequest[] = [];
  for (const r of reqs as {
    id: string;
    price_low: number | null;
    price_high: number | null;
    confidence_pct: number | null;
    created_at: string;
  }[]) {
    const { data: partRows } = await supabase
      .from('damage_parts')
      .select('part, damage_type, note, photo_paths')
      .eq('request_id', r.id);
    const parts: SavedDamagePart[] = [];
    for (const pr of (partRows ?? []) as {
      part: string | null;
      damage_type: string | null;
      note: string | null;
      photo_paths: string[] | null;
    }[]) {
      const paths = pr.photo_paths ?? [];
      let photoUrls: string[] = [];
      if (paths.length) {
        const { data: signed } = await supabase.storage.from(BUCKET).createSignedUrls(paths, 3600);
        photoUrls = (signed ?? []).map((s) => s.signedUrl).filter(Boolean) as string[];
      }
      parts.push({ part: pr.part ?? '', damageType: pr.damage_type, note: pr.note, photoUrls });
    }
    out.push({
      id: r.id,
      priceLow: r.price_low,
      priceHigh: r.price_high,
      confidencePct: r.confidence_pct,
      createdAt: r.created_at,
      parts,
    });
  }
  return out;
}
