import { EARN_RULES } from '../../config/points';
import {
  SCANNED_RECEIPT,
  ScannedReceipt,
  ServiceRecord,
  SERVICE_HISTORY_SEED,
  UPCOMING_SERVICES,
  VEHICLE,
} from './data';
import { delay } from './delay';

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

  /** "OCR" a captured receipt — mock returns the canonical AutoFix Pro
   * receipt after a scanning delay (api twin posts to /maintenance/scan). */
  async scanReceipt(): Promise<ScannedReceipt> {
    await delay(900);
    return { ...SCANNED_RECEIPT };
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
    return {
      ok: true,
      pointsEarned: (source === 'scan' ? EARN_RULES.scanReceipt : EARN_RULES.manualLog) as number,
    };
  },

  async payForBooking(_total: number) {
    await delay(700);
    return {
      ok: true,
      reminder: 'day before at 9:00 AM',
      pointsEarned: EARN_RULES.bookService as number,
    };
  },
};
