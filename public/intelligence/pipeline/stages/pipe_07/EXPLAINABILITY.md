Layer 07 scores temporal freshness.

It uses only the explicit retrieved_at timestamp.
It does not infer publication dates.
It does not synthesize timestamps.
It does not mutate the source record.
It does not use Black Dragon runtime state.

Freshness classes:
- current_30_days: 100
- recent_90_days: 80
- usable_180_days: 60
- stale_365_days: 35
- archival_over_365_days: 15
- rejected_invalid_timestamp: 0
