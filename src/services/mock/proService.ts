import { useAppStore } from '../../store/useAppStore';
import { delay } from './delay';

/**
 * AutoMate Pro purchase (wireframe diy-unlock → diy-payment → diy-confirm).
 * The mock awards nothing server-side — it just flips the client `isPro`
 * flag; the real backend will own pro_memberships + receipts.
 */
export const proService = {
  async unlockPro() {
    await delay(700);
    useAppStore.getState().unlockPro();
    return { ok: true, price: 10, lifetime: true };
  },
};
