# Wiring real In-App Purchase (RevenueCat) for the App Store build

Pro (subscription) and the DIY unlock are digital content, so the iOS build
must sell them through StoreKit (App Store guideline 3.1.1). The app is
already routed through `src/services/purchases.ts` — screens never call
`proService` directly for money — so this wiring touches one file.

Card payments for bookings/deposits are physical services (3.1.3(e)) and
stay exactly as they are.

## 1. App Store Connect (after Apple Developer enrollment)

My Apps → AutoMate → **In-App Purchases**:

| Product ID | Type | Price |
|---|---|---|
| `automate_pro_annual` | Auto-renewable subscription (group "Pro") | $47.99/yr |
| `automate_pro_monthly` | Auto-renewable subscription (group "Pro") | $9.99/mo |
| `automate_diy_unlock` | Non-consumable | $9.99 |

Fill in localized display names/descriptions and the review screenshot for
each (Apple reviews IAPs alongside the binary).

## 2. RevenueCat (free below $2.5k monthly tracked revenue)

1. app.revenuecat.com → new project "AutoMate" → add the iOS app (bundle id
   must match `app.json`).
2. Connect App Store Connect via the App-Specific Shared Secret / API key.
3. Products: import the three products above.
4. Entitlements: `pro` ← both subscriptions; `diy` ← `automate_diy_unlock`
   *and* `pro` (Pro includes DIY, mirroring the store invariant).
5. Offering `default` with packages `annual`, `monthly`, `diy`.
6. Copy the **public iOS SDK key**.

## 3. The app

```bash
npx expo install react-native-purchases   # native module → needs a dev build
```

- EAS build profile (`eas.json`) env:
  `EXPO_PUBLIC_REVENUECAT_IOS_KEY=<public sdk key>` — its presence is what
  flips `iapRequired()` in `src/services/purchases.ts` to true on iOS.
- Replace the `buyWithStoreKit` stub in `src/services/purchases.ts` with:
  configure once (`Purchases.configure({ apiKey })`, e.g. on app start when
  `iapRequired()`), fetch offerings, `purchasePackage` for the matching
  product id, map `userCancelled` → `{ ok: false, cancelled: true }`.
- Implement `restore()` with `Purchases.restorePurchases()` and surface a
  "Restore purchases" row on the Pro screens (required App Store UX).
- After a successful purchase the code already calls the same `proService`
  method, so the server membership row / renewal date / client state are
  identical across payment rails. For production hardening, verify receipts
  server-side via RevenueCat webhooks → a `POST /pro/revenuecat-webhook`
  route that upserts the membership (protect with the webhook auth header).

## 4. Test

- Sandbox tester account in App Store Connect → TestFlight build → buy both
  plans + the unlock + cancel mid-sheet + restore on a second device.
- Verify: membership row appears with the right plan/renews_at, deposit is
  waived on a repair booking, DIY guides unlock, and cancelling in iOS
  Settings → Subscriptions downgrades on expiry (RevenueCat webhook).
