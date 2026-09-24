#!/usr/bin/env python3
"""
Fetch one openly licensed image per practice/topic for the KREEDA Physical
Wellbeing module from Wikimedia Commons, with an attribution file.

Usage:
    python3 fetch_wellbeing_images.py                # everything, 1 image each
    python3 fetch_wellbeing_images.py --only yoga    # one section
    python3 fetch_wellbeing_images.py --overwrite    # re-fetch existing files

Output (default):
    ../src/assets/<section>/<id>.<ext>   — one file per item, used directly
    ../src/assets/ATTRIBUTION.csv        — license + author per file

Only public-domain, CC0, CC BY and CC BY-SA files are kept.
CC BY / CC BY-SA require attribution in the app (credits screen);
CC BY-SA may also require sharing edited versions under the same license.
Standard library only; no pip installs needed.
"""

import argparse
import csv
import html
import json
import os
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

API = "https://commons.wikimedia.org/w/api.php"
UA = "KREEDA-image-fetcher/1.0 (non-commercial student hackathon project)"
THUMB_WIDTH = 800
ALLOWED_LICENSES = ("public domain", "pd", "cc0", "cc by", "cc-by")  # covers CC BY / CC BY-SA
EXT_OK = (".jpg", ".jpeg", ".png", ".webp", ".svg")
RAW_POOL_MIN = 15  # over-fetch this many raw hits even when per-item is 1

# id -> search query. Edit queries freely if results are poor.
ITEMS = {
    "yoga": {
        "surya-namaskar": "Surya Namaskar",
        "tadasana": "Tadasana yoga",
        "vrikshasana": "Vrikshasana tree pose",
        "padahastasana": "Padahastasana",
        "ardha-chakrasana": "Ardha Chakrasana standing backbend",
        "trikonasana": "Trikonasana triangle pose",
        "natarajasana": "Natarajasana yoga",
        "bhadrasana": "Bhadrasana yoga",
        "vajrasana": "Vajrasana yoga",
        "ushtrasana": "Ustrasana camel pose",
        "shashankasana": "Shashankasana",
        "uttana-mandukasana": "Uttana Mandukasana",
        "vakrasana": "Vakrasana yoga",
        "paschimottanasana": "Paschimottanasana",
        "gomukhasana": "Gomukhasana yoga",
        "siddhasana": "Siddhasana",
        "simhasana": "Simhasana lion pose yoga",
        "makarasana": "Makarasana yoga",
        "bhujangasana": "Bhujangasana cobra pose",
        "shalabhasana": "Salabhasana locust pose",
        "dhanurasana": "Dhanurasana bow pose",
        "setubandhasana": "Setu Bandhasana bridge pose",
        "uttanapadasana": "Uttanapadasana",
        "ardha-halasana": "leg raises yoga pose",
        "halasana": "Halasana plough pose",
        "pavanamuktasana": "Pavanamuktasana wind relieving pose",
        "matsyasana": "Matsyasana fish pose",
        "chakrasana": "Chakrasana wheel pose yoga",
        "sarvangasana": "Sarvangasana shoulderstand",
        "sirsasana": "Sirsasana headstand yoga",
        "shavasana": "Savasana corpse pose",
        "nadi-shodhana": "Nadi Shodhana pranayama",
        "sheetali": "cooling breath yoga tongue",
        "bhramari": "Bhramari pranayama",
        "kapalabhati": "Kapalabhati",
        "patanjali": "Patanjali statue",
        "vivekananda-chicago": "Swami Vivekananda Chicago 1893",
        "international-yoga-day": "International Day of Yoga",
    },
    "vyayam": {
        "dand": "Hindu push-up dand",
        "baithak": "Hindu squat baithak",
        "akhada": "akhada wrestling India",
        "kushti": "Kushti pehlwani",
        "mudgar": "Indian club juggling",
        "gada": "gada mace exercise India",
        "jori": "jori Indian clubs",
        "indian-clubs": "Indian clubs Victorian exercise",
        "nal": "nal stone ring weight India",
        "mallakhamb": "Mallakhamb",
        "kalaripayattu": "Kalaripayattu",
        "great-gama": "Great Gama wrestler",
    },
    "dhyana": {
        "anapana": "breath meditation India",
        "walking-meditation": "walking meditation monk",
        "om-chanting": "Om symbol",
        "trataka": "candle flame meditation trataka",
        "maitri": "meditation Buddhist monks",
        "preksha-dhyana": "Preksha meditation",
        "sakshi-bhava": "meditation dhyana mudra",
        "dhyana-mudra": "Dhyana mudra Buddha statue",
        "vipassana": "Vipassana meditation",
        "zen-meditation": "zazen Zen meditation",
        "rishikesh-beatles-ashram": "Beatles Ashram Rishikesh",
    },
}


def _with_retry(fn, attempts=4, base_delay=2.0):
    last_err = None
    for attempt in range(attempts):
        try:
            return fn()
        except urllib.error.HTTPError as e:
            last_err = e
            if e.code not in (429, 503):
                raise
            wait = float(e.headers.get("Retry-After", base_delay * (2 ** attempt)))
            print(f"  [rate limited, retrying in {wait:.0f}s]")
            time.sleep(wait)
        except (urllib.error.URLError, TimeoutError) as e:
            last_err = e
            wait = base_delay * (2 ** attempt)
            print(f"  [network hiccup, retrying in {wait:.0f}s]")
            time.sleep(wait)
    raise last_err


def api_get(params):
    params = {**params, "format": "json", "formatversion": "2"}
    url = API + "?" + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers={"User-Agent": UA})

    def do():
        with urllib.request.urlopen(req, timeout=30) as r:
            return json.load(r)

    return _with_retry(do)


def strip_html(s):
    return html.unescape(re.sub(r"<[^>]+>", "", s or "")).strip()


def _run_search(gsrsearch, limit):
    data = api_get({
        "action": "query",
        "generator": "search",
        "gsrsearch": gsrsearch,
        "gsrnamespace": 6,
        "gsrlimit": max(RAW_POOL_MIN, limit * 5),
        "prop": "imageinfo",
        "iiprop": "url|extmetadata|mime",
        "iiurlwidth": THUMB_WIDTH,
    })
    pages = sorted(data.get("query", {}).get("pages", []), key=lambda p: p.get("index", 0))
    results = []
    for p in pages:
        info = (p.get("imageinfo") or [{}])[0]
        meta = info.get("extmetadata", {})
        lic = strip_html(meta.get("LicenseShortName", {}).get("value", ""))
        if not any(a in lic.lower() for a in ALLOWED_LICENSES):
            continue
        url = info.get("thumburl") or info.get("url")
        if not url:
            continue
        results.append({
            "title": p["title"],
            "url": url,
            "page": info.get("descriptionurl", ""),
            "license": lic,
            "license_url": strip_html(meta.get("LicenseUrl", {}).get("value", "")),
            "author": strip_html(meta.get("Artist", {}).get("value", "")) or "Unknown",
        })
        if len(results) >= limit:
            break
    return results


def search(query, limit):
    # First pass: restrict to images/drawings, which is usually enough.
    results = _run_search(f"{query} filetype:bitmap|drawing", limit)
    if results:
        return results
    # Fallback: some legitimately-licensed Commons files are indexed with
    # other mime types (SVGs tagged oddly, etc.) — retry without the filter
    # before giving up, so single-shot per-item fetches still land something.
    return _run_search(query, limit)


def download(url, path):
    req = urllib.request.Request(url, headers={"User-Agent": UA})

    def do():
        with urllib.request.urlopen(req, timeout=60) as r, open(path, "wb") as f:
            f.write(r.read())

    _with_retry(do)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--per-item", type=int, default=1)
    ap.add_argument("--only", choices=list(ITEMS))
    ap.add_argument("--out", default=os.path.join(os.path.dirname(__file__), "..", "src", "assets"))
    ap.add_argument("--overwrite", action="store_true")
    args = ap.parse_args()

    out_dir = os.path.abspath(args.out)
    os.makedirs(out_dir, exist_ok=True)
    csv_path = os.path.join(out_dir, "ATTRIBUTION.csv")
    new_file = not os.path.exists(csv_path)
    missing = []

    with open(csv_path, "a", newline="", encoding="utf-8") as fh:
        w = csv.writer(fh)
        if new_file:
            w.writerow(["file", "section", "id", "commons_title", "author", "license", "license_url", "source_page"])

        for section, items in ITEMS.items():
            if args.only and section != args.only:
                continue
            section_dir = os.path.join(out_dir, section)
            os.makedirs(section_dir, exist_ok=True)
            for item_id, query in items.items():
                existing = [f for f in os.listdir(section_dir) if f.startswith(item_id + ".")]
                if existing and not args.overwrite:
                    print(f"[skip ] {item_id}: already have {existing[0]}")
                    continue
                try:
                    results = search(query, args.per_item)
                except Exception as e:
                    print(f"[error] {item_id}: search failed ({e})")
                    missing.append(item_id)
                    continue
                if not results:
                    print(f"[none ] {item_id}: no openly licensed results for '{query}'")
                    missing.append(item_id)
                    continue
                for i, res in enumerate(results, 1):
                    ext = os.path.splitext(urllib.parse.urlparse(res["url"]).path)[1].lower()
                    if ext not in EXT_OK:
                        ext = ".jpg"
                    suffix = "" if args.per_item == 1 else f"_{i}"
                    fname = os.path.join(section_dir, f"{item_id}{suffix}{ext}")
                    try:
                        download(res["url"], fname)
                    except Exception as e:
                        print(f"[error] {item_id}: download failed ({e})")
                        continue
                    w.writerow([os.path.relpath(fname, out_dir), section, item_id, res["title"], res["author"],
                                res["license"], res["license_url"], res["page"]])
                    print(f"[ok   ] {item_id:28s} <- {res['title']}  ({res['license']})")
                    time.sleep(0.7)  # be polite to Wikimedia
                time.sleep(0.5)

    print(f"\nDone. Attribution: {csv_path}")
    if missing:
        print("No image found for:", ", ".join(missing))
        print("Tweak their queries in ITEMS and re-run with --only <section> --overwrite.")


if __name__ == "__main__":
    sys.exit(main())
