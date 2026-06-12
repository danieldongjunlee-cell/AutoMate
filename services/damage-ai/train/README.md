# Training the damage detector

The serving path (`MODEL_MODE=yolo`) expects YOLOv8 weights at
`models/damage.pt`. This folder is the scaffold for producing them.

## Folder conventions

```
data/damage/
  dent/      raw photos showing dents          (labelling inbox, class-sorted)
  scratch/   raw photos showing scratches
  crack/     raw photos showing cracks
  paint/     raw photos showing paint damage
data/damage-yolo/         labelled YOLO-format dataset (created by you)
  images/{train,val}/
  labels/{train,val}/     one .txt per image: `class cx cy w h` (normalized)
train/dataset.yaml        dataset config template (edit `path` if needed)
train/runs/               ultralytics output (gitignored)
models/damage.pt          best checkpoint, copied by train_yolo.py
```

`data/damage/*/` are committed empty (`.gitkeep`); drop photos in by class,
annotate them (Label Studio / CVAT / Roboflow all export YOLO format), and
place the export under `data/damage-yolo/`.

## Seeding with CarDD

[CarDD (Car Damage Detection)](https://cardd-ustc.github.io/) — Wang, Li &
Wu, *"CarDD: A New Dataset for Vision-Based Car Damage Detection"*, IEEE
Transactions on Intelligent Transportation Systems, 2023 — is the best public
starting set: ~4,000 images / 9,000+ instances with dent, scratch, crack,
glass-shatter, lamp-broken and flat-tire annotations (boxes + masks).

> **License: research-only.** CarDD is distributed for non-commercial
> research use and requires agreeing to its terms; it must NOT ship in a
> commercial build of AutoMate. The download is therefore a **manual step**:
> request/download it from the authors' page above, then convert.
> Cite the paper if results derived from it are published.

Conversion notes:
- Map CarDD classes onto ours: `dent→dent`, `scratch→scratch`, `crack→crack`,
  and fold `glass shatter` into `crack`; CarDD has no paint-fade class, so
  the `paint` class needs in-house photos.
- CarDD ships COCO-style annotations; convert with any coco→yolo script
  (ultralytics `from ultralytics.data.converter import convert_coco`).

## Run

```bash
pip install ultralytics            # optional extra, not in core requirements
python train/train_yolo.py --data train/dataset.yaml --epochs 50 --imgsz 640
MODEL_MODE=yolo uvicorn app.main:app --port 8100
```

`train_yolo.py` copies the best checkpoint to `models/damage.pt`
automatically. No datasets are downloaded by this repo's tooling.

## Receipt model upgrade path

`RECEIPT_MODE=ocr` uses PaddleOCR + field heuristics. The documented upgrade
is [Donut](https://github.com/clovaai/donut) (`naver-clova-ix/donut-base-finetuned-cord-v2`,
via `transformers`) for end-to-end receipt understanding — swap it in behind
`_ocr_receipt` in `app/main.py` once accuracy matters.
