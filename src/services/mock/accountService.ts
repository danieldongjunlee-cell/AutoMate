/**
 * Mock account service — same signatures as services/api/accountService so
 * the service-layer mode switch (services/index.ts) is transparent to screens.
 *
 * Deleting the demo account has nothing server-side to remove; the screen
 * follows up with store.signOut() which clears all local state.
 */
import { delay } from './delay';

export const accountService = {
  /** Permanently delete the signed-in account (App Store guideline 5.1.1(v)). */
  async deleteAccount(): Promise<{ ok: boolean }> {
    await delay(500);
    return { ok: true };
  },
};
