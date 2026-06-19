"""Deploy the damage-AI FastAPI service to Modal as a scale-to-zero GPU endpoint.

Modal runs our FastAPI app on a GPU, bills per-second of actual compute, and
scales to zero between requests — the cheapest fit for spiky consumer traffic.

One-time:
    pip install modal
    modal setup                                   # browser auth
    modal volume create automate-damage-weights
    # upload your trained weights into the Volume (re-run after each retrain):
    modal volume put automate-damage-weights ../models/damage-seg.pt /damage-seg.pt

Deploy (from services/damage-ai/):
    modal deploy deploy/modal_app.py
    # Modal prints an https URL → set EXPO_PUBLIC_DAMAGE_AI_URL to it, rebuild the app.

Verify:
    curl https://<your-modal-url>/health        # "model_mode":"live","model_loaded":true

Note: Modal's SDK evolves. If a kwarg is rejected, check `modal --version`:
  - scaledown_window  was  container_idle_timeout
  - gpu="L4"          was  gpu=modal.gpu.L4()
"""
from pathlib import Path

import modal

SERVICE_DIR = Path(__file__).resolve().parent.parent  # services/damage-ai

# The standard PyPI torch wheel on Linux x86_64 is CUDA-enabled, so this image
# runs YOLO-seg on Modal's GPU without a custom CUDA base.
image = (
    modal.Image.debian_slim(python_version="3.11")
    .apt_install("libgl1", "libglib2.0-0")  # opencv/ultralytics runtime libs
    .pip_install_from_requirements(str(SERVICE_DIR / "requirements.txt"))
    .pip_install("ultralytics>=8.3", "torch>=2.2")
    .env({"MODEL_MODE": "live", "WEIGHTS_PATH": "/weights/damage-seg.pt"})
    # Ship our service code into the image (cwd is /root → `app`, `config`).
    .add_local_dir(str(SERVICE_DIR / "app"), "/root/app", copy=True)
    .add_local_dir(str(SERVICE_DIR / "config"), "/root/config", copy=True)
)

app = modal.App("automate-damage-ai", image=image)

# Persistent Volume holding the fine-tuned weights (mounted read-only at /weights).
weights = modal.Volume.from_name("automate-damage-weights", create_if_missing=True)


@app.function(
    gpu="L4",                 # or "T4" (cheaper) / "A10G" (faster)
    volumes={"/weights": weights},
    scaledown_window=300,     # stay warm 5 min after the last request, then → 0
    timeout=120,
    # min_containers=1,       # uncomment to keep one warm (kills cold starts, costs more)
)
@modal.asgi_app()
def fastapi_app():
    # MODEL_MODE / WEIGHTS_PATH come from image.env above; app.main reads them at
    # import. If weights are missing the service degrades to mock — check /health.
    from app.main import app as fastapi

    return fastapi
