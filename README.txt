Umbra CITY_MAP meta scaffold pack

Contents
- assets/cities/<city_id>/meta.json for all 50 active cities
- Miami is the verified reference file
- All non-Miami files are scaffolds derived from current entity extents

Readiness rule
- folder exists = asset scaffolded
- local tiles/image exist + bounds verified = CITY_MAP-ready

Important
- Do not treat non-Miami bounds as verified raster authority
- Verify each city's bounds against its actual local raster package before production CITY_MAP use
- Keep the city_id unchanged; it is derived from CITY|STATE and must stay stable
