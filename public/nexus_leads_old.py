# nexus_leads.py — Umbra Nexus (hybrid API key loader)
import os
import csv
import time
import json
import requests
from dotenv import load_dotenv
from pathlib import Path

# ============================================
# UMBRA NEXUS — Google Places Lead Exporter (Hybrid key loader)
# ============================================

# Where to look for .env (same folder as this script)
dotenv_path = Path(__file__).with_name(".env")
print("DEBUG: looking for .env at:", dotenv_path)

# Try load .env (harmless if missing)
try:
    load_dotenv(dotenv_path=dotenv_path)
except Exception as e:
    print("DEBUG: load_dotenv exception:", e)

# Primary source: environment / .env
API_KEY = os.getenv("GOOGLE_API_KEY")

# Temporary/local fallback: hardcode here if .env fails (replace placeholder)
FALLBACK_KEY = "YOUR_REAL_GOOGLE_PLACES_API_KEY_HERE"

if API_KEY:
    print("DEBUG: loaded GOOGLE_API_KEY from environment/.env")
else:
    # Use fallback if available
    if FALLBACK_KEY and FALLBACK_KEY.strip() and "YOUR_REAL_GOOGLE" not in FALLBACK_KEY:
        API_KEY = FALLBACK_KEY
        print("DEBUG: using hardcoded fallback API key (local only)")
    else:
        print("DEBUG: no API key found in .env or fallback. Exiting.")
        raise SystemExit("Missing Google API key. Put it in .env or set FALLBACK_KEY.")

print("DEBUG: GOOGLE_API_KEY present?", bool(API_KEY))

# ====== Config ======
EUGENE_LATLNG = "44.0521,-123.0868"
DEFAULT_RADIUS_M = 50000  # meters

# ====== Helpers ======
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
    print(f"[textsearch] {query!r} -> HTTP={r.status_code} status={j.get('status')} results={len(j.get('results', []))}")
    return j

def nearbysearch(keyword=None, type_=None, location=EUGENE_LATLNG, radius_m=DEFAULT_RADIUS_M, pagetoken=None):
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
    print(f"[nearby] keyword={keyword!r} type={type_!r} -> HTTP={r.status_code} status={j.get('status')} results={len(j.get('results', []))}")
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

def fetch_nearby_all(keyword=None, type_=None, location=EUGENE_LATLNG, radius=DEFAULT_RADIUS_M, limit=120):
    results, token = [], None
    while True:
        data = nearbysearch(keyword, type_, location, radius, token)
        results.extend(data.get("results", []))
        token = data.get("next_page_token")
        if not token or len(results) >= limit:
            break
        time.sleep(2.0)
    return results[:limit]

def write_csv(rows, path="leads_master.csv"):
    cols = ["category","query","name","formatted_address","rating","user_ratings_total","place_id","business_status","types","lat","lon"]
    with open(path, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=cols)
        w.writeheader()
        w.writerows(rows)
    print(f"[csv] Wrote {len(rows)} rows to {path}")
    return path

def write_json(rows, path="leads.json"):
    out = []
    now_iso = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    for r in rows:
        rating = r.get("rating")
        try:
            rating = float(rating) if rating is not None else None
        except:
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
    # Query buckets (adjust as desired)
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

    nearby_types = {
        "LuxuryDealers": ("luxury", "car_dealer"),
        "HighEndServices": ("ceramic coating", "car_wash"),
        "AffluentVenues": ("golf", "country_club")
    }

    all_rows, seen = [], set()
    for category, queries in query_buckets.items():
        bucket_hits = 0
        for q in queries:
            print(f"\n=== {category} :: {q}")
            res = fetch_text_all(q, location=EUGENE_LATLNG, radius=DEFAULT_RADIUS_M, limit=100)
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

        if bucket_hits == 0 and category in nearby_types:
            kw, tp = nearby_types[category]
            print(f"\n-- Fallback: NEARBY for {category} (keyword={kw}, type={tp}) --")
            res = fetch_nearby_all(keyword=kw, type_=tp, location=EUGENE_LATLNG, radius=DEFAULT_RADIUS_M, limit=100)
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
                    "formatted_address": (r.get("vicinity") or r.get("formatted_address")),
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