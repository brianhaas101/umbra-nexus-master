\# Umbra Nexus Geo Wave Execution Checklist



\## Purpose



This checklist governs authoritative geospatial ingestion execution.



No canonical registry mutation is permitted during execution.



\---



\# GEO-WAVE-001



Cities:

\- New York, NY

\- Los Angeles, CA

\- Chicago, IL

\- Houston, TX

\- Washington, DC



\---



\# Execution Stages



\## Stage 1 — Source Selection



Required:

\- authoritative source identified

\- source URL frozen

\- expected CRS documented

\- expected format documented

\- license documented



Status:

\- \[ ] complete



\---



\## Stage 2 — Raw Artifact Preservation



Required:

\- raw artifact downloaded

\- artifact path frozen

\- SHA256 generated

\- retrieval timestamp captured



Status:

\- \[ ] complete



\---



\## Stage 3 — CRS Validation



Required:

\- original CRS verified

\- normalization target confirmed

\- EPSG:4326 compatibility verified



Status:

\- \[ ] complete



\---



\## Stage 4 — Geometry Validation



Required:

\- geometry extracted

\- bbox generated

\- geometry SHA256 generated

\- polygon closure verified



Status:

\- \[ ] complete



\---



\## Stage 5 — Provenance Validation



Required:

\- provenance record generated

\- schema validation passes

\- replay audit passes

\- mutation lock intact



Status:

\- \[ ] complete



\---



\## Stage 6 — Founder Review



Required:

\- replay artifacts reviewed

\- provenance chain reviewed

\- audit reports reviewed

\- mutation authorization explicitly granted



Status:

\- \[ ] complete



\---



\# Mutation Rule



No city may advance into canonical promotion until all stages pass.

