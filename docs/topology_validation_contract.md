\# Umbra Nexus Topology Validation Contract



\## Purpose



Topology validation prevents invalid or corrupted municipal geometries from entering canonical systems.



Replay verification alone is insufficient because replay-safe artifacts may still contain invalid topology.



\## Required Checks



Every normalized geometry must pass:



\- non-empty geometry validation

\- closed polygon ring validation

\- coordinate count validation

\- finite coordinate validation

\- self-intersection detection

\- duplicate ring detection

\- invalid hole detection

\- bbox sanity validation

\- CRS validation

\- geometry type whitelist validation



\## Promotion Gate



Canonical promotion is forbidden unless topology validation passes.



\## Failure Handling



Any topology failure immediately:



\- blocks promotion

\- freezes mutation authorization

\- requires re-acquisition or re-normalization review



\## Determinism Requirement



Topology validation must be deterministic.



Identical normalized artifacts must always produce identical topology validation outputs.



\## Scope



Applies to:



\- Polygon

\- MultiPolygon



Future geometry types require explicit contract extension.

