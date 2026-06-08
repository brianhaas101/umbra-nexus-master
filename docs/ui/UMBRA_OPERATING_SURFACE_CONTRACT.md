\# UMBRA OPERATING SURFACE CONTRACT



\## SYSTEM IDENTITY



Umbra Nexus is not a dashboard.



Umbra Nexus is a persistent intelligence operating surface built around deterministic geospatial truth, replayable provenance, convergence analysis, and multi-layer intelligence orchestration.



The map is the primary truth surface.



All other UI regions exist to explain, validate, replay, score, simulate, or orchestrate what is occurring on the map.



\---



\# PRIMARY UI TOPOLOGY



```text

┌──────────────────────────────────────────────────────────────┐

│ GLOBAL COMMAND BAR                                          │

├──────────────┬───────────────────────────────┬───────────────┤

│ LAYER RAIL  │        MAIN SPATIAL           │ PROVENANCE    │

│              │         VIEWPORT              │ INSPECTOR     │

│              │                               │               │

│              │                               │               │

├──────────────┴───────────────────────────────┴───────────────┤

│ TEMPORAL TIMELINE / EVENT STREAM                            │

├──────────────────────────────────────────────────────────────┤

│ REPLAY CONSOLE / SYSTEM LOG / CONVERGENCE OUTPUT            │

└──────────────────────────────────────────────────────────────┘

```



\---



\# GLOBAL COMMAND BAR



\## Purpose



Global orchestration and system navigation.



\## Responsibilities



\- command palette

\- entity search

\- city search

\- intelligence search

\- replay controls

\- workspace switching

\- scenario switching

\- simulation controls

\- convergence status

\- ingestion wave status

\- authentication state

\- system synchronization state



\## Visibility Rules



Always visible.



Never collapses.



\---



\# LAYER RAIL



\## Purpose



Persistent access to the 12 intelligence layers.



\## Intelligence Layers



1\. Identity Intelligence

2\. Spatial Intelligence

3\. Temporal Intelligence

4\. Infrastructure Intelligence

5\. Economic Intelligence

6\. Governance Intelligence

7\. Behavioral Intelligence

8\. Narrative Intelligence

9\. Predictive Intelligence

10\. Simulation Intelligence

11\. Convergence Intelligence

12\. Nexus Orchestration Intelligence



\## Rules



Layer switching must never destroy viewport state.



Layer switching must preserve:

\- camera position

\- timeline cursor

\- selected entities

\- replay cursor

\- active filters

\- simulation state



\---



\# MAIN SPATIAL VIEWPORT



\## Purpose



Primary operational truth surface.



\## Responsibilities



\- canonical geography

\- authoritative boundaries

\- entities

\- infrastructure

\- events

\- simulation overlays

\- scoring overlays

\- risk overlays

\- convergence overlays

\- provenance-linked geometry

\- route analysis

\- heatmaps

\- timeline-linked rendering



\## Core Rule



Everything displayed on the map must be explainable and replayable.



\## Prohibited



\- decorative fake data

\- inferred geometry without provenance

\- runtime mutation without audit trail

\- non-replayable visual state



\---



\# PROVENANCE INSPECTOR



\## Purpose



Expose explainability and source integrity.



\## Responsibilities



\- source lineage

\- source URLs

\- acquisition metadata

\- SHA256 hashes

\- normalization records

\- replay validation status

\- topology validation status

\- confidence scoring

\- mutation history

\- ingestion history

\- source authority ranking



\## Rules



Provenance must never be more than one interaction away.



Every entity interaction must expose provenance.



\---



\# TEMPORAL TIMELINE



\## Purpose



Persistent temporal navigation surface.



\## Responsibilities



\- event sequencing

\- replay navigation

\- ingestion chronology

\- mutation chronology

\- simulation ticks

\- convergence progression

\- historical playback

\- predictive branching



\## Rules



Timeline is persistent.



Timeline is never modal.



Timeline state must be replayable.



\---



\# REPLAY CONSOLE



\## Purpose



Deterministic replay and audit surface.



\## Responsibilities



\- replay execution

\- replay verification

\- topology validation logs

\- normalization logs

\- ingestion logs

\- failed acquisition logs

\- convergence diagnostics

\- simulation diagnostics

\- orchestration events



\## Rules



Replay state is globally accessible.



Replay visibility must never be hidden behind multiple screens.



\---



\# UI INVARIANTS



\## Invariant 01



Spatial viewport is the primary truth surface.



\## Invariant 02



Every visual state must be reproducible.



\## Invariant 03



Every displayed entity must have provenance.



\## Invariant 04



Replay validation must be deterministic.



\## Invariant 05



Layer switching must preserve operational state.



\## Invariant 06



System integrity is prioritized over rendering speed.



\## Invariant 07



No synthetic placeholder data in production surfaces.



\## Invariant 08



Temporal navigation is persistent.



\## Invariant 09



Convergence scoring must be explainable.



\## Invariant 10



All intelligence layers must integrate through the same operational shell.



\---



\# STORAGE TOPOLOGY REQUIREMENTS



\## Requirements



\- replay-safe

\- append-oriented

\- provenance-linked

\- deterministic serialization

\- audit-safe mutation history

\- immutable source artifacts

\- canonical normalized artifacts

\- topology-safe geometry storage



\---



\# ORCHESTRATION MODEL



Umbra Nexus operates as a continuously synchronized intelligence environment.



The operating surface must support:

\- live ingestion

\- replay

\- simulation

\- branching analysis

\- convergence scoring

\- scenario comparison

\- deterministic recovery



without destroying operator state.



\---



\# FUTURE UI EXTENSIONS



Future modules may include:

\- multi-map orchestration

\- distributed operator sessions

\- collaborative replay

\- simulation branching trees

\- AI-assisted convergence analysis

\- autonomous anomaly detection

\- cross-wave ingestion diagnostics



These extensions must preserve all replay and provenance guarantees defined in this contract.

