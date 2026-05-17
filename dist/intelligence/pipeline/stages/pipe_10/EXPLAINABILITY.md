Layer 10 computes the weighted composite score.

Weights:
- authority_score: 0.22
- relevance_score: 0.24
- geo_score: 0.14
- freshness_score: 0.14
- corroboration_score: 0.26

Formula:
weighted_sum - penalty_score

Layer 10 does not allow runtime weight overrides.
Layer 10 does not boost scores.
Layer 10 does not modify prior layer outputs.
Layer 10 does not use Black Dragon runtime state.

Composite classes:
- 80–100: high_confidence_operational_signal
- 60–79: qualified_operational_signal
- 40–59: watchlist_signal
- 0–39: low_confidence_signal
