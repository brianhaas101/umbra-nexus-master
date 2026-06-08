\# UMBRA BACKEND STACK DECISION



\# FINAL BACKEND DIRECTION



Umbra Nexus backend architecture prioritizes:

\- deterministic replay

\- append-oriented history

\- provenance preservation

\- topology-safe geospatial storage

\- operational synchronization



\---



\# PRIMARY BACKEND STACK



\## Runtime



Node.js



\## Language



TypeScript



\## API Layer



Fastify



\## Geospatial Database



PostgreSQL + PostGIS



\## Cache / Event Synchronization



Redis



\## Object Storage



Immutable artifact storage



\## Event Streaming



Replay-safe append-oriented event bus



\---



\# WHY NODE.JS



Node.js supports:

\- event-driven orchestration

\- WebSocket synchronization

\- real-time replay streaming

\- frontend integration symmetry



\---



\# WHY FASTIFY



Fastify provides:

\- high-performance operational APIs

\- low overhead

\- schema validation

\- deterministic request handling



Express is rejected due to weaker structural guarantees.



\---



\# WHY POSTGRESQL + POSTGIS



PostGIS is mandatory for:

\- topology-safe geometry

\- spatial indexing

\- geospatial querying

\- CRS transformation

\- deterministic geometry operations



NoSQL-only geospatial storage is prohibited for canonical truth layers.



\---



\# WHY REDIS



Redis supports:

\- replay synchronization

\- operational signaling

\- transient coordination

\- distributed event propagation



Redis is not canonical storage.



\---



\# STORAGE MODEL



Canonical truth storage:

\- PostgreSQL/PostGIS



Immutable artifacts:

\- object storage



Replay/event history:

\- append-oriented event store



\---



\# BACKEND ARCHITECTURE MODEL



Backend architecture is:

\- event-oriented

\- replay-safe

\- provenance-linked

\- deterministic



\---



\# PROHIBITED BACKEND PATTERNS



Prohibited:

\- mutable canonical truth

\- provenance rewriting

\- destructive history mutation

\- opaque event rewriting

\- non-deterministic synchronization



\---



\# GEOSPATIAL GUARANTEES



All canonical geometry must support:

\- topology validation

\- CRS verification

\- replay restoration

\- provenance linkage



\---



\# FUTURE SUPPORT



Backend architecture should support:

\- distributed orchestration

\- collaborative replay

\- simulation clusters

\- AI-assisted convergence systems

\- planetary-scale geospatial ingestion



\---



\# FINAL DECISION



Approved stack:

\- Node.js

\- TypeScript

\- Fastify

\- PostgreSQL/PostGIS

\- Redis

\- immutable object storage

