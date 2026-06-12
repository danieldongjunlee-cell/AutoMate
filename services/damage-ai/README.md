# damage-ai — AutoMate AI service (FastAPI)

Photo-based damage estimates and receipt extraction for the AutoMate server
(`server/` forwards to this service and degrades gracefully when it's down).

## Run

```bash
cd services/damage-ai
python -m venv .venv
.venv/bin/pip install -r requirements.txt
.venv/bin/uvicorn app.main:app --port 8100
```

Defaults to **mock mode**: deterministic estimates derived from a hash of the
inputs + `config/pricing.yaml`, so the same photo set always returns the same
numbers and no model weights are needed.

## Endpoints

| Route | Body | Returns |
|---|---|---|
| `GET /health` | — | `{ok, model_mode, receipt_mode, pricing_market}` |
| `POST /estimate` | multipart: `images[]`, `part`, `damage_type` | `{part, damage_type, severity, severity_label, price_low, price_high, confidence_pct, model_mode}` |
| `POST /receipt` | multipart: `file` (image or PDF) | `{vendor, date, service_type, line_items:[{desc, amount}], total, mileage, model_mode}` |

```bash
curl -s localhost:8100/health
curl -s -X POST localhost:8100/estimate \
  -F part="Rear bumper" -F damage_type=Dent -F images=@photo1.jpg
curl -s -X POST localhost:8100/receipt -F file=@receipt.jpg
```

## Environment variables

| Var | Default | Values |
|---|---|---|
| `MODEL_MODE` | `mock` | `mock` — deterministic hash + pricing table. `yolo` — YOLOv8 weights from `models/damage.pt` (needs `pip install ultralytics`); missing deps/weights log a warning and fall back to mock. |
| `RECEIPT_MODE` | `mock` | `mock` — canonical AutoFix Pro receipt. `ocr` — PaddleOCR + heuristics (needs `pip install paddleocr paddlepaddle`); falls back to mock. |

## Pricing

`config/pricing.yaml`: Fairfax, VA base ranges keyed part x damage_type x
severity bucket (minor/moderate/severe). Rear-bumper x dent x moderate is
$285–$480 to match the wireframe demo. Loader: `app/pricing.py`. The server's
TS fallback (`server/src/damageAi.ts`) mirrors these constants — keep in sync.

## Training

See `train/README.md` (YOLOv8 fine-tune scaffold, CarDD dataset notes —
research-only license, manual download).
