# nexus_leads.py — Umbra Nexus data engine (hardwired key + simple attachments)

import os
import csv
import time
import json
import shutil
import requests
from pathlib import Path

# ============================================
# UMBRA NEXUS — Google Places Lead Exporter
# ============================================

# 1) API KEY — hardwired for local use
#    Do NOT share this file publicly with the key still inside.
API_KEY = "AIzaSyD8YafdL16-3D_qXFpqj7ceqRikyret2FVI"

if not API_KEY or not API_KEY.strip():
    raise SystemExit("Missing Google API key in API_KEY constant.")

print("DEBUG: GOOGLE_API_KEY present?", bool(API_KEY))

# 2) Simple built-in attachments
BACKUP_DIR = "backups"
LOG_FILE = "nexus_runs.log"

# ====== Basic helpers ======

def ensure_dir(path: str) -> None:
    """Create a directory if it does not exist."""
    if not os.path.isdir(path):
        os.makedirs(path, exist_ok=True)


def utc_iso() -> str:
    """Return current UTC timestamp as ISO string."""
    return time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())


def log_run(num_rows: int, csv_path: str, json_path: str) -> None:
    """
    Append a summary line to a local log file.
    This is a tiny 'sentinel' style attachment.
    """
    line = f"{utc_iso()} | rows={num_rows} | csv={csv_path} | json={json_path}\n"
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(line)
    print(f"[log] Appended run summary to {LOG_FILE}")


def backup_outputs(csv_path: str, json_path: str) -> str:
    """
    Make a timestamped backup of the current CSV and JSON outputs
    into /backups. This is a tiny 'blackline' style attachment.
    """
    ensure_dir(BACKUP_DIR)
    snap_name = f"nexus_snapshot_{time.strftime('%Y-%m-%d_%H%M%S', time.gmtime())}"
    snap_path = os.path.join(BACKUP_DIR, snap_name)
    ensure_dir(snap_path)

    for src in (csv_path, json_path):
        if src and os.path.isfile(src):
            dst = os.path.join(snap_path, os.path.basename(src))
            shutil.copy2(src, dst)
            print(f"[backup] Copied {src} -> {dst}")
        else:
            print(f"[backup] Skipping missing file: {src}")

    print(f"[backup] Snapshot complete: {snap_path}")
    return snap_path

# ====== Places API helpers ======

EUGENE_LATLNG = "44.0521,-123.0868"
DEFAULT_RADIUS_M = 50000  # meters

def _http_get(url, params):
    r = requests.get(url, params=params, timeout=30)
    try:
        data = r.json()
    except Exception:
        data = {"status": "PARSE_ERROR", "results": []}
    return r, data


def textsearch(query, location=None, radius_m=DEFAULT_RADIUS_M, pagetoken=None):
    base = "https://maps.googleapis.com/maps/api/place/textsearch/json"
    if pagetoken:
        params = {"pagetoken": pagetoken, "key": API_KEY}
    else:
        params = {"query": query, "key": API_KEY}
        if location:
            params.update({"location": location, "radius": radius_m})
    r, j = _http_get(base, params)
    print(
        f"[textsearch] {query!r} -> HTTP={r.status_code} "
        f"status={j.get('status')} results={len(j.get('results', []))}"
    )
    return j


def nearbysearch(keyword=None, type_=None, location=EUGENE_LATLNG,
                 radius_m=DEFAULT_RADIUS_M, pagetoken=None):
    base = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
    if pagetoken:
        params = {"pagetoken": pagetoken, "key": API_KEY}
    else:
        params = {"key": API_KEY, "location": location, "radius": radius_m}
        if keyword:
            params["keyword"] = keyword
        if type_:
            params["type"] = type_
    r, j = _http_get(base, params)
    print(
        f"[nearby] keyword={keyword!r} type={type_!r} -> HTTP={r.status_code} "
        f"status={j.get('status')} results={len(j.get('results', []))}"
    )
    return j


def fetch_text_all(query, location=EUGENE_LATLNG, radius=DEFAULT_RADIUS_M, limit=120):
    results, token = [], None
    while True:
        data = textsearch(query, location, radius, token)
        results.extend(data.get("results", []))
        token = data.get("next_page_token")
        if not token or len(results) >= limit:
            break
        time.sleep(2.0)
    return results[:limit]


def fetch_nearby_all(keyword=None, type_=None, location=EUGENE_LATLNG,
                     radius=DEFAULT_RADIUS_M, limit=120):
    results, token = [], None
    while True:
        data = nearbysearch(keyword, type_, location, radius, token)
        results.extend(data.get("results", []))
        token = data.get("next_page_token")
        if not token or len(results) >= limit:
            break
        time.sleep(2.0)
    return results[:limit]

# ====== Writers ======

def write_csv(rows, path="leads_master.csv"):
    cols = [
        "category", "query", "name", "formatted_address", "rating",
        "user_ratings_total", "place_id", "business_status", "types",
        "lat", "lon"
    ]
    with open(path, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=cols)
        w.writeheader()
        w.writerows(rows)
    print(f"[csv] Wrote {len(rows)} rows to {path}")
    return path


def write_json(rows, path="leads.json"):
    """Convert raw rows into the schema used by Umbra Nexus globe (scene.js)."""
    out = []
    now_iso = utc_iso()
    for r in rows:
        rating = r.get("rating")
        try:
            rating = float(rating) if rating is not None else None
        except (TypeError, ValueError):
            rating = None

        out.append({
            "id": r.get("place_id"),
            "name": r.get("name"),
            "industry": r.get("category"),
            "rating": rating,
            "address": r.get("formatted_address"),
            "lat": r.get("lat"),
            "lon": r.get("lon"),
            "phone": None,
            "website": None,
            "source": r.get("query"),
            "last_updated": now_iso
        })

    with open(path, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=2)
    print(f"[json] Wrote {len(out)} records to {path}")
    return path

# ====== Main ======

if __name__ == "__main__":
    # Query buckets (adjust these later however you want)
    query_buckets = {
        "LuxuryDealers": [
            "BMW dealership near Eugene OR",
            "Mercedes dealership near Eugene OR",
            "Porsche dealership near Eugene OR",
            "Audi dealership near Eugene OR",
            "Tesla service center near Eugene OR",
            "Lexus dealership near Eugene OR",
            "Jaguar dealership near Eugene OR"
        ],
        "HighEndServices": [
            "paint protection film shop near Eugene OR",
            "ceramic coating near Eugene OR",
            "exotic car repair near Eugene OR",
            "wheel restoration near Eugene OR",
            "auto storage facility near Eugene OR",
            "auto upholstery near Eugene OR",
            "classic car restoration near Eugene OR"
        ],
        "AffluentVenues": [
            "golf club near Eugene OR",
            "country club near Eugene OR",
            "private airport hangar near Eugene OR",
            "luxury apartment near Eugene OR"
        ],
        "ClubsEvents": [
            "cars and coffee near Eugene OR",
            "classic car club near Eugene OR",
            "exotic car club near Eugene OR"
        ]
    }

    # Nearby fallback if Text Search gives nothing for a bucket
    nearby_types = {
        "LuxuryDealers": ("luxury", "car_dealer"),
        "HighEndServices": ("ceramic coating", "car_wash"),
        "AffluentVenues": ("golf", "country_club")
    }

    all_rows, seen = [], set()

    for category, queries in query_buckets.items():
        bucket_hits = 0

        # 1) Text Search sweep
        for q in queries:
            print(f"\n=== {category} :: {q}")
            res = fetch_text_all(q, location=EUGENE_LATLNG,
                                 radius=DEFAULT_RADIUS_M, limit=100)
            bucket_hits += len(res)
            for r in res:
                pid = r.get("place_id")
                if not pid or pid in seen:
                    continue
                seen.add(pid)

                loc = (r.get("geometry") or {}).get("location") or {}
                lat = loc.get("lat")
                lng = loc.get("lng")

                all_rows.append({
                    "category": category,
                    "query": q,
                    "name": r.get("name"),
                    "formatted_address": r.get("formatted_address"),
                    "rating": r.get("rating"),
                    "user_ratings_total": r.get("user_ratings_total"),
                    "place_id": pid,
                    "business_status": r.get("business_status"),
                    "types": ", ".join(r.get("types", [])),
                    "lat": lat,
                    "lon": lng
                })

        # 2) Nearby fallback when bucket had zero results
        if bucket_hits == 0 and category in nearby_types:
            kw, tp = nearby_types[category]
            print(f"\n-- Fallback: NEARBY for {category} (keyword={kw}, type={tp}) --")
            res = fetch_nearby_all(keyword=kw, type_=tp,
                                   location=EUGENE_LATLNG,
                                   radius=DEFAULT_RADIUS_M, limit=100)
            for r in res:
                pid = r.get("place_id")
                if not pid or pid in seen:
                    continue
                seen.add(pid)

                loc = (r.get("geometry") or {}).get("location") or {}
                lat = loc.get("lat")
                lng = loc.get("lng")

                all_rows.append({
                    "category": category + "_fallback",
                    "query": f"nearby:{tp or kw}",
                    "name": r.get("name"),
                    "formatted_address": (
                        r.get("vicinity") or r.get("formatted_address")
                    ),
                    "rating": r.get("rating"),
                    "user_ratings_total": r.get("user_ratings_total"),
                    "place_id": pid,
                    "business_status": r.get("business_status"),
                    "types": ", ".join(r.get("types", [])),
                    "lat": lat,
                    "lon": lng
                })

    out_csv = write_csv(all_rows, "leads_master.csv")
    out_json = write_json(all_rows, "leads.json")

    print(f"\n✅ Done! Wrote {len(all_rows)} unique leads to {out_csv} and {out_json}")

    # Attachments: backup + log
    backup_outputs(out_csv, out_json)
    log_run(len(all_rows), out_csv, out_json)