# Training the damage segmentation model (CarDD → YOLO-seg)

The serving path (`MODEL_MODE=live`) loads YOLO-seg weights at
`models/damage-seg.pt`. This folder produces them.

> **Want maximum accuracy?** This README covers the mechanics; see
> [`HIGH_ACCURACY.md`](./HIGH_ACCURACY.md) for the ranked playbook (data
> strategy, resolution, model size, augmentation, per-class evaluation, and the
> downstream price calibration).

## ⚠ CarDD license — read first

[CarDD](https://cardd-ustc.github.io) (Wang, Li & Wu, *"CarDD: A New Dataset
for Vision-Based Car Damage Detection"*, IEEE T-ITS, 2023) is the best public
starting set: ~4,000 high-res images / 9,163 instances across **6 classes**
(dent, scratch, crack, glass shatter, lamp broken, tire flat) **with
segmentation masks**.

**It is research/education-only.** Access requires filling in a license form and
agreeing to Flickr/Shutterstock image terms; CarDD does not own the image
copyrights. **It must NOT ship in a commercial build of AutoMate.** So:

- Download is a **manual step** (no script auto-fetches it).
- Use CarDD to prototype/benchmark only. For production, train on
  **commercially-licensed or self-collected** images (license the source photos,
  or collect & annotate your own in Label Studio / CVAT / Roboflow — all export
  YOLO-seg). The pipeline is identical; only the data source changes.
- Cite the paper if you publish results derived from it.

## Classes (production = 4)

The serving path, `config/pricing.yaml`, and the app all use **4 labels**:
`dent · scratch · crack · paint` (indices in `dataset.yaml` and
`app/inference.py CARDD_CLASSES`). Train on these. CarDD (below) is a 6-class
research set — use only to benchmark; map/drop its extra classes if you do.

## Steps (your own labels — the production path)

Annotate your photos in Label Studio / CVAT / Roboflow and export **"YOLOv8
segmentation"** (one `<name>.txt` of normalized polygons per image, class ids
`0 dent · 1 scratch · 2 crack · 3 paint`). Then:

```bash
pip install ultralytics pycocotools          # training extras (not in core reqs)

# 1. Split your labeled folder into data/cardd/{images,labels}/{train,val}:
python train/prepare_dataset.py --src /path/to/your_labeled_folder --val-frac 0.15
#    (validates class ids/polygons + prints per-class counts so you catch imbalance)
# 2. Fine-tune (≈20 min on a Colab T4 with the nano base):
python train/train_yolov8_seg.py            # base yolo11n-seg, 100 epochs, imgsz 640
#    higher accuracy on thin scratches/cracks: --imgsz 1024 --batch 8  (and yolo11s/m-seg)
# 3. (optional) export for fast serving:
python train/export_model.py --format onnx
```

### Benchmarking on CarDD (optional, research-only)

```bash
# Download CarDD manually (license form), then convert COCO masks → YOLO-seg:
python train/prepare_cardd.py --cardd-root /path/to/CarDD_release
```

`train_yolov8_seg.py` copies the best checkpoint to `models/damage-seg.pt`,
which the service loads when `MODEL_MODE=live`.

## Layout

```
data/cardd/
  images/{train,val}/*.jpg
  labels/{train,val}/*.txt     one row/instance: `cls x1 y1 ... xn yn` (normalized polygon)
train/dataset.yaml             4-class seg config (dent/scratch/crack/paint = app/inference.py CARDD_CLASSES)
train/runs/                    ultralytics output (gitignored)
models/damage-seg.pt           best checkpoint (copied by the trainer)
```

## Expected accuracy & evaluation

The CarDD paper reports ~**mask mAP@50 ≈ 0.50–0.55** for strong instance-seg
baselines; a fine-tuned `yolo11s/m-seg` lands in a similar band. Per-class mAP
is highest for large, distinct damage (glass shatter, lamp broken, tire flat)
and lowest for thin scratches. Treat these as a benchmark target, not a promise.

Evaluate with ultralytics (reports box + mask mAP@50 and mAP@50-95 per class):

```bash
yolo segment val model=models/damage-seg.pt data=train/dataset.yaml
```

Gate a release on **mask mAP@50** improving over the previous checkpoint, and
sanity-check the area→severity→price mapping on a held-out set before flipping
`MODEL_MODE=live` in production.

## Architecture upgrades (no service code changes)

`app/inference.py` loads weights with the ultralytics `YOLO` class, which reads
YOLOv8-seg / YOLO11-seg / YOLO26-seg identically. To upgrade, train with a newer
`--weights` base (e.g. `yolo11m-seg.pt`, or `yolo26-seg.pt` when you adopt it),
copy to `models/damage-seg.pt`, and bump `MODEL_VERSION`.
```

## Calibrating severity to real prices

The price table in `config/pricing.yaml` is your rate card; what's worth fitting
to data is **how damaged-area maps to severity per type** (`severity_weights`).
Once you have a CSV of past damage photos (or precomputed `area_ratio`) + the
**actual quoted price**, fit the weights:

```bash
# dry-run report (uses precomputed area_ratio):
python train/calibrate_severity.py --csv train/calibration_sample.csv
# compute area from photos with your weights, then write the fit:
python train/calibrate_severity.py --csv data/quotes.csv --weights models/damage-seg.pt --apply
```

It grid-searches each type's weight to minimize the error between the predicted
bucket's price and the actual price, prints a per-type before/after MAE table,
and (with `--apply`) writes the fitted `severity_weights` back into
`config/pricing.yaml` (comments preserved). **Bump `pricing_version` afterward.**
This is the highest-ROI tuning and needs no model retrain.

### Pull the CSV straight from Supabase (one command)

`docs/supabase-calibration-export.sql` builds the `part,type,area_ratio,
actual_price` rows from stored estimates (`damage_requests.model_json`) joined to
each user's accepted repair booking (`bookings.price_label`). Run it in the
Supabase SQL editor and "Download CSV", or:

```bash
psql "$SUPABASE_DB_URL" -c "\copy (<SELECT from the .sql>) to 'calibration.csv' csv header"
python train/calibrate_severity.py --csv calibration.csv --apply
```

It uses single-part requests. Bookings carry `damage_request_id` (set when a
quote is accepted), so the join is **exact** for new bookings; older rows fall
back to a nearest-prior-booking heuristic.

## Receipt model (separate)

`RECEIPT_MODE=ocr` uses PaddleOCR + field heuristics for `/receipt` and
`/insurance-card`. Documented upgrade: [Donut](https://github.com/clovaai/donut)
end-to-end receipt understanding — swap behind `_ocr_receipt` in `app/main.py`.
