/** Real Pro-membership service (server/) — mirrors services/mock/proService. */
import { useAppStore } from '../../store/useAppStore';
import { request } from './client';

export const proService = {
  async unlockPro() {
    const res = await request<{ ok: boolean; price: number; lifetime: boolean }>(
      '/pro/purchase',
      { body: {} },
    );
    // Server owns pro_memberships + the payment; flip the client flag too.
    useAppStore.getState().unlockPro();
    return res;
  },
};
