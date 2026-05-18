\# Umbra Nexus Canonical Geometry Registry Contract



\## Purpose



Defines the promotion boundary between replay-verified municipal ingestion artifacts and canonical production geometry records.



Ingestion does not imply promotion.



\## Promotion Preconditions



A city geometry may only be promoted after:



\- authoritative source selected

\- raw artifact hash recorded

\- geometry metadata extracted

\- geometry validation passed

\- normalization passed

\- normalized artifact hash recorded

\- replay validation passed

\- normalized structural validation passed

\- topology validation passed

\- wave completion manifest sealed

\- founder approval granted



\## Registry Mutation Rule



Canonical geometry registry mutation is forbidden unless explicitly authorized by a promotion record.



\## Required Promotion Record Fields



\- city\_id

\- canonical\_name

\- source\_artifact\_sha256

\- normalized\_artifact\_sha256

\- bbox

\- geometry\_type

\- source\_authority

\- normalized\_crs

\- topology\_status

\- replay\_status

\- promotion\_authorized

\- promoted\_at

\- promoted\_by\_process

\- rollback\_reference



\## Geometry Versioning



Each promoted geometry receives an immutable geometry version.



Superseded geometries are never deleted.



\## Rollback Rule



Rollback must restore the prior promoted geometry version and preserve the failed candidate as rejected lineage.



\## Runtime Rule



Runtime systems may read promoted geometry records.



Runtime systems may not promote geometry.

