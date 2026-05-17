"""
Umbra Nexus — scoring_engine.py

Shared scoring helpers for Umbra Detailing Sandbox.

- Loads scoring rules from config/detaling_scoring_rules.json (or similar)
- Computes a composite score 0–1 for each lead
- Assigns status bucket: hot / warm / cold
"""

import json
import math
from pathlib import Path
from typing import Dict, Any, Tuple

BASE_DIR = Path(__file__).resolve().parent
CONFIG_DIR = BASE_DIR / "config"


def _find_rules_file() -> Path:
    """
    Try a few reasonable filenames so we don't break if the case changes a bit.
    """
    candidates = [
        CONFIG_DIR / "detailing_scoring_rules.json",
        CONFIG_DIR / "Detailing_scoring_rules.json",
        CONFIG_DIR / "detailing_rules.json",
    ]
    for path in candidates:
        if path.exists():
            return path
    # fallback: first candidate (even if missing – user will get a clear error)
    return candidates[0]


def load_scoring_rules() -> Dict[str, Any]:
    rules_path = _find_rules_file()
    with rules_path.open("r", encoding="utf-8") as f:
        rules = json.load(f)
    return rules


def _clamp(value: float, min_val: float, max_val: float) -> float:
    return max(min_val, min(max_val, value))


def _normalize(value: float, min_val: float, max_val: float) -> float:
    if max_val <= min_val:
        return 0.0
    return _clamp((value - min_val) / (max_val - min_val), 0.0, 1.0)


def compute_score_for_lead(lead: Dict[str, Any],
                           rules: Dict[str, Any]) -> Tuple[float, str]:
    """
    Given a single lead dict and the rules, return (score_0to1, status_str).
    If a field is missing, we fall back to 0.0 so it doesn't blow anything up.
    """

    signals = rules.get("signals", {})
    caps = rules.get("caps", {})
    buckets = rules.get("status_buckets", {})

    total_score = 0.0

    for name, spec in signals.items():
        field = spec.get("field")
        weight = float(spec.get("weight", 0.0))
        rng = spec.get("range", [0.0, 1.0])
        min_val, max_val = float(rng[0]), float(rng[1])

        raw_val = lead.get(field, 0.0)

        # distance gets inverted (closer = better)
        if name == "distance_km":
            # treat missing distance as "far" but not catastrophic
            raw_val = float(raw_val) if raw_val is not None else max_val
            normalized = 1.0 - _normalize(raw_val, min_val, max_val)
        else:
            try:
                raw_val = float(raw_val)
            except (TypeError, ValueError):
                raw_val = 0.0
            normalized = _normalize(raw_val, min_val, max_val)

        total_score += weight * normalized

    min_score = float(caps.get("min_score", 0.0))
    max_score = float(caps.get("max_score", 1.0))
    score = _clamp(total_score, min_score, max_score)

    # determine status bucket
    status = "cold"
    hot_min = float(buckets.get("hot", {}).get("min_score", 0.8))
    warm_conf = buckets.get("warm", {})
    warm_min = float(warm_conf.get("min_score", 0.6))
    warm_max = float(warm_conf.get("max_score", 0.8))

    if score >= hot_min:
        status = "hot"
    elif warm_min <= score < warm_max:
        status = "warm"
    else:
        status = "cold"

    return score, status
