\# UMBRA STATE ARCHITECTURE



\# CORE PRINCIPLE



All UI state in Umbra Nexus must be:

\- deterministic

\- replayable

\- provenance-aware

\- serializable

\- recoverable

\- audit-safe



\---



\# STATE TIERS



\## Tier 01 — Canonical State



Immutable operational truth.



Examples:

\- authoritative geometry

\- normalized entities

\- validated provenance

\- replay-approved records



\## Rules



Never mutated directly by UI interaction.



\---



\## Tier 02 — Operational State



Current operator workspace state.



Examples:

\- camera position

\- selected entities

\- active overlays

\- timeline cursor

\- replay cursor

\- active intelligence layers



\## Rules



Persistent across navigation.



Serializable.



Replayable.



\---



\## Tier 03 — Simulation State



Hypothetical branches.



Examples:

\- predictive overlays

\- simulated mutations

\- scenario forks

\- convergence experiments



\## Rules



Never modifies canonical truth.



Must support branch isolation.



\---



\## Tier 04 — Ephemeral UI State



Temporary interaction state.



Examples:

\- hover states

\- transient tooltips

\- drag interactions



\## Rules



May be discarded safely.



Not replay-critical.



\---



\# GLOBAL STATE DOMAINS



\## Spatial State



\- viewport

\- zoom

\- map projection

\- active geometry layers

\- layer opacity

\- overlay stack



\---



\## Temporal State



\- replay tick

\- timeline cursor

\- branch position

\- historical window

\- playback speed



\---



\## Provenance State



\- selected source chain

\- artifact verification

\- normalization linkage

\- replay validation status



\---



\## Convergence State



\- confidence scores

\- signal overlap

\- anomaly weighting

\- convergence outputs



\---



\## Simulation State



\- active scenario

\- branch lineage

\- hypothetical mutations

\- forecast outputs



\---



\# STATE SYNCHRONIZATION RULES



\## Rule 01



Map state is authoritative for operational context.



\## Rule 02



Timeline updates synchronize:

\- viewport

\- overlays

\- replay console

\- provenance inspector



\## Rule 03



Entity selection synchronizes:

\- inspectors

\- timelines

\- replay console

\- convergence analysis



\## Rule 04



Replay state restoration must be exact.



\---



\# SERIALIZATION RULES



All operational state must support:

\- deterministic export

\- deterministic restore

\- replay-safe serialization

\- branch-safe cloning



\---



\# FAILURE RULES



State corruption must:

\- halt replay

\- expose diagnostics

\- preserve audit visibility



Silent state repair is prohibited.



\---



\# MUTATION RULES



\## Allowed



\- overlay toggles

\- viewport movement

\- branch creation

\- simulation parameter changes



\## Forbidden



\- canonical geometry mutation

\- provenance rewriting

\- replay history alteration

\- hidden state mutation



\---



\# MULTI-WORKSPACE MODEL



Future support:

\- synchronized operator sessions

\- shared replay rooms

\- collaborative simulation branches

\- distributed convergence analysis



All future synchronization must preserve deterministic replay guarantees.



\---



\# FINAL GUARANTEE



No UI state may exist that:

\- cannot be explained

\- cannot be serialized

\- cannot be replayed

\- cannot be audited

