# Pre-release test prompt (Claude Code)

Paste the prompt below into a Claude Code session opened at the repo root.
Prerequisites (do these once, before running it):

1. **Staging Supabase project** — create a separate Supabase project (or branch),
   and have on hand: `DATABASE_URL` (pooled, port 6543), `DIRECT_URL` (5432),
   project URL + anon key.
2. **Sample damage photos** — drop 5–10 real phone photos into
   `test-assets/damage-samples/` (dents, scratches, cracks; plus 2 "negative"
   photos with no car damage — a clean panel, a random object). If you have the
   trained weights, place them at `services/damage-ai/models/damage-seg.pt`.
3. **k6** installed (`brew install k6` / `apt install k6`), and the Vercel CLI
   if you want the preview-deploy step (`npm i -g vercel`).

---

```
You are running the full pre-release test sweep for AutoMate before we publish
the web app through Vercel. Work phase by phase, in order. THE RULE FOR
FAILURES: when any use case fails, stop, diagnose, fix the code immediately,
re-run the failed case plus the Phase-1 gates, commit the fix with a clear
message, then continue. Never skip a failing case, never mark it "known issue"
without a fix or an explicit blocker note in the final report.

Repo layout: Expo SDK 56 / React Native web app at the root (light mode
default, guest-first auth); Express + Prisma 7 API in server/; FastAPI
damage-AI service in services/damage-ai/; static reference wireframe
"AutoMate Interactive Wireframe v17.html"; parity gate scripts/ and tests
throughout. The database is Supabase PostgreSQL — a STAGING project, so you
may freely seed, mutate, and load-test it. I will provide DATABASE_URL,
DIRECT_URL, SUPABASE_URL and SUPABASE_ANON_KEY when you ask; put them in
server/.env and the client .env, never commit them.

── Phase 0 · Preflight ────────────────────────────────────────────────
- npm install at root, server/, and pip install -r requirements.txt (+
  requirements-live.txt if models/damage-seg.pt exists) in services/damage-ai/.
- Discover the client's environment contract: grep for EXPO_PUBLIC_ across
  src/ and app.config.* to list every env var the app reads (API base URL,
  damage-AI URL, Supabase URL/key, service mock↔api switch). Write a
  .env.example-accurate .env for web testing. Ask me for the staging values.
- In server/: set DATABASE_URL (pooled) + DIRECT_URL, then
  npx prisma migrate deploy && npx prisma generate. Verify every table in
  prisma/schema.prisma exists in staging (psql \dt or prisma db pull diff).
- Create the Supabase storage bucket the app uploads damage photos to
  (grep src/lib/damageEstimates.ts for the bucket name) and confirm RLS
  policies allow an authenticated user to insert/select their own rows on
  damage_requests / damage_parts and upload to the bucket.
- Verify test-assets/damage-samples/ contains images; list them. If empty,
  STOP and ask me for photos before Phase 5.

── Phase 1 · Static gates (run after every fix, too) ──────────────────
- npx tsc --noEmit (root) — must exit 0.
- cd server && npx tsc --noEmit — must exit 0.
- npx expo export --platform web — must succeed; note the dist/ output.
- npx tsx scripts/actuarial-parity.ts (byte-parity of the client/server
  actuarial model) and any npm test / pytest suites that exist (root,
  server/, services/damage-ai/ — run pytest there).
- Wireframe sanity: python3 -c to count <div> vs </div> and <svg> vs </svg>
  in "AutoMate Interactive Wireframe v17.html" — must balance.

── Phase 2 · Bring services up ────────────────────────────────────────
- Start the damage-AI service: MODEL_MODE=mock (and a second run with
  MODEL_MODE=live if models/damage-seg.pt exists) on port 8100; curl its
  health/docs endpoint.
- Start the Express server on port 4000 pointed at staging Supabase and the
  damage-AI URL. Confirm boot logs are clean and GET /health (or the root
  route) responds.
- Serve the exported web build (npx serve dist or expo start --web) and
  confirm it loads in a headless browser.

── Phase 3 · API functional use cases (curl or supertest, against staging) ──
Exercise every route with both happy and failure paths; verify DB side
effects with SQL after each:
 1. Auth: signup → OTP verify (demo OTP if mock provider) → JWT; login with
    wrong password → 401; token on a protected route; malformed body → 4xx
    not 500.
 2. Vehicles: add (the "2019 Honda Accord EX-L"-style name), list, primary
    switching.
 3. Damage request → quotes: submit a request (parts payload), verify a
    damage_requests row + shops_notified; fetch quotes; accept a quote.
 4. Bookings + payments: create booking with deposit rules — repair = $25
    deposit (2500¢), maintenance = $0, Pro = waived. Payment rows must carry
    the right amount_cents and purpose (booking | pro_membership | diy_unlock).
 5. Points ledger: every earn action writes a ledger row with correct delta
    and balance_after; balance can never go negative on redemption; the earn
    schedule must match src/config/points.ts EXACTLY (fail if server/client
    diverge).
 6. Pro: subscribe annual (4800¢) and monthly (999¢) → membership row has
    plan, lifetime=false, renews_at ≈ +1yr/+1mo; repeat subscribe →
    alreadyPro, no duplicate payment; /pro/diy-unlock → 1000¢ payment, no
    membership row.
 7. Cross-user isolation: user B must not be able to read/mutate user A's
    vehicles, requests, points, or bookings (expect 403/404 or empty).

── Phase 4 · Web E2E flows (Playwright, headless chromium) ────────────
Script these against the served web build. These mirror the product spec —
verify UI state AND (where applicable in api/Supabase mode) DB state:
 1. GUEST ESTIMATE: from Home tap "AI Repair Estimate" → select damaged part
    on the car diagram → add photo(s) → damage types → car-info intake (no
    account) → confirm parts → "Submit for quotes" → AI range appears, shop
    quotes are blurred/locked with a sign-up/log-in CTA. The Quotes tab shows
    the estimate but gates the quotes.
 2. GUEST → NEW USER: from the locked preview, choose "New user", complete
    sign-up. EXPECT: no replace prompt; the submission is finalized — the car
    from intake is saved to the account, points were awarded for the photo
    submission, and the Quotes tab now shows the real quotes for that
    submission immediately.
 3. GUEST → RETURNING USER: seed an account that already has an open quote
    request. Re-run the guest flow with a DIFFERENT part/photos, log in from
    the preview. EXPECT the replace prompt: "unresolved quote request …
    quotes already received from auto shops" + a warning card saying the new
    submission removes previous quotes and shops must respond again. Test
    all three buttons: keep existing (→ Quotes tab, old quotes intact),
    replace & submit (→ new request, old key replaced), back to my parts.
 4. DUPLICATE SUBMISSION: with an open request, resubmit the SAME part +
    same photos + same car. EXPECT the duplicate variant: "Same as your
    previous request … same damaged part, photos and car — still replace?"
    with "Replace anyway →". Confirm changing ANY of part/photo/car flips it
    back to the plain replace prompt.
 5. Bookings: accept a quote → agreement → deposit screen ($25 repair /
    waived for Pro) → booking appears in Bookings with the unread badge.
 6. Points: daily check-in awards +10 exactly once per day; the ledger
    screen and dollar conversion (1 pt = $0.01, 420-pt seed) are correct.
 7. Pro: subscribe annual from the paywall → ProManage shows plan, price,
    Active, and a real "Renews" date ≈ one year out; cancel → perks revoked
    immediately (deposit no longer waived, DIY locked); renewal date shows
    an em dash.
 8. Maintenance booking, community post (+points), insurance add (+100 pts),
    dark-mode toggle persistence, and sign-out → app returns to clean guest
    state (points reset to seed, no leaked personal data).
 9. Accessibility/robustness smoke: no console errors on any tested screen;
    refresh mid-flow doesn't crash; direct URL to a gated screen shows the
    auth gate, not a blank page.

── Phase 5 · AI model tests (services/damage-ai + app pipeline) ───────
Use the images in test-assets/damage-samples/. If a manifest.csv is present
there, treat it as ground truth: for each row assert damage-vs-reject, and in
live mode assert the detected part/types match the manifest (log mismatches
as failures). Then:
 1. MOCK MODE: POST each image to /estimate. Assert: valid schema, price_low
    < price_high, confidence in (0,1], severity ∈ the app's enum, and the
    response maps to a part/type the app can render.
 2. LIVE MODE (only if models/damage-seg.pt exists): repeat with
    MODEL_MODE=live. For each damage photo, assert at least one detection of
    a plausible class (dent/scratch/crack/paint) and log per-image
    class+area+severity+price into a results table in the report.
 3. NEGATIVE IMAGES: the no-damage photos MUST take the rejection path
    (rejected=true / low-confidence guard) — the app should show the
    "couldn't detect damage / retake photos" screen, never a price. Verify
    end-to-end through the web UI, not just the API.
 4. Robustness: a 0-byte file, a 20MB image, a non-image file, and a
    sideways (EXIF-rotated) photo — service must 4xx or handle gracefully,
    never 500/crash.
 5. Consistency: same image twice → same estimate (mock is deterministic;
    live should be identical or within a trivial epsilon).
 6. Pricing sanity: pipe one real detection through config/pricing.yaml
    math by hand and confirm the API's price bucket matches.

── Phase 6 · Stress test (k6, staging only) ───────────────────────────
Write a k6 script (save as scripts/stress/k6-api.js) that models a realistic
session: signup-or-login → add vehicle → submit damage request → poll quotes
→ daily check-in → fetch points. Run ~50 VUs for 5 minutes, ramping 0→50
over 60s. Thresholds (fail the phase if breached): p95 latency < 800ms for
reads, < 2s for the estimate submit; error rate < 1%. Also:
- Watch Supabase connection usage (pooled port 6543 via pgbouncer!) —
  confirm the Prisma pool doesn't exhaust staging's connection cap.
- One focused burst: 50 concurrent POSTs to the damage-AI /estimate with a
  sample image; record p95 and whether the service queues or falls over
  (CPU inference — document the realistic ceiling).
- After the run: SQL-audit the ledger (no negative balances, no orphaned
  rows, balance_after chains consistent per user).

── Phase 7 · Vercel pre-deploy ────────────────────────────────────────
- Confirm the web build is a static SPA export (dist/) and write/verify
  vercel.json: SPA rewrite of all routes to /index.html, correct output dir.
- Enumerate every EXPO_PUBLIC_ var (from Phase 0) into a checklist of Vercel
  project env vars; verify none are missing and no secret (service key, JWT
  secret) is exposed as EXPO_PUBLIC_.
- vercel build locally if the CLI is available; otherwise npx serve dist and
  smoke-test deep links (/quotes, a gated route) return the app, not 404.
- If I've linked a Vercel project, deploy a PREVIEW (never --prod), run the
  Phase-4 case 1–4 smoke against the preview URL, and give me the URL.
- Final checklist: HTTPS-only asset URLs, favicon/meta present, bundle size
  noted, no source maps leaking secrets.

── Report ─────────────────────────────────────────────────────────────
Finish with docs/prerelease-test-report.md containing: a pass/fail matrix
for every numbered case above; every issue found with root cause and the
commit that fixed it; AI per-image results table; k6 latency/error summary
+ Supabase connection headroom; the Vercel env-var checklist; and a clear
GO / NO-GO recommendation with remaining risks ranked. Commit the report,
the k6 script, and any test scaffolding you wrote.
```

---

Notes:

- The prompt assumes the session can reach staging Supabase and has Chromium
  available for Playwright (Claude Code web sessions have one pre-installed).
- Give the credentials interactively when asked rather than pasting them into
  the prompt, so they don't end up in the session transcript or a commit.
- Re-runnable: every phase is idempotent against staging; wipe staging between
  full runs with `npx prisma migrate reset` in `server/` if you want a clean
  slate.
