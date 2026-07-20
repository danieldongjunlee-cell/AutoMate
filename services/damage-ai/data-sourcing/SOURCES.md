# Vetted internet data sources for the damage model

Bootstrap dataset for the proprietary model **before shop partnerships exist**.
Every source below is sorted by what its license allows. Re-verify the license
page at download time and save a screenshot/PDF into `data-sourcing/licenses/`
— licenses on hosting platforms occasionally change.

## Tier 1 — Commercial-OK, already annotated (download first)

| Source | Size | Labels | License | Classes → ours |
|---|---|---|---|---|
| [Car Parts and Car Damages (Humans in the Loop, Kaggle)](https://www.kaggle.com/datasets/humansintheloop/car-parts-and-car-damages) | 1,812 imgs (814 damage-annotated) | polygons | **CC0 1.0** (public domain) | dent→0, scratch→1, crack→2, paint chip/flaking→3, corrosion/missing→drop |
| [Car Damages Kaggle (AI Proyect, Roboflow)](https://universe.roboflow.com/ai-proyect/car-damages-kaggle) | 814 imgs | instance seg | **CC BY 4.0** | dent→0, scratch→1, crack→2, paint-chip→3, others→drop |
| [Car-Damage (cardamage, Roboflow)](https://universe.roboflow.com/cardamage-fvhwg/car-damage-f7gsv) | 908 imgs | instance seg | **CC BY 4.0** | dent→0, scratch→1, glass/smash/rust/etc→drop |
| [car-damage-type (SInfo, Roboflow)](https://universe.roboflow.com/sinfo/car-damage-type) | ~1K imgs | instance seg | **CC BY 4.0** | dent→0, scratch→1, smash/serious→drop (or severity signal) |
| [Car-damage-detection (CelebalWorkspace, Roboflow)](https://universe.roboflow.com/celebalworkspace/car-damage-detection-dy5hu) | ~1K imgs | boxes only | **CC BY 4.0** | boxes → weak labels/negatives only (we train seg) |
| [Car Damage Detection (CAR graph, Roboflow)](https://universe.roboflow.com/car-graph/car-damage-detection-dzxim-fknzj) | ~1K imgs | boxes | **CC BY 4.0** | same as above |

≈ **3.5–4.5K images with commercial-friendly labels** before any manual work.

**CC BY obligations:** keep the attribution rows (`attributions.csv`) and credit
the dataset authors in an in-app/served NOTICE file. CC0 needs nothing.

Download:
- Kaggle: `kaggle datasets download humansintheloop/car-parts-and-car-damages`
  (needs free account + `~/.kaggle/kaggle.json`).
- Roboflow: free account → each project page → Download → format
  **"YOLOv8 (segmentation)"** → `curl` link or `roboflow` pip package. Export in
  our 4-class order where the UI allows; otherwise remap after (see
  `remap_classes.py`).

## Tier 2 — Raw (unlabeled) photos, commercial-OK, we label ourselves

| Source | Method | License notes |
|---|---|---|
| Wikimedia Commons (categories: *Damaged automobiles*, *Traffic collisions*, …) | `fetch_wikimedia.py` (working, no API key) | filter to CC0/PD/CC BY (default); `--allow-sa` adds CC BY-SA |
| Flickr | Flickr API, license filter 4,5,9,10 (CC BY / CC0 / PD) | free API key required; record attribution |
| Openverse (openverse.org) | API aggregates CC images across the web | filter `license_type=commercial` |
| Unsplash/Pexels "car damage/dent/scratch" | manual or API | permissive licenses; low volume but high quality |
| Your own photos (junkyards, body-shop lots with permission, friends' cars) | phone | owned outright — the best kind |

These feed the Label Studio → `prepare_dataset.py` path. Also collect
**negatives** here: clean panels, whole undamaged cars, not-a-car images
(~15% of the final set) — Commons categories like *Automobiles by brand*.

## Tier 3 — Research-only (experiments ONLY, never in the shipped model)

| Source | Size | Why restricted |
|---|---|---|
| CarDD (cardd-ustc.github.io) | 4K imgs, 9K instances, seg | research-only license (repo docs already flag this) |
| VehiDE (Kaggle) | 13,945 imgs, 32K instances | license unclear/research — treat as research-only unless the authors grant commercial rights (worth emailing them) |

Use for: architecture sanity checks, augmentation tuning, benchmarking our
model against a strong external testbed. Keep under `data/research-only/`,
excluded from any commercial training manifest.

## Do NOT use (ToS-prohibited scraping)

- Copart / IAAI salvage-auction photos — ToS prohibit scraping. (A written
  data-license deal with them later would be a big unlock, though.)
- Craigslist / Facebook Marketplace damaged-car listings — ToS prohibit.
- Google Images bulk download — mixed rights; unusable for a defensible model.
- Reddit photos — API terms now restrict commercial ML use.

## Price data on the internet (weak priors only)

Real invoices from shops remain the only defensible price ground truth. Until
then, for sanity-checking the price head only:
- RepairPal fair-price estimator (public ranges per repair/metro) — manual
  reference points, don't scrape at scale.
- Published insurer/repair-cost studies (e.g. CCC Crash Course reports) —
  aggregate averages per damage category.
Record these in `train/calibration_sample.csv` format, tagged `source=web`,
and replace with invoice rows as they arrive.
