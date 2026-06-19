# AutoMate damage-AI service

Self-hosted, stateless FastAPI microservice that turns car-damage photos into a
repair-cost estimate. It powers the app's photo-submission flow → "analyzing…"
screen → dealer-quotes AI estimate range + confidence bar.

It runs **fully in mock mode today** (no model, no GPU) and flips to real
inference by setting one env var once weights exist.

## Model choice

- **YOLO-seg instance segmentation** (default base **`yolo11n-seg`**) fine-tuned
  on **CarDD**. Segmentation (not plain boxes) gives a per-instance **mask →
  damaged-area ratio**, which drives severity and therefore price — repair cost
  depends on damage *area + severity per panel*, not just "a dent exists."
- **Why YOLO11-seg over YOLOv8-seg:** as of this build, Ultralytics **YOLO11**
  (Sept 2024) is the current *stable, production-recommended* release; **YOLO26**
  (Jan 2026) is the newest. All three load through the **same `ultralytics.YOLO`
  class**, so the architecture is a **weights swap** (`WEIGHTS_PATH` / `YOLO_BASE`)
  with no service or app code change. We default to YOLO11-seg and document
  YOLOv8-seg (proven CarDD notebooks) and YOLO26-seg as drop-in alternatives.
- **CarDD**: 4,000 images / 9,163 instances / 6 classes (dent, scratch, crack,
  glass shatter, lamp broken, tire flat) **with masks**.

### ⚠ CarDD license (commercial-use caveat)

CarDD is **research/education-only**: download is gated behind a license form and
agreement to Flickr/Shutterstock image terms (CarDD does not own the image
copyrights). **Do not ship CarDD-trained weights in a commercial AutoMate
build.** Use it to prototype/benchmark; for production, train the *same pipeline*
on commercially-licensed or self-collected, self-annotated images. See
[`train/README.md`](train/README.md). Cite the CarDD paper if you publish results.

## Endpoints

| Method | Path              | Purpose |
|--------|-------------------|---------|
| POST   | `/estimate`       | images[] (+ optional `part`, `make`/`model`/`year`) → estimate |
| GET    | `/health`         | status, model mode, `model_loaded`, model/pricing versions |
| POST   | `/receipt`        | receipt image/PDF → fields (maintenance scan) |
| POST   | `/insurance-card` | insurance card → policy fields (insurance scan) |

### `POST /estimate`

`multipart/form-data`:
- `images` — one or more photos (required for live mode).
- `part` — optional selected panel hint (e.g. `rear bumper`).
- `make`, `model`, `year` — optional vehicle context.
- `parts` — optional JSON array `[{"part","type"}]`; **mock mode** echoes these as
  the detected damages (so the app shows the user's selected parts). The **live**
  model ignores it and detects damages from the images.

Response:
```json
{
  "estimate_id": "est_1a2b3c4d5e6f7a8b",
  "damages": [
    { "type": "dent", "part": "rear bumper", "severity": "moderate",
      "confidence": 0.87, "area_ratio": 0.12 }
  ],
  "price_low": 285,
  "price_high": 480,
  "confidence_pct": 87,
  "model_version": "mock-1",
  "pricing_version": "nova-2026.06",
  "model_mode": "mock"
}
```

Pipeline: YOLO-seg inference → per detection `{damage_type, affected_part, mask,
damaged_area_ratio, severity, confidence}` → pricing layer maps
`part × damage_type × severity → $ range` (configurable table), aggregates
multiple damages into one low–high range, and reports the **mean detection
confidence** as `confidence_pct`. (`mask` feeds `area_ratio`; the public response
carries `area_ratio`, not the raw mask.)

## Pricing config

`config/pricing.yaml` — Northern Virginia (Fairfax, VA) rates, keyed
`part × damage_type × severity → [low, high]`, plus per-type `severity_weights`
(area→severity) and a `class_part` fallback. **Edit prices without touching
code**; bump `pricing_version` so stored estimates record which table produced
them. The `rear bumper × dent × moderate = [285, 480]` cell matches the
wireframe demo.

## Run it

### Mock mode (default — no model/GPU)

```bash
cd services/damage-ai
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --port 8100
# health:
curl localhost:8100/health
# estimate (rear-bumper dent demo):
curl -F 'parts=[{"part":"rear bumper","type":"dent"}]' localhost:8100/estimate
```

### Docker / compose

```bash
# Mock (CPU, no model):
docker compose up damage-ai                      # or: docker build -t automate-damage-ai . && docker run -p 8100:8100 automate-damage-ai
# Live (GPU + weights at ./models/damage-seg.pt):
docker compose --profile live up damage-ai-gpu   # uses Dockerfile.gpu (CUDA + ultralytics/torch)
```

### Live mode (real inference)

You need: a **GPU host** + NVIDIA Container Toolkit (CPU works but is slow), the
live extras (`requirements-live.txt`: `ultralytics`, `torch`), and **fine-tuned
weights** at `models/damage-seg.pt` (produce via `train/`). Then either compose
(above) or directly:

```bash
pip install -r requirements.txt -r requirements-live.txt
MODEL_MODE=live WEIGHTS_PATH=models/damage-seg.pt uvicorn app.main:app --port 8100
```

If weights or deps are missing, the service logs a warning and **degrades to
mock** — it never crashes. **Confirm it's truly live:** `GET /health` must show
`"model_mode": "live"` and `"model_loaded": true` (else it fell back to mock).

### GPU serverless deploy

Step-by-step for Modal (scale-to-zero, recommended), Google Cloud Run + GPU
(runs `Dockerfile.gpu` unchanged), and RunPod is in [`deploy/README.md`](deploy/README.md).
A ready Modal app is at [`deploy/modal_app.py`](deploy/modal_app.py).

### Tests

```bash
pip install -r requirements-dev.txt
pytest                                   # mock tests (CPU, gate every push)
RUN_LIVE_TESTS=1 MODEL_MODE=live pytest  # + live test: asserts the model loaded
```

CI: `.github/workflows/damage-ai.yml` runs the mock tests on every push; the
live test is a manual `workflow_dispatch` job for a self-hosted GPU runner and
**fails if a deploy silently degrades to mock**.

## Architecture / swappability

```
app/
  main.py        FastAPI routes (/estimate, /health, /receipt, /insurance-card)
  inference.py   DamageEstimator (MockEstimator | YoloSegEstimator) + assemble_estimate
  pricing.py     config-driven part×type×severity → $; area→severity; aggregation
  mock_engine.py deterministic mock damages + receipt/card mocks
  schemas.py     pydantic response contract
  config.py      env knobs (MODEL_MODE, WEIGHTS_PATH, YOLO_BASE, versions)
config/pricing.yaml   editable pricing table
train/                CarDD prep + YOLO-seg trainer + ONNX/TensorRT export
Dockerfile
```

`DamageEstimator` is the swap point: both estimators emit the same raw damage
list, and `assemble_estimate` owns pricing/response — so the model can change
without touching the rest.

## App integration

- App adapter: `src/lib/damageEstimator.ts` (`DamageEstimator` interface) is the
  only thing the app calls; nothing imports the model. With
  `EXPO_PUBLIC_DAMAGE_AI_URL` set it POSTs here; without it, it uses an in-app
  deterministic mock matching this service's mock — so the app runs with or
  without the service.
- Results (input image refs + full model JSON + price range + confidence +
  `model_version` + `pricing_version`) are stored in Supabase `damage_requests`
  (see `docs/supabase-damage.sql`).
- The Express server (`server/src/damageAi.ts`) also calls `/estimate` and maps
  the response to its per-part shape, with the same deterministic fallback.

## Env vars

| Var | Default | Meaning |
|-----|---------|---------|
| `MODEL_MODE` | `mock` | `mock` \| `live` (YOLO-seg) |
| `WEIGHTS_PATH` | `models/damage-seg.pt` | live weights |
| `YOLO_BASE` | `yolo11n-seg.pt` | base arch (docs/health + training default) |
| `MODEL_VERSION` | derived | stored with each estimate |
| `CONF_THRESHOLD` | `0.25` | live: drop detections below this |
| `RECEIPT_MODE` | `mock` | `mock` \| `ocr` (PaddleOCR) |
