# Training the damage segmentation model (CarDD → YOLO-seg)

The serving path (`MODEL_MODE=live`) loads YOLO-seg weights at
`models/damage-seg.pt`. This folder produces them.

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

## Steps

```bash
pip install ultralytics pycocotools          # training extras (not in core reqs)

# 1. Download CarDD manually from the page above; unzip it.
# 2. Convert COCO masks → YOLO-seg under data/cardd/:
python train/prepare_cardd.py --cardd-root /path/to/CarDD_release
# 3. Fine-tune (≈20 min on a Colab T4 with the nano base):
python train/train_yolov8_seg.py            # base yolo11n-seg, 100 epochs, imgsz 640
# 4. (optional) export for fast serving:
python train/export_model.py --format onnx
```

`train_yolov8_seg.py` copies the best checkpoint to `models/damage-seg.pt`,
which the service loads when `MODEL_MODE=live`.

## Layout

```
data/cardd/
  images/{train,val}/*.jpg
  labels/{train,val}/*.txt     one row/instance: `cls x1 y1 ... xn yn` (normalized polygon)
train/dataset.yaml             6-class seg config (class order = app/inference.py CARDD_CLASSES)
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

## Receipt model (separate)

`RECEIPT_MODE=ocr` uses PaddleOCR + field heuristics for `/receipt` and
`/insurance-card`. Documented upgrade: [Donut](https://github.com/clovaai/donut)
end-to-end receipt understanding — swap behind `_ocr_receipt` in `app/main.py`.
