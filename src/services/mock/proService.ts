import { PRO_PLANS, DIY_ONLY_PRICE_CENTS, useAppStore } from '../../store/useAppStore';
import { delay } from './delay';

/**
 * AutoMate Pro (v17). Two products:
 *  - Pro subscription (annual/monthly) — includes DIY guides + waives booking
 *    deposits (pro-subscribe → pro-payment → pro-success).
 *  - $10 one-time DIY-only unlock (diy-unlock → diy-payment → diy-confirm).
 *
 * The mock just flips the client flags; the real backend owns pro_memberships
 * + payments. 1 pt = $0.01 economy (no points awarded for purchases here).
 */
export const proService = {
  /** Legacy entry kept for callers that don't pass a plan (defaults to annual). */
  async unlockPro() {
    await delay(700);
    useAppStore.getState().unlockPro();
    return {
      ok: true,
      priceCents: PRO_PLANS.annual.priceCents,
      plan: 'annual' as 'annual' | 'monthly',
    };
  },

  /** Subscribe to Pro on a plan (pro-payment confirm). */
  async subscribe(plan: 'annual' | 'monthly') {
    await delay(700);
    useAppStore.getState().subscribePro(plan);
    return { ok: true, plan, priceCents: PRO_PLANS[plan].priceCents };
  },

  /** Buy the $10 DIY-only unlock (diy-payment confirm). */
  async unlockDiyOnly() {
    await delay(700);
    useAppStore.getState().unlockDiyOnly();
    return { ok: true, priceCents: DIY_ONLY_PRICE_CENTS };
  },
};
