\# Umbra Nexus Geospatial Provenance Intake



\## Purpose



This directory stores authoritative public-source provenance references used for canonical city boundary verification.



No registry mutation is permitted from this directory directly.



All provenance records are read-only intake artifacts until:

\- verification audit passes

\- replay audit passes

\- geometry hashes exist

\- CRS validation passes

\- founder review passes



\## Wave Structure



Verification proceeds in deterministic 5-city waves.



Current wave:

\- GEO-WAVE-001



\## Required Provenance Fields



Each intake record must eventually contain:



\- city\_id

\- canonical\_name

\- source\_name

\- source\_url

\- source\_license

\- retrieval\_timestamp

\- geometry\_format

\- source\_sha256

\- CRS

\- bbox

\- geometry\_sha256



\## Accepted Sources



Preferred:

\- OpenStreetMap administrative boundaries

\- U.S. Census TIGER/Line

\- Municipal GIS portals

\- County GIS portals

\- State GIS repositories



\## Prohibited Sources



Do not use:

\- AI-generated geometry

\- inferred screenshots

\- synthetic polygons

\- hand-drawn extents

\- unverifiable coordinate sets



\## Replay Rule



All provenance intake must be reproducible from public sources.

