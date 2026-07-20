/**
 * Purchases abstraction — the single entry point for anything money-related
 * that unlocks DIGITAL content (Pro subscription, DIY-guide unlock).
 *
 * Why: on iOS App Store builds these are digital goods, so Apple guideline
 * 3.1.1 requires StoreKit In-App Purchase — card rails are not allowed for
 * them (bookings/deposits are physical services and stay on card payments,
 * 3.1.3(e)). Everywhere else (web, demo, Android pilot) the existing
 * proService flow applies.
 *
 * Wiring RevenueCat for the App Store build (see docs/iap-revenuecat-setup.md):
 *   1. npx expo install react-native-purchases   (needs a dev build, not Expo Go)
 *   2. Create products in App Store Connect:
 *        automate_pro_annual ($47.99/yr) · automate_pro_monthly ($9.99/mo)
 *        automate_diy_unlock ($9.99 non-consumable)
 *      and mirror them as RevenueCat entitlements: "pro", "diy".
 *   3. Set EXPO_PUBLIC_REVENUECAT_IOS_KEY in the EAS build profile.
 *   4. Replace the buyWithStoreKit stub below with the RevenueCat calls
 *      (kept out until the package is installed so web/Metro builds stay
 *      dependency-free).
 */
import { Platform } from 'react-native';

import { proService } from './index';

export type ProPlanId = 'annual' | 'monthly';

export interface PurchaseResult {
  ok: boolean;
  /** True when the user dismissed the native purchase sheet. */
  cancelled?: boolean;
  error?: string;
}

const REVENUECAT_KEY = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY ?? '';

/** True when this build must route digital goods through StoreKit. */
export const iapRequired = (): boolean => Platform.OS === 'ios' && REVENUECAT_KEY.length > 0;

/**
 * StoreKit adapter stub. Once react-native-purchases is installed, this
 * becomes: configure({apiKey}), getOfferings(), purchasePackage(pkg), then
 * on success call the same proService method so server entitlement rows and
 * client state stay identical across payment rails.
 */
async function buyWithStoreKit(_productId: string): Promise<PurchaseResult> {
  return {
    ok: false,
    error:
      'In-app purchase is not available in this build yet. Please update the app or purchase on automate web.',
  };
}

export const purchases = {
  /** Subscribe to AutoMate Pro (annual/monthly). */
  async purchasePro(plan: ProPlanId): Promise<PurchaseResult> {
    if (iapRequired()) {
      const res = await buyWithStoreKit(`automate_pro_${plan}`);
      if (!res.ok) return res;
      await proService.subscribe(plan); // record entitlement server-side + in-store
      return { ok: true };
    }
    await proService.subscribe(plan);
    return { ok: true };
  },

  /** One-time DIY unlock (wireframe diy-payment chain — unlocks Pro incl. DIY). */
  async purchaseDiyUnlock(): Promise<PurchaseResult> {
    if (iapRequired()) {
      const res = await buyWithStoreKit('automate_diy_unlock');
      if (!res.ok) return res;
      await proService.unlockPro();
      return { ok: true };
    }
    await proService.unlockPro();
    return { ok: true };
  },

  /** Restore previous StoreKit purchases (required App Store UX). No-op on
   *  non-IAP builds — entitlements come from the account/server instead. */
  async restore(): Promise<PurchaseResult> {
    if (!iapRequired()) return { ok: true };
    return { ok: false, error: 'Restore requires the StoreKit adapter (see purchases.ts).' };
  },
};
