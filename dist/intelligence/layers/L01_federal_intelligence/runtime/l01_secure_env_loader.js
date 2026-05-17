import fs from "node:fs";
import path from "node:path";

const ROOT = "C:/Dev/Nexus_MASTER";
const ENV_PATH = path.join(ROOT, "secure", ".env");

export function loadSecureEnv() {
  if (!fs.existsSync(ENV_PATH)) {
    return Object.freeze({
      loaded: false,
      path: ENV_PATH
    });
  }

  const lines = fs.readFileSync(ENV_PATH, "utf8")
    .split(/\r?\n/)
    .filter(Boolean)
    .filter(line => !line.trim().startsWith("#"));

  for (const line of lines) {
    const idx = line.indexOf("=");

    if (idx === -1) continue;

    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }

  return Object.freeze({
    loaded: true,
    keys: Object.freeze({
      SAM_GOV_API_KEY: Boolean(process.env.SAM_GOV_API_KEY),
      API_DATA_GOV_KEY: Boolean(process.env.API_DATA_GOV_KEY),
      FBI_CDE_API_KEY: Boolean(process.env.FBI_CDE_API_KEY)
    })
  });
}
