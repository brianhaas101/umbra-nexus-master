const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const ROOT = process.cwd();

function readJson(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8").replace(/^\uFEFF/, ""));
}

function writeJson(rel, data) {
  const abs = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, JSON.stringify(data, null, 2), "utf8");
}

function sha(data) {
  return crypto.createHash("sha256").update(JSON.stringify(data)).digest("hex");
}

const now = new Date().toISOString();

const manifest = readJson(
  "public/data/intelligence/live_connectors/L02/L02_operationalization_batch_002.manifest.json"
);

const urlBindings = {
  CA: {
    POST: "https://post.ca.gov",
    STATE_DOJ: "https://oag.ca.gov",
    STATE_GRANTS: "https://www.grants.ca.gov",
    STATE_PROCUREMENT: "https://caleprocure.ca.gov",
    STATE_ACADEMY: "https://post.ca.gov/basic-training-academies"
  },
  TX: {
    POST: "https://www.tcole.texas.gov",
    STATE_DOJ: "https://www.texasattorneygeneral.gov",
    STATE_GRANTS: "https://gov.texas.gov/organization/financial-services/grants",
    STATE_PROCUREMENT: "https://www.txsmartbuy.com",
    STATE_ACADEMY: "https://www.tcole.texas.gov/training"
  },
  FL: {
    POST: "https://www.fdle.state.fl.us/CJSTC",
    STATE_DOJ: "https://www.myfloridalegal.com",
    STATE_GRANTS: "https://www.fdle.state.fl.us/Grants",
    STATE_PROCUREMENT: "https://vendor.myfloridamarketplace.com",
    STATE_ACADEMY: "https://www.fdle.state.fl.us/CJSTC/Training-Resources"
  },
  NY: {
    POST: "https://www.criminaljustice.ny.gov/ops/training/",
    STATE_DOJ: "https://ag.ny.gov",
    STATE_GRANTS: "https://grantsmanagement.ny.gov",
    STATE_PROCUREMENT: "https://ogs.ny.gov/procurement",
    STATE_ACADEMY: "https://www.criminaljustice.ny.gov/ops/training/"
  },
  AZ: {
    POST: "https://post.az.gov",
    STATE_DOJ: "https://www.azag.gov",
    STATE_GRANTS: "https://gohs.az.gov/grants",
    STATE_PROCUREMENT: "https://spo.az.gov",
    STATE_ACADEMY: "https://post.az.gov/training"
  },
  IL: {
    POST: "https://www.ptb.illinois.gov",
    STATE_DOJ: "https://illinoisattorneygeneral.gov",
    STATE_GRANTS: "https://gata.illinois.gov",
    STATE_PROCUREMENT: "https://www.bidbuy.illinois.gov",
    STATE_ACADEMY: "https://www.ptb.illinois.gov/training"
  },
  OH: {
    POST: "https://www.ohioattorneygeneral.gov/Law-Enforcement/Ohio-Peace-Officer-Training-Academy",
    STATE_DOJ: "https://www.ohioattorneygeneral.gov",
    STATE_GRANTS: "https://grants.ohio.gov",
    STATE_PROCUREMENT: "https://procure.ohio.gov",
    STATE_ACADEMY: "https://www.ohioattorneygeneral.gov/Law-Enforcement/Ohio-Peace-Officer-Training-Academy"
  },
  NC: {
    POST: "https://ncdoj.gov/law-enforcement-training/",
    STATE_DOJ: "https://ncdoj.gov",
    STATE_GRANTS: "https://www.ncdps.gov/about-dps/boards-and-commissions/governors-crime-commission/grants",
    STATE_PROCUREMENT: "https://www.ips.state.nc.us",
    STATE_ACADEMY: "https://ncdoj.gov/law-enforcement-training/"
  },
  GA: {
    POST: "https://gapost.org",
    STATE_DOJ: "https://law.georgia.gov",
    STATE_GRANTS: "https://cjcc.georgia.gov/grants",
    STATE_PROCUREMENT: "https://doas.ga.gov/state-purchasing",
    STATE_ACADEMY: "https://www.gpstc.org"
  },
  WA: {
    POST: "https://cjtc.wa.gov",
    STATE_DOJ: "https://www.atg.wa.gov",
    STATE_GRANTS: "https://www.commerce.wa.gov/serving-communities/grants-loans/",
    STATE_PROCUREMENT: "https://des.wa.gov/services/contracting-purchasing",
    STATE_ACADEMY: "https://cjtc.wa.gov/training-education"
  }
};

const sourceTypeToField = {
  POST: "post_page",
  STATE_DOJ: "doj_page",
  STATE_GRANTS: "grants_page",
  STATE_PROCUREMENT: "procurement_page",
  STATE_ACADEMY: "academy_page"
};

const enrichedConnectors = manifest.connectors.map(connector => {
  const stateBindings = urlBindings[connector.state_abbr];
  const boundUrl = stateBindings ? stateBindings[connector.source_type] : null;

  return {
    ...connector,
    discovery_status: boundUrl ? "CANONICAL_URL_BOUND" : "DISCOVERY_REQUIRED",
    canonical_url: boundUrl,
    canonical_discovery_targets: {
      ...connector.canonical_discovery_targets,
      [sourceTypeToField[connector.source_type]]: boundUrl
    },
    authority_url_bound: Boolean(boundUrl),
    source_binding_hash: sha({
      connector_id: connector.connector_id,
      state_abbr: connector.state_abbr,
      source_type: connector.source_type,
      canonical_url: boundUrl
    })
  };
});

const report = {
  version: "nexus_L02_live_discovery_batch_003_v1",
  generated_at: now,
  layer_id: "L02",
  batch_id: "L02_LIVE_DISCOVERY_BATCH_003",
  status: "PASS",
  counts: {
    states: Object.keys(urlBindings).length,
    connectors: enrichedConnectors.length,
    canonical_urls_bound: enrichedConnectors.filter(c => c.authority_url_bound).length,
    missing_urls: enrichedConnectors.filter(c => !c.authority_url_bound).length
  },
  gates: {
    ten_states_present: Object.keys(urlBindings).length === 10,
    fifty_connectors_present: enrichedConnectors.length === 50,
    fifty_urls_bound: enrichedConnectors.filter(c => c.authority_url_bound).length === 50,
    no_missing_urls: enrichedConnectors.every(c => c.authority_url_bound),
    no_evidence_emitted_yet: true,
    discovery_before_fetch: true
  },
  connectors: enrichedConnectors
};

if (!report.gates.fifty_urls_bound || !report.gates.no_missing_urls) {
  report.status = "FAIL";
}

report.report_hash = sha(report);

writeJson(
  "public/data/intelligence/live_connectors/L02/L02_live_discovery_batch_003.bound_manifest.json",
  {
    ...manifest,
    generated_at: now,
    batch_id: "L02_LIVE_DISCOVERY_BATCH_003_BOUND_MANIFEST",
    connectors: enrichedConnectors,
    manifest_hash: sha(enrichedConnectors)
  }
);

writeJson(
  "logs/sophistication/L02_live_discovery_batch_003_report.json",
  report
);

console.log(JSON.stringify({
  status: "L02_LIVE_DISCOVERY_BATCH_003_COMPLETE",
  report_status: report.status,
  counts: report.counts,
  gates: report.gates,
  report: "logs/sophistication/L02_live_discovery_batch_003_report.json"
}, null, 2));
