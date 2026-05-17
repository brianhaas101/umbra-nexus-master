// public/globe/intel/clients/black_dragon.enrichment.adapter.js
// Black Dragon Enrichment Adapter V1
// Purpose: enrich agency-level Black Dragon leads before pipeline/scoring without overwriting source truth.

(function () {
  window.UmbraIntel = window.UmbraIntel || {};
  window.UmbraIntel.adapters = window.UmbraIntel.adapters || {};

  const CLIENT_ID = "black_dragon_omg_cert_v1";

  const AGENCY_SIZE_HINTS = [
    { test: /fbi|federal bureau|doj|department of justice/i, officers: 1000 },
    { test: /state police|highway patrol|department of public safety|dps/i, officers: 1000 },
    { test: /sheriff|county/i, officers: 300 },
    { test: /police department|police bureau/i, officers: 300 },
    { test: /task force|gang unit|gang enforcement|safe streets|organized crime|violent crime/i, officers: 300 },
    { test: /post|academy|commission/i, officers: 100 },
    { test: /association|iacp/i, officers: 100 },
    { test: /training/i, officers: 50 }
  ];

  function asText(value) {
    return String(value || "").trim();
  }

  function ensureArray(value) {
    return Array.isArray(value) ? value : [];
  }

  function getHaystack(entity) {
    return [
      entity.agency_name,
      entity.name,
      entity.title,
      entity.full_name,
      entity.source_text,
      entity.notes,
      ensureArray(entity.tags).join(" "),
      ensureArray(entity.rationale).join(" ")
    ]
      .map(asText)
      .join(" ");
  }

  function inferAgencySize(entity) {
    const existing = Number(entity.agency_size || entity.agencySize || entity.officers || 0);
    if (Number.isFinite(existing) && existing > 0) return existing;

    const haystack = getHaystack(entity);
    const match = AGENCY_SIZE_HINTS.find((rule) => rule.test.test(haystack));

    return match ? match.officers : 50;
  }

  function inferAgencyType(entity) {
    if (entity.agency_type) return entity.agency_type;

    const text = getHaystack(entity).toLowerCase();

    if (text.includes("task force")) return "multi_agency_task_force";
    if (text.includes("gang unit") || text.includes("gang enforcement")) return "gang_enforcement_unit";
    if (text.includes("safe streets") || text.includes("violent crime")) return "violent_crime_unit";
    if (text.includes("organized crime")) return "organized_crime_unit";
    if (text.includes("fbi") || text.includes("doj")) return "federal_law_enforcement";
    if (text.includes("post") || text.includes("academy") || text.includes("training") || text.includes("commission")) return "training_authority";
    if (text.includes("sheriff")) return "county_sheriff";
    if (text.includes("highway patrol") || text.includes("state police") || text.includes("department of public safety") || text.includes("dps")) return "state_law_enforcement";
    if (text.includes("police")) return "municipal_police";
    if (text.includes("association") || text.includes("iacp")) return "law_enforcement_association";

    return "law_enforcement_target";
  }

  function inferConfidence(entity) {
    const current = Number(entity.confidence);
    if (Number.isFinite(current) && current > 0) return current;

    const sources = ensureArray(entity.sources);
    const sourceText = JSON.stringify(sources).toLowerCase();

    const hasOfficial = /official|\.gov|post|fbi|doj|hifld|bjs|sheriff|police/.test(sourceText);

    if (hasOfficial && sources.length >= 2) return 0.88;
    if (hasOfficial) return 0.84;
    if (sources.length >= 2) return 0.78;
    if (sources.length === 1) return 0.7;

    return 0.62;
  }

  function buildContactStrategy(entity) {
    if (entity.contact_strategy) return entity.contact_strategy;

    const agency = asText(entity.agency_name || entity.name || "this agency");
    const agencyType = inferAgencyType(entity);

    if (agencyType === "training_authority") {
      return `Find POST, academy, in-service training, or professional standards contact for ${agency}.`;
    }

    if (
      agencyType === "multi_agency_task_force" ||
      agencyType === "gang_enforcement_unit" ||
      agencyType === "organized_crime_unit" ||
      agencyType === "violent_crime_unit"
    ) {
      return `Find parent agency command staff, gang unit supervisor, investigations commander, or training coordinator for ${agency}.`;
    }

    if (agencyType === "federal_law_enforcement") {
      return `Use official public training, outreach, field office, or law-enforcement liaison contact path for ${agency}.`;
    }

    if (agencyType === "law_enforcement_association") {
      return `Find association training coordinator, conference contact, education committee, or member services contact for ${agency}.`;
    }

    return `Find official agency contact page, training division, command staff, professional development, or investigations command contact for ${agency}.`;
  }

  function normalizeDisqualifiers(entity) {
    const disqualifiers = ensureArray(entity.disqualifiers).map(asText).filter(Boolean);
    const researchGaps = ensureArray(entity.research_gaps);

    if (disqualifiers.includes("no_contact_path")) {
      researchGaps.push("direct_contact_needed");
    }

    if (disqualifiers.includes("wrong_role")) {
      researchGaps.push("decision_maker_role_needs_confirmation");
    }

    entity.research_gaps = Array.from(new Set(researchGaps));

    return disqualifiers;
  }

  function enrichLead(input) {
    if (!input || typeof input !== "object") return input;

    const entity = { ...input };

    entity.client_id = entity.client_id || CLIENT_ID;
    entity.agency_name = entity.agency_name || entity.name || entity.full_name || "";
    entity.name = entity.name || entity.agency_name;
    entity.type = entity.type || "law_enforcement";
    entity.agency_type = inferAgencyType(entity);
    entity.agency_size = inferAgencySize(entity);
    entity.confidence = inferConfidence(entity);
    entity.contact_strategy = buildContactStrategy(entity);
    entity.disqualifiers = normalizeDisqualifiers(entity);

    entity.attributes = entity.attributes || {};
    entity.attributes.agency_size = entity.attributes.agency_size || entity.agency_size;
    entity.attributes.agency_type = entity.attributes.agency_type || entity.agency_type;
    entity.attributes.contact_strategy = entity.attributes.contact_strategy || entity.contact_strategy;
    entity.attributes.research_gaps = entity.attributes.research_gaps || entity.research_gaps || [];
    entity.attributes.enriched_by = entity.attributes.enriched_by || "black_dragon.enrichment.adapter.v1";

    entity._enrichmentTrace = entity._enrichmentTrace || {};
    entity._enrichmentTrace.blackDragon = {
      client_id: CLIENT_ID,
      agency_size: entity.agency_size,
      agency_type: entity.agency_type,
      confidence: entity.confidence,
      contact_strategy: entity.contact_strategy,
      research_gaps: entity.research_gaps || [],
      timestamp: new Date().toISOString()
    };

    return entity;
  }

  function enrichLeads(leads) {
    if (!Array.isArray(leads)) return [];
    return leads.map(enrichLead);
  }

  window.UmbraIntel.adapters.blackDragonEnrichment = Object.freeze({
    enrichLead,
    enrichLeads
  });

  console.info("[black_dragon.enrichment.adapter] Ready.");
})();