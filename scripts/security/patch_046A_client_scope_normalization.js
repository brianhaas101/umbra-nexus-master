const fs = require("fs");
const path = require("path");

const files = [
  "public/data/clients/black_dragon/books/operational/black_dragon_books_operational_targets.v1.json",
  "public/data/clients/black_dragon/books/queue/outreach_ready_queue.v1.json",
  "public/data/clients/black_dragon/books/adaptive_priority/adaptive_priority_index.v1.json",
  "public/data/clients/black_dragon/books/kpi/book_operational_kpis.v1.json",
  "public/data/clients/black_dragon/books/map/layers/book_propagation_map_layer.v1.json",
  "public/data/clients/black_dragon/books/map/runtime/book_citymap_nodes.v1.json",
  "public/data/clients/black_dragon/books/map/clusters/book_regional_influence_clusters.v1.json",
  "public/data/clients/black_dragon/books/map/paths/book_propagation_paths.v1.json"
];

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.resolve(file), "utf8"));
}

function writeJson(file, data) {
  fs.writeFileSync(path.resolve(file), JSON.stringify(data, null, 2));
}

function stampRecord(obj) {
  if (obj && typeof obj === "object") {
    obj.client_id = "black_dragon";
    obj.module = obj.module || "book_sales_v2";
  }
  return obj;
}

const report = [];

for (const file of files) {
  const data = readJson(file);
  let changed = 0;

  if (Array.isArray(data)) {
    for (const row of data) {
      if (row.client_id !== "black_dragon") changed++;
      stampRecord(row);
    }
  }

  if (Array.isArray(data.targets)) {
    for (const row of data.targets) {
      if (row.client_id !== "black_dragon") changed++;
      stampRecord(row);
    }
  }

  if (Array.isArray(data.all_queue_items)) {
    for (const row of data.all_queue_items) {
      if (row.client_id !== "black_dragon") changed++;
      stampRecord(row);
    }
  }

  if (Array.isArray(data.ready_queue)) {
    for (const row of data.ready_queue) {
      if (row.client_id !== "black_dragon") changed++;
      stampRecord(row);
    }
  }

  if (Array.isArray(data.features)) {
    for (const feature of data.features) {
      if (feature.properties) {
        if (feature.properties.client_id !== "black_dragon") changed++;
        stampRecord(feature.properties);
      }
    }

    if (data.metadata) {
      data.metadata.client_id = "black_dragon";
      data.metadata.module = data.metadata.module || "book_sales_v2";
    }
  }

  if (Array.isArray(data.nodes)) {
    for (const node of data.nodes) {
      if (node.client_id !== "black_dragon") changed++;
      stampRecord(node);
    }
  }

  if (Array.isArray(data.clusters)) {
    for (const cluster of data.clusters) {
      if (cluster.client_id !== "black_dragon") changed++;
      stampRecord(cluster);
    }
  }

  if (Array.isArray(data.paths)) {
    for (const p of data.paths) {
      if (p.client_id !== "black_dragon") changed++;
      stampRecord(p);
    }
  }

  if (data.client_id !== undefined) {
    data.client_id = "black_dragon";
  }

  if (data.module !== undefined) {
    data.module = "book_sales_v2";
  }

  writeJson(file, data);

  report.push({
    file,
    normalized_records: changed
  });
}

const audit = {
  version: "black_dragon_patch_046A_client_scope_normalization_v1",
  generated_at: new Date().toISOString(),
  report
};

fs.writeFileSync(
  path.resolve("public/data/clients/black_dragon/books/audits/patch_046A_client_scope_normalization.json"),
  JSON.stringify(audit, null, 2)
);

console.log(JSON.stringify(audit, null, 2));
