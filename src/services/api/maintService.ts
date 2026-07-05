/** Real maintenance service (server/) — mirrors services/mock/maintService. */
import { ScannedReceipt, ServiceRecord, UpcomingService, VEHICLE } from '../mock/data';
import { request } from './client';

export const maintService = {
  async getVehicle() {
    return request<typeof VEHICLE>('/maintenance/vehicle');
  },

  async getUpcomingServices() {
    return request<UpcomingService[]>('/maintenance/upcoming');
  },

  async getServiceHistory(): Promise<ServiceRecord[]> {
    return request<ServiceRecord[]>('/maintenance/history');
  },

  async scanReceipt(): Promise<ScannedReceipt> {
    // The RN camera is still simulated, so no file is attached yet; the
    // server forwards a placeholder to the damage-ai /receipt endpoint and
    // returns the extracted fields in the SCANNED_RECEIPT shape.
    const r = await request<ScannedReceipt & { lineItems: unknown; modelMode: string }>(
      '/maintenance/scan',
      { body: {} },
    );
    return {
      serviceType: r.serviceType,
      shop: r.shop,
      date: r.date,
      mileage: r.mileage,
      amount: r.amount,
    };
  },

  async saveServiceRecord(record: Omit<ServiceRecord, 'id' | 'icon'>, source: 'scan' | 'manual') {
    return request<{ ok: boolean; pointsEarned: number }>('/maintenance/history', {
      body: { record, source },
    });
  },

  async payForBooking(total: number) {
    return request<{ ok: boolean; reminder: string; pointsEarned: number }>('/bookings/pay', {
      body: { total },
    });
  },
};
