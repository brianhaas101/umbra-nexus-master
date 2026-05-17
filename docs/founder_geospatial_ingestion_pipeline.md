\# Umbra Nexus Founder Geospatial Ingestion Pipeline



\## Purpose



This document defines the deterministic ingestion pipeline for canonical city boundary verification.



No mutation of canonical registries is permitted during ingestion.



Ingestion produces replayable verification artifacts only.



\---



\# Pipeline Stages



\## Stage 1 — Provenance Intake



Input:

\- public authoritative boundary source

\- metadata source URL

\- source license



Output:

\- provenance intake record



Required:

\- source URL

\- retrieval timestamp

\- source type

\- source license



\---



\## Stage 2 — Raw Artifact Preservation



All downloaded artifacts must be preserved before transformation.



Required:

\- raw file

\- retrieval timestamp

\- SHA256 hash



No mutation allowed.



\---



\## Stage 3 — CRS Normalization



All geometries must normalize into:



```text

EPSG:4326

