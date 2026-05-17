import fs from "node:fs";

const file = "C:/UmbraNexus/public/intelligence/layers/L01_federal_intelligence/schemas/source_acquisition_resolver.json";
const resolver = JSON.parse(fs.readFileSync(file, "utf8").replace(/^\uFEFF/, ""));

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(resolver.resolver_id === "L01_source_acquisition_resolver", "Bad resolver id.");
assert(Object.keys(resolver.source_resolution).length === 15, "Resolver must cover 15 L01 sources.");
assert(resolver.rules.no_parser_promotion_without_pass_token === true, "Pass-token rule missing.");
assert(resolver.rules.no_manual_status_promotion === true, "Manual promotion block missing.");
assert(resolver.rules.no_black_dragon_coupling === true, "Black Dragon block missing.");

console.log("L01_SOURCE_ACQUISITION_RESOLVER_PASS");
