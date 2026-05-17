const fs = require("fs");
const path = require("path");

const leadsFile = path.resolve(
  "C:/Dev/Nexus_MASTER/public/data/clients/black_dragon/black_dragon_leads_master.json"
);

const outFile = path.resolve(
  "C:/Dev/Nexus_MASTER/public/data/clients/black_dragon/black_dragon_city_index.json"
);

const leads = JSON.parse(fs.readFileSync(leadsFile, "utf8"));
const cities = {};

for (const lead of leads) {
  if (!lead.city_id) continue;

  if (!cities[lead.city_id]) {
    cities[lead.city_id] = {
      city_id: lead.city_id,
      name: lead.city || "Unknown",
      state: lead.state || "",
      country: lead.country || "US",
      lat: lead.lat ?? null,
      lon: lead.lon ?? null,
      total_entities: 0,
      hot: 0,
      warm: 0,
      cold: 0,
      entities: []
    };
  }

  const tier = String(lead.tier || "COLD").toLowerCase();

  cities[lead.city_id].total_entities += 1;
  if (tier === "hot") cities[lead.city_id].hot += 1;
  else if (tier === "warm") cities[lead.city_id].warm += 1;
  else cities[lead.city_id].cold += 1;

  cities[lead.city_id].entities.push({
    entity_id: lead.entity_id,
    agency_name: lead.agency_name,
    agency_type: lead.agency_type,
    state: lead.state,
    tier: lead.tier || "COLD",
    score: lead.umbraScore || lead.scores?.umbraScore || 0,
    contact_url: lead.contact_url || "",
    source_url: lead.source_url || ""
  });
}

const output = {
  client_id: "black_dragon_omg_cert_v1",
  generated_at: new Date().toISOString(),
  total_cities: Object.keys(cities).length,
  total_entities: leads.length,
  cities: Object.values(cities).sort((a, b) => {
    if (b.hot !== a.hot) return b.hot - a.hot;
    if (b.warm !== a.warm) return b.warm - a.warm;
    return b.total_entities - a.total_entities;
  })
};

fs.writeFileSync(outFile, JSON.stringify(output, null, 2));

console.log("Black Dragon city index built.");
console.log("Cities:", output.total_cities);
console.log("Entities:", output.total_entities);
console.log("Output:", outFile);