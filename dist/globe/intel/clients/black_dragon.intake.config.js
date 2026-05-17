// public/globe/intel/clients/black_dragon.intake.config.js
// Umbra Nexus Client Intake Config — Black Dragon / OutlawMotorcycleGangCert.com
// Purpose: deterministic client preset for lead targeting, scoring, filtering, and dossier output.

(function () {
  window.UmbraIntel = window.UmbraIntel || {};
  window.UmbraIntel.clients = window.UmbraIntel.clients || {};

  const CONFIG = Object.freeze({
    client_id: "black_dragon_omg_cert_v1",
    client_name: "Black Dragon",
    organization_name: "OutlawMotorcycleGangCert.com",
    parent_brand: "Bunch Media Group",

    offer: Object.freeze({
      product_name: "Outlaw Motorcycle Gang Certification",
      product_type: "premium_online_certification_course",
      delivery: "online_self_paced",
      primary_price_per_seat_usd: 599,
      expected_deal_values_usd: Object.freeze({
        single_seat: 599,
        small_deal_min: 2000,
        small_deal_max: 5000,
        medium_deal_min: 6000,
        medium_deal_max: 12000,
        large_deal_min: 15000,
        large_deal_max: 30000
      }),
      expected_sales_cycle_days: Object.freeze({
        single_seat_min: 14,
        single_seat_max: 42,
        small_team_min: 28,
        small_team_max: 70,
        agency_min: 56,
        agency_max: 140
      })
    }),

    objective: Object.freeze({
      primary_outcome:
        "Generate ranked, sales-ready law-enforcement training leads for Outlaw Motorcycle Gang Certification purchases.",
      monthly_target_leads_min: 50,
      monthly_target_leads_max: 100,
      if_more_than_target_found: "return_all_ranked",
      desired_bad_contact_rate_max: 0.10,
      outreach_target_per_week_min: 15,
      outreach_target_per_week_max: 25,
      target_response_rate_min: 0.15,
      target_response_rate_max: 0.25,
      revenue_target_60_90_days_usd_min: 5000,
      revenue_target_60_90_days_usd_max: 12000
    }),

    target_profile: Object.freeze({
      geography: Object.freeze({
        country: "United States",
        mode: "all_states_open",
        tier_bonus_enabled: true,
        tier_1_states: Object.freeze([
          "CA", "TX", "FL", "PA", "OH", "IL", "AZ", "NY", "MI",
          "WI", "NC", "SC", "WA", "CO", "NV"
        ]),
        tier_2_states: Object.freeze([
          "IN", "NJ", "MD", "VA"
        ])
      }),

      target_organization_types: Object.freeze([
        "police_department",
        "sheriffs_office",
        "state_police",
        "department_of_public_safety",
        "police_academy",
        "post_office",
        "district_attorney_office",
        "state_attorney_office",
        "gang_task_force",
        "criminal_intelligence_unit",
        "fusion_center",
        "atf_office",
        "fbi_safe_streets_task_force",
        "dea_task_force",
        "hsi_task_force"
      ]),

      priority_decision_titles: Object.freeze([
        "Training Director",
        "Training Coordinator",
        "Academy Commander",
        "Police Academy Director",
        "POST Coordinator",
        "Gang Unit Commander",
        "Gang Intelligence Supervisor",
        "Criminal Intelligence Supervisor",
        "Intelligence Analyst Lead",
        "Sergeant",
        "Lieutenant",
        "Captain",
        "Chief of Police",
        "Sheriff",
        "Undersheriff",
        "Commissioner",
        "Superintendent",
        "District Attorney Gang Unit Chief",
        "Specialized Prosecutor",
        "ATF Task Force Coordinator",
        "Special Agent in Charge",
        "Intelligence Supervisor"
      ]),

      minimum_requirements: Object.freeze({
        country_required: "US",
        law_enforcement_or_public_safety_required: true,
        minimum_sworn_officers_default: 50,
        smaller_agency_allowed_if_documented_gang_activity: true,
        must_have_training_or_operational_relevance: true,
        must_have_contact_path: true
      })
    }),

    contact_rules: Object.freeze({
      mode: "moderate_delivery_aggressive_scoring",

      deliverable_minimum: Object.freeze({
        full_name_required: true,
        title_required: true,
        agency_required: true,
        email_or_phone_required: true
      }),

      high_score_contact_standard: Object.freeze({
        email_required: true,
        phone_required: true
      }),

      email_rules: Object.freeze({
        work_email_required_for_full_credit: true,
        personal_domains_allowed: false,
        generic_inboxes_allowed: false,
        acceptable_domain_types: Object.freeze([
          ".gov",
          ".us",
          ".org",
          ".edu",
          "official_agency_domain"
        ]),
        rejected_email_patterns: Object.freeze([
          "gmail.com",
          "yahoo.com",
          "hotmail.com",
          "outlook.com",
          "icloud.com",
          "aol.com",
          "proton.me",
          "info@",
          "support@",
          "admin@",
          "contact@",
          "training@",
          "sales@"
        ])
      }),

      phone_rules: Object.freeze({
        direct_line_preferred: true,
        agency_main_line_allowed: true,
        phone_required_for_full_credit: true
      })
    }),

    recency_windows_days: Object.freeze({
      news_incident: 28,
      job_posting: 28,
      conference_activity: 30,
      unit_formation: 45,
      grant_funding: 60
    }),

    priority_model: Object.freeze({
      order: Object.freeze([
        "accuracy",
        "long_term_value",
        "deal_size",
        "volume",
        "speed"
      ]),
      aggression_level: "aggressive",
      agency_size_bias: "large_agencies_score_higher",
      expansion_mix: Object.freeze({
        new_agencies_target_ratio: 0.5,
        expansion_agencies_target_ratio: 0.5
      })
    }),

    scoring: Object.freeze({
      score_name: "umbraScore",
      classification_thresholds: Object.freeze({
        hot_min: 2.2,
        warm_min: 1.2,
        cold_max_exclusive: 1.2
      }),

      geography_bonus: Object.freeze({
        tier_1_state: 0.35,
        tier_2_state: 0.2,
        other_state: 0
      }),

      agency_size_bonus: Object.freeze({
        unknown: 0,
        under_50_with_signal: 0.1,
        officers_50_99: 0.2,
        officers_100_299: 0.3,
        officers_300_999: 0.6,
        officers_1000_plus: 1.0
      }),

      contact_quality_bonus: Object.freeze({
        verified_work_email_and_phone: 1.0,
        verified_work_email_only: 0.75,
        phone_only: 0.45,
        no_contact: -999
      }),

      disqualifier_penalties: Object.freeze({
        one_disqualifier: -0.5,
        two_or_more_disqualifiers: -1.2,
        hard_reject: -999
      }),

      confidence_multiplier: Object.freeze({
        official_source_confirmed: 1.0,
        multiple_sources_confirmed: 0.95,
        single_reputable_source: 0.8,
        inferred_match: 0.65,
        weak_or_stale_match: 0.45
      })
    }),

    duplicate_handling: Object.freeze({
      same_agency_multiple_contacts: "keep_all_contacts",
      each_contact_is_entity: true,
      shared_agency_id_required: true,
      outreach_note:
        "Multiple contacts at the same agency are useful for multi-thread outreach and expansion."
    }),

    required_output_fields: Object.freeze([
      "entity_id",
      "agency_id",
      "full_name",
      "title",
      "agency_name",
      "state",
      "email",
      "phone",
      "signals_summary",
      "umbraScore",
      "confidence",
      "tier",
      "recommended_outreach_angle"
    ]),

    hard_reject_conditions: Object.freeze([
      "non_law_enforcement_entity",
      "outside_united_states",
      "no_name_no_title",
      "no_email_and_no_phone",
      "civilian_general_public",
      "motorcycle_club_or_biker_association",
      "private_security_without_law_enforcement_training_role"
    ])
  });

  window.UmbraIntel.clients.blackDragon = CONFIG;
})();