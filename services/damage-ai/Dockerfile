# AutoMate damage-AI — stateless, containerized so it deploys independently of
# the web app. Defaults to MODEL_MODE=mock (no model/GPU needed).
#
# Build:  docker build -t automate-damage-ai services/damage-ai
# Run  :  docker run -p 8100:8100 automate-damage-ai            # mock mode
#
# Live mode (GPU host): mount weights + flip the env var:
#   docker run --gpus all -p 8100:8100 \
#     -e MODEL_MODE=live -e WEIGHTS_PATH=/weights/damage-seg.pt \
#     -v $PWD/models:/weights automate-damage-ai
# (Live mode also needs the optional extras — see requirements.txt — added to a
#  GPU image, or bake a separate Dockerfile.gpu.)

FROM python:3.11-slim

ENV PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    MODEL_MODE=mock \
    PORT=8100

WORKDIR /app

# System libs Pillow needs for JPEG/PNG decoding.
RUN apt-get update \
    && apt-get install -y --no-install-recommends libjpeg62-turbo zlib1g \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt ./
RUN pip install -r requirements.txt

COPY app ./app
COPY config ./config

EXPOSE 8100

# Stateless: no volumes required in mock mode.
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT}"]
