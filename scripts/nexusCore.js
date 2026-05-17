// UMBRA NEXUS — CORE ENGINE (non-module version)
// Exposes a global NexusCore object that scene.js can use.

const NexusCore = {
  configs: {
    scoring: null,
    appearance: null,
    categories: null,
    labels: null,
    security: null,
  },

  async init() {
    try {
      this.configs.scoring = await this.loadJSON("/config/scoring_rules.json");
      this.configs.appearance = await this.loadJSON("/config/globe_visualization.json");
      this.configs.categories = await this.loadJSON("/config/lead_schema.json");
      this.configs.labels = await this.loadJSON("/config/ui_filters.json");
      // founder_scoring_extension.json is optional, can be merged later

      console.log("[UMBRA NEXUS] Core configs loaded.");
      return true;
    } catch (err) {
      console.error("[NEXUS CORE] Failed to initialize:", err);
      return false;
    }
  },

  async loadJSON(path) {
    const response = await fetch(path);
    if (!response.ok) throw new Error(`Failed to load ${path}`);
    return response.json();
  },

  // ---------- SCORING ----------
  scoreLead(lead) {
    if (!this.configs.scoring) return 0;

    let score = 0;
    const rules = this.configs.scoring.rules || [];

    for (const rule of rules) {
      const fieldValue = this.getNestedField(lead, rule.field);
      if (fieldValue == null) continue;

      const valueStr = String(fieldValue).toLowerCase();

      if (rule.contains) {
        for (const keyword of rule.contains) {
          if (valueStr.includes(String(keyword).toLowerCase())) {
            score += rule.points;
          }
        }
      }

      if (rule.equals) {
        if (valueStr === String(rule.equals).toLowerCase()) {
          score += rule.points;
        }
      }

      if (rule.range) {
        const num = Number(fieldValue);
        if (!Number.isNaN(num)) {
          const { min, max, points } = rule.range;
          if ((min == null || num >= min) && (max == null || num <= max)) {
            score += points;
          }
        }
      }
    }

    return score;
  },

  // ---------- LABELS / FILTERS ----------
  getLabel(score) {
    if (!this.configs.labels) return "Uncategorized";

    const filters = this.configs.labels.scoreBands || [];
    for (const band of filters) {
      if (score >= band.min && score <= band.max) {
        return band.label;
      }
    }

    return "Uncategorized";
  },

  // ---------- APPEARANCE RULES ----------
  applyAppearanceToMarker(markerMesh, categoryKey) {
    if (!this.configs.appearance) return;

    const rules = this.configs.appearance.categories?.[categoryKey];
    if (!rules || !markerMesh.material) return;

    if (rules.color) markerMesh.material.color.set(rules.color);
    if (rules.emissive) markerMesh.material.emissive.set(rules.emissive);
    if (typeof rules.glow === "number") {
      markerMesh.material.emissiveIntensity = rules.glow;
    }
  },

  // ---------- UTIL ----------
  getNestedField(obj, path) {
    if (!path) return undefined;
    const parts = path.split(".");
    let cur = obj;
    for (const part of parts) {
      if (cur == null) return undefined;
      cur = cur[part];
    }
    return cur;
  }
};

// Expose globally (important for non-module setup)
window.NexusCore = NexusCore;