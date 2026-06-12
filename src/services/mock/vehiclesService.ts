import { VEHICLE } from './data';
import { delay } from './delay';

/** App-level vehicle shape (mirror of the server's vehicles rows). */
export interface Vehicle {
  id: string;
  name: string;
  colorName: string;
  vin: string;
  odometerMi: number;
  oilSpec: string;
  lastService: string;
  isPrimary: boolean;
}

export interface VehicleInput {
  name: string;
  colorName?: string;
  vin?: string;
  odometerMi?: number;
  oilSpec?: string;
}

/** Module-state vehicle list seeded with the Accord, so prof-cars CRUD
 * survives navigation (user-feedback pass 1). */
let vehicles: Vehicle[] = [
  {
    id: 'veh-accord',
    name: VEHICLE.name,
    colorName: VEHICLE.colorName,
    vin: VEHICLE.vin,
    odometerMi: VEHICLE.odometerMi,
    oilSpec: VEHICLE.oilSpec,
    lastService: VEHICLE.lastService,
    isPrimary: true,
  },
];
let nextId = 1;

export const vehiclesService = {
  async listVehicles(): Promise<Vehicle[]> {
    await delay(250);
    return vehicles.map((v) => ({ ...v }));
  },

  async addVehicle(input: VehicleInput): Promise<{ ok: boolean; vehicle: Vehicle }> {
    await delay(450);
    const vehicle: Vehicle = {
      id: `veh-new-${nextId++}`,
      name: input.name,
      colorName: input.colorName ?? '',
      vin: input.vin ?? '',
      odometerMi: input.odometerMi ?? 0,
      oilSpec: input.oilSpec ?? '',
      lastService: '—',
      isPrimary: vehicles.length === 0,
    };
    vehicles = [...vehicles, vehicle];
    return { ok: true, vehicle };
  },

  async updateVehicle(
    id: string,
    patch: Partial<VehicleInput>,
  ): Promise<{ ok: boolean; vehicle: Vehicle }> {
    await delay(450);
    const idx = vehicles.findIndex((v) => v.id === id);
    if (idx < 0) throw new Error('Vehicle not found');
    const vehicle = { ...vehicles[idx], ...patch };
    vehicles = [...vehicles.slice(0, idx), vehicle, ...vehicles.slice(idx + 1)];
    return { ok: true, vehicle };
  },

  async removeVehicle(id: string): Promise<{ ok: boolean }> {
    await delay(350);
    vehicles = vehicles.filter((v) => v.id !== id);
    return { ok: true };
  },
};
