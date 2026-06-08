\# UMBRA STATE ENGINE EVALUATION



\# PRIMARY REQUIREMENTS



Umbra state systems must support:

\- deterministic restoration

\- replay synchronization

\- multi-panel synchronization

\- operational persistence

\- branch-safe simulation state



\---



\# CANDIDATE ENGINES



\## Candidate 01 — Zustand



\### Strengths



\- low boilerplate

\- deterministic store structure

\- React-native simplicity

\- modular state domains

\- operational flexibility



\### Weaknesses



\- requires disciplined architecture

\- fewer enterprise conventions



\### Verdict



Approved.



\---



\## Candidate 02 — Redux Toolkit



\### Strengths



\- explicit mutations

\- mature ecosystem

\- excellent tooling



\### Weaknesses



\- operational verbosity

\- excessive boilerplate

\- reduced iteration velocity



\### Verdict



Rejected for operational complexity overhead.



\---



\## Candidate 03 — Event-Only Architecture



\### Strengths



\- replay-native structure

\- operational purity



\### Weaknesses



\- frontend orchestration complexity

\- excessive implementation burden



\### Verdict



Deferred as internal backend pattern only.



\---



\# FINAL STATE MODEL



\## Frontend State



Zustand



\## Replay/Event Authority



Backend append-oriented event bus



\## Persistent Operational State



Serializable synchronized stores



\---



\# STATE DOMAIN MODEL



Separate domains:

\- viewport state

\- replay state

\- provenance state

\- convergence state

\- simulation state

\- operational workspace state



\---



\# PROHIBITED STATE PATTERNS



Prohibited:

\- hidden mutable state

\- non-serializable operational state

\- disconnected local synchronization

\- replay-unsafe mutations



\---



\# FINAL DECISION



Approved architecture:

\- Zustand frontend state

\- append-oriented backend event authority

\- deterministic serialization model

