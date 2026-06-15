# AutoMate — v17 Upgrade Gap Analysis (PHASE 0)

> **Status: awaiting your approval. No app code or DB migrations written yet.**
> Source of truth: `AutoMate Interactive Wireframe v17.html` (repo root).
> ⚠️ You referenced `AutoMate_Interactive_Wireframe_v17.html` (underscores); the
> file in the repo uses **spaces**. Assuming they're the same file — please confirm.

---

## 0. Detected stack (what we're upgrading)

| Layer | Tech | Notes |
|---|---|---|
| App | **Expo / React Native + TypeScript** | React Navigation (bottom tabs + per-tab native stacks), Zustand store, React Query |
| Service layer | **mock ⇄ api twin switch** (`src/services/index.ts`) | `USE_API = EXPO_PUBLIC_API_URL` set. Screens import from `src/services` only. Demo creds + OTP already live in `mock/authService` (`DEMO_EMAIL`, `DEMO_PASSWORD`, `DEMO_OTP=123456`) |
| Backend | **Express + Prisma + PostgreSQL** (`server/`) | 13 route modules, JWT auth (bcrypt + `signToken`), `?schema=public`, docker-compose `postgres:16` |
| AI | **FastAPI `services/damage-ai`** | `POST /estimate` (`MODEL_MODE=mock\|yolo`), `POST /receipt` (`RECEIPT_MODE=mock\|ocr`, PaddleOCR), insurance-card scan. `server/src/damageAi.ts` is the client with deterministic **mock-fallback** |
| Storage | `StorageProvider` (local now; Axle insurance adapter present) | |

**Implication:** the framework, AI models, and the mock/api seam already exist and
match the wireframe's data shapes well. This upgrade is mostly **(a) port 13 new
screens + rework ~12, (b) repoint persistence/auth to the shared Supabase project,
(c) wire the new booking/deposit/reviews/Pro flows.** The AI models do **not** need
changing.

---

## 1. Screen inventory diff

**v17 = 80 screens · current app = 70 routes · overlap = 67.**

### 1a. NEW — must build (13)
`home-launcher`, `bookings` (new bottom-tab root), `book-agreement`, `book-deposit`,
`reschedule`, `reviews`, `write-review`, `partner-agreement`, `tos-booking`,
`pro-subscribe`, `pro-success`, `prof-car-add`, `how-it-works`.

> Your list also named `verify-method`; it **already exists** in the app
> (`VerifyMethod`, added in an earlier feedback pass) but must be **updated** to the
> v17 multi-channel design (pick email/SMS → OTP). So: 13 truly new + 1 update.

### 1b. REMOVED in v17 (2)
- `home` (`s-home`) → replaced by **`home-launcher`** (the Home tab is now a hub).
- `photo-example` (`s-photo-example`) → gone; `car-diagram → camera` directly, and the
  "good example" guidance is folded into the retake popup + the optional description.

### 1c. Existing screens that need REWORK to match v17 (not just a 1:1 port)
| Screen | v17 change |
|---|---|
| `car-diagram` | Redesigned top-down car layout; **already-photographed parts show a ✓ badge**; optional **damage description moved to `camera`** (below the photos) |
| `camera` | Hosts the optional description; retake popup replaces the photo-guide screen |
| `confirm-submit` | "AI will analyze…" note sits directly above **Submit for quotes** |
| `dealer-quotes` | **Inline map** on top + list below; AI confidence/estimate pinned top; **rating stars are tappable → `reviews`**; "see all on map" card removed |
| `comp-cash-ins` | **Pay-at-shop logic**: no money upfront, shop sets final price in range, card-on-file charged after repair, deposit released; "Pay it yourself" vs "Use insurance" w/ deductible caveat |
| `booking-confirm` / `maint-schedule-confirm` | **Reschedule + Cancel are primary**; Add-to-calendar/View-on-map are small; `Done` removed; **maintenance bookings require no deposit** |
| `accept-booking` / `comp-cash-book` | now route through **`book-agreement → book-deposit`** (repair) before confirm |
| `maint-schedule-book` | routes through **agreement (no deposit)** → confirm |
| `diy-unlock` | Reframed: **$10 DIY-only** vs **Pro (includes DIY)** |
| `prof-hub` | Now the **"More"** tab root; adds a **Pro banner**; "Add another car" → `prof-car-add` |
| `comm-channels` | Community is now a **bottom tab**; **search bar added**; **posting awards no points** |
| `prof-language` / `prof-distance` | Now **functional** (live i18n on key strings; mi⇄km conversion) |
| `splash` / `login` | Simpler auth screen + real Apple/Google logos |

---

## 2. Navigation reconciliation

**Current bottom tabs:** Home · Maintenance · Compare · Community · Profile (5).
**v17 bottom tabs (`TH`):** **Home → `home-launcher`** · **Bookings → `bookings`** ·
**Community → `comm-channels`** · **More → `prof-hub`** (4).

Reconciliation:
- **Home** tab root flips from `Home` to a **launcher hub**; Maintenance & Compare are no
  longer tabs — reached as cards from the launcher (their stacks stay, just re-parented).
- **Bookings** is a **brand-new tab** (calendar + scheduled services + pending quotes).
- **Community** promoted from a tab to… still a tab (unchanged slot, search added).
- **Profile** tab renamed **More** (same `prof-hub` root).
- Tab icons become **SVG line icons** (currentColor) instead of emoji.
- Plan: keep the per-tab native-stack pattern; update `MainTabs.tsx` to the 4-tab set and
  move Maintenance/Compare stacks under the Home tab (or a shared stack reachable from the
  launcher). `crossTab.ts` deep-links updated for the new graph.

---

## 3. New end-to-end flows to implement

1. **Repair booking:** quote → `accept-booking` → **`book-agreement`** (single ToS
   checkbox + `tos-booking`) → **`book-deposit`** (refundable deposit, **waived for Pro** —
   crossed-out $25 → $0) → `booking-confirm`.
2. **Maintenance booking:** `maint-schedule-book` → `book-agreement` (**no deposit**) →
   `maint-schedule-confirm`.
3. **Reschedule / cancel:** `reschedule` (+ cancel sheet with 12h policy, no-show strikes).
4. **Reviews:** `write-review` (verified booking) → `reviews` (in-app, replaces Google).
5. **Pro subscription:** `pro-subscribe` (Annual $39/yr ≈ $3.25/mo, or Monthly $4.99) →
   **`pro-payment`** → `pro-success`; Pro persisted; deposits waived thereafter. Separate
   **$10 DIY-only** unlock (`diy-unlock → diy-payment → diy-confirm`).
6. **Add car:** `prof-car-add` writes a vehicle (mirrors registered-car fields).
7. **Agreements:** `tos-booking` (user) + `partner-agreement` (shop-side, informational).

---

## 4. Data-model gaps (Prisma → `automate` schema)

The current Prisma schema already covers most Phase-2 tables: `users`, `vehicles`,
`damage_requests` (w/ AI fields + photo refs), `quotes`, `bookings`, `payments`,
`service_history` (w/ `image_ref` + `extracted` OCR JSON), `insurance_policies`,
`points_ledger`, `pro_memberships`, `notifications`, `community_posts`/`comments`.

**Required additions/changes for v17:**
| Change | Detail |
|---|---|
| ➕ `reviews` | rating, body, photos, verified-booking ref, dealer ref, author |
| ➕ `reschedules` | booking ref, old/new date+time, reason, strike flag |
| ✏️ `bookings` | add `agreement_accepted`, `deposit_cents`, `deposit_status` (held/released/forfeited), `no_show_count`/strikes, `kind` already exists |
| ✏️ `pro_memberships` | from `$10 lifetime` → `plan` (annual/monthly/diy_only), `term`, `renews_at`, `status`; DIY-only is an entitlement, not full Pro |
| ✏️ `damage_requests` | add `description` (v17 optional damage note) |
| ✏️ `users` → `profiles` | **drop `password_hash`**; PK becomes Supabase **`auth.users.id` (uuid)**; keep name/phone/initial/completion |
| ✓ Points economy | see Decision #5 below ($0.01 vs $0.10) |

---

## 5. Supabase plan (shared project with the dealership portal)

**Guardrails (your rules):** never touch the portal's tables; everything this app owns
lives in **schema `automate`**; migrations in-repo only touch `automate.*`; RLS on every
`automate` table; **pooler (PgBouncer)** connection, not direct.

### 5a. Schema & migrations
- Create schema `automate`; all 16 app tables as `automate.*`.
- Migrations: **two viable paths — needs your decision (Decision #1):**
  - **(A) Keep Express + Prisma** with `multiSchema` (`schemas = ["automate"]`),
    `DATABASE_URL` → Supabase **pooler**, Prisma `migrate` emits `automate`-only SQL.
    *Least disruptive — reuses all routes/services/AI. RLS = defense-in-depth; Express
    verifies the Supabase JWT and sets the per-request role.*
  - **(B) supabase-js direct** from the app + PostgREST + RLS, retiring most Express
    routes. *Bigger rewrite of the service layer; RLS does the enforcing.*
  - **Recommendation: (A).** It satisfies "automate schema + RLS + pooler + Supabase
    Auth" with the smallest blast radius and keeps the AI/insurance/actuarial server code.

### 5b. RLS
- Enable RLS on all `automate` tables; policy: `user_id = auth.uid()` (profiles keyed on
  `auth.users.id`). Service-role paths (server jobs) explicitly scoped.

### 5c. Auth (**Decision #2 — must confirm before wiring login**)
- One Supabase project ⇒ **one shared `auth.users`** with the portal. Consumer signups
  will create rows in the **same** `auth.users` the dealership portal uses.
- Proposal: tag consumers with `app_metadata.role='consumer'` (dealers = `'dealer'`) so the
  two audiences are separable and RLS/policies can branch. **Confirm this is acceptable**,
  since it touches the auth surface both products share.

### 5d. Shared tables (**Decision #3 — confirm before any write**)
The app and portal must reflect the same dealers/quotes/bookings. Proposed ownership
(*pending the portal's actual schema, which I'll need from you to finalize*):

| Entity | Proposed owner | This app | Rationale |
|---|---|---|---|
| `dealers` / `partners` | **Portal** | **READ only** | Portal manages shop profiles, prices, hours |
| `quotes` | **Portal writes price/note**, **app writes accept/decline status** | read + status-write | Dealers quote the app's `damage_requests`; user accepts |
| `bookings` | **App writes** (create), **Portal updates fulfillment** | write + read status | User books; shop marks complete |
| `damage_requests` | **App (`automate`)** | own | Portal reads to quote |

> If you'd rather the app keep **its own** `automate.quotes`/`automate.bookings` and sync to
> the portal (vs. writing the portal's shared tables directly), say so — that changes the
> integration to an event/sync model. **I will not write to any portal-shared table until you
> confirm the owner + the real table names.**

### 5e. Connection & seed
- `.env`: `DATABASE_URL` (pooler), `SUPABASE_URL`, `SUPABASE_ANON_KEY`,
  `SUPABASE_SERVICE_ROLE_KEY` — **you'll need to provide these when we reach Phase 2.**
- Seed: demo consumer (`demo@automate.app`), 2019 Honda Accord EX-L, State Farm policy,
  sample quotes/bookings matching the wireframe.
- **Everything builds mock-first behind flags** so localhost demos with **no keys**.

---

## 6. AI (Phase 4) — keep models, just wire

- `/estimate` already returns type/part/severity/price-low/high/**confidence** → feeds
  `dealer-quotes` (incl. the AI-confidence badge). **No model change.**
- `/receipt` (PaddleOCR) returns service/shop/date/mileage/amount → wire
  `maint-scan-cam → maint-scan-rev`. **No model change.**
- Mock-mode flags preserved: `MODEL_MODE`, `RECEIPT_MODE` (service), `DAMAGE_AI_URL` +
  TS mock-fallback (server). App demos without model access.
- **Only AI-adjacent gap:** v17's optional **damage description** isn't an input the current
  `/estimate` accepts. Plan: **store it on `damage_requests`**, don't change the model
  (listed here rather than silently altering the model).

---

## 7. Proposed migration plan (PR-sized commits, in order)

1. **P1 — Wireframe sync** (no DB): build 13 new screens, rework the ~12, 4-tab nav,
   port copy/styles/interactions (single-select diagram, dynamic totals, live deposit w/
   Pro discount, multi-method verify, dark mode). App stays runnable on mocks. Update
   `SCREENS.md`.
2. **P2 — Supabase DB + RLS**: `automate` schema migrations, RLS, pooler config, seed.
   Shared-table integration only after Decision #3.
3. **P3 — Auth**: real Supabase Auth sessions; demo `demo@automate.app / Demo1234!`;
   `verify-method` channel picker → `verify-otp` accepts `123456` → home launcher; signup
   creates a `profiles` row; protected routes.
4. **P4 — AI wiring**: connect photo-submit/quotes to `/estimate`; receipt scan to
   `/receipt`; keep mock flags.
5. **P5 — Every button works**: wire all 80 screens end-to-end w/ persistence; loading
   states/skeletons for all async; keep `BUTTONS.md` current.

After **each** phase I'll give you a precise browser test script.

---

## 8. Decisions I need before writing code

1. **Backend architecture** — (A) keep Express+Prisma on Supabase `automate` via pooler
   *(recommended)* or (B) rewrite to supabase-js direct?
2. **Auth sharing** — confirm consumer users live in the **shared `auth.users`** with the
   portal, separated by `app_metadata.role`.
3. **Shared tables** — confirm ownership for `dealers` (read), `quotes`
   (read + status-write), `bookings` (write + status-read); and send the portal's real
   table/schema names. I will **not** write to a portal table until you confirm.
4. **Points economy** — v17 shows **1 pt = $0.01** (100 pts = $1; "420 pts = $4.20"), but
   your Phase 5 note says **1 pt = $0.10**. Which is canonical? *(Recommend $0.01 to match
   the wireframe.)*
5. **Pro model** — confirm migrating `pro_memberships` from `$10 lifetime` to
   subscription (annual/monthly) **+** a separate `$10 DIY-only` entitlement.
6. **Supabase creds** — you'll provide the pooler URL + keys (and portal schema) at Phase 2;
   until then everything runs mock-first.

> On approval of this plan (and answers to #1–#5), I'll start **P1 — Wireframe sync** and
> keep localhost running throughout.

---

## 9. Decisions received (2026-06-15)

| # | Decision | Resolution |
|---|---|---|
| 1 | Backend | ✅ **Keep Express + Prisma** on Supabase `automate` via pooler |
| 3 | Shared tables | ✅ **Defer to Phase 2** — app-owned `automate.quotes`/`automate.bookings`, mock the portal integration for now; revisit with the portal's real schema |
| 4 | Points economy | ✅ **1 pt = $0.01** (matches v17 everywhere) |
| 5 | Pro model | Proceeding with v17: subscription (annual/monthly) **+** separate $10 DIY-only entitlement (flag if you disagree) |
| 2 | **Auth — separate user pool** | ⚠️ **Open conflict, see below** |

### ⚠️ Auth conflict to resolve before Phase 3
You chose a **separate consumer user pool**, but Phase 3 also asks for **real Supabase
Auth** *in the shared project*. A single Supabase project has exactly **one** `auth.users`
(GoTrue), shared with the portal — so "separate pool" and "Supabase Auth in the shared
project" can't both be true. Two clean ways to honor a separate pool:

- **Option A — Dedicated Supabase Auth for consumers.** A second Supabase **Auth project**
  (real GoTrue, fully isolated pool); the `automate` **data** stays in the shared project.
  Express (which we're keeping) verifies the consumer JWT and bridges to the shared DB.
  *True Supabase Auth + isolated, but two projects and cross-project RLS handled in Express.*
- **Option B — App-managed auth in `automate.users`.** Keep the current Express
  bcrypt + JWT, storing consumer accounts in `automate.users` on the **shared project's
  Postgres** — completely isolated from the portal's `auth.users`. *Simplest, isolated, uses
  the shared project for data; not GoTrue.*

**This blocks Phase 3 only.** Phases **P1 (wireframe sync)** and **P2 (DB schema)** do not
depend on it and can proceed now.

### ✅ Auth resolved (2026-06-15)
**Option B — App-managed auth in `automate.users`.** Keep the existing Express
bcrypt + JWT; consumer accounts live in `automate.users` on the **shared project's
Postgres**, fully isolated from the portal's `auth.users`. Phase 3 = real DB-backed
sessions (demo `demo@automate.app / Demo1234!`, OTP `123456`), not GoTrue.
**Approved to start P1 (wireframe sync) now.**

## 10. v17 source-file reconciliation (verified against the real HTML, 2026-06-15)

The uploaded `AutoMate_Interactive_Wireframe_v17 (5).html` is **byte-identical**
(md5 `5e752d20…`) to the `AutoMate Interactive Wireframe v17.html` P1 was built
against — so P1 is on the right file. Verified directly against the markup + JS:

- **Screen count: exactly 80** `<div id="s-…" class="screen">` (full ID list in
  `/tmp` during the audit; matches §1). All **14 new screens present** with the
  expected IDs (verify-method, home-launcher, bookings, book-agreement,
  book-deposit, reschedule, reviews, write-review, partner-agreement, tos-booking,
  pro-subscribe, pro-success, prof-car-add, how-it-works).
- **Authoritative nav model (from the JS, not guessed):**
  - `nav('<id-without-s->')` push-navigates; `back()` pops a history stack;
    `tab(name)` switches tabs and **resets that tab's history**.
  - **4 tabs**: `home, bookings, community, more` (`TH = {home:home-launcher,
    bookings:bookings, community:comm-channels, more:prof-hub}`).
  - `tabOf()`: `bookings→bookings`, `comm-*→community`, `prof-*`/`help-*→more`,
    **everything else→home** (so repair, maintenance, compare, DIY, pro, reviews,
    booking flows all live under Home). ✅ The app's 4-tab + HomeStack-hosts-all
    structure matches this exactly.
  - `AUTH = {splash, login, signup, verify-method, verify-otp}` (no tab bar).
- **Booking flow driver** `startBooking(dest, skipDeposit)` → sets the consent
  copy → `nav('book-agreement')`. `agreeContinue()` = `skipDep ? finishBooking()
  : nav('book-deposit')`; `finishBooking()` = `nav(bookDest)`. On book-deposit a
  Pro toggle (`togglePro`) waives **$25 → $0** inline; `pro-subscribe` is the upsell.
- **`photo-example` is gone** in v17 (car-diagram → camera directly; only a stale
  back-map entry remains). ✅ App already removed it.

### Deltas found vs the current app — two are payment-flow decisions (flagged, not changed)

| # | v17 says | App currently does | Action |
|---|---|---|---|
| A | **No `s-pro-payment`** — `pro-subscribe` "Start Pro" → `nav('pro-success')` directly | Added a `ProPayment` screen between them | ⚠️ **FLAG** (real billing usually needs a payment step — platform concern) |
| B | **Maintenance skips `maint-payment`** — `maint-schedule-book` "Continue to booking →" = `startBooking('maint-schedule-confirm', true)` → book-agreement (no deposit) → **maint-schedule-confirm**. Scheduled services are now **pay-at-shop** ("Book without paying upfront") | Routes maint through `MaintPayment` (upfront pay + points redemption) → confirm | ⚠️ **FLAG** (removes in-app service payment + points-at-booking) |
| C | `reschedule` cancel opens a **`cancel-sheet`** bottom sheet; confirm-new-time → booking-confirm | Uses a red "Cancel booking" button (→ Reschedule manage screen) | Minor — match later |
| D | `home-launcher` hub also links to **car-switcher sheet, prof-miles, prof-insurance, notifications** | HomeLauncher missing those four entry points | Minor — add in sync pass |
| E | Localization (`localize()`) + km/mi unit conversion run over live DOM text; dicts for ko/es/zh | App has functional language + distance settings already | ✅ parity |

`maint-payment` still **exists** as a screen in v17 (with full points-redemption UI)
but is **not reached** by the primary scheduled-service flow — i.e. it's retained
but effectively legacy. Same pattern as DIY which *does* keep its own
`diy-payment`. This is why A/B are decisions rather than obvious bugs.
