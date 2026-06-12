# SCREENS.md — Wireframe → Implementation checklist

Status: ⬜ not started · 🟨 in progress · ✅ done (verified in app)

Build steps: 1 scaffold/nav · 2 auth · 3 home/damage · 4 maintenance · 5 compare/community/profile · 6 notifications/bundles

> **Synced to wireframe v15.10** (`AutoMate Interactive Wireframe v15.html`):
> 68 screens. v15.10 added 14 screens (dealer-map, the diy-* Pro chain, the
> help-* articles, prof-ins-edit/add), deleted `s-map`, and reworked the
> damage flow to single-select multi-part. Every screen has a real
> implementation registered in React Navigation. Header titles live in
> `src/navigation/registry.ts`; the navigation graph reference is
> docs/wireframe-analysis.md §2 + docs/upgrade-v15.10-gap-analysis.md.

## Auth (Step 2)

| Wireframe ID | Screen | Component | Status |
|---|---|---|---|
| `s-splash` | Splash | `src/screens/auth/SplashScreen.tsx` | ✅ |
| `s-signup` | Sign Up | `src/screens/auth/SignUpScreen.tsx` | ✅ |
| `s-login` | Log In | `src/screens/auth/LogInScreen.tsx` | ✅ |
| `s-verify-otp` | Verify OTP | `src/screens/auth/VerifyOtpScreen.tsx` | ✅ |

## Home tab (Steps 3 & 6)

| Wireframe ID | Screen | Component | Status |
|---|---|---|---|
| `s-home` | Home (v15.10: + Scheduled services section) | `src/screens/home/HomeScreen.tsx` | ✅ |
| `s-car-diagram` | Select Part (v15.10: single-select `pickPart`) | `src/screens/home/CarDiagramScreen.tsx` | ✅ |
| `s-photo-example` | Photo Guide | `src/screens/home/PhotoExampleScreen.tsx` | ✅ |
| `s-camera` | Take Photos (v15.10: damage-type chips at capture) | `src/screens/home/CameraScreen.tsx` | ✅ |
| `s-confirm-submit` | Confirm Damage (v15.10: multi-part list, ✕ Remove) | `src/screens/home/ConfirmSubmitScreen.tsx` | ✅ |
| `s-submitted` | Submitted (v15.10: Pro lock → diy-unlock, unlocked when Pro) | `src/screens/home/SubmittedScreen.tsx` | ✅ |
| `s-after-hours` | After Hours (v15.10: Pro lock → diy-unlock) | `src/screens/home/AfterHoursScreen.tsx` | ✅ |
| `s-dealer-quotes` | Quotes Received (v15.10: all 8 quotes, AI confidence 87%, Msg dropped) | `src/screens/home/DealerQuotesScreen.tsx` | ✅ |
| `s-all-quotes-map` | All Quotes Map (v15.10: 8 pins, BEST PRICE/RECOMMENDED, Top picks) | `src/screens/home/AllQuotesMapScreen.tsx` | ✅ |
| `s-accept-booking` | Accept & Book | `src/screens/home/AcceptBookingScreen.tsx` | ✅ |
| `s-booking-confirm` | Booking Confirmed (v15.10: View on map → dealer-map) | `src/screens/home/BookingConfirmScreen.tsx` | ✅ |
| `s-dealer-map` | Dealer Map (new in v15.10) | `src/screens/home/DealerMapScreen.tsx` | ✅ |
| `s-home-bundle-deals` | Bundle Deals | `src/screens/home/BundleDealsScreen.tsx` | ✅ |
| `s-notifications` | Notifications | `src/screens/home/NotificationsScreen.tsx` | ✅ |

> v15.10 removed `s-map` (MapFilterScreen) — superseded by the redesigned
> all-quotes-map + the new dealer-map.

## Maintenance tab (Step 4)

| Wireframe ID | Screen | Component | Status |
|---|---|---|---|
| `s-maint-dashboard` | Maintenance | `src/screens/maint/MaintDashboardScreen.tsx` | ✅ |
| `s-maint-history` | Service History (v15.10: filters below scan/manual cards) | `src/screens/maint/MaintHistoryScreen.tsx` | ✅ |
| `s-maint-scan-cam` | Scan Camera | `src/screens/maint/MaintScanCamScreen.tsx` | ✅ |
| `s-maint-scan-rev` | Scan Review | `src/screens/maint/MaintScanRevScreen.tsx` | ✅ |
| `s-maint-manual` | Manual Log | `src/screens/maint/MaintManualScreen.tsx` | ✅ |
| `s-maint-diy` | DIY Tips Hub (v15.10: lock → diy-unlock; lists all 12 when Pro) | `src/screens/maint/MaintDiyScreen.tsx` | ✅ |
| `s-diy-unlock` | Unlock Pro (new in v15.10) | `src/screens/maint/DiyUnlockScreen.tsx` | ✅ |
| `s-diy-payment` | Pro Payment (new in v15.10) | `src/screens/maint/DiyPaymentScreen.tsx` | ✅ |
| `s-diy-confirm` | Welcome to Pro (new in v15.10) | `src/screens/maint/DiyConfirmScreen.tsx` | ✅ |
| `s-diy-guides` | All 12 Guides (new in v15.10) | `src/screens/maint/DiyProScreens.tsx` | ✅ |
| `s-diy-match` | AI Guide Matching (new in v15.10) | `src/screens/maint/DiyProScreens.tsx` | ✅ |
| `s-diy-tools` | Shopping Lists (new in v15.10) | `src/screens/maint/DiyProScreens.tsx` | ✅ |
| `s-diy-future` | Coming Soon (new in v15.10) | `src/screens/maint/DiyProScreens.tsx` | ✅ |
| `s-maint-schedule` | Schedule Service | `src/screens/maint/MaintScheduleScreen.tsx` | ✅ |
| `s-maint-schedule-book` | Book Appointment | `src/screens/maint/MaintScheduleBookScreen.tsx` | ✅ |
| `s-maint-payment` | Payment | `src/screens/maint/MaintPaymentScreen.tsx` | ✅ |
| `s-maint-schedule-confirm` | Booking Confirmed | `src/screens/maint/MaintScheduleConfirmScreen.tsx` | ✅ |

## Compare tab (Step 5)

| Wireframe ID | Screen | Component | Status |
|---|---|---|---|
| `s-comp-select` | Select Quote | `src/screens/compare/CompSelectScreen.tsx` | ✅ |
| `s-comp-cash-ins` | Cash vs Insurance | `src/screens/compare/CompCashInsScreen.tsx` | ✅ |
| `s-comp-deep-dive` | Cost Deep Dive | `src/screens/compare/CompDeepDiveScreen.tsx` | ✅ |
| `s-comp-cash-book` | Book (Cash) | `src/screens/compare/CompCashBookScreen.tsx` | ✅ |
| `s-comp-insurance` | Contact Insurer | `src/screens/compare/CompInsuranceScreen.tsx` | ✅ |

## Community tab (Step 5)

| Wireframe ID | Screen | Component | Status |
|---|---|---|---|
| `s-comm-channels` | Community | `src/screens/community/CommChannelsScreen.tsx` | ✅ |
| `s-comm-honda` | Honda Feed | `src/screens/community/CommHondaScreen.tsx` | ✅ |
| `s-comm-post` | Post Detail | `src/screens/community/CommPostScreen.tsx` | ✅ |
| `s-comm-create` | Create Post | `src/screens/community/CommCreateScreen.tsx` | ✅ |

## Profile tab (Step 5)

| Wireframe ID | Screen | Component | Status |
|---|---|---|---|
| `s-prof-hub` | Profile | `src/screens/profile/ProfHubScreen.tsx` | ✅ |
| `s-prof-miles` | Milestones | `src/screens/profile/ProfMilesScreen.tsx` | ✅ |
| `s-prof-mile-det` | Milestone Detail | `src/screens/profile/ProfMileDetScreen.tsx` | ✅ |
| `s-prof-earn` | Earn History | `src/screens/profile/ProfEarnScreen.tsx` | ✅ |
| `s-prof-cars` | My Cars | `src/screens/profile/ProfCarsScreen.tsx` | ✅ |
| `s-prof-insurance` | Insurance (v15.10: Edit/Add wired to the new forms) | `src/screens/profile/ProfInsuranceScreen.tsx` | ✅ |
| `s-prof-ins-edit` | Edit Policy (new in v15.10) | `src/screens/profile/ProfInsFormScreens.tsx` | ✅ |
| `s-prof-ins-add` | Add Policy (new in v15.10) | `src/screens/profile/ProfInsFormScreens.tsx` | ✅ |
| `s-prof-payment` | Payment | `src/screens/profile/ProfPaymentScreen.tsx` | ✅ |
| `s-prof-settings` | Settings | `src/screens/profile/ProfSettingsScreen.tsx` | ✅ |
| `s-prof-edit-profile` | Edit Profile | `src/screens/profile/ProfEditProfileScreen.tsx` | ✅ |
| `s-prof-change-email` | Change Email | `src/screens/profile/ProfAccountFormScreens.tsx` | ✅ |
| `s-prof-change-password` | Change Password | `src/screens/profile/ProfAccountFormScreens.tsx` | ✅ |
| `s-prof-change-phone` | Change Phone | `src/screens/profile/ProfAccountFormScreens.tsx` | ✅ |
| `s-prof-linked-accounts` | Linked Accounts | `src/screens/profile/ProfMiscScreens.tsx` | ✅ |
| `s-prof-help-center` | Help Center (v15.10: 4 topics → real articles) | `src/screens/profile/ProfMiscScreens.tsx` | ✅ |
| `s-help-photos` | Help: Damage Photos (new in v15.10) | `src/screens/profile/HelpArticleScreens.tsx` | ✅ |
| `s-help-quotes` | Help: Quotes & Pricing (new in v15.10) | `src/screens/profile/HelpArticleScreens.tsx` | ✅ |
| `s-help-bookings` | Help: Managing Bookings (new in v15.10) | `src/screens/profile/HelpArticleScreens.tsx` | ✅ |
| `s-help-contact` | Contact Support (new in v15.10) | `src/screens/profile/HelpArticleScreens.tsx` | ✅ |
| `s-prof-terms` | Terms of Service | `src/screens/profile/ProfMiscScreens.tsx` | ✅ |
| `s-prof-privacy` | Privacy Policy | `src/screens/profile/ProfMiscScreens.tsx` | ✅ |
| `s-prof-language` | Language | `src/screens/profile/ProfMiscScreens.tsx` | ✅ |
| `s-prof-distance` | Distance Units | `src/screens/profile/ProfMiscScreens.tsx` | ✅ |

## Global (non-screen)

| Wireframe element | Component | Status |
|---|---|---|
| Tab bar (5 tabs, hidden on auth) | `src/navigation/MainTabs.tsx` | ✅ (reset-to-root via `popToTopOnBlur`) |
| Auth gate (tab bar hidden on auth) | `src/navigation/RootNavigator.tsx` | ✅ |
| Design tokens (light + dark) | `src/theme/` | ✅ |
| Sign-out bottom sheet | `src/screens/profile/ProfSettingsScreen.tsx` | ✅ |
| Dark mode theming | `src/theme/index.ts` + Zustand `darkMode` | ✅ (toggle in Settings themes nav + all screens) |
