\# UMBRA INGESTION ORCHESTRATION CONTRACT



\# CORE PRINCIPLE



Ingestion systems govern acquisition, normalization, validation, replay linkage, and provenance preservation.



Ingestion is an operational truth pipeline.



\---



\# INGESTION REQUIREMENTS



All ingestion systems must support:

\- authoritative source acquisition

\- immutable source preservation

\- normalization contracts

\- topology validation

\- replay-safe serialization

\- provenance linkage



\---



\# INGESTION STAGES



1\. Source Discovery

2\. Acquisition

3\. Validation

4\. Normalization

5\. Topology Verification

6\. Replay Verification

7\. Canonical Promotion



\---



\# FAILURE RULES



Ingestion failures must expose:

\- source failure

\- topology mismatch

\- replay mismatch

\- provenance corruption

\- normalization failure



Silent ingestion repair is prohibited.



\---



\# FINAL GUARANTEE



No artifact may enter canonical state without:

\- provenance

\- replay verification

\- topology validation

\- deterministic restoration

