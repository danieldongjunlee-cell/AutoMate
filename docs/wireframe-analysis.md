# AutoMate — Wireframe v15 Analysis (Step 1)

Source of truth: `AutoMate_Interactive_Wireframe_v15.html` (55 screens).
The wireframe's own JS defines the canonical model used here:
`FLOW` (screen list), `NAMES` (titles), `TH` (tab roots), `BK` (back-stack parents), `tabOf()` (tab ownership).

---

## 1. Screen inventory (55 screens)

### Auth — 4 screens (no tab bar, dark navy status bar)

| # | Wireframe ID | Title | Contents / interactive elements |
|---|---|---|---|
| 1 | `s-splash` | Splash | Logo + tagline "YOUR CAR. YOUR RIGHTS. YOUR SAVINGS.", **Get started →** (→ signup), **I already have an account** (→ login)¹, Apple / Google social buttons¹ |
| 2 | `s-signup` | Sign Up | Full name / Email / Phone / Password fields, Show-password, **Create account** (→ verify-otp)² |
| 3 | `s-login` | Log In | Email / Password, Forgot password?, **Sign in** (→ verify-otp) |
| 4 | `s-verify-otp` | Verify OTP | 6-digit code boxes (sent to +1 703 555-0198), **Verify →** (→ home), Resend (0:42 countdown) |

¹ No handler in wireframe — implied targets (login / social auth stubs). ² Wireframe attaches the nav handler to the heading, not the button — implemented on the button.

### Home tab — 14 screens (root: `home`)

| # | Wireframe ID | Title | Contents / interactive elements |
|---|---|---|---|
| 5 | `s-home` | Home | Logo header, bell w/ unread dot (→ notifications), Day-5 streak banner +10 pts (→ prof-earn ⤴profile), hero **Get a Repair Estimate** (→ car-diagram), Honda Fairfax Summer Bundle **Claim deal →** (→ home-bundle-deals), Pending quotes card "Rear bumper dent · 3 of 8 dealers quoted · 3 new" (→ dealer-quotes) |
| 6 | `s-car-diagram` | Select Part | Top-down car grid, **15 multi-selectable parts** (Front/Rear bumper, Hood, Windshield, Roof, Rear window, Trunk, L/R Fender, L/R Door, L/R Rear door, L/R Rear fender), "N selected" badge, AI Estimate CTA "N parts →" disabled at 0 (→ photo-example) |
| 7 | `s-photo-example` | Photo Guide | "Step 2 of 3", example photo card, 3 tips (lighting, 3–5 ft, 3+ angles), **← Change part** (back), **Take photos →** (→ camera) |
| 8 | `s-camera` | Take Photos | Viewfinder w/ rule-of-thirds grid + corner brackets, photo slots (1 of 3 required, Angle 2/3 dashed), AI tip, **📁 Upload**, **Submit photos →** (→ confirm-submit) |
| 9 | `s-confirm-submit` | Confirm Damage | Selected-parts list (Edit ✎ → car-diagram, + Photos → camera), Damage location card, damage-type chips (Dent ✔ / Scratch / Paint chip / Crack / Missing piece), photo strip (3 + Add), + Add another damaged part, **Submit for quotes →** (→ submitted), "Sending to 12 verified shops in Fairfax, VA" |
| 10 | `s-submitted` | Submitted | ✅ "Photos sent to 12 shops", stats (1–3 hrs / 12 shops / Free), "Notify me" banner (→ dealer-quotes), AI Repair Recommendation (87% confidence) + Pro-locked blurred DIY guides, **Unlock Pro · $10** |
| 11 | `s-after-hours` | After Hours | Dark 11:48 PM variant of Submitted: 🌙 "Most auto shops are now closed", quote timeline (Sent → 8 AM Opens → ~10 AM Quotes), Pro-locked AI rec, **View available quotes →** (→ dealer-quotes), **Back to home** (→ home). Status bar forced dark/"11:48 PM" |
| 12 | `s-dealer-quotes` | Quotes Received | "8 quotes" badge, range card $285–$480, photo-estimate disclaimer, QuoteCards (Honda Fairfax ★4.9 $330, AutoFix Pro ★4.8 $285) each w/ **Accept quote** (→ accept-booking), hours chip, **Msg**; **See all 8 quotes on map** (→ all-quotes-map) |
| 13 | `s-all-quotes-map` | All Quotes Map | Dark map w/ priced pins + you-are-here, legend (Lowest/Good/Fair/Higher), quote rows (→ accept-booking), ← back to list |
| 14 | `s-map` | Map | Alternate light map: filter chips (All (8) / Brand ▼ / Under $350), price-range cluster pills, selected dealer card w/ **Accept quote** (→ accept-booking) + **📞 Call** ³ |
| 15 | `s-accept-booking` | Accept & Book | Accepted-quote banner, April 2027 calendar (12 selected, disabled days), time slots (10:30 AM selected), **Confirm booking — Apr 12 at 10:30 AM** (→ booking-confirm) |
| 16 | `s-booking-confirm` | Booking Confirmed | ✅ "You're all set!", booking summary grid (dealer/date/estimate/service/drop-off), reminder card w/ Edit, "What to bring" list, **Add to calendar**, **View on map** (→ home) |
| 17 | `s-home-bundle-deals` | Bundle Deals | 3 partner deals: Honda Fairfax Summer Bundle (SAVE $89, item prices w/ strikethroughs), AutoFix Pro (20% OFF), Vienna Auto Care ($30 OFF, code AUTOMATE30) — each claim CTA → maint-schedule-book ⤴maint |
| 18 | `s-notifications` | Notifications | **Mark all read**; Unread: quote accepted (→ accept-booking), oil change due (→ maint-schedule ⤴), Gold tier (→ prof-earn ⤴); Earlier: 8 shops responded (→ dealer-quotes), community reply (no nav), upcoming appointment (→ maint-schedule-confirm ⤴) |

³ `s-map` is unreachable by tap in the prototype (only via its linear Next button) — see Flags.

### Maintenance tab — 10 screens (root: `maint-dashboard`)

| # | Wireframe ID | Title | Contents / interactive elements |
|---|---|---|---|
| 19 | `s-maint-dashboard` | Maintenance | Market value card ($17,400, ↑$420, low/high bar), car card (2019 Honda Accord EX-L · 47,230 mi · health 78%, › → maint-history), DIY tips card (→ maint-diy), **Book a service** banner (→ maint-schedule), upcoming services (Oil "Soon", Tire rotation "Upcoming", Inspection "Scheduled") |
| 20 | `s-maint-history` | Service History | Time filters (All time / 6 mo / 2024 / 2023), type filters (All / Oil / Tires / Brakes / Body), health ring 78, **Scan receipt +20 pts** (→ maint-scan-cam), **Manual input +10 pts** (→ maint-manual), past services list |
| 21 | `s-maint-scan-cam` | Scan Camera | Receipt viewfinder w/ scan line, tips, **Capture receipt**, **Gallery instead**, **← Retake** (back), **Review scan →** (→ maint-scan-rev) |
| 22 | `s-maint-scan-rev` | Scan Review | Parsed fields (service type / shop / date / mileage / amount, each w/ Edit), **Save to history →** (→ maint-history) |
| 23 | `s-maint-manual` | Manual Log | Service-type chips, Shop / Date / Mileage / Cost inputs, **Save service record →** (→ maint-history) |
| 24 | `s-maint-diy` | DIY Tips Hub | Stats header (12 guides / $10 forever / 5 min), category chips, 2 free guides (EASY), Pro-locked blurred guides (+10 more), **Unlock Pro · $10 forever** |
| 25 | `s-maint-schedule` | Schedule Service | Service-type chips (single-select), 3 DealerCards (Honda Fairfax / AutoFix Pro Fairfax / Vienna Auto Care w/ open status + price chips) → maint-schedule-book |
| 26 | `s-maint-schedule-book` | Book Appointment | **Multi-select service rows** (Oil $49 ✔ / Tire rotation $29 / Inspection $39 / Brake inspection $149), live total banner ("1 service selected · Total: $49 · ~45 min"), calendar + time slots, **Continue to payment →** (→ maint-payment) |
| 27 | `s-maint-payment` | Payment | Order summary, payment methods (Visa ••••4242 default / Apple Pay), "charged after service completion" note, **Confirm & pay $49 →** (→ maint-schedule-confirm) |
| 28 | `s-maint-schedule-confirm` | Booking Confirmed | ✅ "You're booked!", summary grid, reminder card, **Done** (→ maint-dashboard), **Add to calendar** |

### Compare tab — 5 screens (root: `comp-select`)

| # | Wireframe ID | Title | Contents / interactive elements |
|---|---|---|---|
| 29 | `s-comp-select` | Select Quote | Info banner, accepted quotes (Honda Fairfax $320–$345 → comp-cash-ins; AutoFix Pro $280–$310; City Body Shop $350–$375) |
| 30 | `s-comp-cash-ins` | Cash vs Insurance | Selected-quote card, policy banner (State Farm · $500 ded. · $1,200/yr), side-by-side: **Pay cash $320 ✔ Recommended** (→ comp-cash-book) vs **File insurance $0 ⚠ Rate hike** (→ comp-insurance), **See full cost breakdown** (→ comp-deep-dive) |
| 31 | `s-comp-deep-dive` | Cost Deep Dive | 3-yr table (repair / deductible / premium hike +$540 / claim on record → totals $320 vs $1,040), break-even note, Verdict (Pay cash ✔) vs Filing risk (High ⚠), **Book Honda Fairfax · Pay cash →** (→ comp-cash-book) |
| 32 | `s-comp-cash-book` | Book (Cash) | Cash banner, calendar + time slots, Visa ••••4242 row w/ Change, **Confirm booking — Apr 7 at 10:30 AM** (→ booking-confirm ⤴home) |
| 33 | `s-comp-insurance` | Contact Insurer | "File a claim" sheet: State Farm policy #, **1-800-STATE-FARM**, 24/7 chip, reference REF-AM-9821-VA, premium-hike warning, **📞 Call now**, **Dismiss** |

### Community tab — 4 screens (root: `comm-channels`)

| # | Wireframe ID | Title | Contents / interactive elements |
|---|---|---|---|
| 34 | `s-comm-channels` | Community | Brand channels: Honda Owners (1,240 members, joined → comm-honda), Toyota Owners / GM Owners w/ **Join**, +50 pts banner |
| 35 | `s-comm-honda` | Honda Feed | **+ Post (+50 pts)** (→ comm-create), member/new-post chips, 4 posts w/ author + car + category badge (Tip/Review/Question/Warning), replies/likes (→ comm-post) |
| 36 | `s-comm-post` | Post Detail | Full post w/ photo attachment, like / 14 replies / Share, 4 comments w/ like + Reply, comment composer |
| 37 | `s-comm-create` | Create Post | Points banner (+50, +10 photo bonus), channel picker, category chips, body input, photo slots (Camera / Gallery / attached w/ ✕ / up to 4), **Publish → earn +60 pts** |

### Profile tab — 18 screens (root: `prof-hub`)

| # | Wireframe ID | Title | Contents / interactive elements |
|---|---|---|---|
| 38 | `s-prof-hub` | Profile | Avatar, John Doe, completion 85% bar, points card "420 pts = $4.20" + **Explore reward milestones →** (→ prof-miles), rows: My cars (→ prof-cars), Insurance policy w/ "Check" chip (→ prof-insurance), Payment method (→ prof-payment), Settings (→ prof-settings) |
| 39 | `s-prof-miles` | Milestones | Balance card (100 pts = $1), milestone cards w/ progress bars: Free oil change 6,000 / Free tire rotation 10,000 / Free inspection 25,000 (tap → prof-mile-det)⁴ |
| 40 | `s-prof-mile-det` | Milestone Detail | Free Oil Change header + progress, partner dealerships (Honda Fairfax OEM / AutoFix Pro Same-day) w/ **Get directions** + **Redeem here** |
| 41 | `s-prof-earn` | Earn History | Balance card, earn actions: daily check-in +10, scan receipt +20, manual log +10, book service +50, submit photos +20, community post +50, add insurance +100, refer a friend +100 |
| 42 | `s-prof-cars` | My Cars | Vehicle card (Primary, VIN 1HGCV1F34KA01234, odometer, oil spec, last service, **Edit car** / **Remove**), **+ Add another car** (VIN scan or manual), tip banner |
| 43 | `s-prof-insurance` | Insurance | State Farm policy card (Active; policy #, deductible, premium, covers, renewal; **Edit policy**), **+ Add another policy**, **Compare cash vs. insurance →** link⁵ |
| 44 | `s-prof-payment` | Payment | Visa card art (•••• 4242, John Doe, 08/27; **Edit card** / **Remove**), Apple Pay row (Ready), **+ Add payment method**, PCI note |
| 45 | `s-prof-settings` | Settings | Account: Edit profile / Change email / Change phone / Change password / Linked accounts. Notifications: 4 toggles (Quote alerts ✔, Service reminders ✔, Community replies ✗, Streak reminders ✔). App preferences: **Dark mode toggle**, Language (English), Distance units (Miles). Support & legal: Help / Terms / Privacy. **Sign out** (→ bottom sheet → splash), Delete account, "AutoMate v1.0.0 · Build 2027.1" |
| 46–55 | `s-prof-edit-profile`, `s-prof-change-email`, `s-prof-change-password`, `s-prof-change-phone`, `s-prof-linked-accounts`, `s-prof-help-center`, `s-prof-terms`, `s-prof-privacy`, `s-prof-language`, `s-prof-distance` | Settings sub-screens | Edit profile (photo/name/username/bio + Save), Change email (verify link), Change password (3 fields), Change phone (SMS code), Linked accounts (Google connected, Apple/Facebook connect), Help center (search + 4 topics), Terms, Privacy, Language (EN ✔/한국어/Español/中文), Distance (Miles ✔/Kilometers) |

⁴ Tap target implied; wireframe reaches it only via its Next button. ⁵ No handler in wireframe; implied → Compare tab.

**Global elements (not screens):** status bar (light/dark variants; forced "11:48 PM" dark on after-hours), 5-tab bar (hidden on auth), **sign-out confirmation bottom sheet** (Sign out → splash / Cancel).

---

## 2. Navigation map

### Tab bar (from `TH` + `tabOf()`)

| Tab | Root screen | Owns |
|---|---|---|
| 🏠 Home | `home` | home, car-diagram, photo-example, camera, confirm-submit, submitted, after-hours, dealer-quotes, all-quotes-map, map, accept-booking, booking-confirm, home-bundle-deals, notifications |
| 🔧 Maint. | `maint-dashboard` | all `maint-*` |
| ⚖ Compare | `comp-select` | all `comp-*` |
| 💬 Community | `comm-channels` | all `comm-*` |
| 👤 Profile | `prof-hub` | all `prof-*` |

Prototype `tab()` always jumps to the tab **root** and clears history — matches the requirement "tab press always resets to the tab's root screen". Tab bar hidden on the 4 auth screens.

### Back-stack parents (wireframe `BK` map — drives stack nesting)

```
Auth      signup ← splash   login ← splash   verify-otp ← splash
Home      car-diagram ← home ← (photo-example ← camera ← confirm-submit chain)
          submitted ← home   after-hours ← submitted   dealer-quotes ← submitted
          all-quotes-map ← dealer-quotes   map ← dealer-quotes
          accept-booking ← map   booking-confirm ← accept-booking
          home-bundle-deals ← home   notifications ← home
Maint     history/manual/diy/schedule ← maint-dashboard
          scan-cam ← history   scan-rev ← scan-cam
          schedule-book ← schedule   payment ← schedule-book   schedule-confirm ← payment
Compare   cash-ins ← comp-select   deep-dive ← cash-ins   insurance ← cash-ins
          cash-book ← deep-dive
Community honda ← channels   post ← honda   create ← honda
Profile   miles/earn/cars/insurance/payment/settings ← prof-hub
          mile-det ← miles   all 10 settings sub-screens ← settings
```

### Forward edges (every `nav()` call, by source)

```
splash          → signup, (login¹, social¹)
signup          → verify-otp
login           → verify-otp
verify-otp      → home  (auth complete — replace stack)

home            → notifications, prof-earn⤴, car-diagram, home-bundle-deals, dealer-quotes
car-diagram     → photo-example          (CTA enabled when ≥1 part)
photo-example   → camera | back
camera          → confirm-submit
confirm-submit  → car-diagram (edit), camera (+photos), submitted
submitted       → dealer-quotes
after-hours     → dealer-quotes, home
dealer-quotes   → accept-booking (per quote), all-quotes-map
all-quotes-map  → accept-booking (per row), back
map             → accept-booking
accept-booking  → booking-confirm
booking-confirm → home ("View on map" reuses → home in wireframe)
home-bundle-deals → maint-schedule-book⤴ (×3 deals)
notifications   → accept-booking, maint-schedule⤴, prof-earn⤴, dealer-quotes, maint-schedule-confirm⤴

maint-dashboard → maint-history, maint-diy, maint-schedule
maint-history   → maint-scan-cam, maint-manual
maint-scan-cam  → maint-scan-rev | back (retake)
maint-scan-rev  → maint-history (save)
maint-manual    → maint-history (save)
maint-schedule  → maint-schedule-book (per dealer)
maint-schedule-book → maint-payment
maint-payment   → maint-schedule-confirm
maint-schedule-confirm → maint-dashboard (done)

comp-select     → comp-cash-ins
comp-cash-ins   → comp-cash-book, comp-insurance, comp-deep-dive
comp-deep-dive  → comp-cash-book
comp-cash-book  → booking-confirm⤴ (home tab)

comm-channels   → comm-honda
comm-honda      → comm-create, comm-post (per post)
prof-hub        → prof-miles, prof-cars, prof-insurance, prof-payment, prof-settings
prof-settings   → 10 sub-screens; Sign out → sheet → splash (reset to auth)

sign-out sheet  → splash (clears session)
```
⤴ = cross-tab jump (switch tab, then push target onto that tab's stack).

### Deep links from notifications

| Notification | Target | Tab |
|---|---|---|
| Quote accepted ($320–$345 ready) | accept-booking | Home |
| Oil change due soon | maint-schedule | Maint |
| Gold tier reached | prof-earn | Profile |
| 8 shops responded | dealer-quotes | Home |
| Upcoming appointment | maint-schedule-confirm | Maint |

### Conditional flows
- **After-hours**: `confirm-submit → submitted` becomes `→ after-hours` when submitted outside business hours (prototype models this as the 11:48 PM dark variant; back-parent is `submitted`'s slot, status bar dark).
- **Pro gating**: blurred + locked DIY content on submitted / after-hours / maint-diy until "Unlock Pro · $10".
- **Dark mode**: prototype fakes it with a CSS invert filter; the app implements real token-based theming (per requirements).

---

## 3. Design tokens

### Colors

| Token | Hex | Usage in wireframe |
|---|---|---|
| `primary` | `#7F77DD` | CTAs, active tab, selected states, pins |
| `primaryDark` | `#534AB7` | Gradients w/ primary, selected part fill, links |
| `primaryDeep` | `#3C3489` | Headings on primary surfaces |
| `primaryLight` | `#AFA9EC` | Borders, dashed outlines, secondary fills |
| `primarySurface` | `#EEEDFE` | Tinted cards, chips, selected rows |
| `background` | `#F4F2ED` | Screen background |
| `surface` | `#F8F7F4` | Cards, list groups |
| `surfaceAlt` | `#F0EDE6` | Dividers-as-bg, diagram bg, calendar arrows |
| `inputBg` | `#FAFAF8` | Text inputs, quote cards |
| `border` | `#E0DDD5` | Card/input borders, tab bar top border |
| `divider` | `#F0EDE6` | Row separators |
| `disabled` | `#D0CECA` | Disabled calendar days, inactive slots |
| `textPrimary` | `#1A1A1A` | Body / headings |
| `textSecondary` | `#555555` | Secondary copy |
| `textTertiary` | `#888888` | Captions, metadata |
| `textPlaceholder` | `#AAAAAA` | Placeholders |
| `success` | `#1D9E75` | Green CTAs, open badges, ✔ |
| `successDark` | `#0F6E56` | Prices |
| `successDeep` | `#085041` | Green-surface headings |
| `successSurface` | `#E1F5EE` | Success banners/badges |
| `successLight` | `#5DCFAA` | On dark surfaces |
| `warning` | `#EF9F27` | Deals, points, "Soon" badges, streak |
| `warningSurface` | `#FAEEDA` | Points chips, notice banners |
| `warningDeep` | `#633806` | On warning surfaces |
| `warningMid` | `#854F0B` | Tips body text |
| `danger` | `#E24B4A` | Sign out, unread dot, "Higher" pins, HARD badge |
| `dangerSurface` | `#FCEBEB` | Insurance-risk cards |
| `dangerBorder` | `#F09595` | Risk card borders |
| `dangerDeep` | `#A32D2D` | On danger surfaces |
| `info` | `#378ADD` | Vienna brand, "Upcoming" |
| `infoSurface` | `#E6F1FB` | Info badges |
| `infoDeep` | `#0C447C` | On info surfaces |
| `navy` / `navyMid` / `navyDeep` | `#0B1E3D` / `#1A2A42` / `#0D1B2A` | Auth bg gradient, dark cards, maps |
| `brandBlue` | `#29ABE2` | Logo "Mate", shield mark |
| `authAction` | `#1B4E8F` | Auth-screen primary buttons |
| `dark` / `darkAlt` | `#1A1A1A` / `#2D2D2D` | Dark deal/market-value cards, card art |
| `aiPanel` | `#1A1A2E` | AI estimate bar on car diagram |
| `white` | `#FFFFFF` | Tab bar, sheets, on-primary text |

Auth screens use the navy gradient (`160deg, #0B1E3D → #1A2A42`) + `#1B4E8F` buttons; the in-app primary is `#7F77DD`. Kept as separate tokens (intentional in wireframe).

### Spacing (4-pt scale)
Wireframe is drawn at miniature type scale; spatial rhythm maps to: `xs 4 · sm 8 · md 12 · lg 16 · xl 20 · 2xl 24 · 3xl 32`. Screen padding: wireframe `10px 14px 20px` → `16` horizontal. Tab bar 60 → 64 + safe area; status bar native.

### Radii
`sm 8` (chips-as-rects, thumbnails) · `md 12` (cards, inputs, buttons) · `lg 16` (hero cards, maps) · `xl 20` (featured) · `sheet 24` (bottom sheet top) · `pill 999` (badges, chips, toggles) · `full` (avatars, calendar days).

### Type scale (wireframe px ≈ ×2 → app dp)

| Token | Size/weight | Wireframe equivalent |
|---|---|---|
| `display` | 40/800 | 20–22px balance figures |
| `title` | 24/700 | 13px success headings |
| `headline` | 20/600 | 10.5px screen titles |
| `body` | 16/400–500 | 8–8.5px body |
| `bodySmall` | 14/400 | 7.5px secondary |
| `caption` | 13/400 | 7px metadata |
| `label` | 12/600–700 uppercase, ls .05em | 6.5–7.5px section labels |
| `badge` | 12/500–700 | 6.5–7px pills |

### Shared component patterns (extraction targets)
`PrimaryButton`, `DealerCard` (avatar initial + name + ★/distance + price chips + CTA), `QuoteCard` (dealer + price ± inspection + note + Accept/hours/Msg), `ServiceSelectRow` (icon + name/sub + price + ✔ multi-select), `NotificationCard` (emoji + title + time + body + unread dot, tinted variants), `SettingsRow` (icon + label + value + ›), `TogglePill` (28×16 track toggle), `FilterChips` (h-scroll single-select), `SectionLabel`, `Calendar` + `TimeSlotPicker`, `PartChip`/`CarDiagram`, `PointsBadge` (★ +N pts), `ProLockOverlay` (blur + 🔒 + unlock CTA), `MilestoneCard` (progress bar), `StatusBadge` (pill variants), `BottomSheet` (sign-out), `PostCard` / `CommentRow`, `AvatarInitial`.

---

## 4. Flags — wireframe vs. platform conventions / gaps

1. **`s-map` is unreachable by tap** — only the prototype's external "Next" button reaches it. It duplicates `all-quotes-map` with filters + call action. Proposal: implement as a filter/view toggle on All Quotes Map (or list/map segmented control) rather than an orphan screen — pending your call.
2. **`s-prof-mile-det` has no tap entry** — milestone cards on `prof-miles` will navigate to it (clearly the intent).
3. **`after-hours` trigger is implicit** — implemented as: submission completed outside dealer business hours (mock clock injectable for testing).
4. **Splash "I already have an account" and Apple/Google buttons have no handlers** — wired to login / stub social auth.
5. **Signup/login nav handlers sit on headings, not buttons** (wireframe slip) — implemented on the buttons.
6. **Wireframe font sizes are miniature** (8px body) — mapped ×2 to a standard mobile type scale (see tokens). Flagging since "match exactly" can't apply to literal px here.
7. **Booking confirm "View on map"** navs to `home` in the wireframe — kept as-is (flagged as odd).
8. **prof-insurance "Compare cash vs. insurance →"** has no handler — wired to Compare tab root.
9. **Dark mode** is a CSS invert filter in the prototype — implemented as real token theming per requirements.
10. **Two "Booking Confirmed" screens** (`booking-confirm` home, `maint-schedule-confirm` maint) share layout — one component, two routes.
11. **Duplicate save CTAs** on `maint-scan-rev` / `maint-manual` ("Save → earn pts" + "Save to history →") — merged into one CTA that saves and awards points.
12. **OTP "Verify" flows to `home`** with no account-creation step distinction — signup and login both end at verify-otp → home (matches wireframe).
