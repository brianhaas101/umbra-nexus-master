// public/globe/intel/clients/black_dragon.pipeline.adapter.js
// Additive pipeline adapter for Black Dragon lead qualification.

(function () {
  window.UmbraIntel = window.UmbraIntel || {};
  window.UmbraIntel.clients = window.UmbraIntel.clients || {};
  window.UmbraIntel.adapters = window.UmbraIntel.adapters || {};

  const config = window.UmbraIntel.clients.blackDragon;
  const signalDefs = window.UmbraIntel.clients.blackDragonSignals;
  const scoring = window.UmbraIntel.adapters.blackDragonScoring;

  if (!config || !signalDefs || !scoring) {
    console.error("[black_dragon.pipeline.adapter] Missing config, signal definitions, or scoring adapter.");
    return;
  }

  function norm(value) {
    return String(value || "").toLowerCase();
  }

  function containsAny(text, terms) {
    const haystack = norm(text);
    return Array.from(terms || []).some((term) => haystack.includes(norm(term)));
  }

  function daysAgo(dateValue) {
    if (!dateValue) return Infinity;

    const t = new Date(dateValue).getTime();
    if (!Number.isFinite(t)) return Infinity;

    return Math.floor((Date.now() - t) / 86400000);
  }

  function isRecent(dateValue, maxDays) {
    return daysAgo(dateValue) <= maxDays;
  }

  function buildText(entity) {
    return [
      entity.full_name,
      entity.title,
      entity.agency_name,
      entity.description,
      entity.notes,
      entity.summary,
      entity.source_text,
      entity.sourceText,
      entity.recent_news,
      entity.recentNews,
      entity.unit_name,
      entity.unitName
    ].filter(Boolean).join(" ");
  }

  function detectSignals(entity) {
    const text = buildText(entity);
    const keywords = signalDefs.keyword_sets;
    const recency = config.recency_windows_days;

    const sourceDate =
      entity.source_date ||
      entity.sourceDate ||
      entity.updated_at ||
      entity.updatedAt ||
      entity.date;

    const detected = {};

    detected.recent_omg_incident =
      containsAny(text, keywords.omg_terms) ||
      containsAny(text, keywords.club_names);

    detected.recent_omg_incident =
      detected.recent_omg_incident && isRecent(sourceDate, recency.news_incident);

    detected.task_force_participation =
      containsAny(text, ["task force"]) &&
      (
        containsAny(text, keywords.omg_terms) ||
        containsAny(text, keywords.club_names) ||
        containsAny(text, keywords.law_enforcement_units)
      );

    detected.grant_funding =
      containsAny(text, keywords.purchase_budget_terms) &&
      isRecent(sourceDate, recency.grant_funding);

    detected.new_or_expanded_unit =
      containsAny(text, keywords.law_enforcement_units) &&
      containsAny(text, ["new", "formed", "expanded", "launched", "created", "assigned", "hiring"]) &&
      isRecent(sourceDate, recency.unit_formation);

    detected.active_job_posting =
      containsAny(text, ["job", "posting", "hiring", "recruitment", "opening"]) &&
      containsAny(text, ["gang", "intelligence", "organized crime", "analyst", "investigator"]) &&
      isRecent(sourceDate, recency.job_posting);

    detected.post_or_training_need =
      containsAny(text, keywords.training_terms) &&
      containsAny(text, ["gang", "organized crime", "outlaw motorcycle", "biker"]);

    detected.decision_maker_match =
      containsAny(entity.title || "", config.target_profile.priority_decision_titles);

    detected.large_agency =
      Number(entity.agency_size || entity.agencySize || entity.officers || 0) >= 100;

    detected.tier_1_state =
      config.target_profile.geography.tier_1_states.includes(
        String(entity.state || entity.location?.state || "").toUpperCase()
      );

    entity.signals = Object.assign({}, entity.signals || {}, detected);

    return entity;
  }

  function detectDisqualifiers(entity) {
    const disqualifiers = new Set(Array.isArray(entity.disqualifiers) ? entity.disqualifiers : []);

    const text = buildText(entity);
    const email = String(entity.email || entity.contact?.email || "").trim();
    const phone = String(entity.phone || entity.contact?.phone || "").trim();
    const country = String(entity.country || entity.location?.country || "US").toUpperCase();

    if (country !== "US" && country !== "USA" && country !== "UNITED STATES") {
      disqualifiers.add("outside_us");
    }

    if (!email && !phone) {
      disqualifiers.add("no_contact_path");
    }

    if (
      containsAny(text, [
        "motorcycle club",
        "biker association",
        "private security",
        "corporate training",
        "general public"
      ]) &&
      !containsAny(text, [
        "police",
        "sheriff",
        "district attorney",
        "state attorney",
        "ATF",
        "FBI",
        "DEA",
        "HSI",
        "POST",
        "academy"
      ])
    ) {
      disqualifiers.add("non_law_enforcement");
    }

    if (
      entity.title &&
      !containsAny(entity.title, config.target_profile.priority_decision_titles)
    ) {
      disqualifiers.add("wrong_role");
    }

    const agencySize = Number(entity.agency_size || entity.agencySize || entity.officers || 0);
    const hasGangSignal =
      entity.signals?.recent_omg_incident ||
      entity.signals?.task_force_participation ||
      entity.signals?.new_or_expanded_unit;

    if (agencySize > 0 && agencySize < 50 && !hasGangSignal) {
      disqualifiers.add("too_small_no_gang_signal");
    }

    entity.disqualifiers = Array.from(disqualifiers);
    return entity;
  }

  function addOutreachAngle(entity) {
    const angles = signalDefs.recommended_outreach_angles;
    const s = entity.signals || {};

    let angle = "Lead with the specialized online certification, reduced travel friction, and direct relevance to OMG enforcement training.";

    if (s.recent_omg_incident) angle = angles.recent_omg_incident;
    else if (s.task_force_participation) angle = angles.task_force_participation;
    else if (s.grant_funding) angle = angles.grant_funding;
    else if (s.new_or_expanded_unit) angle = angles.new_or_expanded_unit;
    else if (s.active_job_posting) angle = angles.active_job_posting;
    else if (s.post_or_training_need) angle = angles.post_or_training_need;
    else if (s.large_agency) angle = angles.large_agency;

    entity.recommended_outreach_angle = angle;
    return entity;
  }

  function processEntity(entity) {
    if (!entity || typeof entity !== "object") return entity;

    detectSignals(entity);
    detectDisqualifiers(entity);
    addOutreachAngle(entity);
    scoring.scoreEntity(entity);

    return entity;
  }

  function processEntities(entities) {
    if (!Array.isArray(entities)) return [];

    return entities
      .map(processEntity)
      .filter(Boolean)
      .sort((a, b) => Number(b.umbraScore || 0) - Number(a.umbraScore || 0));
  }

  window.UmbraIntel.adapters.blackDragonPipeline = Object.freeze({
    processEntity,
    processEntities,
    detectSignals,
    detectDisqualifiers
  });

  console.info("[black_dragon.pipeline.adapter] Ready.");
})();