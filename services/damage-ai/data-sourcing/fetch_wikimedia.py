#!/usr/bin/env python3
"""Fetch commercially-usable car-damage photos from Wikimedia Commons.

No API key needed. Filters to commercial-friendly licenses (CC0 / public
domain / CC BY by default; --allow-sa adds CC BY-SA), downloads a resized
copy (EXIF stripped by re-encoding), and appends provenance rows to
attributions.csv so CC BY credit obligations are met.

Usage:
    python fetch_wikimedia.py --out ../data/raw/wikimedia \
        --category "Damaged automobiles" --category "Dented cars" \
        --search "car bumper dent" --limit 200

    # negatives (clean cars) for the reject/undamaged classes:
    python fetch_wikimedia.py --out ../data/raw/negatives \
        --search "sedan parked" --limit 100
"""
from __future__ import annotations

import argparse
import csv
import io
import re
import sys
import time
from pathlib import Path

import requests

API = "https://commons.wikimedia.org/w/api.php"
UA = "AutoMateDataBootstrap/1.0 (car-damage dataset collection; contact: danieldongjunlee@gmail.com)"

OK_LICENSES = {
    "cc0", "public domain", "pd", "no restrictions",
    "cc by", "cc by 1.0", "cc by 2.0", "cc by 2.5", "cc by 3.0", "cc by 4.0",
    "cc-by", "cc-by-2.0", "cc-by-3.0", "cc-by-4.0", "attribution",
}
SA_LICENSES = {
    "cc by-sa", "cc by-sa 2.0", "cc by-sa 2.5", "cc by-sa 3.0", "cc by-sa 4.0",
    "cc-by-sa", "cc-by-sa-2.0", "cc-by-sa-3.0", "cc-by-sa-4.0",
}


def api_get(session: requests.Session, **params) -> dict:
    params.setdefault("format", "json")
    r = session.get(API, params=params, timeout=30)
    r.raise_for_status()
    return r.json()


def iter_category_files(session, category: str, limit: int):
    cont = {}
    fetched = 0
    while fetched < limit:
        data = api_get(
            session, action="query", list="categorymembers",
            cmtitle=f"Category:{category}", cmtype="file",
            cmlimit=min(200, limit - fetched), **cont)
        members = data.get("query", {}).get("categorymembers", [])
        for m in members:
            yield m["title"]
            fetched += 1
            if fetched >= limit:
                return
        cont = data.get("continue") or {}
        if not cont:
            return


def iter_search_files(session, term: str, limit: int):
    cont = {}
    fetched = 0
    while fetched < limit:
        data = api_get(
            session, action="query", list="search", srsearch=term,
            srnamespace=6, srlimit=min(200, limit - fetched), **cont)
        hits = data.get("query", {}).get("search", [])
        for h in hits:
            yield h["title"]
            fetched += 1
            if fetched >= limit:
                return
        cont = data.get("continue") or {}
        if not cont:
            return


def file_info(session, titles: list[str]) -> list[dict]:
    out = []
    for i in range(0, len(titles), 50):
        chunk = titles[i:i + 50]
        data = api_get(
            session, action="query", prop="imageinfo", titles="|".join(chunk),
            iiprop="url|size|extmetadata", iiurlwidth=1600)
        for page in data.get("query", {}).get("pages", {}).values():
            infos = page.get("imageinfo")
            if infos:
                out.append({"title": page.get("title", ""), **infos[0]})
    return out


def norm_license(meta: dict) -> str:
    v = meta.get("LicenseShortName", {}).get("value", "") or ""
    return re.sub(r"\s+", " ", v).strip().lower()


def strip_html(s: str) -> str:
    return re.sub(r"<[^>]+>", "", s or "").strip()


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--out", required=True, help="output folder")
    ap.add_argument("--category", action="append", default=[],
                    help="Commons category (repeatable), without 'Category:'")
    ap.add_argument("--search", action="append", default=[],
                    help="file search term (repeatable)")
    ap.add_argument("--limit", type=int, default=200, help="max files per category/search")
    ap.add_argument("--min-width", type=int, default=640)
    ap.add_argument("--allow-sa", action="store_true",
                    help="also accept CC BY-SA (share-alike applies to the dataset if redistributed)")
    args = ap.parse_args()
    if not args.category and not args.search:
        ap.error("give at least one --category or --search")

    try:
        from PIL import Image
    except ImportError:
        print("Pillow required: pip install Pillow", file=sys.stderr)
        return 1

    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)
    attr_path = out / "attributions.csv"
    new_attr = not attr_path.exists()
    seen = {p.stem for p in out.glob("*.jpg")}

    session = requests.Session()
    session.headers["User-Agent"] = UA
    allowed = OK_LICENSES | (SA_LICENSES if args.allow_sa else set())

    titles: list[str] = []
    for cat in args.category:
        titles += list(iter_category_files(session, cat, args.limit))
    for term in args.search:
        titles += list(iter_search_files(session, term, args.limit))
    titles = list(dict.fromkeys(titles))
    print(f"candidates: {len(titles)}")

    kept = skipped_license = skipped_small = 0
    with attr_path.open("a", newline="") as f:
        w = csv.writer(f)
        if new_attr:
            w.writerow(["file", "commons_title", "author", "license", "source_url"])
        for info in file_info(session, titles):
            meta = info.get("extmetadata", {}) or {}
            lic = norm_license(meta)
            if not any(lic.startswith(ok) for ok in allowed):
                skipped_license += 1
                continue
            if (info.get("width") or 0) < args.min_width:
                skipped_small += 1
                continue
            url = info.get("thumburl") or info.get("url")
            if not url:
                continue
            stem = re.sub(r"[^A-Za-z0-9_-]+", "_", info["title"].removeprefix("File:"))[:120]
            if stem in seen:
                continue
            try:
                r = session.get(url, timeout=60)
                r.raise_for_status()
                img = Image.open(io.BytesIO(r.content)).convert("RGB")  # re-encode: strips EXIF/GPS
                img.save(out / f"{stem}.jpg", "JPEG", quality=90)
            except Exception as e:  # noqa: BLE001 — skip any undecodable/unreachable file
                print(f"  ! {info['title']}: {e}", file=sys.stderr)
                continue
            author = strip_html(meta.get("Artist", {}).get("value", ""))[:200]
            w.writerow([f"{stem}.jpg", info["title"], author, lic,
                        info.get("descriptionurl", "")])
            seen.add(stem)
            kept += 1
            time.sleep(0.25)

    print(f"kept {kept} · license-filtered {skipped_license} · too-small {skipped_small}")
    print(f"attributions → {attr_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
