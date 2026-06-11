import {
  ServiceRecord,
  SERVICE_HISTORY_SEED,
  UPCOMING_SERVICES,
  VEHICLE,
} from './data';

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/** In-memory history so saved scans/manual logs appear immediately. */
let history: ServiceRecord[] = [...SERVICE_HISTORY_SEED];
let nextId = 1;

export const maintService = {
  async getVehicle() {
    await delay(200);
    return VEHICLE;
  },

  async getUpcomingServices() {
    await delay(250);
    return UPCOMING_SERVICES;
  },

  async getServiceHistory(): Promise<ServiceRecord[]> {
    await delay(300);
    return [...history];
  },

  /** Save a scanned or manually-entered record; returns points earned. */
  async saveServiceRecord(
    record: Omit<ServiceRecord, 'id' | 'icon'>,
    source: 'scan' | 'manual',
  ) {
    await delay(500);
    history = [
      {
        ...record,
        id: `rec-new-${nextId++}`,
        icon: record.type.toLowerCase().includes('tire') ? '↺' : '🛢️',
      },
      ...history,
    ];
    return { ok: true, pointsEarned: source === 'scan' ? 20 : 10 };
  },

  async payForBooking(_total: number) {
    await delay(700);
    return { ok: true, reminder: 'day before at 9:00 AM' };
  },
};
