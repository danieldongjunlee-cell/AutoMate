import { useQuery } from '@tanstack/react-query';
import { Platform } from 'react-native';

import { API_URL } from './api/client';
import { brandOf, modelOf } from '../hooks/useActiveVehicle';

/** "2019 Honda Accord EX-L" → { year: '2019', make: 'Honda', model: 'Accord', trim: 'EX-L' } */
export function carImageParams(name: string): { year: string; make: string; model: string; trim?: string } | null {
  const year = name.trim().match(/^(\d{4})\b/)?.[1];
  if (!year) return null;
  const make = brandOf(name);
  const rest = modelOf(name, make).trim();
  if (!rest || rest === name) return null;
  const [model, ...trimParts] = rest.split(/\s+/);
  return { year, make, model, trim: trimParts.join(' ') || undefined };
}

/**
 * Ask our API for the car's photo. The Car Images key lives server-side; the
 * app only sees `{ url }`. On web with no EXPO_PUBLIC_API_URL the call is
 * same-origin (`/api/car-image`, the Vercel function); on native it needs
 * the server URL, otherwise we skip the call and show the silhouette.
 */
export async function fetchCarImageUrl(name: string): Promise<string | null> {
  const p = carImageParams(name);
  if (!p) return null;
  if (!API_URL && Platform.OS !== 'web') return null;
  const qs = new URLSearchParams({ year: p.year, make: p.make, model: p.model, ...(p.trim ? { trim: p.trim } : {}) });
  try {
    const res = await fetch(`${API_URL}/api/car-image?${qs.toString()}`, { headers: { Accept: 'application/json' } });
    if (!res.ok) return null;
    const data = (await res.json()) as { url?: unknown };
    return typeof data.url === 'string' && data.url ? data.url : null;
  } catch {
    return null;
  }
}

/** Cached per car name for the session (the server caches upstream for 24h). */
export function useCarImage(name: string | undefined) {
  return useQuery({
    queryKey: ['car-image', name ?? ''],
    queryFn: () => fetchCarImageUrl(name ?? ''),
    enabled: !!name,
    staleTime: 24 * 60 * 60 * 1000,
    retry: false,
  });
}
