/** Real vehicles service (server /profile/vehicles) — mirrors services/mock/vehiclesService. */
import { Vehicle, VehicleInput } from '../mock/vehiclesService';
import { request } from './client';

/** Raw vehicles row (nullable text columns; no lastService column yet). */
interface ServerVehicle {
  id: string;
  name: string;
  colorName: string | null;
  vin: string | null;
  odometerMi: number;
  oilSpec: string | null;
  isPrimary: boolean;
}

const toVehicle = (v: ServerVehicle): Vehicle => ({
  id: v.id,
  name: v.name,
  colorName: v.colorName ?? '',
  vin: v.vin ?? '',
  odometerMi: v.odometerMi,
  oilSpec: v.oilSpec ?? '',
  lastService: '—',
  isPrimary: v.isPrimary,
});

export const vehiclesService = {
  async listVehicles(): Promise<Vehicle[]> {
    return (await request<ServerVehicle[]>('/profile/vehicles')).map(toVehicle);
  },

  async addVehicle(input: VehicleInput): Promise<{ ok: boolean; vehicle: Vehicle }> {
    const r = await request<{ ok: boolean; vehicle: ServerVehicle }>('/profile/vehicles', {
      body: input,
    });
    return { ok: r.ok, vehicle: toVehicle(r.vehicle) };
  },

  async updateVehicle(
    id: string,
    patch: Partial<VehicleInput>,
  ): Promise<{ ok: boolean; vehicle: Vehicle }> {
    const r = await request<{ ok: boolean; vehicle: ServerVehicle }>(
      `/profile/vehicles/${id}`,
      { method: 'PUT', body: patch },
    );
    return { ok: r.ok, vehicle: toVehicle(r.vehicle) };
  },

  async removeVehicle(id: string): Promise<{ ok: boolean }> {
    return request<{ ok: boolean }>(`/profile/vehicles/${id}`, { method: 'DELETE' });
  },
};
