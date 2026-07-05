# AutoMate: trained AI model → live in app → tested → published on iOS

End-to-end plan with costs. Assumes today's state: web app live on Vercel
(demo mode), Supabase migrated, Railway API mid-setup, damage-AI service in
mock mode, training scaffold ready (`services/damage-ai/train/`, playbook in
`train/HIGH_ACCURACY.md`), test suites committed (Phase-3 API, Playwright
E2E, sample-image pytest, k6).

Total timeline: **~10–12 weeks** with one dev + you. Phases 1–2 and 5 can
overlap.

---

## Phase 1 — Training data (weeks 1–4) · the make-or-break phase

The model is only as good as this phase. Target: **3,000–5,000 images,
≥1,000 instances per class** (`dent · scratch · crack · paint`), plus ~10%
negatives (clean panels, non-car photos) for the rejection guard.

1. **Write the labeling guide first** (1 page): tight polygons that hug the
   damage (no loose boxes around scratches), label *every* instance in frame,
   the dent-vs-paint boundary rule, and what counts as a negative.
2. **Collect commercially usable images.** CarDD (~4k images) is
   research-only — use it to *benchmark*, never to ship. Usable sources:
   - **Partner body shops** in the Fairfax corridor: offer free early listing
     placement in exchange for photo rights to their intake photos (best
     source — exactly the domain: phone photos, real lighting). 2–3 shops ≈
     1–2k images.
   - **Self-collected**: parking lots, junkyards (ask permission), your own
     network's dinged cars.
   - **Licensed datasets** on Roboflow Universe / Kaggle — *check each
     license*; many are CC-BY (usable with attribution).
   - **Pilot users' uploads** once ToS grants a training license (add the
     clause now — see Missing Items).
3. **Annotate.** Label Studio (self-hosted, free) or Roboflow (free tier →
   $65/mo if you outgrow it). Export **YOLOv8 segmentation** format. For
   speed, outsource polygon labeling to a freelancer/labeling service at
   ~$0.04–0.12 per instance → **$400–$1,500** for the full set; you QA 10%
   of every batch against the guide.
4. **Assemble** with `train/prepare_dataset.py --val-frac 0.15` — it
   validates polygons and prints per-class counts. Fix any class with <25%
   of the largest class by collecting more (usually `crack`). Split by
   *vehicle*, not by photo, so burst shots don't leak train→val.

**Exit gate:** per-class counts ≥1k, val set includes 100+ real
AutoMate-style phone photos, negatives present, labeling QA done.

## Phase 2 — Train the model (weeks 3–6, overlaps Phase 1)

Follow `train/HIGH_ACCURACY.md` — the loop, not one big run:

1. **Round 1 baseline:** `python train/train_yolov8_seg.py --weights
   yolo11s-seg.pt --imgsz 1024 --batch 8 --epochs 200` (~3–6 h on a rented
   A10/4090).
2. **Evaluate per class:** `yolo segment val model=models/damage-seg.pt
   data=train/dataset.yaml`. Read the confusion matrix and the 20
   worst-loss val images — they name the next labeling batch.
3. **Rounds 2–3:** fix the data the failures point to, add `copy_paste=0.3`
   augmentation for the starved classes, retrain warm-starting from the
   previous checkpoint.
4. **Tune the rejection threshold** on the negatives: pick the per-detection
   confidence floor (service-side analog of the client's
   `YOLO_MIN_CONFIDENCE=0.5`) that rejects ≥95% of negatives while keeping
   damage recall acceptable.
5. **Calibrate severity → price** once real accepted-quote data exists:
   `python train/calibrate_severity.py --csv data/quotes.csv --apply`
   (highest-ROI tuning; no retrain).

**Hardware:** rent, don't buy. RunPod/Lambda A10 ≈ $0.30–0.75/hr → a full
3-round program is **under $100**. Colab Pro ($10–12/mo) works for the nano
model but is cramped at imgsz 1024 on `s`.

**Exit gates:** mask mAP@50 ≥ ~0.50 overall (CarDD-benchmark band), scratch
+ crack recall each ≥ 0.40, negative rejection ≥ 95%, val set includes the
real-phone-photo holdout.

## Phase 3 — Deploy the model behind the app (week 6–7)

The app's architecture means **zero client changes**: the service contract
is identical in mock and live mode.

1. Copy the checkpoint to `services/damage-ai/models/damage-seg.pt`.
2. Pick a serving host:
   - **Modal (recommended to start)** — `deploy/modal_app.py` is already
     written. Serverless GPU (T4): you pay per second of inference, ~zero
     when idle. At pilot volume (hundreds of estimates/day) this is
     **$5–30/mo**, and cold starts (~5–15 s) are acceptable for a
     "analyzing your photos…" UX that already shows staged progress.
   - **Railway CPU container** — build with `Dockerfile.gpu`'s CPU variant
     (`requirements-live.txt`, torch-cpu). 1024-px seg inference on CPU is
     ~2–5 s/image; fine at low volume, **$10–20/mo**, no cold starts.
   - Dedicated GPU box (Lambda/RunPod ~$200+/mo) — not until volume
     justifies it.
3. Set `MODEL_MODE=live`, bump `MODEL_VERSION`, keep serving `imgsz` equal
   to training `imgsz`.
4. Point the Railway API's `DAMAGE_AI_URL` at it. The server's TS fallback
   and the client mock remain as graceful degradation — an AI outage never
   breaks submissions.
5. Update the app copy: confidence now comes from the real model; keep the
   "estimate — final price after inspection" disclosure regardless.

## Phase 4 — Test all use cases with diverse damage samples (week 7–8)

Everything needed is already committed — this phase is about *data breadth*
and acceptance gates:

1. **Grow `test-assets/damage-samples/` to 100–150 images**: every class ×
   angles × lighting (day/night/garage) × paint colors (white/black/red/
   metallic) × wet/dirty panels × partial frames × EXIF-rotated portrait
   shots, plus 20+ negatives (clean panels, interiors, non-car objects,
   memes). Fill `manifest.csv` ground truth for every row.
2. **Live-mode suite:** `MODEL_MODE=live` + `pytest
   tests/test_prerelease_samples.py` — the manifest assertions now check
   real detections (part/type match, damage-vs-reject) instead of mock
   plumbing. Add a per-image results table to the report.
3. **End-to-end E2E:** re-run `scripts/e2e/suite.js` and the API-mode flow
   against the live model — the rejection path is now testable through the
   UI (upload a clean-panel photo → "couldn't detect damage" screen, never
   a price).
4. **Accuracy vs reality:** for 20–30 images where you know the actual
   repair cost (body-shop partners again), compare the app's range —
   target: actual price inside the range ≥70% of the time; feed misses into
   `calibrate_severity.py`.
5. **Load:** repeat the 50-concurrent `/estimate` burst against the live
   host; set the product SLA from the measured p95 (expect 1–4 s live vs
   210 ms mock) and confirm the UI's staged progress covers it.
6. **Beta cohort:** 20–50 TestFlight users (next phase) submit real photos;
   review every rejection and every wild-range estimate weekly; retrain
   monthly at first.

**Exit gates:** manifest suite green in live mode; negative-path E2E green;
≥70% actual-price-in-range on the known-cost set; p95 within the UI budget.

## Phase 5 — Publish on iOS (weeks 8–12)

Prereqs: backend live (Railway + Supabase — finish the 502 fix), because
App Review tests a *working* app.

1. **Apple Developer Program** — enroll ($99/yr; D-U-N-S needed if you
   enroll the LLC rather than yourself — do LLC if it exists, ~1–2 wks).
2. **Project config:** set a real `bundleIdentifier` (currently the
   placeholder `com.anonymous.automate` — e.g. `com.automate.app`), app
   icon/splash, `NSCameraUsageDescription` and
   `NSPhotoLibraryUsageDescription` strings in `app.json` (required — the
   damage flow uses both), version/build numbers.
3. **Build with EAS:** `eas build --platform ios` (Expo's cloud build —
   free tier queue or $19/mo priority). EAS handles certificates/profiles.
4. **TestFlight:** internal testers first (instant), then external beta
   (needs a lightweight Beta App Review). Run the Phase-4 beta cohort here.
5. **App Store submission package:**
   - Screenshots (6.9" and 6.5" iPhone minimum), promo text, keywords
     (ASO: "car repair estimate", "auto body quote", local terms).
   - **App Privacy form**: declares photos, contact info, user content;
     match it to your privacy policy URL (must be live — host on the Vercel
     domain).
   - **Demo account for reviewers** (seeded demo login + OTP note in the
     review notes).
6. **Expect 1–3 review cycles.** Known review risks for this app —
   addressed in Missing Items below: real account deletion (Guideline
   5.1.1(v)), UGC moderation for Community (1.2), and **In-App Purchase for
   Pro** (3.1.1) — the big one.
7. **Launch:** phased release on, monitor crashes (add Sentry) and the
   first cohort's funnels.

## Missing items the current plan/codebase needs (do these or expect rejection)

| # | Gap | Why / fix |
|---|---|---|
| 1 | **Pro must use Apple IAP** | Pro unlocks digital content (DIY guides) → Guideline 3.1.1 requires StoreKit for the $48/yr / $9.99/mo subscription (Apple takes 15% under $1M/yr). Integrate via RevenueCat (free tier) + `react-native-purchases`; keep card payments for *bookings/deposits* (physical services are exempt, 3.1.3(e)). ~1 week of work. |
| 2 | **Real account deletion** | The Settings button currently just signs out locally. Apple requires actual deletion: add `DELETE /profile` server endpoint (cascade is already modeled) + Supabase auth user removal, wire the button. Required since 2022. |
| 3 | **UGC moderation** | Community posts need report + block + a moderation path (Guideline 1.2): report button writing to a `reports` table, block list filtering the feed, and a stated review SLA in ToS. |
| 4 | **ToS training-license clause + privacy policy hosted** | Needed for Phase 1 user-photo training data and for the App Privacy form. Template + light legal review. |
| 5 | **Uploads off ephemeral disk** | Move damage photos to Supabase Storage before iOS launch (Railway disk wipes on redeploy; also needed for the retraining data flywheel). The `StorageProvider` interface was built for this swap. |
| 6 | **Crash reporting + analytics** | Sentry (free tier) + a funnel tool (PostHog free tier) before TestFlight, or you fly blind through beta. |
| 7 | **Retraining loop** | Monthly: export new consented photos + accepted-quote prices from Supabase (`docs/supabase-calibration-export.sql`), re-run training round + severity calibration, bump `MODEL_VERSION`. Budget it as an operating cost, not a one-off. |
| 8 | **Push notifications** ("your quotes arrived") | Not review-blocking, but the product's re-engagement loop; Expo Notifications + server hook. Can trail launch by a few weeks. |

## Expected costs

**One-time / first 3 months**

| Item | Est. |
|---|---|
| Data labeling (outsourced polygons, 4–5k images) | $400–1,500 |
| GPU training rental (3 rounds + experiments) | $50–150 |
| Apple Developer Program | $99/yr |
| App icon / screenshots / store assets (Figma DIY → freelancer) | $0–400 |
| Legal: privacy policy, ToS w/ training clause, marketplace terms (template + review) | $300–1,500 |
| D-U-N-S / LLC filing (if not done) | $0–300 |
| **One-time subtotal** | **~$850–3,950** |

**Monthly run-rate at pilot scale**

| Item | Est./mo |
|---|---|
| Model serving — Modal serverless GPU (or $10–20 Railway CPU) | $5–30 |
| Railway (API + AI containers) | $5–20 |
| Supabase (free → Pro when storage/connections demand) | $0–25 |
| Vercel (Hobby) | $0 |
| EAS builds (free queue → priority) | $0–19 |
| Sentry + PostHog (free tiers) | $0 |
| RevenueCat (free < $2.5k MTR) | $0 |
| Label Studio self-hosted / Roboflow | $0–65 |
| Monthly retraining GPU time | $10–30 |
| **Run-rate subtotal** | **~$20–190/mo** |

Apple's cut on Pro subscriptions: 15% (Small Business Program, <$1M/yr) —
factor into Pro pricing, not a cash cost.

**Realistic total to a public iOS launch with a live model: ~$1,500–4,500
plus ~$50–150/mo** — comfortably inside the earlier $25k plan envelope.

## Order of operations (summary)

```
Wk 1-4  Data: labeling guide → shop partnerships → collect → annotate → QA
Wk 3-6  Train: baseline → per-class eval → 2 fix-rounds → rejection tuning
Wk 6-7  Deploy: damage-seg.pt → Modal (MODEL_MODE=live) → DAMAGE_AI_URL
Wk 7-8  Test: 150-sample manifest suite live + E2E + known-cost validation
Wk 5-8  In parallel: IAP for Pro, account deletion, UGC moderation,
        Supabase Storage uploads, Sentry, policies hosted
Wk 8-9  Apple enrollment, bundle id + permissions, EAS build, TestFlight
Wk 9-11 Beta cohort → fix round → App Store submission (1-3 review cycles)
Wk 12   Phased release + monthly retraining loop begins
```
