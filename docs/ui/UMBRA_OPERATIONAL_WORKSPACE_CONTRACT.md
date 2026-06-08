\# UMBRA OPERATIONAL WORKSPACE CONTRACT



\# CORE PRINCIPLE



Operational workspaces preserve operator state, context, replay state, and simulation state across sessions.



Workspaces are operational environments, not temporary UI layouts.



\---



\# WORKSPACE RESPONSIBILITIES



Workspaces must preserve:

\- viewport state

\- timeline state

\- replay state

\- selected entities

\- overlays

\- filters

\- simulation branches

\- convergence inspections



\---



\# SERIALIZATION RULES



Workspaces must support:

\- deterministic export

\- deterministic restoration

\- replay-safe persistence

\- branch-safe restoration



\---



\# MULTI-WORKSPACE RULES



Future systems may support:

\- collaborative workspaces

\- distributed operations

\- synchronized replay rooms

\- branch comparison environments



\---



\# FAILURE RULES



Workspace corruption must expose:

\- replay mismatch

\- stale synchronization

\- missing provenance

\- branch divergence



Silent workspace repair is prohibited.

