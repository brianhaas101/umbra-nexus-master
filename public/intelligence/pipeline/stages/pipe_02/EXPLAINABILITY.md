Layer 02 classifies whether a sourced record is city-local.

It does not create new facts.
It does not infer missing contacts.
It does not promote ambiguous data.
It only evaluates whether the existing source appears city-local based on deterministic text and URL checks.

Classification thresholds:
- 75–100: city_local_primary
- 50–74: city_local_secondary
- 25–49: regional_or_ambiguous
- 0–24: non_city_local
