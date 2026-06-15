/** Real Pro service (server/) — mirrors services/mock/proService (v17).
 *  Endpoints are wired in P5; signatures match the mock so the service-switch
 *  (typeof mockProService) stays type-safe. */
import { PRO_PLANS, DIY_ONLY_PRICE_CENTS, useAppStore } from '../../store/useAppStore';
import { request } from './client';

export const proService = {
  async unlockPro() {
    const res = await request<{ ok: boolean; priceCents: number; plan: 'annual' | 'monthly' }>(
      '/pro/purchase',
      { body: { plan: 'annual' } },
    );
    useAppStore.getState().unlockPro();
    return (
      res ?? {
        ok: true,
        priceCents: PRO_PLANS.annual.priceCents,
        plan: 'annual' as 'annual' | 'monthly',
      }
    );
  },

  async subscribe(plan: 'annual' | 'monthly') {
    const res = await request<{ ok: boolean; plan: 'annual' | 'monthly'; priceCents: number }>(
      '/pro/subscribe',
      { body: { plan } },
    );
    useAppStore.getState().subscribePro(plan);
    return res ?? { ok: true, plan, priceCents: PRO_PLANS[plan].priceCents };
  },

  async unlockDiyOnly() {
    const res = await request<{ ok: boolean; priceCents: number }>('/pro/diy-unlock', { body: {} });
    useAppStore.getState().unlockDiyOnly();
    return res ?? { ok: true, priceCents: DIY_ONLY_PRICE_CENTS };
  },
};
