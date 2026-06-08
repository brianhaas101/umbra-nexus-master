\# UMBRA INTERACTION MODEL



\# CORE INTERACTION PHILOSOPHY



Umbra Nexus is an operational intelligence environment.



The interface must behave like:

\- an intelligence command center

\- a geospatial operating system

\- a replayable simulation surface



The interface must not behave like:

\- a CRUD admin panel

\- a marketing dashboard

\- a static GIS viewer



\---



\# PRIMARY INTERACTION TYPES



\## 1. Spatial Interaction



Examples:

\- map pan

\- map zoom

\- entity selection

\- region selection

\- route tracing

\- overlay activation

\- heatmap inspection

\- topology inspection



\## Rules



Spatial interaction is primary.



All other interaction models synchronize to spatial state.



\---



\## 2. Temporal Interaction



Examples:

\- replay scrubbing

\- historical playback

\- timeline branching

\- event comparison

\- simulation stepping



\## Rules



Temporal interaction must synchronize:

\- map state

\- provenance state

\- replay console

\- convergence output



\---



\## 3. Provenance Interaction



Examples:

\- source inspection

\- artifact tracing

\- normalization inspection

\- replay verification

\- topology verification



\## Rules



Every rendered entity must expose provenance.



No hidden scoring.



No opaque transformations.



\---



\## 4. Convergence Interaction



Examples:

\- confidence comparison

\- scoring explanation

\- anomaly analysis

\- signal overlap inspection

\- scenario comparison



\## Rules



Convergence must remain explainable.



No black-box authority scoring.



\---



\## 5. Simulation Interaction



Examples:

\- branch creation

\- scenario replay

\- parameter mutation

\- hypothetical overlays

\- predictive modeling



\## Rules



Simulation branches must never mutate canonical truth layers.



All branches must remain replayable.



\---



\# STATE MANAGEMENT RULES



\## Persistent State



The following state survives navigation:



\- camera position

\- active city

\- selected entities

\- active overlays

\- timeline cursor

\- replay cursor

\- simulation branch

\- filters

\- intelligence layer selections



\## Non-Persistent State



Temporary hover states may reset.



\---



\# MULTI-PANEL SYNCHRONIZATION



\## Rule



All operational panels synchronize around shared entity context.



Example:



Selecting an entity on the map updates:

\- provenance inspector

\- timeline

\- replay console

\- convergence inspector

\- simulation workspace



simultaneously.



\---



\# CAMERA MODEL



\## Rules



Camera position is operational state.



Camera movement must be:

\- smooth

\- deterministic

\- replayable



Viewport restoration must be exact.



\---



\# REPLAY MODEL



\## Rules



Replay affects:

\- rendered geometry

\- overlays

\- scoring

\- events

\- timelines

\- provenance visibility



Replay must support:

\- pause

\- step

\- reverse

\- branch

\- deterministic verification



\---



\# UI LATENCY RULES



\## Rules



System integrity is prioritized over visual smoothness.



The UI may delay rendering if:

\- provenance verification is incomplete

\- replay synchronization is incomplete

\- topology validation is incomplete



\---



\# FAILURE VISIBILITY RULES



\## Rules



Failures must be visible.



The UI must expose:

\- failed ingestions

\- replay mismatches

\- topology failures

\- missing provenance

\- confidence degradation



Failures must never silently disappear.



\---



\# MAP RENDERING RULES



\## Rules



Map rendering must support:

\- authoritative boundaries

\- vector overlays

\- temporal overlays

\- convergence heatmaps

\- replay-linked geometry

\- deterministic layer restoration



\---



\# ENTITY MODEL



\## Rules



Every entity must support:

\- canonical ID

\- provenance chain

\- temporal history

\- replay linkage

\- convergence metadata

\- spatial representation



\---



\# OPERATIONAL MODES



\## Mode 01 — Live Operations



Real-time ingestion and monitoring.



\## Mode 02 — Replay



Historical reconstruction.



\## Mode 03 — Simulation



Hypothetical scenario execution.



\## Mode 04 — Convergence Analysis



Cross-layer signal synthesis.



\## Mode 05 — Audit



Full provenance and validation inspection.



\---



\# NON-NEGOTIABLE UI GUARANTEES



1\. No hidden mutations

2\. No irreversible actions without audit

3\. No detached visual state

4\. No unexplained scoring

5\. No non-replayable rendering

6\. No provenance-free entities

7\. No silent data substitution

8\. No synthetic production overlays

