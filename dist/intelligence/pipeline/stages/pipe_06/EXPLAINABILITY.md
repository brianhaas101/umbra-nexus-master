Layer 06 checks geospatial coherence.

It accepts explicit city data.
It accepts explicit latitude/longitude only when both are present and valid.
It does not geocode.
It does not infer coordinates.
It does not create locations.
It does not use Black Dragon globe data, loaders, assets, or runtime paths.

Geo statuses:
- geo_coherent_explicit_city
- geo_coherent_explicit_coordinates
- geo_ambiguous_no_coordinates
- geo_rejected_invalid_coordinates
- geo_rejected_synthetic_location
