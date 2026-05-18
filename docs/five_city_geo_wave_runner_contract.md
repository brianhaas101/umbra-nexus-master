\# Umbra Nexus Five-City Geo Wave Runner Contract



\## Purpose



Defines how geospatial ingestion runs in deterministic 5-city operational waves.



\## Wave Size



Each wave contains exactly 5 cities unless explicitly approved otherwise.



\## Per-City Required Flow



Each city must complete:



1\. bootstrap workspace

2\. source family lock

3\. dataset candidate freeze

4\. download authorization

5\. raw artifact acquisition

6\. acquisition hash record

7\. metadata extraction

8\. geometry validation

9\. normalization

10\. normalization record

11\. replay verification

12\. normalized structural validation

13\. topology validation



\## Wave Completion Requirements



A wave may be sealed only when all 5 cities pass:



\- replay verification

\- normalized structural validation

\- topology validation



\## Mutation Rule



Wave completion does not authorize canonical promotion.



Promotion remains a separate registry-controlled process.



\## Artifact Policy



Raw and normalized municipal artifacts remain local-only unless artifact storage policy changes.



Git tracks records, manifests, contracts, and scripts only.



\## Runner Responsibilities



A future batch runner may automate:



\- workspace bootstrapping

\- record creation

\- hash capture

\- validation

\- normalization

\- replay verification

\- topology reporting

\- manifest generation



It may not automate:



\- source trust decisions

\- canonical registry promotion

\- founder approval

