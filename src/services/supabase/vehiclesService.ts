import { supabase } from '../../lib/supabase';
import {
  Vehicle,
  VehicleInput,
  vehiclesService as mockVehiclesService,
} from '../mock/vehiclesService';

/** Raw public.vehicles row (snake_case) → mapped to the app's Vehicle shape. */
interface Row {
  id: string;
  name: string;
  color_name: string | null;
  vin: string | null;
  odometer_mi: number | null;
  oil_spec: string | null;
  last_service: string | null;
  is_primary: boolean | null;
}

const COLS = 'id, name, color_name, vin, odometer_mi, oil_spec, last_service, is_primary';

const toVehicle = (r: Row): Vehicle => ({
  id: r.id,
  name: r.name,
  colorName: r.color_name ?? '',
  vin: r.vin ?? '',
  odometerMi: r.odometer_mi ?? 0,
  oilSpec: r.oil_spec ?? '',
  lastService: r.last_service ?? '—',
  isPrimary: r.is_primary ?? false,
});

function client() {
  if (!supabase) throw new Error('Supabase is not configured.');
  return supabase;
}

/**
 * Supabase-backed twin of the mock vehiclesService (pinned to its signature via
 * `typeof mockVehiclesService`). user_id is filled by the column default
 * (auth.uid()), and RLS keeps each user to their own rows.
 */
export const vehiclesService: typeof mockVehiclesService = {
  async listVehicles(): Promise<Vehicle[]> {
    const { data, error } = await client()
      .from('vehicles')
      .select(COLS)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return (data as Row[]).map(toVehicle);
  },

  async addVehicle(input: VehicleInput): Promise<{ ok: boolean; vehicle: Vehicle }> {
    const c = client();
    // First car becomes primary.
    const { count } = await c.from('vehicles').select('id', { count: 'exact', head: true });
    const { data, error } = await c
      .from('vehicles')
      .insert({
        name: input.name,
        color_name: input.colorName ?? '',
        vin: input.vin ?? '',
        odometer_mi: input.odometerMi ?? 0,
        oil_spec: input.oilSpec ?? '',
        last_service: '—',
        is_primary: (count ?? 0) === 0,
      })
      .select(COLS)
      .single();
    if (error) throw error;
    return { ok: true, vehicle: toVehicle(data as Row) };
  },

  async updateVehicle(
    id: string,
    patch: Partial<VehicleInput>,
  ): Promise<{ ok: boolean; vehicle: Vehicle }> {
    const dbPatch: Record<string, unknown> = {};
    if (patch.name !== undefined) dbPatch.name = patch.name;
    if (patch.colorName !== undefined) dbPatch.color_name = patch.colorName;
    if (patch.vin !== undefined) dbPatch.vin = patch.vin;
    if (patch.odometerMi !== undefined) dbPatch.odometer_mi = patch.odometerMi;
    if (patch.oilSpec !== undefined) dbPatch.oil_spec = patch.oilSpec;
    const { data, error } = await client()
      .from('vehicles')
      .update(dbPatch)
      .eq('id', id)
      .select(COLS)
      .single();
    if (error) throw error;
    return { ok: true, vehicle: toVehicle(data as Row) };
  },

  async removeVehicle(id: string): Promise<{ ok: boolean }> {
    const { error } = await client().from('vehicles').delete().eq('id', id);
    if (error) throw error;
    return { ok: true };
  },
};
