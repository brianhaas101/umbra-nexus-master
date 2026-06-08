\# UMBRA VIEWPORT RENDER PIPELINE



\# CORE PRINCIPLE



The viewport render pipeline converts canonical state, replay state, and overlay state into deterministic map rendering.



The pipeline must preserve provenance and replay integrity.



\---



\# PIPELINE STAGES



1\. Load workspace state

2\. Restore replay tick

3\. Resolve active intelligence layers

4\. Resolve canonical geometry

5\. Resolve operational overlays

6\. Resolve simulation branches

7\. Apply overlay priority rules

8\. Render map viewport

9\. Synchronize inspectors

10\. Emit render diagnostics



\---



\# INPUTS



Viewport rendering consumes:

\- canonical geometry

\- entity state

\- replay tick state

\- overlay state

\- convergence outputs

\- simulation branch state

\- operator workspace state



\---



\# OUTPUTS



Viewport rendering produces:

\- map frame

\- inspector context

\- timeline context

\- replay console state

\- diagnostic output



\---



\# RENDERING ORDER



1\. Base geography

2\. Canonical boundaries

3\. Infrastructure

4\. Operational entities

5\. Events

6\. Provenance indicators

7\. Convergence overlays

8\. Predictive overlays

9\. Simulation overlays

10\. Diagnostic overlays



\---



\# FAILURE RULES



Rendering must halt or degrade visibly when:

\- provenance is missing

\- replay state is corrupt

\- topology validation fails

\- overlay synchronization fails



Silent render repair is prohibited.



\---



\# FINAL GUARANTEE



No viewport frame may render without:

\- deterministic state resolution

\- replay synchronization

\- provenance visibility

