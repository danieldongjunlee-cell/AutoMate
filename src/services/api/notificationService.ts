/** Real notification service (server/) — mirrors services/mock/notificationService. */
import { AppNotification } from '../mock/notificationService';
import { request } from './client';

export const notificationService = {
  async getNotifications(): Promise<AppNotification[]> {
    return request<AppNotification[]>('/notifications');
  },

  async markAllRead() {
    return request<{ ok: boolean }>('/notifications/read-all', { body: {} });
  },

  async markRead(id: string) {
    return request<{ ok: boolean }>(`/notifications/${encodeURIComponent(id)}/read`, {
      body: {},
    });
  },
};
