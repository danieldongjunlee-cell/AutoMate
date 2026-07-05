import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

import { Vehicle, vehiclesService } from '../services';
import { VehicleType } from '../services/mock/data';
import { useAppStore } from '../store/useAppStore';

// Model keywords → vehicle-size bucket (used to auto-pick brake pricing, etc.).
const TYPE_KEYWORDS: [VehicleType, string[]][] = [
  ['Truck', ['f-150', 'f150', 'f-250', 'silverado', 'sierra', 'ram', 'tacoma', 'tundra', 'ranger', 'colorado', 'frontier', 'ridgeline', 'gladiator', 'titan', 'canyon', 'maverick']],
  ['SUV', ['rav4', 'cr-v', 'crv', 'sportage', 'telluride', 'cx-5', 'cx5', 'cx-50', 'cx-90', 'outback', 'pilot', 'highlander', 'explorer', 'tahoe', 'suburban', 'equinox', 'rogue', 'pathfinder', 'sorento', 'santa fe', 'tucson', '4runner', 'wrangler', 'cherokee', 'forester', 'ascent', 'palisade', 'seltos', 'kona', 'bronco', 'escape', 'edge', 'traverse', 'atlas', 'tiguan', 'murano', 'blazer', 'trailblazer', 'venza', 'crosstrek']],
  ['Performance', ['mustang', 'corvette', 'gt-r', 'gtr', ' m3', ' m4', ' m5', 'amg', '911', 'camaro', 'srt', 'type r', 'gti', 'wrx', 'sti', 'supra', '370z', '350z', ' z ', 'civic si']],
  ['Small Car', ['civic', 'corolla', 'sentra', 'elantra', 'forte', 'rio', 'versa', 'fit', 'yaris', 'mirage', 'accent', 'sonic', 'spark', 'golf', 'mazda3', 'mazda 3', 'impreza']],
  ['Sedan', ['accord', 'camry', 'altima', 'sonata', 'optima', 'k5', 'maxima', 'legacy', 'mazda6', 'mazda 6', 'passat', 'jetta', 'malibu', 'fusion', 'avalon', 'es ', 'tlx', 'stinger', 'arteon', 'charger', '300']],
];

/** Best-guess vehicle-size bucket from the car name (null if unknown). */
export function vehicleTypeOf(name: string): VehicleType | null {
  const n = ` ${name.toLowerCase()} `;
  for (const [type, keys] of TYPE_KEYWORDS) {
    if (keys.some((k) => n.includes(k))) return type;
  }
  return null;
}

const KNOWN_BRANDS = [
  'Honda', 'Toyota', 'Subaru', 'Ford', 'Chevrolet', 'Nissan', 'Mazda', 'Hyundai',
  'Kia', 'BMW', 'Mercedes', 'Audi', 'Volkswagen', 'Tesla', 'Jeep', 'Lexus', 'Acura',
  'GMC', 'Ram', 'Dodge', 'Volvo', 'Porsche',
];

/** Pull the make out of a vehicle name ("2019 Honda Accord EX-L" → "Honda"). */
export function brandOf(name: string): string {
  const found = KNOWN_BRANDS.find((b) => name.toLowerCase().includes(b.toLowerCase()));
  if (found) return found;
  const parts = name.trim().split(/\s+/);
  // After a leading year, the make is usually the next token.
  return /^\d{4}$/.test(parts[0]) ? parts[1] ?? parts[0] : parts[0] ?? 'your car';
}

const BRAND_DOMAIN: Record<string, string> = {
  Honda: 'honda.com', Toyota: 'toyota.com', Subaru: 'subaru.com', Ford: 'ford.com',
  Chevrolet: 'chevrolet.com', Nissan: 'nissanusa.com', Mazda: 'mazdausa.com',
  Hyundai: 'hyundaiusa.com', Kia: 'kia.com', BMW: 'bmwusa.com', Mercedes: 'mbusa.com',
  Audi: 'audiusa.com', Volkswagen: 'vw.com', Tesla: 'tesla.com', Jeep: 'jeep.com',
  Lexus: 'lexus.com', Acura: 'acura.com', GMC: 'gmc.com', Ram: 'ramtrucks.com',
  Dodge: 'dodge.com', Volvo: 'volvocars.com', Porsche: 'porsche.com',
};

/** Real brand logo via the Clearbit logo CDN (null if brand unknown). */
export function brandLogoUrl(brand: string): string | null {
  const domain = BRAND_DOMAIN[brand];
  return domain ? `https://logo.clearbit.com/${domain}` : null;
}

/** Strip the leading year + brand from a vehicle name → the model/trim. */
export function modelOf(name: string, brand: string): string {
  return name.replace(new RegExp(`^\\d{4}\\s+${brand}\\s+`, 'i'), '').trim() || name;
}

export interface ActiveVehicle {
  vehicles: Vehicle[];
  active: Vehicle | undefined;
  brand: string;
}

/**
 * The car currently in focus across the app: the user-selected `activeVehicleId`
 * if set, else the primary vehicle, else the first. Switching it (setActiveVehicle)
 * re-renders every consumer, so brand/insurance context follows the selection.
 */
export function useActiveVehicle(): ActiveVehicle {
  const activeId = useAppStore((s) => s.activeVehicleId);
  const setActiveVehicle = useAppStore((s) => s.setActiveVehicle);
  const { data: vehicles } = useQuery({
    queryKey: ['vehicles'],
    queryFn: vehiclesService.listVehicles,
  });
  const list = vehicles ?? [];
  const active = list.find((v) => v.id === activeId) ?? list.find((v) => v.isPrimary) ?? list[0];

  // Pin the active id to the resolved primary once vehicles load, so the
  // per-car damage/quotes snapshots key consistently (no null bucket).
  useEffect(() => {
    if (!activeId && active) setActiveVehicle(active.id);
  }, [activeId, active, setActiveVehicle]);

  return { vehicles: list, active, brand: active ? brandOf(active.name) : 'your car' };
}
