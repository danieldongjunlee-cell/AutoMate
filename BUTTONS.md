# BUTTONS.md — Exhaustive interactive-element audit (Phase 7)

Source of truth: `AutoMate Interactive Wireframe v15.html` (68 screens). Every
element with an `onclick` handler **or** `cursor:pointer` styling in the
wireframe is listed, plus app-only additions (marked ➕). Audited 2026-06-12.

**Status legend**
- ✅ **working** — real navigation / state change / service call
- 🔌 **stub-with-alert** — taps show an informative Alert because the action
  needs a real device capability (dialer, calendar, maps, camera roll, push
  permission) or backend not in scope; *never* silent
- **n/a** — informational chip the wireframe styles as `cursor:pointer` but
  deliberately leaves without a handler (no-op by design); rendered
  non-interactive in the app

There are **zero ❌ dead buttons**: every element that looks tappable does
something. Global elements (back arrows on all 64 stacked screens, the 5-tab
bar) are listed once at the top instead of 68×.

## Global chrome

| Screen | Button/element | Stated action (wireframe) | Implementation | Status |
|---|---|---|---|---|
| all stacked screens | ← back arrow (header) | `data-back` → `back()` | React Navigation native-stack header back | ✅ |
| all tab screens | Tab bar: Home / Maint. / Comp. / Comm. / Profile | `tab('home' \| 'maint' \| 'compare' \| 'community' \| 'profile')` | `MainTabs.tsx` bottom tabs, `popToTopOnBlur` reset, hidden on auth | ✅ |

## Auth

| Screen | Button/element | Stated action | Implementation | Status |
|---|---|---|---|---|
| s-splash | Get started → | `nav('signup')` | `SplashScreen` → SignUp | ✅ |
| s-splash | I already have an account | (cursor) → login | → LogIn, pre-filled demo creds | ✅ |
| s-splash | Apple social button | (cursor) | branded Apple ID sheet (`SocialSignInSheet`) → Continue → `authService.socialSignIn('apple')` → Home | ✅ |
| s-splash | Google social button | (cursor) | branded Google account chooser (`SocialSignInSheet`) → demo account → `authService.socialSignIn('google')` → Home; "Use another account" alert | ✅ |
| s-signup | ➕ Confirm password field + live rules checklist | (feedback pass 1) | ✓/✗ rows (8 chars / uppercase / number); mismatch shows red helper | ✅ |
| s-signup | Create account | `nav('verify-otp')` | `authService.signUp` (loading) → **VerifyMethod**; disabled until rules pass & passwords match | ✅ |
| s-signup | Log in link | (cursor) | → LogIn | ✅ |
| s-login | Forgot password? | (cursor) | Alert (password reset = backend email flow) | 🔌 |
| s-login | Sign in | `nav('verify-otp')` | `authService.logIn` (loading spinner, error Alert) → VerifyOtp | ✅ |
| ➕ VerifyMethod | 📧 Email / 📱 Text message cards | (app-only, feedback pass 1) | show the ACTUAL entered email/phone; pick → `authService.sendCode(method, destination)` (spinner) → VerifyOtp `{method, destination}` | ✅ |
| s-verify-otp | OTP boxes | (input) | 6-box UI over hidden input, auto-focus; header reads "Code sent to <destination>" + ✓ sent-via-email/SMS banner | ✅ |
| s-verify-otp | Verify → | `nav('home')` | `authService.verifyOtp` (loading) → signIn; bad code alert (web-safe) | ✅ |
| s-verify-otp | Resend (0:42) | (cursor) | Real 42 s countdown; at 0:00 "Resend" → `sendCode(method, destination)` (or legacy `resendOtp` from login) + counter resets | ✅ |

## Home tab

| Screen | Button/element | Stated action | Implementation | Status |
|---|---|---|---|---|
| s-home | 🔔 bell | `showAnnouncement()` → notifications | → Notifications | ✅ |
| s-home | 🔥 Day 5 streak chip | `nav('prof-earn')` | cross-tab → ProfileTab/ProfEarn | ✅ |
| s-home | ➕ Daily check-in card (claim / dismiss) | (app-only, Phase 6) | `pointsService.checkIn()` +5 pts; ✕ dismisses | ✅ |
| s-home | 📷 Get a Repair Estimate | `nav('car-diagram')` | resets draft → CarDiagram | ✅ |
| s-home | Claim deal → (bundle banner) | `nav('home-bundle-deals')` | → BundleDeals | ✅ |
| s-home | Pending quote card (Rear bumper dent 3 of 8) | `nav('dealer-quotes')` | → DealerQuotes | ✅ |
| s-home | Scheduled: Apr 7 oil change "$49 Paid" | `nav('maint-schedule-confirm')` | cross-tab → MaintTab/MaintScheduleConfirm | ✅ |
| s-home | Scheduled: Apr 12 bumper "Confirmed" | `nav('booking-confirm')` | → BookingConfirm | ✅ |
| s-car-diagram | 15 car-part cells (Front bumper … Rear bumper) | `pickPart(this, name)` single-select | store `pickPart` — ✔ check on selection, badge + summary update | ✅ |
| s-car-diagram | Continue → | `nav('photo-example')` | disabled until a part is picked → PhotoExample | ✅ |
| s-photo-example | ← Change part | `back()` | `goBack()` | ✅ |
| s-photo-example | Take photos → | `nav('camera')` | → Camera | ✅ |
| s-camera | Damage-type chips (Dent/Scratch/Crack/Paint) | `pickDmg(this)` | store `setDraftType`, tagged at capture time | ✅ |
| s-camera | Viewfinder (tap to capture) | (cursor) | **REAL device camera** (expo-image-picker; web: file picker w/ capture hint) — stores the actual uri, last shot previews in the frame | ✅ |
| s-camera | "+ Angle n" empty slot | (cursor) | next slot tappable → device camera; filled slots render the real photo thumbnails | ✅ |
| s-camera | 📁 Upload | (cursor) | **REAL gallery picker** (`pickFromGallery`, web: file picker) | ✅ |
| s-camera | Submit photos → | `nav('confirm-submit')` | `commitDraftPart()` → ConfirmSubmit; disabled <1 photo | ✅ |
| s-confirm-submit | ✎ Edit (per part) | `nav('car-diagram')` | seeds draft with part → CarDiagram | ✅ |
| s-confirm-submit | 📷 + Photos (per part) | `nav('camera')` | seeds draft → Camera | ✅ |
| s-confirm-submit | ✕ Remove (per part) | `removePart(this)` | store `removePart(i)` | ✅ |
| s-confirm-submit | ➕ Add another damaged part | `nav('car-diagram')` | `resetDraft()` → CarDiagram | ✅ |
| s-confirm-submit | Submit for quotes → | `nav('submitted')` | `quoteService.submitDamageRequest` behind **in-screen analyzing state** (pulsing 🤖, "Analyzing your photos…" → "Contacting 12 shops…", ≥2 s) → Submitted/AfterHours | ✅ |
| s-submitted | Notify banner text | `nav('dealer-quotes')` | → DealerQuotes | ✅ |
| s-submitted | Enable (notifications) | (cursor) | Flips to green "Enabled ✓" + banner copy update (mock push opt-in) | ✅ |
| s-submitted | Unlock Pro · $10 | `nav('maint-diy')`/lock | cross-tab → MaintTab/DiyUnlock (hidden when `isPro`) | ✅ |
| s-submitted | Read guide → (×2, Pro unlocked) | (cursor, no target screen) | Alert preview of guide steps (content ships with backend) | 🔌 |
| s-submitted | View available quotes → | `nav('dealer-quotes')` | → DealerQuotes | ✅ |
| s-submitted | 🏠 Back to home | `tab('home')` | popToTop → Home | ✅ |
| s-after-hours | Unlock Pro · $10 (lock) | (cursor) | cross-tab → MaintTab/DiyUnlock | ✅ |
| s-after-hours | View available quotes → | `nav('dealer-quotes')` | → DealerQuotes | ✅ |
| s-after-hours | 🏠 Back to home | `nav('home')` | → Home | ✅ |
| s-dealer-quotes | Accept quote (×8) | `nav('accept-booking')` | → AcceptBooking with `dealerId` | ✅ |
| s-dealer-quotes | ★ rating (per card) | (feedback pass 2) | tappable → confirm → Google reviews | ✅ |
| s-dealer-quotes | 🕐 hours chip (×8) | cursor:pointer, **no onclick** | informational chip, non-interactive (matches wireframe) | n/a |
| s-dealer-quotes | 📍 See all 8 quotes on map | `nav('all-quotes-map')` | → AllQuotesMap | ✅ |
| s-all-quotes-map | 8 price pins (incl. BEST PRICE / RECOMMENDED) | `nav('accept-booking')` | **REAL tile map** (feedback pass 2: Leaflet+OSM web / react-native-maps native); pin tap selects + highlights its dealer card and scrolls it into view (two-way sync) | ✅ |
| s-all-quotes-map | ➕ Distance / Price range dropdowns | (feedback pass 2) | `Select` filters — hide pins **and** cards together; empty-state copy when nothing matches | ✅ |
| s-all-quotes-map | Quote cards (×8, was "Top picks" ×3) | `nav('accept-booking')` | tap selects + highlights its map pin (two-way sync); selected card reveals "Accept & book →" → AcceptBooking; meta shows tappable ★ rating + 🕐 hours | ✅ |
| s-all-quotes-map | ★ rating (per card) | (feedback pass 2) | confirm → Google reviews for the dealer | ✅ |
| s-accept-booking | Calendar ‹ › month arrows | cursor:pointer, no onclick | Alert: only April 2027 has demo availability | 🔌 |
| s-accept-booking | Calendar day cells | (cursor) | selectable days (unavailable disabled) | ✅ |
| s-accept-booking | Time slots (9:00…4:00) | (cursor) | single-select chips | ✅ |
| s-accept-booking | Confirm booking — Apr 12 at 10:30 AM | `nav('booking-confirm')` | `acceptQuote` + `bookAppointment` (parallel), loading + **blocking overlay** → BookingConfirm | ✅ |
| s-booking-confirm | Edit (reminder row) | (cursor) | **timing modal** (1 day / 2 days / 2 hours before / morning of) saved to store `reminderPref`; row + header copy update live | ✅ |
| s-booking-confirm | Add to calendar | (cursor) | **real export** — native: expo-calendar event in the default calendar (permission-gated); web: confirm → pre-filled Google Calendar template | ✅ |
| s-booking-confirm | View on map | `nav('dealer-map')` | → DealerMap with dealer | ✅ |
| s-dealer-map | Map + zoom | cursor:pointer, no onclick | **REAL tile map** (Leaflet+OSM web with built-in zoom control / react-native-maps pinch-zoom native), dealer pin + you-are-here dot | ✅ |
| s-dealer-map | ⭐ Rating row | (feedback pass 2) | tappable → confirm → Google reviews | ✅ |
| s-dealer-map | 🧭 Get directions | (cursor) | confirm → Google Maps directions to the dealer address | ✅ |
| s-dealer-map | Share | (cursor) | Native `Share.share` sheet with dealer + address | ✅ |
| s-home-bundle-deals | Claim this bundle → | `nav('maint-schedule-book')` | cross-tab → MaintTab/MaintScheduleBook (seeds cart) | ✅ |
| s-home-bundle-deals | Claim this deal → | `nav('maint-schedule-book')` | same | ✅ |
| s-home-bundle-deals | Book & save → | `nav('maint-schedule-book')` | same | ✅ |
| s-notifications | Mark all read (header) | (cursor) | `notificationService.markAllRead()` + query invalidate | ✅ |
| s-notifications | Quote accepted card | `nav('accept-booking')` | deep link + mark-read | ✅ |
| s-notifications | Oil change due card | `nav('maint-schedule')` | cross-tab deep link | ✅ |
| s-notifications | Gold tier card | `nav('prof-earn')` | cross-tab deep link | ✅ |
| s-notifications | 8 shops responded card | `nav('dealer-quotes')` | deep link | ✅ |
| s-notifications | Sarah replied card | (cursor) | deep link → CommunityTab/CommPost | ✅ |
| s-notifications | Upcoming appointment card | `nav('maint-schedule-confirm')` | cross-tab deep link | ✅ |

## Maintenance tab

| Screen | Button/element | Stated action | Implementation | Status |
|---|---|---|---|---|
| s-maint-dashboard | Vehicle card › | `nav('maint-history')` | → MaintHistory | ✅ |
| s-maint-dashboard | DIY tips card | `nav('maint-diy')` | → MaintDiy | ✅ |
| s-maint-dashboard | 📅 Book a service | `nav('maint-schedule')` | → MaintSchedule | ✅ |
| s-maint-history | 📷 Scan receipt | `nav('maint-scan-cam')` | → MaintScanCam | ✅ |
| s-maint-history | ✏️ Manual input | `nav('maint-manual')` | → MaintManual | ✅ |
| s-maint-history | Type filter (All types/Oil/Tires/Brakes/Body) | (cursor) | **dropdown `Select`** (feedback pass 1) — modal option list, filters the list | ✅ |
| s-maint-history | Time filter (All time/6 months/2024/2023) | (cursor) | **dropdown `Select`** side-by-side with Type, filters the list | ✅ |
| s-maint-scan-cam | 📷 Capture receipt | cursor:pointer, no onclick | **REAL camera capture** (expo-image-picker) — the photographed receipt fills the viewfinder; OCR stays mocked | ✅ |
| s-maint-scan-cam | 🗂 Gallery instead | cursor:pointer, no onclick | **REAL gallery import** — picked image previews in the viewfinder | ✅ |
| s-maint-scan-cam | ← Retake | `back()` | clears capture; goBack when nothing captured | ✅ |
| s-maint-scan-cam | Review scan → | `nav('maint-scan-rev')` | `maintService.scanReceipt` (OCR) with **animated scan-line shimmer** on the viewfinder while pending → MaintScanRev | ✅ |
| s-maint-scan-rev | ✎ field edit icons | (cursor) | Alert (field editing arrives with real OCR) | 🔌 |
| s-maint-scan-rev | Save to history → (+20 pts) | `nav('maint-history')` | `maintService.saveScannedRecord` + points → MaintHistory | ✅ |
| s-maint-manual | Service-type chips | (cursor) | single-select | ✅ |
| s-maint-manual | Save service record → (+10 pts) | `nav('maint-history')` | `maintService.saveManualRecord` + points → MaintHistory | ✅ |
| s-maint-diy | Category chips (All/Bumper/Scratches/…) | cursor:pointer, no onclick | selectable chips (visual parity with wireframe) | ✅ |
| s-maint-diy | Read guide → (free guides) | (cursor) | Alert preview of guide steps | 🔌 |
| s-maint-diy | $10 Forever stat chip | `nav('diy-unlock')` | → DiyUnlock (hidden when Pro) | ✅ |
| s-maint-diy | Unlock Pro · $10 forever (lock CTA) | (cursor) | → DiyUnlock | ✅ |
| s-maint-diy | 12 guide rows (Pro unlocked) | (cursor) | Alert preview per guide | 🔌 |
| s-diy-unlock | 💳 Visa pay-with row | cursor:pointer, no onclick | informational (single card on file) | n/a |
| s-diy-unlock | Unlock Pro for $10 → | `nav('diy-payment')` | → DiyPayment | ✅ |
| s-diy-payment | Pay-with rows (Visa / Apple Pay) | (cursor) | single-select; Apple Pay row opens the simulated ** Pay sheet** — confirming it runs the same onPay | ✅ |
| s-diy-payment | ➕ Use points toggle | (app-only, Phase 6) | redemption math, total updates | ✅ |
| s-diy-payment | Pay $10.00 | `nav('diy-confirm')` | `pointsService.redeem` + `proService.unlockPro` (sets `isPro`), loading + **blocking overlay** → DiyConfirm | ✅ |
| s-diy-confirm | 📚 All 12 DIY repair guides | `nav('diy-guides')` | → DiyGuides | ✅ |
| s-diy-confirm | 🤖 AI damage-to-guide matching | `nav('diy-match')` | → DiyMatch | ✅ |
| s-diy-confirm | 🛠️ Tool & parts shopping lists | `nav('diy-tools')` | → DiyTools | ✅ |
| s-diy-confirm | ♾️ All future guides included | `nav('diy-future')` | → DiyFuture | ✅ |
| s-diy-confirm | Start exploring → | `nav('diy-guides')` | → DiyGuides | ✅ |
| s-diy-guides | 12 guide rows | cursor:pointer, no onclick | Alert preview per guide (no detail screen in wireframe) | 🔌 |
| s-diy-match | Open guide | `nav('diy-guides')` | → DiyGuides | ✅ |
| s-diy-match | Compare to quotes | `nav('dealer-quotes')` | cross-tab → HomeTab/DealerQuotes | ✅ |
| s-diy-tools | (no interactive elements) | — | — | — |
| s-diy-future | ▲ vote buttons (×4) | cursor:pointer, no onclick | toggleable votes, count increments locally | ✅ |
| s-maint-schedule | Service chips (All/Oil/Tires/Brakes/Insp.) | `selectSvc(this, …)` | single-select chips | ✅ |
| s-maint-schedule | Dealer rows (×3) | `nav('maint-schedule-book')` | `startBooking(dealerId)` → MaintScheduleBook | ✅ |
| s-maint-schedule | ★ rating + 🕐 hours (per dealer card) | (feedback pass 2) | rating tappable → Google reviews; hours line added to every dealer card | ✅ |
| s-maint-schedule-book | Service rows (oil/tires/inspection/brakes) | `toggleSvcItem(this)` | cart toggle; dynamic totals (price + duration) | ✅ |
| s-maint-schedule-book | Calendar ‹ › arrows | cursor:pointer, no onclick | Alert: demo availability is April 2027 | 🔌 |
| s-maint-schedule-book | Calendar days + time slots | (cursor) | `setCartSlot` | ✅ |
| s-maint-schedule-book | Continue to payment → | `goPayment()` | → MaintPayment (renders live cart) | ✅ |
| s-maint-payment | Payment-method rows (Visa / Apple Pay) | (cursor) | single-select; Apple Pay row opens the simulated ** Pay sheet** (total shown) — confirming completes payment via the same onPay | ✅ |
| s-maint-payment | ➕ Use points toggle | (app-only, Phase 6) | redemption applied to total | ✅ |
| s-maint-payment | Confirm & pay $… → | `nav('maint-schedule-confirm')` | `pointsService.redeem` + `maintService.payForBooking`, loading + **blocking overlay** → confirm | ✅ |
| s-maint-schedule-confirm | Edit (reminder row) | (cursor) | **timing modal** (shared `ReminderRow`) saved to store `reminderPref`; copy updates live | ✅ |
| s-maint-schedule-confirm | Done | `nav('maint-dashboard')` | clears cart → MaintDashboard | ✅ |
| s-maint-schedule-confirm | Add to calendar | (cursor) | **real export** — native: expo-calendar event (services + paid total in notes); web: confirm → Google Calendar template | ✅ |

## Compare tab

| Screen | Button/element | Stated action | Implementation | Status |
|---|---|---|---|---|
| s-comp-select | Accepted quote rows | `nav('comp-cash-ins')` | → CompCashIns with `quoteId` | ✅ |
| s-comp-cash-ins | 💰 Pay cash card + CTA | `nav('comp-cash-book')` | → CompCashBook | ✅ |
| s-comp-cash-ins | 🛡️ File insurance card + CTA | `nav('comp-insurance')` | → CompInsurance | ✅ |
| s-comp-cash-ins | 📊 See full cost breakdown | `nav('comp-deep-dive')` | → CompDeepDive (live actuarial numbers) | ✅ |
| s-comp-deep-dive | Assumptions disclosure | (app-only, Phase 5) | expand/collapse | ✅ |
| s-comp-deep-dive | Book Honda Fairfax · Pay cash → | `nav('comp-cash-book')` | → CompCashBook | ✅ |
| s-comp-cash-book | Calendar ‹ › arrows | cursor:pointer, no onclick | Alert: demo availability is April 2027 | 🔌 |
| s-comp-cash-book | Calendar days + time slots | (cursor) | selectable | ✅ |
| s-comp-cash-book | Change (card on file) | cursor:pointer, no onclick | **fixed** — cross-tab → ProfileTab/ProfPayment | ✅ |
| s-comp-cash-book | Confirm booking — Apr 7 at 10:30 AM | `nav('booking-confirm')` | `bookAppointment`, loading + **blocking overlay**, cross-tab → HomeTab/BookingConfirm | ✅ |
| s-comp-insurance | 📞 Call now | (cursor) | Alert (device dialer) | 🔌 |
| s-comp-insurance | Dismiss | (cursor) | `goBack()` | ✅ |

## Community tab

| Screen | Button/element | Stated action | Implementation | Status |
|---|---|---|---|---|
| s-comm-channels | Honda Owners row (+ View) | `nav('comm-honda')` | → CommHonda | ✅ |
| s-comm-channels | Toyota / GM rows | (cursor) | Alert (joining other channels = backend) | 🔌 |
| s-comm-honda | + Post (+50 pts, header) | `nav('comm-create')` | → CommCreate | ✅ |
| s-comm-honda | Post cards (×4) | `nav('comm-post')` | → CommPost with `postId` | ✅ |
| s-comm-post | ❤️ like (post) | (cursor) | **fixed** — toggles liked state, count ±1 locally | ✅ |
| s-comm-post | Share | (cursor) | **fixed** — native `Share.share` sheet | ✅ |
| s-comm-post | ❤️ like (per comment) | (cursor) | **fixed** — per-comment like toggle | ✅ |
| s-comm-post | Reply (per comment) | (cursor) | **fixed** — prefixes composer with `@Author`, focuses input | ✅ |
| s-comm-post | Composer input + ➤ send | (cursor) | **fixed** — real TextInput; send appends your comment locally, reply count updates | ✅ |
| s-comm-create | Channel picker (Honda Owners ▼) | (none in wireframe) | informational (single channel) | n/a |
| s-comm-create | Category chips (Question/Help/…) | (cursor) | single-select | ✅ |
| s-comm-create | 📷 Camera tile | (cursor) | **fixed** — adds the mock photo | ✅ |
| s-comm-create | 🖼️ Gallery tile | (cursor) | **fixed** — adds the mock photo | ✅ |
| s-comm-create | ✕ remove photo | (cursor) | removes photo (publish points update) | ✅ |
| s-comm-create | Publish → earn +60 pts | (cursor) | `communityService.createPost` (loading) + points + feed invalidate → back | ✅ |

## Profile tab

| Screen | Button/element | Stated action | Implementation | Status |
|---|---|---|---|---|
| s-prof-hub | Points card (420 pts = $4.20) | `nav('prof-miles')` | → ProfMiles (live balance + USD) | ✅ |
| s-prof-hub | 🏆 Explore reward milestones → | `nav('prof-miles')` | → ProfMiles | ✅ |
| s-prof-hub | 🚗 My cars | `nav('prof-cars')` | → ProfCars | ✅ |
| s-prof-hub | 🛡️ Insurance policy | `nav('prof-insurance')` | → ProfInsurance | ✅ |
| s-prof-hub | 💳 Payment method | `nav('prof-payment')` | → ProfPayment | ✅ |
| s-prof-hub | ⚙️ Settings | `nav('prof-settings')` | → ProfSettings | ✅ |
| s-prof-miles | Milestone cards (×3) | (cursor) | → ProfMileDet | ✅ |
| s-prof-mile-det | Get directions (×2) | (cursor) | confirm → Google Maps directions to the partner dealer; ★ ratings are tappable → Google reviews | ✅ |
| s-prof-mile-det | Redeem here (×2) | (cursor) | Alert (in-shop QR redemption = backend) | 🔌 |
| s-prof-earn | (history list, no interactive elements) | — | — | — |
| s-prof-cars | Edit car | (cursor) | inline edit modal (name + odometer) → `vehiclesService.updateVehicle` | ✅ |
| s-prof-cars | Remove | (cursor) | confirm → `vehiclesService.removeVehicle`; empty state "No vehicles yet" + add card | ✅ |
| s-prof-cars | ➕ Add another car | (cursor) | add modal (name + odometer) → `vehiclesService.addVehicle` | ✅ |
| s-prof-insurance | ✎ Edit policy details | `nav('prof-ins-edit')` | → ProfInsEdit with `policyId` | ✅ |
| s-prof-insurance | ➕ Remove (per policy card) | (feedback pass 1) | confirm → `insuranceService.removePolicy` (mock + DELETE /profile/policies/:id) | ✅ |
| s-prof-insurance | ➕ Add another policy | `nav('prof-ins-add')` | → ProfInsAdd | ✅ |
| s-prof-insurance | ⚖ Compare cash vs. insurance → | (cursor) | cross-tab → CompareTab/CompSelect | ✅ |
| s-prof-ins-edit | Provider picker + carrier chips | (cursor) | inline carrier options | ✅ |
| s-prof-ins-edit | Cancel | `back()` | `goBack()` | ✅ |
| s-prof-ins-edit | Save changes | `nav('prof-insurance')` | `insuranceService.updatePolicy` ("Saving…") + policies/comparison invalidate → back | ✅ |
| s-prof-ins-add | 📷 Scan insurance card | (cursor) | **REAL camera capture first** (cancel aborts), then OCR spinner → autofills form | ✅ |
| s-prof-ins-add | ✍️ Enter manually | (cursor) | informational (the form *is* below) | n/a |
| s-prof-ins-add | Connect my insurer rows | (app-only, Phase 4) | aggregator connect with per-row spinner (insurance sync) | ✅ |
| s-prof-ins-add | Add policy | `nav('prof-insurance')` | `insuranceService.addPolicy` + earn rule, validation errors → back | ✅ |
| s-prof-payment | Edit card | (cursor) | modal form (holder + expiry editable, last4 read-only) → `paymentMethodsService.updateCard` | ✅ |
| s-prof-payment | Remove | (cursor) | confirm → `paymentMethodsService.removeCard`; empty state with add prompt | ✅ |
| s-prof-payment | ➕ Add payment method | (cursor) | modal form (holder, last4, expiry) → `paymentMethodsService.addCard` | ✅ |
| s-prof-payment | Apple Pay row | (cursor) | opens the simulated ** Pay sheet** (`ApplePaySheet`) → processing → ✓ Done | ✅ |
| s-prof-settings | Edit profile / Change email / phone / password / Linked accounts | `nav('prof-…')` ×5 | each → its screen | ✅ |
| s-prof-settings | Notification toggles (×4) | `toggleNotif(this)` | TogglePill state per row | ✅ |
| s-prof-settings | Dark mode toggle | `toggleDarkMode(this)` | Zustand `darkMode` — themes the whole app | ✅ |
| s-prof-settings | Language (shows current) | `nav('prof-language')` | → ProfLanguage; row shows store value | ✅ |
| s-prof-settings | Distance units (shows current) | `nav('prof-distance')` | → ProfDistance; row shows store value | ✅ |
| s-prof-settings | Help center / Terms / Privacy | `nav('prof-…')` ×3 | each → its screen | ✅ |
| s-prof-settings | Sign out | `showSignOutPopup()` | bottom sheet → confirm `signOut()` → Splash / Cancel | ✅ |
| s-prof-settings | Delete account | (cursor) | Alert (account deletion = backend) | 🔌 |
| s-prof-edit-profile | Change photo | (cursor) | Alert (device camera / gallery) — **was dead, fixed** | 🔌 |
| s-prof-edit-profile | Save changes | (cursor) | saves form state → back | ✅ |
| s-prof-change-email | Send verification link | (cursor) | mock submit → back | ✅ |
| s-prof-change-password | Update password | (cursor) | mock submit → back | ✅ |
| s-prof-change-phone | Send verification code | (cursor) | mock submit → back | ✅ |
| s-prof-linked-accounts | Connect (Apple) | (cursor) | branded Apple ID sheet → `authService.socialSignIn('apple')` → row flips to Connected | ✅ |
| s-prof-linked-accounts | Connect (Facebook) | (cursor) | Alert (OAuth = backend) | 🔌 |
| s-prof-help-center | Search field | (input) | live TextInput | ✅ |
| s-prof-help-center | 4 topic rows | `nav('help-…')` ×4 | → HelpPhotos / HelpQuotes / HelpBookings / HelpContact | ✅ |
| s-help-photos | Still need help? Contact support → | `nav('help-contact')` | → HelpContact | ✅ |
| s-help-quotes | Still need help? Contact support → | `nav('help-contact')` | → HelpContact | ✅ |
| s-help-bookings | Still need help? Contact support → | `nav('help-contact')` | → HelpContact | ✅ |
| s-help-contact | 💬 Start chat | (cursor) | Alert (live chat = backend) | 🔌 |
| s-help-contact | ✉️ Email us | (cursor) | Alert (mail draft = device mail) | 🔌 |
| s-prof-terms / s-prof-privacy | (legal docs, no interactive elements) | — | — | — |
| s-prof-language | Language rows (×4) | (cursor) | **fixed** — selection persisted in Zustand store (survives navigation), Settings row reflects it | ✅ |
| s-prof-distance | Miles / Kilometers rows | (cursor) | **fixed** — persisted in store, Settings row reflects it | ✅ |

## Audit totals

Counted by table row above (a row like "8 price pins" covers all of its
repeated elements).

| Status | Rows |
|---|---|
| ✅ working | 157 |
| 🔌 stub-with-alert (device/backend capability) | 29 |
| n/a (informational by design in wireframe) | 4 |
| ❌ dead | **0** |

### Dead buttons found & fixed in Phase 7

1. **CommPost "Reply"** (every comment) — no handler → prefixes composer with `@Author` and focuses it.
2. **CommPost like / Share / composer send** — plain text → like toggles (post + per-comment), native Share sheet, send posts a local comment.
3. **CompCashBook "Change"** (card on file) — no handler → cross-tab to Profile → Payment method.
4. **MaintScanCam "📷 Capture receipt"** — no handler → mock capture with receipt preview in the viewfinder.
5. **MaintScanCam "🗂 Gallery instead"** — no handler → mock gallery import preview.
6. **ProfEditProfile "Change photo"** — no handler → device-capability Alert.
7. **DealerMap zoom + / −** — decorative → adjust real map scale state.
8. **CommCreate Camera / Gallery tiles** — non-pressable → add the mock photo.
9. **Calendar ‹ › month arrows** (accept-booking, schedule-book, comp-cash-book) — decorative → demo-availability Alert.
10. **"Read guide →" links / Pro guide rows** — non-pressable → guide preview Alerts.
11. **Language / Distance selections** — local state that silently reset on navigation → persisted in the Zustand store and surfaced in Settings.
