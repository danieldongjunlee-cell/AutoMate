/** Real account service (server/) — mirrors services/mock/accountService. */
import { request } from './client';

export const accountService = {
  /** Permanently delete the signed-in account and all owned rows
   *  (DELETE /profile — Prisma cascades; posts are detached, not removed). */
  async deleteAccount(): Promise<{ ok: boolean }> {
    return request<{ ok: boolean }>('/profile', { method: 'DELETE' });
  },
};
