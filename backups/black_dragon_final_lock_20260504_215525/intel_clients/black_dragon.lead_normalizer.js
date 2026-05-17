// public/globe/intel/clients/black_dragon.lead_normalizer.js
// Black Dragon Lead Normalizer
// Purpose: convert raw lead records into the locked Black Dragon lead output shape before enrichment/scoring/dossier rendering.

(function () {
  window.UmbraIntel = window.UmbraIntel || {};
  window.UmbraIntel.clients = window.UmbraIntel.clients || {};
  window.UmbraIntel.adapters = window.UmbraIntel.adapters || {};

  const CLIENT_ID = "black_dragon_omg_cert_v1";

  function value(...items) {
    for (const item of items) {
      if (item !== undefined && item !== null && String(item).trim() !== "") {
        return item;
      }
    }
    return "";
  }

  function cleanString(input) {
    return String(input ?? "").replace(/\s+/g, " ").trim();
  }

  function cleanState(input) {
    const state = cleanString(input).toUpperCase();
    return state || "";
  }

  function cleanCountry(input) {
    const country = cleanString(input || "US").toUpperCase();

    if (country === "UNITED STATES" || country === "USA" || country === "U.S." || country === "U.S.A.") {
      return "US";
    }

    return country || "US";
  }

  function cleanNumber(input) {
    if (input === undefined || input === null || input === "") return null;

    const n = Number(String(input).replace(/[^\d.-]/g, ""));
    return Number.isFinite(n) ? n : null;
  }

  function normalizeLat(input) {
    const n = cleanNumber(input);
    return Number.isFinite(n) && n >= -90 && n <= 90 ? n : null;
  }

  function normalizeLon(input) {
    const n = cleanNumber(input);
    return Number.isFinite(n) && n >= -180 && n <= 180 ? n : null;
  }

  function normalizeEmail(input) {
    return cleanString(input).toLowerCase();
  }

  function normalizePhone(input) {
    return cleanString(input);
  }

  function stableSlug(input) {
    return cleanString(input)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "")
      .slice(0, 80);
  }

  function makeAgencyId(raw) {
    return cleanString(
      value(
        raw.agency_id,
        raw.agencyId,
        raw.organization_id,
        raw.organizationId
      )
    ) || `agency_${stableSlug(value(raw.agency_name, raw.agencyName, raw.organization, raw.department, "unknown"))}`;
  }

  function makeEntityId(raw, agencyId) {
    return cleanString(
      value(
        raw.entity_id,
        raw.entityId,
        raw.lead_id,
        raw.leadId,
        raw.id
      )
    ) || `${agencyId}_${stableSlug(value(raw.full_name, raw.name, raw.contact_name, raw.contactName, raw.title, "unknown_contact"))}`;
  }

  function normalizeSignals(raw) {
    const signals = raw.signals && typeof raw.signals === "object" ? raw.signals : {};
    const output = {};

    Object.keys(signals).forEach((key) => {
      output[key] = signals[key] === true;
    });

    return output;
  }

  function normalizeDisqualifiers(raw) {
    if (Array.isArray(raw.disqualifiers)) {
      return raw.disqualifiers.map(cleanString).filter(Boolean);
    }

    return [];
  }

  function normalizeSourceRefs(source) {
    if (Array.isArray(source.source_refs)) {
      return source.source_refs
        .filter((ref) => ref && typeof ref === "object")
        .map((ref) => ({
          source_name: cleanString(ref.source_name || ref.name || ref.source || ""),
          source_url: cleanString(ref.source_url || ref.url || ref.link || ""),
          source_date: cleanString(ref.source_date || ref.date || ref.updated_at || ""),
          source_type: cleanString(ref.source_type || ref.type || "public_source")
        }));
    }

    const sourceName = cleanString(value(source.source_name, source.sourceName, source.source, source.publisher));
    const sourceUrl = cleanString(value(source.source_url, source.sourceUrl, source.url, source.link));
    const sourceDate = cleanString(value(source.source_date, source.sourceDate, source.updated_at, source.updatedAt, source.date));

    if (!sourceName && !sourceUrl && !sourceDate) return [];

    return [
      {
        source_name: sourceName,
        source_url: sourceUrl,
        source_date: sourceDate,
        source_type: "public_source"
      }
    ];
  }

  function normalizeLead(raw) {
    const source = raw && typeof raw === "object" ? raw : {};

    const agencyId = makeAgencyId(source);
    const entityId = makeEntityId(source, agencyId);

    const lat = normalizeLat(value(
      source.lat,
      source.latitude,
      source.location?.lat,
      source.location?.latitude
    ));

    const lon = normalizeLon(value(
      source.lon,
      source.lng,
      source.longitude,
      source.location?.lon,
      source.location?.lng,
      source.location?.longitude
    ));

    const sourceUrl = cleanString(value(
      source.source_url,
      source.sourceUrl,
      source.url,
      source.link
    ));

    const normalized = {
      entity_id: entityId,
      agency_id: agencyId,
      client_id: CLIENT_ID,

      full_name: cleanString(value(
        source.full_name,
        source.fullName,
        source.name,
        source.contact_name,
        source.contactName
      )),

      title: cleanString(value(
        source.title,
        source.job_title,
        source.jobTitle,
        source.role,
        source.position
      )),

      agency_name: cleanString(value(
        source.agency_name,
        source.agencyName,
        source.organization,
        source.organization_name,
        source.department,
        source.department_name
      )),

      agency_type: cleanString(value(
        source.agency_type,
        source.agencyType,
        source.organization_type,
        source.type
      )),

      agency_size: cleanNumber(value(
        source.agency_size,
        source.agencySize,
        source.officers,
        source.sworn_officers,
        source.employee_count,
        source.employees
      )),

      city: cleanString(value(
        source.city,
        source.location?.city
      )),

      city_id: cleanString(value(
        source.city_id,
        source.cityId,
        source.location?.city_id,
        source.location?.cityId
      )),

      state: cleanState(value(
        source.state,
        source.region,
        source.location?.state
      )),

      country: cleanCountry(value(
        source.country,
        source.location?.country,
        "US"
      )),

      lat,
      lon,

      location: {
        city: cleanString(value(source.city, source.location?.city)),
        state: cleanState(value(source.state, source.region, source.location?.state)),
        country: cleanCountry(value(source.country, source.location?.country, "US")),
        lat,
        lon
      },

      email: normalizeEmail(value(
        source.email,
        source.work_email,
        source.workEmail,
        source.contact?.email
      )),

      phone: normalizePhone(value(
        source.phone,
        source.direct_phone,
        source.directPhone,
        source.office_phone,
        source.officePhone,
        source.contact?.phone
      )),

      contact_url: cleanString(value(
        source.contact_url,
        source.contactUrl,
        source.contact?.url,
        sourceUrl
      )),

      source_url: sourceUrl || null,

      source_name: cleanString(value(
        source.source_name,
        source.sourceName,
        source.source,
        source.publisher
      )) || null,

      source_date: cleanString(value(
        source.source_date,
        source.sourceDate,
        source.updated_at,
        source.updatedAt,
        source.date
      )) || null,

      source_text: cleanString(value(
        source.source_text,
        source.sourceText,
        source.summary,
        source.description,
        source.notes,
        source.recent_news,
        source.recentNews
      )),

      source_refs: normalizeSourceRefs(source),

      signals: normalizeSignals(source),
      signals_summary: Array.isArray(source.signals_summary)
        ? source.signals_summary.map(cleanString).filter(Boolean)
        : [],

      disqualifiers: normalizeDisqualifiers(source),

      scores: source.scores && typeof source.scores === "object"
        ? Object.assign({}, source.scores)
        : {},

      tier: cleanString(source.tier) || "COLD",

      confidence: Number.isFinite(Number(source.confidence))
        ? Math.max(0, Math.min(1, Number(source.confidence)))
        : 0.8,

      recommended_outreach_angle: cleanString(source.recommended_outreach_angle),

      dossier: source.dossier && typeof source.dossier === "object"
        ? Object.assign({}, source.dossier)
        : {}
    };

    return normalized;
  }

  function normalizeLeads(rawLeads) {
    if (!Array.isArray(rawLeads)) return [];
    return rawLeads.map(normalizeLead);
  }

  window.UmbraIntel.adapters.blackDragonLeadNormalizer = Object.freeze({
    normalizeLead,
    normalizeLeads
  });

  console.info("[black_dragon.lead_normalizer] Ready.");
})();