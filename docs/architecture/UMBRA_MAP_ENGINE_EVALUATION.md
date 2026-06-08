\# UMBRA MAP ENGINE EVALUATION



\# PRIMARY REQUIREMENTS



Umbra map systems must support:

\- deterministic rendering

\- replay synchronization

\- high-density vector rendering

\- temporal overlays

\- convergence overlays

\- provenance-linked entities

\- simulation branching



\---



\# CANDIDATE ENGINES



\## Candidate 01 — MapLibre GL



\### Strengths



\- open source

\- vector tile native

\- excellent React integration

\- performant 2D rendering

\- operationally mature



\### Weaknesses



\- limited native 3D capability

\- complex terrain scaling



\### Verdict



Approved as primary operational viewport engine.



\---



\## Candidate 02 — deck.gl



\### Strengths



\- high-density overlay rendering

\- GPU acceleration

\- excellent aggregation support

\- convergence heatmap support

\- simulation rendering support



\### Weaknesses



\- not a standalone map engine

\- requires integration layer



\### Verdict



Approved as overlay rendering engine.



\---



\## Candidate 03 — Cesium



\### Strengths



\- planetary-scale rendering

\- terrain support

\- true 3D geospatial rendering



\### Weaknesses



\- operational complexity

\- heavier synchronization overhead

\- reduced UI integration simplicity



\### Verdict



Deferred for future 3D operational expansion.



\---



\# FINAL ARCHITECTURE



\## Primary Viewport



MapLibre GL



\## High-Density Overlay System



deck.gl



\## Future 3D Expansion



Cesium (deferred)



\---



\# OPERATIONAL JUSTIFICATION



MapLibre + deck.gl provides:

\- deterministic rendering

\- scalable overlays

\- replay synchronization

\- operational clarity

\- React ecosystem compatibility



without premature 3D complexity.



\---



\# PROHIBITED MAP PATTERNS



Prohibited:

\- opaque rendering pipelines

\- non-replayable overlays

\- provenance-free geometry

\- detached simulation rendering



\---



\# FINAL DECISION



Approved architecture:

\- MapLibre GL

\- deck.gl overlay system

\- Cesium deferred

