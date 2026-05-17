# places_leads_v3_new_integrated.py
# One-file version with enrichment, ETA progress, scoring, and master files
# Requires: requests, python-dotenv, tqdm
# pip install requests python-dotenv tqdm

import os
import csv
import time
import math
import random
import re
from urllib.parse import urljoin
import requests
from dotenv import dotenv_values
from tqdm import tqdm  # type: ignore

# --------- Config ----------
BASE_DIR = r"C:\leads_test"
os.makedirs(BASE_DIR, exist_ok=True)

# Load .env from same folder
env = dotenv_values(".env")
API_KEY = (env.get("GOOGLE_API_KEY") or env.get("\ufeffGOOGLE_API_KEY") or "").strip()

print("✅ Loaded API Key:", bool(API_KEY))
if not API_KEY:
    raise SystemExit("❌ GOOGLE_API_KEY not found. Make sure .env (with GOOGLE_API_KEY=...) is in the same folder as this .py file.")

# --- Query list ---
queries = [
    "auto detailing Eugene OR",
    "ceramic coating Eugene OR",
    "paint protection film Eugene OR",
    "car wash Eugene OR",
    "auto body shop Eugene OR",
    "window tint Eugene OR",
    "luxury car dealership Eugene OR",
    "motorcycle detailing Eugene OR"
]

HOME_LAT = 44.0521
HOME_LON = -123.0868
MAX_RADIUS_KM = 40  # ~40 mi
print(f"📍 Using Eugene coordinates: ({HOME_LAT}, {HOME_LON})")

SESSION = requests.Session()
SESSION.headers.update({"User-Agent": "leads-engine/1.0"})

# ---------- Utilities ----------
def distance_in_km(lat1, lon1, lat2, lon2):
    """Haversine distance in km between two lat/lon pairs."""
    if None in (lat1, lon1, lat2, lon2):
        return 0.0
    R = 6371.0
    lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = math.sin(dlat/2)**2 + math.cos(lat1)*math.cos(lat2)*math.sin(dlon/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

TRANSIENT_HTTP = {429, 500, 502, 503, 504}
TRANSIENT_PLACES = {"OVER_QUERY_LIMIT", "UNKNOWN_ERROR"}

def _get_json(url, params, max_attempts=6):
    attempt = 0
    while True:
        try:
            resp = SESSION.get(url, params=params, timeout=25)
            status_code = resp.status_code
            data = resp.json() if resp.content else {}
        except Exception:
            status_code = 503
            data = {}

        places_status = data.get("status")

        # success path
        if status_code < 400 and places_status not in TRANSIENT_PLACES:
            return data

        attempt += 1
        if attempt >= max_attempts:
            return data

        backoff = 0.8 * (2 ** (attempt - 1)) + random.random() * 0.3
        time.sleep(backoff)

def categorize(search_query: str) -> str:
    q = (search_query or "").lower()
    if "ceramic" in q: return "ceramic_coating"
    if "detail"  in q: return "detailing"
    if "tint"    in q: return "window_tint"
    if "body"    in q or "collision" in q: return "auto_body"
    if "dealer"  in q or "dealership" in q: return "dealership"
    return "other"

# ---------- Email enrichment helpers ----------
_EMAIL_RE = re.compile(r"[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}", re.I)

def _ensure_http(url: str) -> str:
    if not url:
        return ""
    u = url.strip()
    if u.startswith("http://") or u.startswith("https://"):
        return u
    return "https://" + u.lstrip("/")

def _fetch_text(url: str, max_bytes: int = 2_000_000) -> str:
    try:
        r = SESSION.get(url, timeout=15, allow_redirects=True)
        ct = (r.headers.get("Content-Type") or "").lower()
        if "text" not in ct and "html" not in ct:
            return ""
        return r.text[:max_bytes]
    except Exception:
        return ""

def _extract_emails(text: str) -> list[str]:
    if not text:
        return []
    found = set(m.group(0) for m in _EMAIL_RE.finditer(text))
    bad = {"example@example.com", "info@example.com"}
    return [e for e in found if e.lower() not in bad]

def _find_email_on_site(base_url: str) -> tuple[str, str]:
    """
    Try homepage, then common contact/about URLs.
    Returns (email, source_url) or ("","") if nothing found.
    """
    if not base_url:
        return "", ""
    base = _ensure_http(base_url)

    candidates = [
        base,
        urljoin(base, "/contact"),
        urljoin(base, "/contact/"),
        urljoin(base, "/contact-us"),
        urljoin(base, "/contact-us/"),
        urljoin(base, "/about"),
        urljoin(base, "/about/"),
        urljoin(base, "/about-us"),
        urljoin(base, "/about-us/"),
    ]

    for url in candidates:
        html = _fetch_text(url)
        if not html:
            continue

        # <a href="mailto:...">
        mailtos = re.findall(r'href=["\']mailto:([^"\']+)["\']', html, flags=re.I)
        mailtos = [m.split("?")[0] for m in mailtos]
        mailtos = [m for m in mailtos if _EMAIL_RE.fullmatch(m or "")]

        text_emails = _extract_emails(html)
        emails = mailtos or text_emails
        if emails:
            return emails[0], url

        time.sleep(0.35)

    return "", ""

def _find_contact_form(site_url: str) -> str:
    """
    Attempt to locate a contact/quote/booking form URL.
    Returns the first usable URL or "".
    """
    if not site_url:
        return ""
    base = _ensure_http(site_url)

    candidates = [
        base,
        urljoin(base, "/contact"),
        urljoin(base, "/contact/"),
        urljoin(base, "/contact-us"),
        urljoin(base, "/contact-us/"),
        urljoin(base, "/quote"),
        urljoin(base, "/quote/"),
        urljoin(base, "/estimate"),
        urljoin(base, "/estimate/"),
        urljoin(base, "/book"),
        urljoin(base, "/book/"),
        urljoin(base, "/booking"),
        urljoin(base, "/booking/"),
        urljoin(base, "/schedule"),
        urljoin(base, "/schedule/"),
        urljoin(base, "/appointments"),
        urljoin(base, "/appointments/"),
    ]

    for url in candidates:
        html = _fetch_text(url)
        if not html:
            continue
        if "<form" in html.lower():
            return url
        time.sleep(0.25)

    # fallback heuristic crawl
    html = _fetch_text(base)
    if html:
        hrefs = re.findall(r'href=["\']([^"\']+)["\']', html, flags=re.I)
        url_signals = ("contact", "quote", "estimate", "book", "booking", "schedule", "appointment", "form")
        scored = []
        for href in hrefs:
            full = urljoin(base, href)
            lower = (href + " " + full).lower()
            score = sum(1 for s in url_signals if s in lower)
            if score:
                scored.append((score, full))
        if scored:
            scored.sort(reverse=True, key=lambda x: x[0])
            return scored[0][1]

    return ""

# ---------- Google Places Text Search with proper paging ----------
def get_place_results_from_text_search(query, max_pages=3):
    """
    Google Places Text Search with paging, progress bar, and normalized output.
    """
    url = "https://maps.googleapis.com/maps/api/place/textsearch/json"
    pagetoken = None
    raw_results = []

    with tqdm(total=max_pages, desc=f"Fetching '{query}'", unit="page") as pbar:
        for _ in range(max_pages):
            params = {
                "query": query,
                "location": f"{HOME_LAT},{HOME_LON}",
                "radius": int(MAX_RADIUS_KM * 1000),
                "language": "en",
                "region": "us",
                "key": API_KEY,
            }

            if pagetoken:
                params["pagetoken"] = pagetoken
                time.sleep(2.0)  # next_page_token delay

            data = _get_json(url, params)
            status = data.get("status", "")

            if status not in ("OK", "ZERO_RESULTS"):
                break

            batch = data.get("results", [])
            raw_results.extend(batch)

            pbar.update(1)
            pbar.set_postfix({"leads": len(raw_results)})

            pagetoken = data.get("next_page_token")
            if not pagetoken:
                break

    # normalize
    normalized = []
    for x in raw_results:
        loc = x.get("geometry", {}).get("location") or {}
        lat = loc.get("lat")
        lon = loc.get("lng")
        dist = round(distance_in_km(HOME_LAT, HOME_LON, lat, lon), 2) if (lat is not None and lon is not None) else None

        normalized.append({
            "name": x.get("name"),
            "address": x.get("formatted_address"),
            "rating": x.get("rating"),
            "place_id": x.get("place_id"),
            "lat": lat,
            "lon": lon,
            "distance_km": dist,
            "phone": "",
            "website": "",
            "city": "",
            "state": "",
        })

    return normalized

# ---------- Details enrichment (phone, website, city/state) ----------
def _parse_city_state(components):
    if not components:
        return "", ""
    city = ""
    state = ""
    for c in components:
        types = set(c.get("types", []))
        if "locality" in types or "postal_town" in types:
            city = c.get("long_name", city)
        if "administrative_area_level_1" in types:
            state = c.get("short_name", state)
    return city, state

def get_place_details(place_id, sleep_between=0.25):
    url = "https://maps.googleapis.com/maps/api/place/details/json"
    params = {
        "key": API_KEY,
        "place_id": place_id,
        "fields": "formatted_phone_number,website,address_components",
        "language": "en",
        "region": "us",
    }
    data = _get_json(url, params)
    status = data.get("status")
    if status != "OK":
        time.sleep(sleep_between)
        return {"phone": "", "website": "", "city": "", "state": ""}
    result = data.get("result") or {}
    phone = result.get("formatted_phone_number", "") or ""
    website = result.get("website", "") or ""
    city, state = _parse_city_state(result.get("address_components"))
    time.sleep(sleep_between)
    return {"phone": phone, "website": website, "city": city, "state": state}

# ---------- Backup text_search (rare fallback if radius filter kills everything) ----------
def text_search(query, api_key):
    url = "https://maps.googleapis.com/maps/api/place/textsearch/json"
    params = {"query": query, "key": api_key}

    all_results = []
    next_page_token = None

    while True:
        if next_page_token:
            time.sleep(2)
            params["pagetoken"] = next_page_token

        resp = requests.get(url, params=params)
        data = resp.json()

        if data.get("status") not in ("OK", "ZERO_RESULTS"):
            break

        results = data.get("results", [])
        all_results.extend(results)

        next_page_token = data.get("next_page_token")
        if not next_page_token:
            break

    return all_results

# ---------- MAIN: run queries, enrich, save ----------
all_rows = []

for query in queries:
    print(f"\n🔍 Searching for: {query}")
    base_rows = get_place_results_from_text_search(query)

    # keep within ~100km of home
    base_rows = [r for r in base_rows if (r.get("distance_km") is None or r["distance_km"] <= 100)]

    if len(base_rows) == 0:
        print(f"⚠️ 0 found in radius for '{query}', trying text_search fallback...")
        fallback_raw = text_search(query, API_KEY)
        print(f"📍 Fallback text_search found {len(fallback_raw)} for '{query}'")

        # normalize fallback_raw into same shape
        norm_fb = []
        for x in fallback_raw:
            loc = x.get("geometry", {}).get("location") or {}
            lat = loc.get("lat")
            lon = loc.get("lng")
            dist = round(distance_in_km(HOME_LAT, HOME_LON, lat, lon), 2) if (lat is not None and lon is not None) else None

            norm_fb.append({
                "name": x.get("name"),
                "address": x.get("formatted_address"),
                "rating": x.get("rating"),
                "place_id": x.get("place_id"),
                "lat": lat,
                "lon": lon,
                "distance_km": dist,
                "phone": "",
                "website": "",
                "city": "",
                "state": "",
            })
        base_rows = norm_fb

    print(f"✅ Using {len(base_rows)} leads for '{query}'")

    # Enrich with phone / site / city / state
    for r in base_rows:
        details = get_place_details(r["place_id"])
        r.update(details)
        r["search_query"] = query
        r["category"] = categorize(query)

    all_rows.extend(base_rows)

# ---------- Enrich missing emails (and contact form fallback) ----------
filled_email = 0
filled_form = 0
start_ts = time.time()

for idx, r in enumerate(tqdm(all_rows, desc="🔎 Scraping websites", unit="lead", ncols=80), start=1):

    r.setdefault("email", "")
    r.setdefault("email_source", "")
    r.setdefault("contact_form_url", "")

    # custom ETA print every ~20 leads
    if idx % 20 == 0 or idx == len(all_rows):
        elapsed = max(0.001, time.time() - start_ts)
        avg_per = elapsed / idx
        remaining_secs = int((len(all_rows) - idx) * avg_per)
        mins, secs = divmod(remaining_secs, 60)
        eta = f"≈ {mins}m {secs}s left" if remaining_secs >= 10 else "≈ seconds left"
        domain = (r.get("website") or "").split("//")[-1]
        print(f"🔎 Checking lead {idx}/{len(all_rows)}: {domain}  ({eta})")

    if (r.get("email") or "").strip():
        continue

    site = (r.get("website") or "").strip()
    if not site:
        continue

    email, src = _find_email_on_site(site)
    if email:
        r["email"] = email
        r["email_source"] = src
        filled_email += 1
        continue

    form_url = _find_contact_form(site)
    if form_url:
        r["contact_form_url"] = form_url
        filled_form += 1

print(f"📧 Email enrichment added {filled_email} emails; 📝 contact-form fallback added {filled_form} URLs")

# ---------- Save combined CSV ----------
timestamp = time.strftime('%Y%m%d_%H%M%S')
out = rf"{BASE_DIR}\leads_{timestamp}.csv"
out_fields = [
    "name","category","address","city","state","rating",
    "phone","email","website","place_id","lat","lon",
    "distance_km","search_query","email_source","contact_form_url"
]

with open(out, "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=out_fields)
    writer.writeheader()
    writer.writerows(all_rows)

print(f"💾 Saved {len(all_rows)} total rows across {len(queries)} searches to {out}")

# ---------- Scoring + Call List ----------
def _safe_float(x, default=0.0):
    try:
        return float(x)
    except Exception:
        return default

def _has_phone(p):
    return bool(p and re.search(r"\d{3}.*\d{3}.*\d{4}", p))

def _has_email(e):
    return bool(e and re.search(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", e.strip()))

CATEGORY_WEIGHT = {
    "ceramic_coating": 1.0,
    "detailing": 0.9,
    "window_tint": 0.8,
    "auto_body": 0.7,
    "dealership": 0.6,
    "other": 0.5,
}

def _score_row(row):
    cat    = (row.get("category") or "other").lower()
    dist   = _safe_float(row.get("distance_km"), 999)
    rating = _safe_float(row.get("rating"), 0)
    phone  = row.get("phone") or ""
    email  = row.get("email") or ""
    site   = row.get("website") or ""

    score = 0.0
    score += 20 * CATEGORY_WEIGHT.get(cat, 0.5)
    score += 15 if _has_phone(phone) else 0
    score += 15 if _has_email(email) else 0
    if (not email) and row.get("contact_form_url"):
        score += 8
    score += 10 if site else 0

    if dist <= 10: score += 25
    elif dist <= 20: score += 18
    elif dist <= 30: score += 12
    elif dist <= 40: score += 6

    if rating >= 4.7: score += 12
    elif rating >= 4.3: score += 8
    elif rating >= 4.0: score += 5

    row["score"] = round(score, 2)
    return row

_scored = [_score_row(dict(r)) for r in all_rows]
_scored.sort(key=lambda x: x.get("score", 0), reverse=True)

scored_path = rf"{BASE_DIR}\leads_scored_{timestamp}.csv"
call_path   = rf"{BASE_DIR}\call_list_top100_{timestamp}.csv"

if _scored:
    scored_fields = list(_scored[0].keys())
    with open(scored_path, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=scored_fields)
        w.writeheader()
        w.writerows(_scored)
    print(f"💾 Wrote scored file: {scored_path} ({len(_scored)} rows)")

    call_fields = ["score","name","category","phone","email","website","city","state","address","distance_km","rating","contact_form_url"]
    with open(call_path, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=call_fields)
        w.writeheader()
        for r in _scored[:100]:
            w.writerow({k: r.get(k, "") for k in call_fields})
    print(f"☎️ Wrote call list: {call_path} (top 100)")
else:
    print("ℹ️ No rows to score.")

# ---------- Master files: append + de-dupe ----------
MASTER_PLACES = rf"{BASE_DIR}\master_places.csv"       # raw-ish google results
MASTER_NORMAL = rf"{BASE_DIR}\master_normalized.csv"   # engine-ready leads

def _read_csv(path):
    if not os.path.exists(path):
        return [], []
    with open(path, newline="", encoding="utf-8") as f:
        r = csv.DictReader(f)
        return list(r), r.fieldnames

def _write_csv(path, fieldnames, rows):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=fieldnames)
        w.writeheader()
        w.writerows(rows)

def _dedupe(rows, key_fields):
    seen = set()
    out_rows = []
    for row in rows:
        key = tuple((row.get(k) or "").strip().lower() for k in key_fields)
        if key in seen:
            continue
        seen.add(key)
        out_rows.append(row)
    return out_rows

_raw_fields = ["name", "address", "rating", "place_id", "lat", "lon", "distance_km", "search_query"]
existing_raw, _ = _read_csv(MASTER_PLACES)
merged_raw = existing_raw + [{k: str(x.get(k, "")) for k in _raw_fields} for x in all_rows]
merged_raw = _dedupe(merged_raw, key_fields=["place_id"])
_write_csv(MASTER_PLACES, _raw_fields, merged_raw)
print(f"📚 Master (raw) now has {len(merged_raw)} rows -> {MASTER_PLACES}")

_norm_fields = ["name","category","phone","email","website","city","state","source","contact_form_url"]
existing_norm, _ = _read_csv(MASTER_NORMAL)

def _to_norm_row(r):
    return {
        "name": r.get("name",""),
        "category": r.get("category","other"),
        "phone": r.get("phone",""),
        "email": r.get("email",""),
        "website": r.get("website",""),
        "city": r.get("city",""),
        "state": r.get("state",""),
        "source": "google_places",
        "contact_form_url": r.get("contact_form_url",""),
    }

new_norm_rows = [_to_norm_row(r) for r in all_rows]
merged_norm = _dedupe(existing_norm + new_norm_rows, key_fields=["name","phone","website","email"])
_write_csv(MASTER_NORMAL, _norm_fields, merged_norm)
print(f"📚 Master (normalized) now has {len(merged_norm)} rows -> {MASTER_NORMAL}")