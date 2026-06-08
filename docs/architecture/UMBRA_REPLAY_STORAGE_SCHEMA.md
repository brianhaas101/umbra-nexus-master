\# UMBRA REPLAY STORAGE SCHEMA



\# CORE PRINCIPLE



Replay storage preserves deterministic reconstruction of operational state.



Replay history is append-oriented and immutable.



\---



\# REPLAY TICK SCHEMA



```json

{

&#x20; "tick\_id": "tick\_<stable\_id>",

&#x20; "sequence": 0,

&#x20; "timestamp\_utc": "",

&#x20; "branch\_id": "canonical",

&#x20; "parent\_tick\_id": null,

&#x20; "workspace\_id": "",

&#x20; "state\_refs": {

&#x20;   "viewport\_state": "",

&#x20;   "timeline\_state": "",

&#x20;   "overlay\_state": "",

&#x20;   "entity\_state": "",

&#x20;   "provenance\_state": "",

&#x20;   "convergence\_state": ""

&#x20; },

&#x20; "deltas": {

&#x20;   "entities": \[],

&#x20;   "spatial": \[],

&#x20;   "temporal": \[],

&#x20;   "provenance": \[],

&#x20;   "convergence": \[],

&#x20;   "simulation": \[]

&#x20; },

&#x20; "validation": {

&#x20;   "replay\_hash": "",

&#x20;   "validation\_status": "pass|fail|pending"

&#x20; }

}

```



\---



\# STORAGE RULES



Replay records must be:

\- append-only

\- deterministic

\- branch-aware

\- provenance-linked

\- hash-verifiable



\---



\# BRANCH RULES



Branches must preserve:

\- parent branch

\- origin tick

\- mutation lineage

\- replay compatibility



\---



\# VALIDATION RULES



Replay storage must support:

\- hash validation

\- deterministic restore

\- divergence detection

\- failure visibility



\---



\# FAILURE RULES



Replay failures must expose:

\- missing tick

\- corrupt delta

\- hash mismatch

\- branch divergence

\- provenance mismatch



\---



\# FINAL GUARANTEE



No replay state may exist outside append-oriented replay storage.

