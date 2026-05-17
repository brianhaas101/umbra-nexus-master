"""
Umbra Nexus — Generate_detailing_leads.py

Pipeline for the Umbra Detailing Sandbox (Eugene / Lane County):

1. Load raw leads from Eugene_detailing_raw.json
2. Load scoring rules from config/detaling_scoring_rules.json (or similar)
3. Compute a composite score + status (hot / warm / cold) for each lead
4. Write the enriched leads to Eugene_detailing.json
   → This is what scene.js reads to render the glowing nodes.
"""

import json
from datetime import datetime
from pathlib import Path

from scoring_engine import load_scoring_rules, compute_score_for_lead

BASE_DIR = Path(__file__).resolve().parent

RAW_FILE = BASE_DIR / "Eugene_detailing_raw.json"
OUT_FILE = BASE_DIR / "Eugene_detailing.json"


def load_raw_leads():
    if not RAW_FILE.exists():
        raise FileNotFoundError(
            f"Raw leads file not found: {RAW_FILE}\n"
            f"Make sure Eugene_detailing_raw.json is in the same folder as this script."
        )

    with RAW_FILE.open("r", encoding="utf-8") as f:
        data = json.load(f)

    # support either:
    #  - { "leads": [...] }
    #  - [ {...}, {...} ]
    if isinstance(data, dict) and "leads" in data:
        leads = data["leads"]
    else:
        leads = data

    if not isinstance(leads, list):
        raise ValueError("Raw leads JSON must be a list or an object with a 'leads' list.")

    return leads


def enrich_leads():
    print("[UMBRA ENGINE] Loading scoring rules…")
    rules = load_scoring_rules()

    print("[UMBRA ENGINE] Loading raw detailing leads…")
    raw_leads = load_raw_leads()
    print(f"[UMBRA ENGINE] Raw leads loaded: {len(raw_leads)}")

    enriched = []

    for lead in raw_leads:
        score, status = compute_score_for_lead(lead, rules)

        # keep original fields and add Nexus metadata
        enriched_lead = dict(lead)  # shallow copy
        enriched_lead["score"] = round(float(score), 4)
        enriched_lead["status"] = status

        enriched.append(enriched_lead)

    payload = {
        "mode": rules.get("mode", "detailing_sandbox"),
        "version": rules.get("version", "1.0.0"),
        "generated_at": datetime.utcnow().isoformat() + "Z",
        "total_leads": len(enriched),
        "leads": enriched,
    }

    with OUT_FILE.open("w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2, ensure_ascii=False)

    print("[UMBRA ENGINE] Enriched leads written to:", OUT_FILE)
    print("[UMBRA ENGINE] Done.")


if __name__ == "__main__":
    enrich_leads()