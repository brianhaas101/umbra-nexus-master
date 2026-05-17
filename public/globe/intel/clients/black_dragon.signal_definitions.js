// public/globe/intel/clients/black_dragon.signal_definitions.js
// Umbra Nexus Signal Definitions — Black Dragon / OMG Certification
// Purpose: deterministic signal detection and scoring definitions.

(function () {
  window.UmbraIntel = window.UmbraIntel || {};
  window.UmbraIntel.clients = window.UmbraIntel.clients || {};

  const SIGNALS = Object.freeze({
    client_id: "black_dragon_omg_cert_v1",

    keyword_sets: Object.freeze({
      omg_terms: Object.freeze([
        "outlaw motorcycle gang",
        "outlaw motorcycle gangs",
        "OMG",
        "1% biker",
        "one percenter",
        "motorcycle gang",
        "biker gang",
        "motorcycle club investigation",
        "clubhouse raid"
      ]),

      club_names: Object.freeze([
        "Hells Angels",
        "Outlaws MC",
        "Bandidos",
        "Mongols",
        "Pagans",
        "Sons of Silence",
        "Vagos",
        "Warlocks",
        "Iron Horsemen",
        "Gypsy Joker",
        "Satans Slaves"
      ]),

      law_enforcement_units: Object.freeze([
        "gang unit",
        "gang task force",
        "violent gang task force",
        "criminal intelligence unit",
        "organized crime unit",
        "street crimes unit",
        "special investigations unit",
        "fusion center",
        "intelligence center",
        "safe streets task force",
        "ATF task force"
      ]),

      training_terms: Object.freeze([
        "training director",
        "training coordinator",
        "academy commander",
        "police academy",
        "POST",
        "peace officer standards and training",
        "in-service training",
        "professional development",
        "law enforcement training",
        "certification course",
        "gang training",
        "organized crime training"
      ]),

      purchase_budget_terms: Object.freeze([
        "training budget",
        "professional development budget",
        "purchase order",
        "course approval",
        "grant funding",
        "Byrne JAG",
        "COPS grant",
        "anti-gang grant",
        "violent crime grant",
        "organized crime grant"
      ])
    }),

    source_reliability: Object.freeze({
      tier_1_high_trust: Object.freeze([
        "official_agency_website",
        "official_gov_domain",
        "official_press_release",
        "city_council_minutes",
        "county_commission_minutes",
        "state_post_website",
        "federal_grant_database",
        "official_budget_document"
      ]),

      tier_2_medium_trust: Object.freeze([
        "linkedin",
        "government_job_board",
        "police1",
        "local_news",
        "conference_directory",
        "professional_association_site"
      ]),

      tier_3_supporting_only: Object.freeze([
        "social_media",
        "news_aggregator",
        "third_party_directory",
        "unverified_blog"
      ])
    }),

    top_signals: Object.freeze({
      recent_omg_incident: Object.freeze({
        signal_id: "recent_omg_incident",
        label: "Recent OMG-related incident, arrest, raid, seizure, or prosecution",
        weight: 1.0,
        recency_days: 28,
        required_conditions: Object.freeze([
          "source_mentions_omg_terms_or_club_names",
          "event_location_matches_agency_jurisdiction",
          "event_date_within_recency_window"
        ]),
        preferred_sources: Object.freeze([
          "official_press_release",
          "local_news",
          "district_attorney_press_release",
          "atf_press_release"
        ])
      }),

      task_force_participation: Object.freeze({
        signal_id: "task_force_participation",
        label: "Agency participates in gang, violent crime, OMG, or ATF-linked task force",
        weight: 0.9,
        recency_days: 365,
        required_conditions: Object.freeze([
          "agency_named_in_task_force_context",
          "task_force_related_to_gangs_organized_crime_or_violent_crime"
        ]),
        preferred_sources: Object.freeze([
          "official_agency_website",
          "official_press_release",
          "atf_press_release",
          "fbi_press_release",
          "local_news"
        ])
      }),

      grant_funding: Object.freeze({
        signal_id: "grant_funding",
        label: "Recent grant or budget signal related to gang enforcement, intelligence, or training",
        weight: 0.85,
        recency_days: 60,
        required_conditions: Object.freeze([
          "agency_or_parent_government_named",
          "funding_related_to_training_gangs_violent_crime_or_intelligence"
        ]),
        preferred_sources: Object.freeze([
          "federal_grant_database",
          "city_council_minutes",
          "county_commission_minutes",
          "official_budget_document",
          "official_press_release"
        ])
      }),

      new_or_expanded_unit: Object.freeze({
        signal_id: "new_or_expanded_unit",
        label: "Recently formed or expanded gang, intelligence, organized crime, or task force unit",
        weight: 0.8,
        recency_days: 45,
        required_conditions: Object.freeze([
          "unit_name_matches_law_enforcement_units",
          "formation_expansion_or_staffing_change_detected"
        ]),
        preferred_sources: Object.freeze([
          "official_agency_website",
          "official_press_release",
          "local_news",
          "government_job_board"
        ])
      }),

      active_job_posting: Object.freeze({
        signal_id: "active_job_posting",
        label: "Recent job posting for gang, organized crime, intelligence, analyst, or training role",
        weight: 0.75,
        recency_days: 28,
        required_conditions: Object.freeze([
          "job_title_matches_target_role",
          "posting_date_within_recency_window",
          "agency_identified"
        ]),
        preferred_sources: Object.freeze([
          "government_job_board",
          "official_agency_website",
          "police1",
          "state_job_board"
        ])
      }),

      post_or_training_need: Object.freeze({
        signal_id: "post_or_training_need",
        label: "POST, academy, or in-service training need detected",
        weight: 0.7,
        recency_days: 90,
        required_conditions: Object.freeze([
          "training_context_detected",
          "gang_organized_crime_or_investigation_topic_detected"
        ]),
        preferred_sources: Object.freeze([
          "state_post_website",
          "police_academy_website",
          "official_training_calendar",
          "official_agency_website"
        ])
      })
    }),

    supporting_signals: Object.freeze({
      large_agency: Object.freeze({
        signal_id: "large_agency",
        label: "Agency size supports multi-seat or agency-wide purchase",
        weight: 0.6,
        rules: Object.freeze({
          officers_100_299: 0.3,
          officers_300_999: 0.6,
          officers_1000_plus: 1.0
        })
      }),

      tier_1_state: Object.freeze({
        signal_id: "tier_1_state",
        label: "Agency located in high-priority OMG activity state",
        weight: 0.35
      }),

      decision_maker_match: Object.freeze({
        signal_id: "decision_maker_match",
        label: "Contact title matches training, gang, intelligence, command, or academy authority",
        weight: 0.75,
        required_conditions: Object.freeze([
          "title_matches_priority_decision_titles",
          "agency_matches_target_organization_type"
        ])
      }),

      new_decision_maker: Object.freeze({
        signal_id: "new_decision_maker",
        label: "Decision-maker appears to be new in role",
        weight: 0.45,
        recency_days: 548,
        required_conditions: Object.freeze([
          "role_start_date_detected",
          "role_start_within_18_months"
        ]),
        preferred_sources: Object.freeze([
          "linkedin",
          "official_agency_website",
          "press_release"
        ])
      }),

      conference_or_association_activity: Object.freeze({
        signal_id: "conference_or_association_activity",
        label: "Agency or contact connected to gang, intelligence, or law-enforcement training event",
        weight: 0.5,
        recency_days: 30,
        preferred_sources: Object.freeze([
          "conference_directory",
          "professional_association_site",
          "official_event_page",
          "linkedin"
        ])
      }),

      prior_external_training_purchase: Object.freeze({
        signal_id: "prior_external_training_purchase",
        label: "Agency has history of purchasing external or online specialized training",
        weight: 0.65,
        recency_days: 730,
        preferred_sources: Object.freeze([
          "budget_document",
          "purchase_order_record",
          "city_council_minutes",
          "county_commission_minutes",
          "training_calendar"
        ])
      })
    }),

    disqualifiers: Object.freeze({
      too_small_no_gang_signal: Object.freeze({
        disqualifier_id: "too_small_no_gang_signal",
        label: "Agency under 50 sworn officers with no documented gang or intelligence activity",
        penalty: -0.5
      }),

      no_relevant_unit: Object.freeze({
        disqualifier_id: "no_relevant_unit",
        label: "No gang, intelligence, organized crime, training, academy, or task force relevance found",
        penalty: -0.5
      }),

      wrong_role: Object.freeze({
        disqualifier_id: "wrong_role",
        label: "Contact role lacks training, command, gang, intelligence, academy, or purchasing relevance",
        penalty: -0.5
      }),

      non_law_enforcement: Object.freeze({
        disqualifier_id: "non_law_enforcement",
        label: "Entity is not law enforcement, prosecution, POST, academy, or public-safety training authority",
        penalty: -999,
        hard_reject: true
      }),

      outside_us: Object.freeze({
        disqualifier_id: "outside_us",
        label: "Target is outside the United States",
        penalty: -999,
        hard_reject: true
      }),

      no_contact_path: Object.freeze({
        disqualifier_id: "no_contact_path",
        label: "No email and no phone found",
        penalty: -999,
        hard_reject: true
      }),

      personal_or_generic_email_only: Object.freeze({
        disqualifier_id: "personal_or_generic_email_only",
        label: "Only personal or generic email available",
        penalty: -0.75
      }),

      irrelevant_federal_agency: Object.freeze({
        disqualifier_id: "irrelevant_federal_agency",
        label: "Federal agency/contact has no gang, organized crime, task force, intelligence, or training relevance",
        penalty: -0.5
      })
    }),

    lead_tier_rules: Object.freeze({
      hot: Object.freeze({
        min_score: 2.2,
        description:
          "Strong buying intent, relevant authority, recent signal, and usable contact path."
      }),
      warm: Object.freeze({
        min_score: 1.2,
        max_score_exclusive: 2.2,
        description:
          "Relevant target with at least one meaningful signal or strong decision-maker fit."
      }),
      cold: Object.freeze({
        max_score_exclusive: 1.2,
        description:
          "Low-priority lead. Keep ranked but do not prioritize unless volume is needed."
      })
    }),

    recommended_outreach_angles: Object.freeze({
      recent_omg_incident:
        "Reference recent OMG enforcement pressure and position the course as rapid, low-friction specialized training.",
      task_force_participation:
        "Position as scalable training for multi-agency task force members handling OMG or violent gang investigations.",
      grant_funding:
        "Frame as a budget-ready use of training, professional development, or anti-gang funding.",
      new_or_expanded_unit:
        "Frame as onboarding and standardization training for a newly formed or expanding gang/intelligence unit.",
      active_job_posting:
        "Frame as immediate support for newly hired gang, intelligence, or organized crime personnel.",
      post_or_training_need:
        "Frame as an online certification option for POST, academy, or in-service training requirements.",
      large_agency:
        "Lead with multi-seat licensing, academy-wide access, and reduced travel/training friction."
    })
  });

  window.UmbraIntel.clients.blackDragonSignals = SIGNALS;
})();