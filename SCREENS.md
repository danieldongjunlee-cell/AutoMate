# SCREENS.md — Wireframe → Implementation checklist

Status: ⬜ not started · 🟨 in progress · ✅ done (verified in app)

Build steps: 1 scaffold/nav · 2 auth · 3 home/damage · 4 maintenance · 5 compare/community/profile · 6 notifications/bundles

> **All build steps complete:** every one of the 55 wireframe screens has a
> real implementation registered in React Navigation. Header titles live in
> `src/navigation/registry.ts`; the navigation graph reference is
> docs/wireframe-analysis.md §2.

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
| `s-home-bundle-deals` | Bundle Deals | `src/screens/home/BundleDealsScreen.tsx` | ✅ |
| `s-notifications` | Notifications | `src/screens/home/NotificationsScreen.tsx` | ✅ |

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
| `s-prof-insurance` | Insurance | `src/screens/profile/ProfInsuranceScreen.tsx` | ✅ |
| `s-prof-payment` | Payment | `src/screens/profile/ProfPaymentScreen.tsx` | ✅ |
| `s-prof-settings` | Settings | `src/screens/profile/ProfSettingsScreen.tsx` | ✅ |
| `s-prof-edit-profile` | Edit Profile | `src/screens/profile/ProfEditProfileScreen.tsx` | ✅ |
| `s-prof-change-email` | Change Email | `src/screens/profile/ProfAccountFormScreens.tsx` | ✅ |
| `s-prof-change-password` | Change Password | `src/screens/profile/ProfAccountFormScreens.tsx` | ✅ |
| `s-prof-change-phone` | Change Phone | `src/screens/profile/ProfAccountFormScreens.tsx` | ✅ |
| `s-prof-linked-accounts` | Linked Accounts | `src/screens/profile/ProfMiscScreens.tsx` | ✅ |
| `s-prof-help-center` | Help Center | `src/screens/profile/ProfMiscScreens.tsx` | ✅ |
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
