# Pre-release test report — 2026-07-04

Full sweep per `docs/prerelease-test-prompt.md`, run in a sandboxed session.
**Environment substitution:** staging Supabase credentials were not available
in-session, so all DB phases ran against a **local PostgreSQL 16** instance
with the full Prisma migration set applied. The suites are committed and
re-runnable against staging as-is (see "Re-run against staging" below).

## Verdict: **GO, with 3 pre-launch conditions**

The stack is functionally solid: 61/61 API assertions, 25/25 E2E assertions,
17/17 AI-service tests, 0 errors across ~9,000 requests at 50 concurrent
users. One real product bug was found and fixed during the sweep. Conditions
before publishing are listed at the end.

---

## Pass/fail matrix

| Phase | Scope | Result |
|---|---|---|
| 0 Preflight | deps, env contract, DB, sample images | ✅ |
| 1 Static gates | root tsc · server tsc · expo export · actuarial parity (byte-identical) · actuarial predict (5) · damage-ai pytest (10+1 skip) · wireframe tag balance | ✅ all |
| 2 Services | damage-ai :8100 (mock) · Express :4000 · web builds (mock + api-mode) | ✅ |
| 3 API functional | 61 assertions | ✅ 61/61 |
| 4 Web E2E (Playwright) | 25 assertions | ✅ 25/25 (1 product bug found → fixed → re-run green) |
| 5 AI model tests | 7 new sample tests + full suite = 17 pass | ✅ (live mode skipped — no weights) |
| 6 Stress | 50 VU session load + 50-concurrent /estimate burst + ledger audit | ✅ |
| 7 Vercel pre-deploy | vercel.json, env checklist, deep links, secrets scan | ✅ |

## Phase 3 — API functional (server/scripts/phase3-functional.test.ts)

61/61 against Express + Postgres, including DB side-effect checks:

- **Auth:** signup / duplicate → 409 / wrong password → 401 / wrong OTP → 401 /
  OTP `123456` → JWT / protected route without token → 401 / malformed → 4xx.
- **Earn-schedule parity:** client `src/config/points.ts` and server
  `EARN_RULES` byte-equal (keys + values).
- **Damage → quotes:** submit persists an `open` request (shops_notified=12,
  AI fields set), quote accept flips status in DB, no-parts submit → 400.
- **Bookings/payments:** maintenance pay writes a linked payment (12,999¢,
  purpose=booking, status=paid); repair booking awards `bookService`.
- **Points:** check-in idempotent per day; over-redemption rejected (4xx);
  negative earn rejected; `balance_after` chain exactly matches running sum.
- **Pro:** annual 4,800¢ / monthly 999¢; `plan`, `lifetime=false`,
  `renews_at` ≈ +1y/+1mo; re-subscribe → `alreadyPro` with **no duplicate
  payment**; DIY unlock 1,000¢ with no membership row.
- **Isolation:** user B cannot read/mutate user A's vehicles, quotes, points.

Note: booking *deposits* ($25 repair / $0 maintenance / waived for Pro) are a
client-side rule — asserted in Phase 4, not on the server.

## Phase 4 — Web E2E (scripts/e2e/suite.js, headless Chromium)

25/25 across the product's core promise flows:

1. **Guest estimate:** part → photos (real sample image via file chooser) →
   damage types → car intake → confirm → submit → AI range visible, shop
   quotes blurred + locked behind sign-up.
2. **Guest → new user:** sign-up (name/email/phone/password → verify method →
   OTP) → **no replace prompt**, lands on Submitted; quotes visible; intake
   car saved; **Quotes tab shows the submission immediately** (the bug below
   was found by this assertion).
3. **Duplicate & replace prompts:** identical resubmit (same part+photos+car)
   → "Same as your previous request" variant; changed submission → "You
   already have an open quote request" variant with the removal warning;
   "Keep my existing quotes" routes to the Quotes tab intact.
4. **Guest → returning user:** demo login mid-flow → replace prompt with the
   warning ("removes your previous quotes … wait for the auto shops") →
   "Replace & submit" proceeds to Submitted.
5. **Daily check-in:** claim consumed exactly once.
6. **Pro:** subscribe annual → ProManage shows a real "Renews" date one year
   out.
7. **Robustness:** deep links return the app, refresh mid-session survives,
   zero unexpected console errors across all contexts.

**API-mode integration E2E (scripts run against :8082 bundle):** the same
guest→signup flow with `EXPO_PUBLIC_API_URL` baked in — verified in Postgres:
`damage_requests` row ($300–$520, open), points ledger (+20 Submit damage
photos, balance_after=20), vehicle "2019 Honda Accord / White" persisted.

### 🐛 Bug found & fixed (commit `eb754e1`)

**Guest submission orphaned after sign-up.** After a guest submitted and
created an account, the Quotes tab showed "No active quote". Root cause: a
three-way race on the per-car damage slices — `useActiveVehicle` auto-pins
the first vehicle after login (moving the guest slice under it), then
`finalize`'s `setActiveVehicle(newIntakeCarId)` loaded an *empty* slice for
the just-persisted car, stranding the submission. Fix: `setActiveVehicle`
gained a `carrySubmission` option (used by both intake-persistence call
sites) that moves the in-flight submission to the car it was captured for;
a guest's first activation also keeps the in-flight slice. A second, related
fix makes the duplicate-detection key prefer `pendingVehicle`'s name so an
identical resubmission is correctly flagged as a duplicate.

## Phase 5 — AI model tests (services/damage-ai/tests/test_prerelease_samples.py)

Run over `test-assets/damage-samples/` (incl. the provided front-bumper
scratch+dent photo) against the live mock-mode service — 7 new tests, all
green; full damage-ai suite 17 pass / 1 skip:

| Check | Result |
|---|---|
| Sample photo → valid estimate (front bumper, dent+scratch) | ✅ $300–$520, severity *moderate*, 87% confidence |
| Determinism (same image twice → identical estimate) | ✅ |
| Price bucket matches `config/pricing.yaml` math | ✅ front bumper/dent/moderate = [300, 520] |
| 0-byte file / non-image / 20 MB upload | ✅ handled, no 500s |
| No-image parts-hint path (demo mode) | ✅ |
| Client YOLO guard: unknown damage type → `rejected` + reason | ✅ (verified directly) |
| Known type → accepted with range | ✅ |

**Live-mode caveat:** `models/damage-seg.pt` is not in the repo, so
photo-*content* rejection (a clean panel / non-car photo must be refused)
cannot fire in mock mode — the mock estimates from the selected parts by
design. The negative-image tests in the manifest only become meaningful with
trained weights under `MODEL_MODE=live`. This is the single most important
gap to close before marketing "AI estimates" (see conditions).

## Phase 6 — Stress (50 VUs)

`scripts/stress/k6-api.js` committed for staging; executed here via an
equivalent Node runner (k6 unavailable in the sandbox), 50 VUs, 150 s,
full session flow per iteration (signup → OTP → vehicle → submit → quotes →
check-in → points):

| Metric | Result | Threshold |
|---|---|---|
| Requests / errors | **8,960 / 0** (0.00%) | <1% ✅ |
| Reads p50 / p95 | 37 ms / **64 ms** | p95 <800 ms ✅ |
| Estimate submit p50 / p95 | 124 ms / **172 ms** | p95 <2 s ✅ |
| Auth (bcrypt) p95 | 4.4 s under 50-way signup storm | n/a — see note |
| /estimate burst, 50 concurrent | 0 errors, p95 **210 ms** (mock) | — |

Post-load DB audit over 2,566 ledger rows / 1,282 requests: **0 broken
`balance_after` chains, 0 negative balances, 0 orphaned payments** — the
points path is concurrency-safe.

Notes: (1) the 4.4 s tail is bcrypt cost-10 hashing when every iteration
creates an account — a synthetic worst case; real users sign up once. If
signup latency matters at launch, lower bcrypt rounds to 8 or offload auth.
(2) The /estimate burst measures the **mock** engine; live YOLO inference on
CPU will be the real ceiling — re-measure with weights before launch.
(3) Supabase pgbouncer connection behavior was not exercised (local PG) —
re-run the k6 script against staging (pooled port 6543) and watch the
dashboard's connection count.

## Phase 7 — Vercel pre-deploy

- **`vercel.json` added:** `expo export --platform web` build, `dist` output,
  SPA rewrite (everything except `/_expo/`, `/assets/`, favicon →
  `/index.html`), immutable caching for hashed static bundles.
- **Deep links:** `/`, `/quotes`, `/profile`, unknown routes → app shell 200.
- **Bundle:** 2.1 MB raw / **540 KB gzip** main JS; no source maps shipped;
  secret scan of the bundle clean (no AUTH_SECRET/service keys — only
  `EXPO_PUBLIC_*` values are inlined, as intended).
- **Env checklist for the Vercel project (all EXPO_PUBLIC_, safe to inline):**
  | Var | Value at launch |
  |---|---|
  | `EXPO_PUBLIC_API_URL` | deployed Express API origin (Railway/Fly/Render) |
  | `EXPO_PUBLIC_DAMAGE_AI_URL` | deployed FastAPI origin (or unset → server-proxied/mock) |
  | `EXPO_PUBLIC_SUPABASE_URL` | staging/prod Supabase project URL |
  | `EXPO_PUBLIC_SUPABASE_ANON_KEY` | anon key (public by design; RLS must be enabled) |
  Server-side secrets (`DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET`) belong to
  the API host, **never** to Vercel env as `EXPO_PUBLIC_*`.
- **⚠ Metro caching gotcha (hit during this sweep):** changing
  `EXPO_PUBLIC_*` values does **not** invalidate Metro's transform cache —
  export with `--clear` (or set `CI=1`) in the Vercel build, otherwise a stale
  bundle can ship without your env. Recommend `"buildCommand":
  "npx expo export --platform web --clear"` on CI if envs ever change.
- **External origins in the bundle:** `loremflickr.com` (demo review photos)
  and `logo.clearbit.com` (brand logos) — replace demo imagery with owned
  assets before public launch; both fail closed behind strict networks.
- Preview deploy: skipped (no linked Vercel project in-session).

## Not covered in this run (needs staging credentials)

1. Supabase-specific paths: RLS policies, `damage-photos` storage bucket
   upload, Supabase auth (`isSupabaseConfigured` path skips the OTP screen),
   `docs/supabase-calibration-export.sql`.
2. k6 against staging through pgbouncer (connection-cap headroom).
3. Live-model AI tests (needs `models/damage-seg.pt`).

### Re-run against staging
```
# server/.env → staging DATABASE_URL (pooled :6543) + DIRECT_URL, then:
cd server && npx prisma migrate deploy && npx tsx scripts/phase3-functional.test.ts
k6 run -e API_URL=<api-host> scripts/stress/k6-api.js
cd services/damage-ai && .venv/bin/python -m pytest tests/ -q
```

## GO conditions (ranked)

1. **Re-run Phases 3+6 against staging Supabase** (pooled connections, RLS,
   storage bucket) — the local-PG results are strong but don't prove the
   pgbouncer + RLS layer.
2. **Live-model validation:** train/obtain `damage-seg.pt`, then run the
   manifest tests in `MODEL_MODE=live` — especially the negative images
   (clean panel / non-car **must** reject). Until then, keep the disclosed
   "estimate mode" copy.
3. **Vercel build hygiene:** use `--clear` in the CI build command and swap
   loremflickr/clearbit demo imagery for owned assets.

Everything else observed is launch-ready.
