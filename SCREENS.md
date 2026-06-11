# SCREENS.md — Wireframe → Implementation checklist

Status: ⬜ not started · 🟨 in progress · ✅ done (verified in app)

Build steps: 1 scaffold/nav · 2 auth · 3 home/damage · 4 maintenance · 5 compare/community/profile · 6 notifications/bundles

> **Step 1 complete:** all 55 routes are registered in React Navigation
> (`src/navigation/registry.ts`) and render `PlaceholderScreen` with every
> wireframe nav edge tappable. A screen's status flips to ✅ when its real
> implementation replaces the placeholder and is verified.

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
| `s-home` | Home | `src/screens/home/HomeScreen.tsx` | ✅ |
| `s-car-diagram` | Select Part | `src/screens/home/CarDiagramScreen.tsx` | ✅ |
| `s-photo-example` | Photo Guide | `src/screens/home/PhotoExampleScreen.tsx` | ✅ |
| `s-camera` | Take Photos | `src/screens/home/CameraScreen.tsx` | ✅ |
| `s-confirm-submit` | Confirm Damage | `src/screens/home/ConfirmSubmitScreen.tsx` | ✅ |
| `s-submitted` | Submitted | `src/screens/home/SubmittedScreen.tsx` | ✅ |
| `s-after-hours` | After Hours | `src/screens/home/AfterHoursScreen.tsx` | ✅ |
| `s-dealer-quotes` | Quotes Received | `src/screens/home/DealerQuotesScreen.tsx` | ✅ |
| `s-all-quotes-map` | All Quotes Map | `src/screens/home/AllQuotesMapScreen.tsx` | ✅ |
| `s-map` | Map (separate screen, entry: "Filter quotes on map" on All Quotes Map) | `src/screens/home/MapFilterScreen.tsx` | ✅ |
| `s-accept-booking` | Accept & Book | `src/screens/home/AcceptBookingScreen.tsx` | ✅ |
| `s-booking-confirm` | Booking Confirmed | `src/screens/home/BookingConfirmScreen.tsx` | ✅ |
| `s-home-bundle-deals` | Bundle Deals (Step 6) | — | ⬜ |
| `s-notifications` | Notifications (Step 6) | — | ⬜ |

## Maintenance tab (Step 4)

| Wireframe ID | Screen | Component | Status |
|---|---|---|---|
| `s-maint-dashboard` | Maintenance | `src/screens/maint/MaintDashboardScreen.tsx` | ✅ |
| `s-maint-history` | Service History | `src/screens/maint/MaintHistoryScreen.tsx` | ✅ |
| `s-maint-scan-cam` | Scan Camera | `src/screens/maint/MaintScanCamScreen.tsx` | ✅ |
| `s-maint-scan-rev` | Scan Review | `src/screens/maint/MaintScanRevScreen.tsx` | ✅ |
| `s-maint-manual` | Manual Log | `src/screens/maint/MaintManualScreen.tsx` | ✅ |
| `s-maint-diy` | DIY Tips Hub | `src/screens/maint/MaintDiyScreen.tsx` | ✅ |
| `s-maint-schedule` | Schedule Service | `src/screens/maint/MaintScheduleScreen.tsx` | ✅ |
| `s-maint-schedule-book` | Book Appointment | `src/screens/maint/MaintScheduleBookScreen.tsx` | ✅ |
| `s-maint-payment` | Payment | `src/screens/maint/MaintPaymentScreen.tsx` | ✅ |
| `s-maint-schedule-confirm` | Booking Confirmed | `src/screens/maint/MaintScheduleConfirmScreen.tsx` | ✅ |

## Compare tab (Step 5)

| Wireframe ID | Screen | Component | Status |
|---|---|---|---|
| `s-comp-select` | Select Quote | — | ⬜ |
| `s-comp-cash-ins` | Cash vs Insurance | — | ⬜ |
| `s-comp-deep-dive` | Cost Deep Dive | — | ⬜ |
| `s-comp-cash-book` | Book (Cash) | — | ⬜ |
| `s-comp-insurance` | Contact Insurer | — | ⬜ |

## Community tab (Step 5)

| Wireframe ID | Screen | Component | Status |
|---|---|---|---|
| `s-comm-channels` | Community | — | ⬜ |
| `s-comm-honda` | Honda Feed | — | ⬜ |
| `s-comm-post` | Post Detail | — | ⬜ |
| `s-comm-create` | Create Post | — | ⬜ |

## Profile tab (Step 5)

| Wireframe ID | Screen | Component | Status |
|---|---|---|---|
| `s-prof-hub` | Profile | — | ⬜ |
| `s-prof-miles` | Milestones | — | ⬜ |
| `s-prof-mile-det` | Milestone Detail | — | ⬜ |
| `s-prof-earn` | Earn History | — | ⬜ |
| `s-prof-cars` | My Cars | — | ⬜ |
| `s-prof-insurance` | Insurance | — | ⬜ |
| `s-prof-payment` | Payment | — | ⬜ |
| `s-prof-settings` | Settings | — | ⬜ |
| `s-prof-edit-profile` | Edit Profile | — | ⬜ |
| `s-prof-change-email` | Change Email | — | ⬜ |
| `s-prof-change-password` | Change Password | — | ⬜ |
| `s-prof-change-phone` | Change Phone | — | ⬜ |
| `s-prof-linked-accounts` | Linked Accounts | — | ⬜ |
| `s-prof-help-center` | Help Center | — | ⬜ |
| `s-prof-terms` | Terms of Service | — | ⬜ |
| `s-prof-privacy` | Privacy Policy | — | ⬜ |
| `s-prof-language` | Language | — | ⬜ |
| `s-prof-distance` | Distance Units | — | ⬜ |

## Global (non-screen)

| Wireframe element | Component | Status |
|---|---|---|
| Tab bar (5 tabs, hidden on auth) | `src/navigation/MainTabs.tsx` | 🟨 (placeholders; reset-to-root via `popToTopOnBlur`) |
| Auth gate (tab bar hidden on auth) | `src/navigation/RootNavigator.tsx` | 🟨 |
| Design tokens (light + dark) | `src/theme/` | 🟨 (dark palette refined in step 5) |
| Sign-out bottom sheet | — | ⬜ (placeholder signs out directly) |
| Dark mode theming | `src/theme/index.ts` + Zustand `darkMode` | 🟨 (toggle UI lands with Settings) |
