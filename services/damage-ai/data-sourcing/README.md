# data-sourcing — bootstrap the dataset from the internet (no shop partners needed)

Step 1 of the model plan, runnable today. Everything here feeds the existing
pipeline: `train/prepare_dataset.py` → `train/train_yolov8_seg.py`.

## Workflow

```
1. Read SOURCES.md, download Tier-1 datasets (Kaggle + Roboflow, ~4K labeled imgs)
2. Convert labels to our schema (0:dent 1:scratch 2:crack 3:paint):
   - COCO-style JSON polygons (Kaggle/HITL downloads):
       python convert_coco_json.py --src <folder-with-jsons+images> --out ../data/raw/<name>
     (maps classes BY NAME — dent/scratch/crack/paint keywords; prints dropped
      names so you can extend with --extra-map "corrosion:3,rust:-1")
   - YOLO-seg txt exports (Roboflow "YOLOv8" format): use remap_classes.py
     with an id map derived from the export's data.yaml `names:` order
3. python fetch_wikimedia.py --out ../data/raw/wikimedia --category "Damaged automobiles" ...
      → raw commercial-OK photos (and negatives) for self-labeling in Label Studio
4. Merge labeled folders, then:
   python ../train/prepare_dataset.py --src <merged> --val-frac 0.15
5. python ../train/train_yolov8_seg.py   (first baseline ≈ few GPU-hours)
6. Baseline model → Label Studio ML backend → pre-label the raw pool → correct → retrain
```

## Rules that keep the model defensible

- **Provenance or it didn't happen:** every image needs a row in an
  `attributions.csv` (script-generated) or a license note in `SOURCES.md`.
  Save a copy of each dataset's license page into `licenses/` at download time.
- **CC BY** → keep attribution rows, ship a NOTICE file crediting authors.
- **Research-only data (CarDD, VehiDE)** stays in `data/research-only/`,
  never in a commercial training manifest.
- **No ToS-violating scraping** (Copart/IAAI, marketplaces, Google Images).
- Duplicate control: many public sets share images. Run a perceptual-hash
  dedupe across merged sources before `prepare_dataset.py` (e.g.
  `imagehash.phash`, hamming ≤ 6 ⇒ duplicate) so val doesn't leak into train.

## What "done" looks like for the internet bootstrap

- ~4K labeled images from Tier 1 remapped to our schema
- ~2–4K raw photos from Tier 2 queued in Label Studio
- baseline YOLOv8s-seg trained (mAP50 ≥ ~0.5 expected at this size)
- pre-labeling active → founder labeling throughput ~3× hand speed

Then shop photos (with invoices) start replacing internet data as the
majority source — internet data bootstraps the *detector*; only shop
invoices can ground the *price* head.
