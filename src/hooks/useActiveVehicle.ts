import { useQuery } from '@tanstack/react-query';

import { Vehicle, vehiclesService } from '../services';
import { useAppStore } from '../store/useAppStore';

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
  const { data: vehicles } = useQuery({
    queryKey: ['vehicles'],
    queryFn: vehiclesService.listVehicles,
  });
  const list = vehicles ?? [];
  const active = list.find((v) => v.id === activeId) ?? list.find((v) => v.isPrimary) ?? list[0];
  return { vehicles: list, active, brand: active ? brandOf(active.name) : 'your car' };
}
