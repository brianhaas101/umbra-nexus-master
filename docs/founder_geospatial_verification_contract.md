\# Umbra Nexus Founder Geospatial Verification Contract



\## Scope



This contract governs promotion of canonical city records from scaffolded or pending status to verified geospatial status.



Initial wave:



\- city\_3d50f2fd — New York, NY

\- city\_1f98af58 — Los Angeles, CA

\- city\_4c180874 — Chicago, IL

\- city\_0a922e63 — Houston, TX

\- city\_5fedc010 — Washington, DC



\## Non-Mutation Rule



No canonical registry mutation is allowed until all required verification fields exist and pass audit.



\## Required Verification Fields



Each city must have:



\- city\_id

\- canonical\_name

\- city

\- state

\- verified\_centroid\_lat

\- verified\_centroid\_lon

\- boundary\_source\_name

\- boundary\_source\_url

\- boundary\_source\_retrieved\_at

\- boundary\_source\_sha256

\- boundary\_crs

\- boundary\_bbox

\- boundary\_geometry\_sha256

\- spatial\_confidence\_class

\- verification\_status

\- verified\_by\_process

\- verification\_timestamp



\## Accepted CRS



Canonical coordinate reference system:



```text

EPSG:4326

