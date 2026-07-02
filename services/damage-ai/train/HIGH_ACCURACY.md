# High-accuracy playbook — AutoMate damage-seg model

A focused recipe for pushing **mask mAP@50** as high as this 4-class car-damage
segmentation problem allows (`dent · scratch · crack · paint`). Read
[`README.md`](./README.md) first for the mechanics and the CarDD license; this
file is only about **accuracy levers**, ranked by return on effort.

> The single biggest accuracy fact for this problem: `dent` and `paint` are
> easy (large, blobby regions); **`scratch` and `crack` are hard** (thin,
> low-contrast, few pixels). Almost every lever below is really "how do I stop
> losing the thin classes." Track **per-class** mAP, not just the average — a
> great overall number can hide a scratch recall of 0.2.

---

## 0. The accuracy loop (do this, in order)

```
label well → train bigger+higher-res → look at the WORST val images
   → fix the data those failures point to → retrain → gate on per-class mAP
```

You get more from a second, targeted round of labeling the model's failures
than from any hyperparameter. Budget for **two or three** data iterations, not
one big train.

---

## 1. Data — 80% of the accuracy (spend here first)

Model size and hyperparameters are the last 20%. In order of impact:

1. **Volume with balance.** Aim for **≥1,000 instances per class**, and don't
   let the rare class fall below ~1/4 of the common one. `prepare_dataset.py`
   already prints per-class counts — treat a skew worse than 4:1 as a bug to fix
   by collecting/labeling more of the starved class (usually `crack`), not by
   oversampling alone.
2. **Label quality on thin damage.** Polygons must hug the scratch/crack, not
   box it. A loose polygon around a hairline scratch teaches the model that
   "scratch = a big rectangle of paint," which destroys precision. Enforce a
   labeling guide: tight polygons, label *every* instance in frame (missed
   instances become false "background" and suppress recall), and agree on the
   dent-vs-paint boundary up front.
3. **Domain match.** Train images should look like what the app captures:
   phone photos, mixed lighting, glare, wet panels, dirt, varied paint colors,
   oblique angles, partial panels. A model trained only on clean studio shots
   collapses on a real driveway photo. If you fine-tune on CarDD, **hold out a
   set of real AutoMate-style photos for validation** so the gate reflects
   production, not CarDD.
4. **Hard negatives.** Include clean panels, reflections, shadows, rock-chip
   sticker decals, and water beading with **no** damage labels. This is the
   cheapest way to cut false positives (the app quoting a repair for a shadow).
5. **Honest val split.** `prepare_dataset.py --val-frac 0.15` splits per file —
   make sure multiple photos of the *same* car/damage don't straddle train/val
   (leakage inflates mAP). If your data has burst shots, split by vehicle.

---

## 2. Resolution — the highest-ROI single flag

Thin cracks and scratches are a **pixel-count** problem. At `imgsz 640` a
hairline crack may be 1–2 px wide and gets erased by downsampling. Going to
`1024` (or `1280`) is usually worth **more mAP on scratch/crack than jumping a
model size**, at the cost of memory/time.

```bash
python train/train_yolov8_seg.py --imgsz 1024 --batch 8      # start here
# GPU-rich: --imgsz 1280 --batch 4 (lower batch to fit; pair with more epochs)
```

Keep the **serving** resolution matched — `app/inference.py` should infer at the
same `imgsz` you trained at (a model trained at 1024 but served at 640 loses the
gain). Bump `MODEL_VERSION` when you change it.

---

## 3. Model size — climb only when data + resolution are maxed

Base weights via `--weights`. Climb the ladder; stop when val mAP plateaus:

| Base | When |
|---|---|
| `yolo11n-seg.pt` | prototype / CPU serving / <500 instances/class |
| `yolo11s-seg.pt` | **default production start** — best accuracy/speed trade |
| `yolo11m-seg.pt` | you have a GPU for serving and s-seg plateaued |
| `yolo11l/x-seg` | last resort; watch for overfit on a small set |

```bash
python train/train_yolov8_seg.py --weights yolo11s-seg.pt --imgsz 1024 --batch 8
```

A bigger model on **too little** data overfits — you'll see train mAP ≫ val mAP.
If that gap opens, go back to §1, don't go up a size.

---

## 4. Training schedule

The script already sets the right defaults for fine-tuning: `cos_lr=True`,
`patience=20` (early-stop), mosaic on, 100 epochs. Adjustments that help:

- **More epochs at higher res.** 1024/1280 needs longer to converge — try
  `--epochs 200`; `patience=20` stops early if it plateaus, so you rarely waste
  the full budget.
- **Batch size.** Keep it as large as VRAM allows for stable batch-norm; if you
  must drop below 8 for resolution, that's fine — cos_lr tolerates it.
- **Warm-start from your last production checkpoint** instead of the COCO base
  once you have one — pass `--weights models/damage-seg.pt` so each data round
  builds on the previous fit.

### Augmentation (the thin-class ally, if you extend the script)

`train_yolov8_seg.py` doesn't expose aug flags today, but ultralytics accepts
them in `model.train(...)`. For car damage the high-value ones:

- `copy_paste=0.3` (seg-specific) — pastes rare instances (cracks/scratches)
  into new images. **Best single augmentation for class imbalance here.**
- `degrees=10, scale=0.5, fliplr=0.5, perspective=0.0005` — angle/scale/mirror
  variety matches phone framing. (Don't `flipud` — cars aren't upside down.)
- `hsv_h/hsv_s/hsv_v` — color/exposure jitter so paint color and glare don't
  become a class cue.
- `close_mosaic=10` — turn mosaic off for the last 10 epochs so the model
  finishes on natural, whole-image composition.

Add these to the `model.train(...)` call (or thread them as CLI args) and
re-benchmark; keep whatever moves **val** mask mAP, discard the rest.

---

## 5. Evaluate like you'll be judged

```bash
yolo segment val model=models/damage-seg.pt data=train/dataset.yaml
```

- Gate on **mask mAP@50 per class**, and additionally on **scratch/crack
  recall** — those are the ones that cost the product money when missed.
- Read the **confusion matrix** ultralytics writes: dent↔paint and scratch↔crack
  confusion is the usual failure and tells you exactly which labeling guide to
  tighten.
- **Look at the worst 20 val images by loss.** This is the highest-signal 15
  minutes in the whole loop — the failures name the next batch of data to label.
- Only flip `MODEL_MODE=live` after the **area→severity→price** mapping is
  sanity-checked on a held-out set (a great mask that maps to the wrong price
  bucket still quotes wrong — see §7).

---

## 6. Squeeze the last few points (inference-time, no retrain)

- **TTA:** `yolo ... val augment=True` (test-time augmentation) typically adds a
  little recall on thin classes at the cost of latency. Worth it if serving on
  GPU; measure the latency hit before enabling in `app/inference.py`.
- **Per-class confidence thresholds.** One global `conf` is a blunt instrument
  when classes differ this much. Lower the threshold for the low-recall class
  (crack) and raise it for the trigger-happy one — tune on val, not test.
- **Ensemble** two bases (e.g. `s-seg` + `m-seg`) only if a single model has
  truly plateaued; it doubles serving cost, so treat it as a last resort.

---

## 7. Don't forget: accuracy ≠ just the mask

The product's output is a **price range**, so two calibrations sit downstream of
the mask and are often a bigger win than more mAP:

1. **Severity calibration** (`train/calibrate_severity.py`) fits how
   damaged-area maps to a severity/price bucket per type against your **actual
   quoted prices**. This is the highest-ROI tuning in the whole service and
   needs **no retrain** — see the README section "Calibrating severity to real
   prices." Do this every time you gather more accepted-quote data.
2. **Confidence honesty.** The app discloses a confidence; make sure the
   reported number tracks real per-class reliability so a low-confidence crack
   estimate reads as a range, not a promise.

---

## TL;DR recipe

```bash
# 1. Label tightly, balance classes, include hard negatives (§1)
python train/prepare_dataset.py --src /path/to/labeled --val-frac 0.15   # check per-class counts

# 2. Production starting point: s-seg at 1024 (§2, §3)
python train/train_yolov8_seg.py --weights yolo11s-seg.pt --imgsz 1024 --batch 8 --epochs 200

# 3. Evaluate per-class, read the worst images, fix that data, retrain (§0, §5)
yolo segment val model=models/damage-seg.pt data=train/dataset.yaml

# 4. Calibrate price mapping — biggest downstream win, no retrain (§7)
python train/calibrate_severity.py --csv data/quotes.csv --apply

# 5. Serve at the SAME imgsz you trained at; bump MODEL_VERSION
MODEL_MODE=live uvicorn app.main:app --port 8100
```

Two or three passes of this loop, each aimed at the previous round's worst
failures, beats any single "perfect" training run.
