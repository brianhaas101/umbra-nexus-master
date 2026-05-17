// public/globe/intel/layers/intelligence_layers.registry.js
// Umbra Nexus Intelligence Layers Registry
// Purpose: lock the 12 baseline intelligence layers used by all client presets.
// Rule: every client can weight layers differently, but the baseline layer structure remains stable.

(function () {
  window.UmbraIntel = window.UmbraIntel || {};
  window.UmbraIntel.layers = window.UmbraIntel.layers || {};

  const INTELLIGENCE_LAYERS = Object.freeze({
    version: "INTELLIGENCE_LAYERS_V1",
    layer_count: 12,
    minimum_sources_per_layer: 12,
    recommended_sources_per_layer: 15,

    layers: Object.freeze([
      {
        layer_id: "identity_entity",
        order: 1,
        name: "Identity & Entity Layer",
        purpose: "Correctly identify people, organizations, agencies, departments, and account-level entities.",
        primary_question: "Who exactly is this lead or organization?",
        output_fields: Object.freeze([
          "entity_id",
          "agency_id",
          "full_name",
          "title",
          "agency_name",
          "agency_type",
          "location"
        ]),
        source_categories: Object.freeze([
          "official_agency_websites",
          "staff_directories",
          "government_department_pages",
          "linkedin_profiles",
          "public_employee_databases",
          "association_directories",
          "conference_speaker_pages",
          "training_academy_staff_pages",
          "post_staff_directories",
          "prosecutor_office_directories",
          "sheriff_police_command_pages",
          "public_records_portals",
          "official_press_releases",
          "local_government_rosters",
          "crm_imported_lead_lists"
        ])
      },

      {
        layer_id: "contactability",
        order: 2,
        name: "Contactability Layer",
        purpose: "Determine whether the lead can actually be reached through a usable professional contact path.",
        primary_question: "Can this person or office be contacted reliably?",
        output_fields: Object.freeze([
          "email",
          "phone",
          "contact_status",
          "contact_confidence",
          "contact_source"
        ]),
        source_categories: Object.freeze([
          "agency_domain_emails",
          "direct_office_numbers",
          "main_agency_phone_directories",
          "department_contact_pages",
          "staff_pdf_directories",
          "public_meeting_agendas",
          "conference_contact_pages",
          "post_contact_pages",
          "training_coordinator_pages",
          "procurement_contact_pages",
          "city_county_staff_lookup_tools",
          "email_verification_tools",
          "phone_validation_tools",
          "crm_enrichment_tools",
          "manual_verified_contact_entries"
        ])
      },

      {
        layer_id: "authority_role",
        order: 3,
        name: "Authority & Role Layer",
        purpose: "Measure whether the contact has decision authority, influence, budget access, or operational relevance.",
        primary_question: "Can this person approve, influence, or route a purchase?",
        output_fields: Object.freeze([
          "authority_score",
          "role_match",
          "decision_level",
          "buying_influence"
        ]),
        source_categories: Object.freeze([
          "job_titles",
          "organization_charts",
          "command_staff_pages",
          "academy_leadership_pages",
          "training_division_pages",
          "linkedin_role_history",
          "promotion_press_releases",
          "appointment_notices",
          "meeting_minutes",
          "post_coordinator_lists",
          "task_force_leadership_pages",
          "prosecutor_division_pages",
          "sheriff_command_structures",
          "police_department_bureau_pages",
          "internal_client_notes"
        ])
      },

      {
        layer_id: "organizational_fit",
        order: 4,
        name: "Organizational Fit Layer",
        purpose: "Determine whether the organization matches the client’s target market and operating use case.",
        primary_question: "Is this organization structurally a good fit?",
        output_fields: Object.freeze([
          "organization_fit_score",
          "agency_type",
          "target_type_match",
          "fit_reason"
        ]),
        source_categories: Object.freeze([
          "police_department_websites",
          "sheriff_office_websites",
          "state_police_websites",
          "district_attorney_websites",
          "police_academy_websites",
          "post_websites",
          "fusion_center_websites",
          "gang_unit_pages",
          "criminal_intelligence_unit_pages",
          "organized_crime_unit_pages",
          "federal_task_force_pages",
          "agency_annual_reports",
          "city_county_public_safety_pages",
          "law_enforcement_association_pages",
          "imported_agency_datasets"
        ])
      },

      {
        layer_id: "operational_need",
        order: 5,
        name: "Operational Need Layer",
        purpose: "Detect whether the target has a real-world current need related to the client’s offer.",
        primary_question: "Does this target have a real operational reason to care now?",
        output_fields: Object.freeze([
          "need_score",
          "need_type",
          "need_evidence",
          "need_source"
        ]),
        source_categories: Object.freeze([
          "local_news",
          "agency_press_releases",
          "atf_press_releases",
          "fbi_press_releases",
          "dea_press_releases",
          "hsi_press_releases",
          "prosecutor_announcements",
          "recent_arrests",
          "clubhouse_raids",
          "gang_task_force_activity",
          "violent_crime_initiatives",
          "public_intelligence_bulletins",
          "city_council_safety_updates",
          "county_commission_updates",
          "public_safety_annual_reports"
        ])
      },

      {
        layer_id: "trigger_event",
        order: 6,
        name: "Trigger Event Layer",
        purpose: "Detect recent events that create urgency, timing advantage, or outreach relevance.",
        primary_question: "What happened recently that makes this lead timely?",
        output_fields: Object.freeze([
          "trigger_score",
          "trigger_type",
          "trigger_date",
          "trigger_summary"
        ]),
        source_categories: Object.freeze([
          "recent_news_within_window",
          "active_investigations",
          "recent_arrests",
          "recent_seizures",
          "recent_raids",
          "recent_violent_incidents",
          "task_force_announcements",
          "new_gang_enforcement_operations",
          "new_intelligence_initiatives",
          "prosecutor_indictments",
          "federal_local_joint_operations",
          "budget_approvals",
          "training_announcements",
          "personnel_promotions",
          "job_postings"
        ])
      },

      {
        layer_id: "budget_funding",
        order: 7,
        name: "Budget & Funding Layer",
        purpose: "Estimate whether the organization has funding capacity or purchase pathways for the offer.",
        primary_question: "Can this target realistically afford or approve the purchase?",
        output_fields: Object.freeze([
          "budget_score",
          "funding_signal",
          "procurement_path",
          "budget_source"
        ]),
        source_categories: Object.freeze([
          "city_budgets",
          "county_budgets",
          "police_budget_pdfs",
          "sheriff_budget_pdfs",
          "training_budget_line_items",
          "procurement_portals",
          "purchase_orders",
          "grant_databases",
          "byrne_jag_grants",
          "cops_grants",
          "state_public_safety_grants",
          "meeting_minutes_approving_purchases",
          "vendor_payment_records",
          "fiscal_year_plans",
          "public_rfps"
        ])
      },

      {
        layer_id: "training_certification",
        order: 8,
        name: "Training & Certification Layer",
        purpose: "Detect whether training, certification, continuing education, or professional development is relevant.",
        primary_question: "Does this organization already buy, require, or manage training?",
        output_fields: Object.freeze([
          "training_score",
          "training_need",
          "certification_relevance",
          "training_source"
        ]),
        source_categories: Object.freeze([
          "post_course_catalogs",
          "police_academy_calendars",
          "in_service_training_calendars",
          "conference_schedules",
          "training_vendor_pages",
          "association_training_events",
          "agency_training_divisions",
          "procurement_history",
          "continuing_education_requirements",
          "certification_requirements",
          "academy_commander_pages",
          "state_training_bulletins",
          "national_law_enforcement_training_listings",
          "public_course_approval_pages",
          "internal_sales_notes"
        ])
      },

      {
        layer_id: "competitive_alternatives",
        order: 9,
        name: "Competitive / Alternative Solution Layer",
        purpose: "Identify existing vendors, substitute solutions, previous purchases, and competitive pressure.",
        primary_question: "What alternatives might this target already know, use, or buy?",
        output_fields: Object.freeze([
          "competitive_score",
          "known_vendor",
          "alternative_solution",
          "competitive_risk"
        ]),
        source_categories: Object.freeze([
          "training_vendor_directories",
          "conference_exhibitor_lists",
          "agency_purchase_records",
          "public_procurement_awards",
          "post_approved_course_lists",
          "competitor_websites",
          "association_sponsor_lists",
          "police_training_marketplaces",
          "grant_funded_vendor_records",
          "public_invoice_databases",
          "training_calendar_archives",
          "law_enforcement_newsletters",
          "vendor_testimonials",
          "course_review_pages",
          "client_provided_competitor_notes"
        ])
      },

      {
        layer_id: "timing_recency",
        order: 10,
        name: "Timing & Recency Layer",
        purpose: "Enforce freshness, decay stale signals, and align lead timing with outreach windows.",
        primary_question: "Is this information recent enough to act on?",
        output_fields: Object.freeze([
          "recency_score",
          "latest_signal_date",
          "staleness_flag",
          "timing_notes"
        ]),
        source_categories: Object.freeze([
          "published_dates",
          "press_release_dates",
          "job_posting_dates",
          "budget_cycle_dates",
          "grant_award_dates",
          "meeting_agenda_dates",
          "meeting_minutes_dates",
          "conference_dates",
          "appointment_promotion_dates",
          "procurement_deadline_dates",
          "training_calendar_dates",
          "fiscal_year_dates",
          "news_timestamps",
          "crm_activity_dates",
          "outreach_history_dates"
        ])
      },

      {
        layer_id: "risk_compliance_disqualification",
        order: 11,
        name: "Risk, Compliance & Disqualification Layer",
        purpose: "Reject or downgrade low-quality, irrelevant, unsafe, stale, or non-compliant targets.",
        primary_question: "Should this lead be blocked, downgraded, or held?",
        output_fields: Object.freeze([
          "risk_score",
          "disqualifiers",
          "hard_reject",
          "risk_reason"
        ]),
        source_categories: Object.freeze([
          "disqualifier_rules",
          "agency_size_thresholds",
          "role_mismatch_checks",
          "email_domain_validation",
          "personal_email_rejection",
          "generic_inbox_rejection",
          "non_law_enforcement_rejection",
          "out_of_country_rejection",
          "budget_cut_notices",
          "hiring_freeze_notices",
          "duplicate_detection",
          "source_reliability_scoring",
          "contact_bounce_history",
          "crm_suppression_lists",
          "manual_blacklist_hold_lists"
        ])
      },

      {
        layer_id: "outcome_feedback",
        order: 12,
        name: "Outcome & Feedback Layer",
        purpose: "Use real outreach outcomes to improve scoring, targeting, prioritization, and future recommendations.",
        primary_question: "What happened after outreach, and what should the system learn?",
        output_fields: Object.freeze([
          "outcome_status",
          "feedback_score",
          "close_reason",
          "next_action"
        ]),
        source_categories: Object.freeze([
          "email_opens",
          "email_replies",
          "calls_completed",
          "meetings_booked",
          "demos_scheduled",
          "course_purchases",
          "purchase_order_status",
          "lost_deal_reasons",
          "bad_contact_flags",
          "bounce_rates",
          "referral_notes",
          "expansion_opportunities",
          "renewal_potential",
          "sales_team_notes",
          "crm_close_data"
        ])
      }
    ])
  });

  function getLayer(layerId) {
    return INTELLIGENCE_LAYERS.layers.find((layer) => layer.layer_id === layerId) || null;
  }

  function listLayers() {
    return INTELLIGENCE_LAYERS.layers.slice();
  }

  function getSourceCategories(layerId) {
    const layer = getLayer(layerId);
    return layer ? layer.source_categories.slice() : [];
  }

  function validateRegistry() {
    const layers = INTELLIGENCE_LAYERS.layers;
    const layerIds = layers.map((layer) => layer.layer_id);
    const uniqueLayerIds = new Set(layerIds);

    const checks = {
      has_12_layers: layers.length === 12,
      unique_layer_ids: uniqueLayerIds.size === layerIds.length,
      every_layer_has_minimum_sources: layers.every(
        (layer) => Array.isArray(layer.source_categories) && layer.source_categories.length >= 12
      ),
      every_layer_has_output_fields: layers.every(
        (layer) => Array.isArray(layer.output_fields) && layer.output_fields.length > 0
      ),
      ordered_1_to_12: layers.every((layer, index) => layer.order === index + 1)
    };

    return {
      system: "Umbra Nexus Intelligence Layers Registry",
      version: INTELLIGENCE_LAYERS.version,
      pass: Object.values(checks).every(Boolean),
      checks,
      layer_count: layers.length,
      timestamp: new Date().toISOString()
    };
  }

  window.UmbraIntel.layers.registry = INTELLIGENCE_LAYERS;

  window.UmbraIntel.layers.api = Object.freeze({
    getLayer,
    listLayers,
    getSourceCategories,
    validateRegistry
  });

  console.info("[intelligence_layers.registry] Ready.", validateRegistry());
})();