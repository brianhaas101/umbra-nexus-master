Layer 05 normalizes entity identity.

It does not infer entities.
It does not create contacts.
It does not deduplicate across external datasets.
It does not mutate the original entity name.
It creates a deterministic entity_key from the explicitly provided entity string.

Examples:
- "Example Entity, LLC" -> "example_entity_llc"
- "A&B Holdings" -> "a_and_b_holdings"

Layer 05 is an identity-normalization gate, not an enrichment layer.
