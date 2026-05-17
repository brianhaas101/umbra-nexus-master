// public/globe/intel/layers/source_catalog.v1.js
// Umbra Nexus Source Catalog V1
// Purpose: normalize source categories used across all 12 intelligence layers.
// This does not fetch data. It defines source meaning, trust level, recency expectations, and use constraints.

(function () {
  window.UmbraIntel = window.UmbraIntel || {};
  window.UmbraIntel.layers = window.UmbraIntel.layers || {};

  const SOURCE_TRUST = Object.freeze({
    OFFICIAL: 1.0,
    HIGH: 0.9,
    MEDIUM: 0.75,
    SUPPORTING: 0.6,
    WEAK: 0.4,
    INTERNAL: 0.85,
    FEEDBACK: 0.95
  });

  const SOURCE_TYPES = Object.freeze({
    official: "official",
    public_record: "public_record",
    directory: "directory",
    news: "news",
    professional_profile: "professional_profile",
    procurement: "procurement",
    grant: "grant",
    training: "training",
    conference: "conference",
    verification: "verification",
    crm: "crm",
    feedback: "feedback",
    derived_rule: "derived_rule",
    social: "social"
  });

  const CATALOG = Object.freeze({
    version: "SOURCE_CATALOG_V1",

    trust_levels: SOURCE_TRUST,
    source_types: SOURCE_TYPES,

    sources: Object.freeze({
      official_agency_websites: {
        source_id: "official_agency_websites",
        type: SOURCE_TYPES.official,
        trust: SOURCE_TRUST.OFFICIAL,
        freshness_days: 180,
        description: "Official agency websites used for identity, role, unit, and contact verification."
      },

      staff_directories: {
        source_id: "staff_directories",
        type: SOURCE_TYPES.directory,
        trust: SOURCE_TRUST.HIGH,
        freshness_days: 180,
        description: "Official or semi-official staff directories listing personnel, titles, emails, or phone numbers."
      },

      government_department_pages: {
        source_id: "government_department_pages",
        type: SOURCE_TYPES.official,
        trust: SOURCE_TRUST.OFFICIAL,
        freshness_days: 180,
        description: "Government department pages that identify departments, leadership, and functions."
      },

      linkedin_profiles: {
        source_id: "linkedin_profiles",
        type: SOURCE_TYPES.professional_profile,
        trust: SOURCE_TRUST.MEDIUM,
        freshness_days: 365,
        description: "Professional profiles used for title, role history, tenure, and decision-maker context."
      },

      public_employee_databases: {
        source_id: "public_employee_databases",
        type: SOURCE_TYPES.public_record,
        trust: SOURCE_TRUST.HIGH,
        freshness_days: 365,
        description: "Public records identifying employees, roles, departments, or salary/title context."
      },

      association_directories: {
        source_id: "association_directories",
        type: SOURCE_TYPES.directory,
        trust: SOURCE_TRUST.MEDIUM,
        freshness_days: 365,
        description: "Professional association directories used for role and organization verification."
      },

      conference_speaker_pages: {
        source_id: "conference_speaker_pages",
        type: SOURCE_TYPES.conference,
        trust: SOURCE_TRUST.MEDIUM,
        freshness_days: 365,
        description: "Speaker pages used to identify expertise, authority, and active professional participation."
      },

      training_academy_staff_pages: {
        source_id: "training_academy_staff_pages",
        type: SOURCE_TYPES.training,
        trust: SOURCE_TRUST.HIGH,
        freshness_days: 180,
        description: "Academy staff pages identifying training authority and institutional fit."
      },

      post_staff_directories: {
        source_id: "post_staff_directories",
        type: SOURCE_TYPES.training,
        trust: SOURCE_TRUST.HIGH,
        freshness_days: 180,
        description: "POST staff and coordinator directories used for statewide training authority."
      },

      prosecutor_office_directories: {
        source_id: "prosecutor_office_directories",
        type: SOURCE_TYPES.directory,
        trust: SOURCE_TRUST.HIGH,
        freshness_days: 180,
        description: "DA/state attorney office directories used to identify prosecution-side training or gang-unit buyers."
      },

      sheriff_police_command_pages: {
        source_id: "sheriff_police_command_pages",
        type: SOURCE_TYPES.official,
        trust: SOURCE_TRUST.OFFICIAL,
        freshness_days: 180,
        description: "Command staff pages used for leadership, rank, and purchase-influence mapping."
      },

      public_records_portals: {
        source_id: "public_records_portals",
        type: SOURCE_TYPES.public_record,
        trust: SOURCE_TRUST.HIGH,
        freshness_days: 365,
        description: "Public records portals used for budgets, staff, purchases, meetings, or procurement context."
      },

      official_press_releases: {
        source_id: "official_press_releases",
        type: SOURCE_TYPES.official,
        trust: SOURCE_TRUST.OFFICIAL,
        freshness_days: 90,
        description: "Official announcements used for trigger events, unit activity, arrests, operations, and leadership changes."
      },

      local_government_rosters: {
        source_id: "local_government_rosters",
        type: SOURCE_TYPES.directory,
        trust: SOURCE_TRUST.HIGH,
        freshness_days: 180,
        description: "City/county rosters used to verify personnel, departments, and official contact paths."
      },

      crm_imported_lead_lists: {
        source_id: "crm_imported_lead_lists",
        type: SOURCE_TYPES.crm,
        trust: SOURCE_TRUST.INTERNAL,
        freshness_days: 180,
        description: "Client or operator-imported leads, requiring normalization and verification before scoring."
      },

      agency_domain_emails: {
        source_id: "agency_domain_emails",
        type: SOURCE_TYPES.verification,
        trust: SOURCE_TRUST.HIGH,
        freshness_days: 180,
        description: "Work-domain emails tied to the target organization."
      },

      direct_office_numbers: {
        source_id: "direct_office_numbers",
        type: SOURCE_TYPES.verification,
        trust: SOURCE_TRUST.HIGH,
        freshness_days: 180,
        description: "Direct phone lines tied to the individual, department, or office."
      },

      main_agency_phone_directories: {
        source_id: "main_agency_phone_directories",
        type: SOURCE_TYPES.directory,
        trust: SOURCE_TRUST.MEDIUM,
        freshness_days: 180,
        description: "Main directories used when direct phone is unavailable."
      },

      department_contact_pages: {
        source_id: "department_contact_pages",
        type: SOURCE_TYPES.official,
        trust: SOURCE_TRUST.HIGH,
        freshness_days: 180,
        description: "Official pages listing departmental contact points."
      },

      staff_pdf_directories: {
        source_id: "staff_pdf_directories",
        type: SOURCE_TYPES.directory,
        trust: SOURCE_TRUST.MEDIUM,
        freshness_days: 365,
        description: "PDF directories used for contact extraction and title verification."
      },

      public_meeting_agendas: {
        source_id: "public_meeting_agendas",
        type: SOURCE_TYPES.public_record,
        trust: SOURCE_TRUST.HIGH,
        freshness_days: 120,
        description: "Agendas used for budget approvals, vendor purchases, staffing, and training discussions."
      },

      conference_contact_pages: {
        source_id: "conference_contact_pages",
        type: SOURCE_TYPES.conference,
        trust: SOURCE_TRUST.MEDIUM,
        freshness_days: 365,
        description: "Conference pages that provide professional context and sometimes contact paths."
      },

      post_contact_pages: {
        source_id: "post_contact_pages",
        type: SOURCE_TYPES.training,
        trust: SOURCE_TRUST.HIGH,
        freshness_days: 180,
        description: "POST contact pages used to identify training/certification authority."
      },

      training_coordinator_pages: {
        source_id: "training_coordinator_pages",
        type: SOURCE_TYPES.training,
        trust: SOURCE_TRUST.HIGH,
        freshness_days: 180,
        description: "Agency pages naming training coordinators or training units."
      },

      procurement_contact_pages: {
        source_id: "procurement_contact_pages",
        type: SOURCE_TYPES.procurement,
        trust: SOURCE_TRUST.HIGH,
        freshness_days: 180,
        description: "Procurement contacts for purchasing, vendor onboarding, and purchase-order routing."
      },

      city_county_staff_lookup_tools: {
        source_id: "city_county_staff_lookup_tools",
        type: SOURCE_TYPES.directory,
        trust: SOURCE_TRUST.HIGH,
        freshness_days: 180,
        description: "Official lookup tools for city/county employees."
      },

      email_verification_tools: {
        source_id: "email_verification_tools",
        type: SOURCE_TYPES.verification,
        trust: SOURCE_TRUST.MEDIUM,
        freshness_days: 30,
        description: "Tools or checks used to validate email deliverability and domain status."
      },

      phone_validation_tools: {
        source_id: "phone_validation_tools",
        type: SOURCE_TYPES.verification,
        trust: SOURCE_TRUST.MEDIUM,
        freshness_days: 90,
        description: "Tools used to validate phone format, line type, and location match."
      },

      crm_enrichment_tools: {
        source_id: "crm_enrichment_tools",
        type: SOURCE_TYPES.crm,
        trust: SOURCE_TRUST.MEDIUM,
        freshness_days: 90,
        description: "Third-party enrichment used only as support unless verified by official sources."
      },

      manual_verified_contact_entries: {
        source_id: "manual_verified_contact_entries",
        type: SOURCE_TYPES.crm,
        trust: SOURCE_TRUST.INTERNAL,
        freshness_days: 365,
        description: "Manually confirmed contacts entered by operator or client."
      },

      local_news: {
        source_id: "local_news",
        type: SOURCE_TYPES.news,
        trust: SOURCE_TRUST.MEDIUM,
        freshness_days: 30,
        description: "Local reporting used for trigger events, incidents, and agency activity."
      },

      atf_press_releases: {
        source_id: "atf_press_releases",
        type: SOURCE_TYPES.official,
        trust: SOURCE_TRUST.OFFICIAL,
        freshness_days: 90,
        description: "ATF announcements for operations, indictments, raids, and task-force activity."
      },

      fbi_press_releases: {
        source_id: "fbi_press_releases",
        type: SOURCE_TYPES.official,
        trust: SOURCE_TRUST.OFFICIAL,
        freshness_days: 90,
        description: "FBI announcements related to violent crime, safe streets, gangs, or joint operations."
      },

      dea_press_releases: {
        source_id: "dea_press_releases",
        type: SOURCE_TYPES.official,
        trust: SOURCE_TRUST.OFFICIAL,
        freshness_days: 90,
        description: "DEA announcements related to drug trafficking and organized crime."
      },

      hsi_press_releases: {
        source_id: "hsi_press_releases",
        type: SOURCE_TYPES.official,
        trust: SOURCE_TRUST.OFFICIAL,
        freshness_days: 90,
        description: "HSI announcements related to organized crime, gangs, trafficking, and joint investigations."
      },

      prosecutor_announcements: {
        source_id: "prosecutor_announcements",
        type: SOURCE_TYPES.official,
        trust: SOURCE_TRUST.HIGH,
        freshness_days: 90,
        description: "DA or prosecutor announcements related to indictments, prosecutions, task forces, or gang cases."
      },

      recent_arrests: {
        source_id: "recent_arrests",
        type: SOURCE_TYPES.news,
        trust: SOURCE_TRUST.MEDIUM,
        freshness_days: 30,
        description: "Recent arrest reports or announcements used as operational trigger signals."
      },

      clubhouse_raids: {
        source_id: "clubhouse_raids",
        type: SOURCE_TYPES.news,
        trust: SOURCE_TRUST.MEDIUM,
        freshness_days: 30,
        description: "Raid-specific reporting or announcements tied to motorcycle clubhouses or gang operations."
      },

      gang_task_force_activity: {
        source_id: "gang_task_force_activity",
        type: SOURCE_TYPES.official,
        trust: SOURCE_TRUST.HIGH,
        freshness_days: 90,
        description: "Evidence of active gang task force work, operations, or staffing."
      },

      violent_crime_initiatives: {
        source_id: "violent_crime_initiatives",
        type: SOURCE_TYPES.official,
        trust: SOURCE_TRUST.HIGH,
        freshness_days: 180,
        description: "Public initiatives related to violent crime enforcement and prevention."
      },

      public_intelligence_bulletins: {
        source_id: "public_intelligence_bulletins",
        type: SOURCE_TYPES.public_record,
        trust: SOURCE_TRUST.MEDIUM,
        freshness_days: 180,
        description: "Publicly available intelligence bulletins or safety reports."
      },

      city_council_safety_updates: {
        source_id: "city_council_safety_updates",
        type: SOURCE_TYPES.public_record,
        trust: SOURCE_TRUST.HIGH,
        freshness_days: 180,
        description: "City-level updates on public safety priorities, funding, staffing, and enforcement."
      },

      county_commission_updates: {
        source_id: "county_commission_updates",
        type: SOURCE_TYPES.public_record,
        trust: SOURCE_TRUST.HIGH,
        freshness_days: 180,
        description: "County-level public safety, sheriff, budget, or staffing updates."
      },

      public_safety_annual_reports: {
        source_id: "public_safety_annual_reports",
        type: SOURCE_TYPES.public_record,
        trust: SOURCE_TRUST.HIGH,
        freshness_days: 730,
        description: "Annual reports that establish organizational fit, unit structure, crime priorities, and budget context."
      },

      recent_news_within_window: {
        source_id: "recent_news_within_window",
        type: SOURCE_TYPES.news,
        trust: SOURCE_TRUST.MEDIUM,
        freshness_days: 30,
        description: "Fresh news matched to active recency windows."
      },

      active_investigations: {
        source_id: "active_investigations",
        type: SOURCE_TYPES.official,
        trust: SOURCE_TRUST.HIGH,
        freshness_days: 90,
        description: "Publicly disclosed active or recent investigations."
      },

      recent_seizures: {
        source_id: "recent_seizures",
        type: SOURCE_TYPES.official,
        trust: SOURCE_TRUST.HIGH,
        freshness_days: 30,
        description: "Recent seizure reports involving weapons, drugs, money, or criminal enterprise assets."
      },

      recent_raids: {
        source_id: "recent_raids",
        type: SOURCE_TYPES.official,
        trust: SOURCE_TRUST.HIGH,
        freshness_days: 30,
        description: "Recent raids connected to enforcement or organized crime operations."
      },

      recent_violent_incidents: {
        source_id: "recent_violent_incidents",
        type: SOURCE_TYPES.news,
        trust: SOURCE_TRUST.MEDIUM,
        freshness_days: 30,
        description: "Recent violence that may trigger training, task force, or command attention."
      },

      task_force_announcements: {
        source_id: "task_force_announcements",
        type: SOURCE_TYPES.official,
        trust: SOURCE_TRUST.HIGH,
        freshness_days: 180,
        description: "Announcements of new or active task forces."
      },

      new_gang_enforcement_operations: {
        source_id: "new_gang_enforcement_operations",
        type: SOURCE_TYPES.official,
        trust: SOURCE_TRUST.HIGH,
        freshness_days: 90,
        description: "New enforcement operations targeting gangs, violent crime, or organized crime."
      },

      new_intelligence_initiatives: {
        source_id: "new_intelligence_initiatives",
        type: SOURCE_TYPES.official,
        trust: SOURCE_TRUST.HIGH,
        freshness_days: 180,
        description: "New intelligence-sharing, fusion, analyst, or organized crime initiatives."
      },

      prosecutor_indictments: {
        source_id: "prosecutor_indictments",
        type: SOURCE_TYPES.official,
        trust: SOURCE_TRUST.HIGH,
        freshness_days: 90,
        description: "Indictments that establish current prosecution pressure and operational relevance."
      },

      federal_local_joint_operations: {
        source_id: "federal_local_joint_operations",
        type: SOURCE_TYPES.official,
        trust: SOURCE_TRUST.HIGH,
        freshness_days: 180,
        description: "Joint federal-local operations that imply task force participation and training need."
      },

      budget_approvals: {
        source_id: "budget_approvals",
        type: SOURCE_TYPES.public_record,
        trust: SOURCE_TRUST.HIGH,
        freshness_days: 180,
        description: "Approved budgets, amendments, or agenda items tied to training, enforcement, or staffing."
      },

      training_announcements: {
        source_id: "training_announcements",
        type: SOURCE_TYPES.training,
        trust: SOURCE_TRUST.HIGH,
        freshness_days: 90,
        description: "Training events or course announcements indicating demand or purchase behavior."
      },

      personnel_promotions: {
        source_id: "personnel_promotions",
        type: SOURCE_TYPES.official,
        trust: SOURCE_TRUST.HIGH,
        freshness_days: 365,
        description: "Promotion announcements used to detect new decision-makers or changed authority."
      },

      job_postings: {
        source_id: "job_postings",
        type: SOURCE_TYPES.public_record,
        trust: SOURCE_TRUST.HIGH,
        freshness_days: 30,
        description: "Open or recent job postings indicating staffing expansion or unit need."
      },

      city_budgets: {
        source_id: "city_budgets",
        type: SOURCE_TYPES.public_record,
        trust: SOURCE_TRUST.HIGH,
        freshness_days: 730,
        description: "City budget documents used for funding and training capacity."
      },

      county_budgets: {
        source_id: "county_budgets",
        type: SOURCE_TYPES.public_record,
        trust: SOURCE_TRUST.HIGH,
        freshness_days: 730,
        description: "County budget documents used for sheriff and prosecutor purchase capacity."
      },

      police_budget_pdfs: {
        source_id: "police_budget_pdfs",
        type: SOURCE_TYPES.public_record,
        trust: SOURCE_TRUST.HIGH,
        freshness_days: 730,
        description: "Police budget PDFs used for training, staffing, equipment, and operating budget context."
      },

      sheriff_budget_pdfs: {
        source_id: "sheriff_budget_pdfs",
        type: SOURCE_TYPES.public_record,
        trust: SOURCE_TRUST.HIGH,
        freshness_days: 730,
        description: "Sheriff budget PDFs used for law enforcement funding capacity."
      },

      training_budget_line_items: {
        source_id: "training_budget_line_items",
        type: SOURCE_TYPES.public_record,
        trust: SOURCE_TRUST.HIGH,
        freshness_days: 730,
        description: "Specific budget lines indicating training/professional development capacity."
      },

      procurement_portals: {
        source_id: "procurement_portals",
        type: SOURCE_TYPES.procurement,
        trust: SOURCE_TRUST.HIGH,
        freshness_days: 365,
        description: "Procurement systems used for RFPs, awards, vendors, and purchasing pathways."
      },

      purchase_orders: {
        source_id: "purchase_orders",
        type: SOURCE_TYPES.procurement,
        trust: SOURCE_TRUST.HIGH,
        freshness_days: 730,
        description: "Purchase order records showing prior spending and vendor behavior."
      },

      grant_databases: {
        source_id: "grant_databases",
        type: SOURCE_TYPES.grant,
        trust: SOURCE_TRUST.HIGH,
        freshness_days: 365,
        description: "Grant databases identifying awards and funding purposes."
      },

      byrne_jag_grants: {
        source_id: "byrne_jag_grants",
        type: SOURCE_TYPES.grant,
        trust: SOURCE_TRUST.HIGH,
        freshness_days: 365,
        description: "Byrne JAG funding relevant to law enforcement training and public safety initiatives."
      },

      cops_grants: {
        source_id: "cops_grants",
        type: SOURCE_TYPES.grant,
        trust: SOURCE_TRUST.HIGH,
        freshness_days: 365,
        description: "COPS grant awards relevant to policing, training, and public safety capacity."
      },

      state_public_safety_grants: {
        source_id: "state_public_safety_grants",
        type: SOURCE_TYPES.grant,
        trust: SOURCE_TRUST.HIGH,
        freshness_days: 365,
        description: "State-level public safety grants relevant to training or gang enforcement."
      },

      meeting_minutes_approving_purchases: {
        source_id: "meeting_minutes_approving_purchases",
        type: SOURCE_TYPES.public_record,
        trust: SOURCE_TRUST.HIGH,
        freshness_days: 365,
        description: "Public minutes showing approvals for purchases, contracts, training, or vendor spend."
      },

      vendor_payment_records: {
        source_id: "vendor_payment_records",
        type: SOURCE_TYPES.procurement,
        trust: SOURCE_TRUST.HIGH,
        freshness_days: 730,
        description: "Payment records that show previous vendor spend and buying behavior."
      },

      fiscal_year_plans: {
        source_id: "fiscal_year_plans",
        type: SOURCE_TYPES.public_record,
        trust: SOURCE_TRUST.HIGH,
        freshness_days: 730,
        description: "Fiscal plans indicating budget windows and timing."
      },

      public_rfps: {
        source_id: "public_rfps",
        type: SOURCE_TYPES.procurement,
        trust: SOURCE_TRUST.HIGH,
        freshness_days: 365,
        description: "Requests for proposals indicating active purchasing need."
      },

      email_opens: {
        source_id: "email_opens",
        type: SOURCE_TYPES.feedback,
        trust: SOURCE_TRUST.FEEDBACK,
        freshness_days: 90,
        description: "Outreach engagement feedback."
      },

      email_replies: {
        source_id: "email_replies",
        type: SOURCE_TYPES.feedback,
        trust: SOURCE_TRUST.FEEDBACK,
        freshness_days: 365,
        description: "Reply behavior used to improve future scoring."
      },

      calls_completed: {
        source_id: "calls_completed",
        type: SOURCE_TYPES.feedback,
        trust: SOURCE_TRUST.FEEDBACK,
        freshness_days: 365,
        description: "Completed call outcomes."
      },

      meetings_booked: {
        source_id: "meetings_booked",
        type: SOURCE_TYPES.feedback,
        trust: SOURCE_TRUST.FEEDBACK,
        freshness_days: 365,
        description: "Booked meetings used as strong positive feedback."
      },

      demos_scheduled: {
        source_id: "demos_scheduled",
        type: SOURCE_TYPES.feedback,
        trust: SOURCE_TRUST.FEEDBACK,
        freshness_days: 365,
        description: "Demo interest used to refine targeting."
      },

      course_purchases: {
        source_id: "course_purchases",
        type: SOURCE_TYPES.feedback,
        trust: SOURCE_TRUST.FEEDBACK,
        freshness_days: 1095,
        description: "Closed-won purchases used as strongest model feedback."
      },

      purchase_order_status: {
        source_id: "purchase_order_status",
        type: SOURCE_TYPES.feedback,
        trust: SOURCE_TRUST.FEEDBACK,
        freshness_days: 365,
        description: "Procurement stage feedback."
      },

      lost_deal_reasons: {
        source_id: "lost_deal_reasons",
        type: SOURCE_TYPES.feedback,
        trust: SOURCE_TRUST.FEEDBACK,
        freshness_days: 730,
        description: "Closed-lost reasons used to downgrade similar future patterns."
      },

      bad_contact_flags: {
        source_id: "bad_contact_flags",
        type: SOURCE_TYPES.feedback,
        trust: SOURCE_TRUST.FEEDBACK,
        freshness_days: 365,
        description: "Invalid contact feedback used for suppression and contact-quality scoring."
      },

      bounce_rates: {
        source_id: "bounce_rates",
        type: SOURCE_TYPES.feedback,
        trust: SOURCE_TRUST.FEEDBACK,
        freshness_days: 180,
        description: "Email delivery failures used to reduce contact confidence."
      },

      referral_notes: {
        source_id: "referral_notes",
        type: SOURCE_TYPES.feedback,
        trust: SOURCE_TRUST.FEEDBACK,
        freshness_days: 730,
        description: "Referral notes from contacts or client team."
      },

      expansion_opportunities: {
        source_id: "expansion_opportunities",
        type: SOURCE_TYPES.feedback,
        trust: SOURCE_TRUST.FEEDBACK,
        freshness_days: 730,
        description: "Known cross-sell or multi-seat expansion signals."
      },

      renewal_potential: {
        source_id: "renewal_potential",
        type: SOURCE_TYPES.feedback,
        trust: SOURCE_TRUST.FEEDBACK,
        freshness_days: 1095,
        description: "Likelihood of repeat purchase or ongoing license renewal."
      },

      sales_team_notes: {
        source_id: "sales_team_notes",
        type: SOURCE_TYPES.feedback,
        trust: SOURCE_TRUST.INTERNAL,
        freshness_days: 365,
        description: "Sales/operator notes used to improve lead context and future prioritization."
      },

      crm_close_data: {
        source_id: "crm_close_data",
        type: SOURCE_TYPES.feedback,
        trust: SOURCE_TRUST.FEEDBACK,
        freshness_days: 1095,
        description: "CRM win/loss and deal-stage data."
      }
    })
  });

  function getSource(sourceId) {
    return CATALOG.sources[sourceId] || null;
  }

  function listSources() {
    return Object.values(CATALOG.sources);
  }

  function getSourcesByType(type) {
    return listSources().filter((source) => source.type === type);
  }

  function getTrust(sourceId) {
    return Number(getSource(sourceId)?.trust || 0);
  }

  function validateCatalog() {
    const sourceIds = Object.keys(CATALOG.sources);
    const unique = new Set(sourceIds);

    const checks = {
      has_sources: sourceIds.length > 0,
      unique_source_ids: unique.size === sourceIds.length,
      every_source_has_type: sourceIds.every((id) => Boolean(CATALOG.sources[id].type)),
      every_source_has_trust: sourceIds.every((id) => Number.isFinite(Number(CATALOG.sources[id].trust))),
      every_source_has_freshness: sourceIds.every((id) => Number.isFinite(Number(CATALOG.sources[id].freshness_days)))
    };

    return {
      system: "Umbra Nexus Source Catalog",
      version: CATALOG.version,
      pass: Object.values(checks).every(Boolean),
      checks,
      source_count: sourceIds.length,
      timestamp: new Date().toISOString()
    };
  }

  window.UmbraIntel.layers.sourceCatalog = CATALOG;
  window.UmbraIntel.layers.sourceCatalogApi = Object.freeze({
    getSource,
    listSources,
    getSourcesByType,
    getTrust,
    validateCatalog
  });

  console.info("[source_catalog.v1] Ready.", validateCatalog());
})();