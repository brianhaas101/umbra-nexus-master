\# UMBRA MONOREPO STRUCTURE



\# CORE PRINCIPLE



The repository must separate operational truth, frontend systems, backend services, contracts, scripts, and immutable provenance artifacts.



\---



\# TARGET STRUCTURE



```text

apps/

&#x20; web/

&#x20;   src/

&#x20;     shell/

&#x20;     map/

&#x20;     timeline/

&#x20;     inspectors/

&#x20;     replay/

&#x20;     simulation/

&#x20;     convergence/



services/

&#x20; api/

&#x20; replay/

&#x20; ingestion/

&#x20; convergence/

&#x20; simulation/



packages/

&#x20; schemas/

&#x20; state/

&#x20; events/

&#x20; geospatial/

&#x20; replay/

&#x20; provenance/

&#x20; ui-primitives/



docs/

&#x20; ui/

&#x20; architecture/

&#x20; intelligence\_layers/



ops/

&#x20; geo\_provenance/

&#x20; replay/

&#x20; ingestion/

&#x20; audits/



scripts/

&#x20; geospatial/

&#x20; replay/

&#x20; validation/

&#x20; ingestion/

```



\---



\# STRUCTURE RULES



\## apps/



User-facing applications only.



\## services/



Backend operational services.



\## packages/



Shared deterministic libraries.



\## docs/



Contracts, architecture, decisions, and system spine.



\## ops/



Operational artifacts, provenance, manifests, and replay records.



\## scripts/



Audit-safe operational tooling.



\---



\# PROHIBITED STRUCTURE PATTERNS



Prohibited:

\- mixing generated artifacts with source code

\- placing provenance artifacts inside app code

\- hiding scripts inside frontend directories

\- duplicating schemas across services



\---



\# FINAL GUARANTEE



Repository structure must preserve:

\- provenance clarity

\- replay clarity

\- operational separation

\- deterministic tooling

