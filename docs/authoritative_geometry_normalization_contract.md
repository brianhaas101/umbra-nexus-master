\# Umbra Nexus Authoritative Geometry Normalization Contract



\## Purpose



Defines deterministic normalization rules for authoritative municipal geometry ingestion.



This contract applies after:

\- authoritative acquisition

\- provenance locking

\- geometry validation



and before:

\- canonical promotion

\- spatial indexing

\- tile generation

\- graph integration



\---



\# Required Inputs



\- authoritative GeoJSON artifact

\- immutable SHA256 artifact hash

\- validated geometry family

\- validated CRS

\- deterministic bbox



\---



\# Normalization Rules



\## CRS



All geometries must normalize to:



EPSG:4326



No alternate CRS permitted in canonical storage.



\---



\## Geometry Types



Permitted canonical geometry types:



\- Polygon

\- MultiPolygon



All other geometry types rejected.



\---



\## Coordinate Ordering



Canonical coordinate ordering:



\[longitude, latitude]



No alternate ordering permitted.



\---



\## Polygon Integrity



Required:

\- closed polygon rings

\- no null coordinates

\- no NaN coordinates

\- deterministic traversal order



\---



\## Replay Safety



Normalization must be:

\- deterministic

\- replayable

\- hash-verifiable



Equivalent inputs must produce equivalent normalized outputs.



\---



\# Mutation Controls



Normalization does not authorize:

\- canonical promotion

\- registry mutation

\- graph insertion

\- tile generation



Additional founder approval required.



\---



\# Canonical Promotion Requirements



Required before promotion:

\- provenance validation pass

\- replay audit pass

\- geometry normalization pass

\- founder review complete

\- mutation authorization explicitly granted

