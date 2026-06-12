/** Real maintenance service (server/) — mirrors services/mock/maintService. */
import { ServiceRecord, UpcomingService, VEHICLE } from '../mock/data';
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
