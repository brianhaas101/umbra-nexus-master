\# UMBRA CANONICAL ENTITY SCHEMA



\# CORE PRINCIPLE



Every operational object in Umbra Nexus must resolve to a canonical entity identity.



No operational entity may exist without:

\- canonical ID

\- provenance linkage

\- temporal linkage

\- replay compatibility

\- audit visibility



\---



\# ENTITY SCHEMA



```json

{

&#x20; "entity\_id": "entity\_<stable\_id>",

&#x20; "entity\_type": "city|asset|event|source|organization|infrastructure|governance\_unit",

&#x20; "canonical\_name": "",

&#x20; "aliases": \[],

&#x20; "status": "active|inactive|deprecated|deferred",

&#x20; "spatial\_ref": {

&#x20;   "geometry\_artifact": "",

&#x20;   "normalized\_crs": "EPSG:4326",

&#x20;   "bbox": \[]

&#x20; },

&#x20; "temporal\_ref": {

&#x20;   "created\_at\_utc": "",

&#x20;   "updated\_at\_utc": "",

&#x20;   "valid\_from\_utc": "",

&#x20;   "valid\_to\_utc": null

&#x20; },

&#x20; "provenance\_ref": {

&#x20;   "source\_artifacts": \[],

&#x20;   "acquisition\_records": \[],

&#x20;   "normalization\_records": \[],

&#x20;   "validation\_records": \[]

&#x20; },

&#x20; "replay\_ref": {

&#x20;   "first\_replay\_tick": "",

&#x20;   "last\_replay\_tick": "",

&#x20;   "replay\_status": "pass|fail|pending"

&#x20; },

&#x20; "audit\_ref": {

&#x20;   "created\_by": "",

&#x20;   "mutation\_history": \[]

&#x20; }

}

```



\---



\# ENTITY ID RULES



Entity IDs must be:

\- stable

\- deterministic

\- non-reused

\- audit-visible



\---



\# ENTITY TYPE RULES



Entity types must be explicit.



Opaque generic entity types are prohibited.



\---



\# SPATIAL LINKAGE RULES



Spatial linkage must expose:

\- normalized CRS

\- geometry artifact path

\- bounding box

\- topology validation status



\---



\# TEMPORAL LINKAGE RULES



Temporal linkage must expose:

\- creation time

\- update time

\- validity interval

\- replay interval



\---



\# PROVENANCE LINKAGE RULES



Provenance linkage must expose:

\- source artifacts

\- acquisition records

\- normalization records

\- validation records



\---



\# FINAL GUARANTEE



No entity may enter operational state without:

\- canonical identity

\- provenance linkage

\- replay linkage

\- temporal linkage

