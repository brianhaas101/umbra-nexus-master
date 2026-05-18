\# Umbra Nexus Geospatial Artifact Retention Policy



\## Policy



Raw and normalized municipal GeoJSON artifacts are local-first operational artifacts.



They are not committed to Git by default.



\## Git Tracks



Git tracks:



\- acquisition records

\- source candidates

\- download authorizations

\- geometry validation records

\- normalization records

\- replay manifests

\- completion manifests

\- scripts

\- governance contracts



\## Git Does Not Track By Default



Git does not track:



\- raw downloaded municipal artifacts

\- normalized generated GeoJSON artifacts

\- temporary extraction outputs

\- downloaded archives

\- shapefile sidecars

\- generated tile artifacts



\## Replay Guarantee



Replay is guaranteed by:



\- authoritative source URL

\- acquisition timestamp

\- artifact SHA256

\- normalized artifact SHA256

\- deterministic normalization scripts

\- replay validators

\- completion manifests



\## Promotion Rule



Canonical registry promotion may only use records that reference validated artifact hashes.



\## Future Storage Option



Large artifacts may later move to:



\- Git LFS

\- object storage

\- release artifacts

\- deterministic cache storage



until explicitly enabled, artifacts remain local-only.

