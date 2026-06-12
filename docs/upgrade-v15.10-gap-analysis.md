# AutoMate v15.10 Upgrade — Gap Analysis & Migration Plan (Step 0)

New source of truth: `AutoMate Interactive Wireframe v15.html` (repo root).
Current app: 55 screens, fully mock-backed (no backend, no ORM — answer to §7:
there is no current ORM; Prisma + PostgreSQL will be introduced fresh).

## 1. Screen diff (55 current → 68 in new wireframe)

### Added (14)

| Wireframe id | What it is | Entry point |
|---|---|---|
| `s-dealer-map` | Dealer detail map: address, hours, rating, your appointment, Get directions/Share | booking-confirm "View on map" (replaces the old →home quirk) |
| `s-diy-unlock` | Pro paywall detail: 4 benefits, $10 lifetime, pay-with row | maint-diy / submitted Pro locks |
| `s-diy-payment` | Pro order summary + payment method | diy-unlock |
| `s-diy-confirm` | "You're a Pro member!" + 4 benefit links | diy-payment |
| `s-diy-guides` | All 12 unlocked guides (time + difficulty) | diy-confirm |
| `s-diy-match` | AI damage→guide matching (94% match, savings, Compare-to-quotes link) | diy-confirm |
| `s-diy-tools` | Tool/parts shopping list w/ price comparisons + savings total | diy-confirm |
| `s-diy-future` | Roadmap + vote-on-guides | diy-confirm |
| `s-help-photos` | Help article: submitting damage photos | prof-help-center |
| `s-help-quotes` | Help article: quotes & pricing (explains AI confidence + RECOMMENDED) | prof-help-center |
| `s-help-bookings` | Help article: managing bookings | prof-help-center |
| `s-help-contact` | Contact support: chat/email/phone | prof-help-center + all help articles |
| `s-prof-ins-edit` | Edit policy form (provider/number/deductible/premium/vehicle/renewal) | prof-insurance "Edit policy details" |
| `s-prof-ins-add` | Add policy: **Scan insurance card** or manual form | prof-insurance "Add another policy" |

### Deleted (1)
- `s-map` (our `MapFilterScreen`) — superseded by the redesigned all-quotes-map + new dealer-map.

### Modified (key ones, by markup diff)

| Screen | Change |
|---|---|
| `car-diagram` | **Multi-select → single-select** (`pickPart`), ✔ check on selection, CTA "Continue →"; copy: "Tap one part — you'll add photos for each part separately" |
| `camera` | Damage-type chips moved here (`pickDmg` on `#s-camera .dmg-chip`) — type is tagged at capture time |
| `confirm-submit` | Multi-part list built by looping the single-select flow: each part has own type/photos, **✕ Remove** (`removePart`), "Each part gets its own photos & quotes", Step 3 of 3 |
| `dealer-quotes` | "AI confidence 87%" badge on the estimate header; **all 8 quotes** listed (AutoFix $285 → … → $480); per-quote notes; Msg button dropped |
| `all-quotes-map` | 8 priced pins with **BEST PRICE** / **RECOMMENDED** tags, new legend, "Top picks" list |
| `booking-confirm` | "View on map" → `dealer-map` |
| `home` | New **Scheduled services** section: Apr 7 oil change "$49 Paid" → maint-schedule-confirm; Apr 12 bumper "$320–345 Confirmed" → booking-confirm |
| `submitted` | DIY recommendation links to `maint-diy` |
| `maint-diy` | Pro lock → `diy-unlock` (full purchase chain) |
| `maint-schedule-book` | **Dynamic totals** (`updateSvcTotal` reads `data-price`); `goPayment()` builds the order rows that maint-payment renders |
| `maint-payment` | Line items injected from the live cart (no longer static) — our cart store already does this; copy tweaks |
| `maint-history` | Filters reordered below the scan/manual cards |
| `prof-insurance` | Edit/Add wired to the two new screens |
| `prof-help-center` | 4 topics navigate to the 4 help articles |

Unchanged (≈38 screens): auth, accept-booking, bundle deals, notifications,
compare tab, community tab, most profile/settings screens — copy-level
re-verification during Phase 1, no structural work.

## 2. Changed flows

1. **Damage flow**: single part per pass → photo guide → camera (+ damage-type chips) → confirm screen accumulates parts (add another loops back; ✕ Remove). Store: `selectedParts: string[]` → `damageParts: {part, type, photos[]}[]`.
2. **Pro unlock**: lock → diy-unlock → diy-payment → diy-confirm → 4 benefit screens. Store gains `isPro`; all Pro locks check it (submitted, after-hours, maint-diy).
3. **Quotes**: AI estimate (range + confidence) is now first-class — fed by the damage-AI service response; RECOMMENDED/BEST PRICE ranking on map.
4. **Booking visibility**: home shows scheduled services; booking-confirm links to dealer-map.
5. **Maintenance payment**: totals/line items fully dynamic from cart (mostly already true in our app — wireframe caught up to us).
6. **Help center**: real articles instead of alert stubs.
7. **Insurance**: policy CRUD (edit/add + card scan) instead of alert stubs.

## 3. Migration plan — 7 PR-sized phases (user-specified order)

App stays runnable at every step: every external dependency ships behind an env
flag (`EXPO_PUBLIC_API_URL` unset → current in-app TS mocks keep working).

**Phase 1 — Wireframe sync (RN app only, mocks intact)**
Add 14 screens, delete MapFilter, apply all modifications above; rework damage
store to multi-part/single-select; `isPro` flag gating; SCREENS.md updated to
v15.10 ids. *Test: every new/changed flow in the browser.*

**Phase 2 — DB + auth (`server/`)**
Node + Express + **Prisma + PostgreSQL** (docker-compose for the DB; none exists
today). Schema per §7 (users, vehicles, damage_requests, quotes, bookings,
payments, service_history, insurance_policies, points_ledger, pro_memberships,
notifications, community_posts). Seed: demo user `demo@automate.app /
Demo1234!`, OTP `123456`, 2019 Accord EX-L, State Farm policy, wireframe quotes/
bookings. JWT sessions; "I already have an account" pre-fills demo creds; app
gets an API client + auth context. Local `/uploads` behind an S3-compatible
storage interface. *Test: demo login end-to-end, data served from DB.*

**Phase 3 — AI services (mock mode default)**
`services/damage-ai`: FastAPI, `POST /estimate` (images → {part, type,
severity, price_range, confidence}); YOLOv8 fine-tune scaffold with
`data/damage/{dent,scratch,crack,paint}/` structure + training script +
configurable pricing table (part × type × severity); CarDD noted for seeding
**(research-only license — flagged, download left as a documented step)**.
Receipt pipeline in the same service: PaddleOCR (+ Donut upgrade path) →
{vendor, date, line_items, service_type, total}; wired to scan-review.
`MODEL_MODE=mock` ships deterministic results so everything demos today.
*Test: photo submission → analyzing animation → estimate; receipt scan →
review prefill.*

**Phase 4 — Insurance module**
`InsuranceProvider` adapter interface; research current consumer-permissioned
aggregators (Canopy Connect / Axle) and implement one behind the adapter +
always-working fallbacks: manual entry (prof-ins-add) and **card scan** reusing
the OCR pipeline. Normalized policy storage. *Test: add/edit/scan policy.*

**Phase 5 — Actuarial model**
`server/src/actuarial`: transparent coefficient model (VA-first config file:
surcharge by claim type/amount), regression upgrade path; outputs cash vs.
insurance 3-yr totals + break-even; Compare tab renders real numbers with an
assumptions disclosure. *Test: deep-dive math changes with deductible edits.*

**Phase 6 — Points**
`POINT_VALUE_USD = 0.10` config; ledger-backed earn/redeem; dollar equivalents
everywhere; redemption step in payment screens. ⚠ **Conflict flagged below.**

**Phase 7 — Loading states + button audit**
Skeletons/animations for estimate processing, scanning, quotes, payments,
insurance sync, login; `BUTTONS.md` (screen → button → action → status) with
zero dead buttons. *Test: full app sweep against BUTTONS.md.*

## 4. Decisions needed before Phase 1

1. **Points value conflict**: the wireframe copy still says `420 pts = $4.20`
   (1 pt = $0.01), but instruction §4 says 1 pt = **$0.10** (+50 pts = $5.00).
   Directive over wireframe? (Plan assumes yes: 420 pts = $42.00.)
2. **Backend stack**: no ORM exists today; plan introduces Node + Express +
   Prisma + PostgreSQL in `server/`. Approve or name a preference (NestJS,
   Fastify, tRPC…).
3. **Delivery constraint**: pushes to GitHub are still blocked by the repo's
   Code Scanning ruleset — work proceeds in local commits, but the PR/ZIP can't
   update until that's lifted.
