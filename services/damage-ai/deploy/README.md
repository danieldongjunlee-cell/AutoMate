# Deploying damage-ai to GPU serverless (live mode)

Three serverless GPU paths. All end the same way: you get an **HTTPS URL**, set
`EXPO_PUBLIC_DAMAGE_AI_URL` to it, rebuild the app, and confirm
`GET /health` shows `"model_mode":"live"` and `"model_loaded":true`.

Prereq for all: a trained checkpoint at `services/damage-ai/models/damage-seg.pt`
(see `../train/README.md`).

---

## Option A — Modal (recommended for spiky consumer traffic)

Python-native, true scale-to-zero, per-second billing. Uses `deploy/modal_app.py`.

```bash
cd services/damage-ai
pip install modal && modal setup                       # one-time browser auth
modal volume create automate-damage-weights            # one-time
modal volume put automate-damage-weights models/damage-seg.pt /damage-seg.pt
modal deploy deploy/modal_app.py                        # prints an https URL
curl https://<modal-url>/health
```
Re-upload weights (`modal volume put ...`) and re-`modal deploy` after each
retrain. Tune `gpu=`, `scaledown_window`, `min_containers` in `modal_app.py`.

---

## Option B — Google Cloud Run + GPU (runs our Dockerfile.gpu unchanged)

Plain container, native HTTPS, scale-to-zero with NVIDIA L4. Weights live in a
GCS bucket mounted at `/weights` (matches our compose convention).

```bash
# 0. one-time
gcloud auth login && gcloud config set project YOUR_PROJECT
gcloud services enable run.googleapis.com artifactregistry.googleapis.com
gcloud artifacts repositories create automate --repository-format=docker --location=us-central1

# 1. build + push the GPU image (Cloud Build)
cd services/damage-ai
gcloud builds submit --tag us-central1-docker.pkg.dev/YOUR_PROJECT/automate/damage-ai:gpu -f Dockerfile.gpu .

# 2. weights → a bucket (re-upload after each retrain)
gcloud storage buckets create gs://YOUR_PROJECT-damage-weights --location=us-central1
gcloud storage cp models/damage-seg.pt gs://YOUR_PROJECT-damage-weights/damage-seg.pt

# 3. deploy with a GPU + the bucket mounted at /weights
gcloud run deploy damage-ai \
  --image us-central1-docker.pkg.dev/YOUR_PROJECT/automate/damage-ai:gpu \
  --region us-central1 --gpu 1 --gpu-type nvidia-l4 --cpu 4 --memory 16Gi \
  --min-instances 0 --max-instances 3 --concurrency 4 --no-cpu-throttling \
  --port 8100 --allow-unauthenticated \
  --set-env-vars MODEL_MODE=live,WEIGHTS_PATH=/weights/damage-seg.pt,MODEL_VERSION=yolo11n-seg-cardd-v1 \
  --add-volume name=weights,type=cloud-storage,bucket=YOUR_PROJECT-damage-weights \
  --add-volume-mount volume=weights,mount-path=/weights
# → prints a https://damage-ai-....run.app URL
```
You may need to request **GPU quota** for Cloud Run in the region first
(IAM & Admin → Quotas → "Cloud Run … GPU"). `--allow-unauthenticated` makes it
public; lock it down later (API key / IAM) and keep it in the same region as
Supabase to avoid cross-cloud egress.

---

## Option C — RunPod Serverless

Container-based GPU workers. Push the GPU image to a registry, create a
Serverless endpoint from it (set `MODEL_MODE=live`, bake weights into the image
or pull from a network volume / S3 at startup), and use the generated endpoint
URL. Good per-second pricing; slightly more setup than Modal.

---

## After any option

```bash
# in the app's build env (.env or EAS):
EXPO_PUBLIC_DAMAGE_AI_URL=https://<your-url>
```
Rebuild Expo (env is baked at build), submit damage photos, and confirm the
dealer-quotes estimate now comes from the live model. Rollback = unset the env
var (app uses its in-app mock) or redeploy with `MODEL_MODE=mock`.
