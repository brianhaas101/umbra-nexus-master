const fs = require("fs");
const path = require("path");

const rawTargetsPath = path.resolve(
  "public/data/clients/black_dragon/books/public_intake/raw/public_book_targets_raw.v1.json"
);

const operationalPath = path.resolve(
  "public/data/clients/black_dragon/books/operational/black_dragon_books_operational_targets.v1.json"
);

const outputPath = path.resolve(
  "public/data/clients/black_dragon/books/contacts/raw/public_contact_paths_raw.v1.json"
);

const rawTargets = JSON.parse(fs.readFileSync(rawTargetsPath, "utf8"));
const operational = JSON.parse(fs.readFileSync(operationalPath, "utf8"));

function clean(v) {
  return String(v || "").trim().toUpperCase();
}

function findOperational(raw) {
  return operational.find(op =>
    clean(op.organization_name) === clean(raw.organization_name)
  );
}

function contactTypeFromSource(sourceType) {
  if (sourceType === "PUBLIC_FACEBOOK_PAGE") return "PUBLIC_FACEBOOK_PAGE";
  if (sourceType === "PUBLIC_INSTAGRAM_PAGE") return "PUBLIC_INSTAGRAM_PAGE";
  if (sourceType === "PUBLIC_YOUTUBE_CHANNEL") return "PUBLIC_YOUTUBE_CHANNEL";
  if (sourceType === "PUBLIC_PODCAST") return "PUBLIC_PODCAST_PAGE";
  if (sourceType === "PUBLIC_EVENT_PAGE") return "PUBLIC_EVENT_PAGE";
  return "PUBLIC_WEBSITE";
}

const contactRows = [];

for (const raw of rawTargets) {
  const op = findOperational(raw);

  if (!op) continue;

  const paths = [];

  if (raw.source_url) {
    paths.push({
      contact_type: contactTypeFromSource(raw.source_type),
      value: raw.source_url,
      source_url: raw.source_url,
      visibility: "PUBLIC",
      notes: "Public source route from approved Black Dragon book target intake."
    });
  }

  if (raw.contact_method) {
    const cm = String(raw.contact_method).trim();

    if (cm.includes("@")) {
      paths.push({
        contact_type: "PUBLIC_EMAIL",
        value: cm,
        source_url: raw.source_url || null,
        visibility: "PUBLIC",
        notes: "Public email supplied through approved intake."
      });
    }

    else if (/^\+?[0-9().\-\s]{7,}$/.test(cm)) {
      paths.push({
        contact_type: "PUBLIC_PHONE",
        value: cm,
        source_url: raw.source_url || null,
        visibility: "PUBLIC",
        notes: "Public phone supplied through approved intake."
      });
    }

    else {
      paths.push({
        contact_type: "PUBLIC_CONTACT_FORM",
        value: cm,
        source_url: raw.source_url || null,
        visibility: "PUBLIC",
        notes: "Public contact route supplied through approved intake."
      });
    }
  }

  contactRows.push({
    entity_id: op.entity_id,
    organization_name: op.organization_name,
    contact_paths: paths
  });
}

fs.writeFileSync(outputPath, JSON.stringify(contactRows, null, 2));

console.log(JSON.stringify({
  status: "REAL_PUBLIC_CONTACT_PATHS_POPULATED",
  raw_targets: rawTargets.length,
  contact_rows: contactRows.length,
  total_contact_paths: contactRows.reduce((acc, r) => acc + r.contact_paths.length, 0),
  output: outputPath
}, null, 2));
