(function () {
  const KEY = "umbra_black_dragon_activity_v1";

  function read() {
    try { return JSON.parse(localStorage.getItem(KEY) || "[]"); }
    catch { return []; }
  }

  function write(events) {
    localStorage.setItem(KEY, JSON.stringify(events.slice(-1000)));
  }

  function event(type, detail = {}) {
    const events = read();
    events.push({
      event_id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + "_" + Math.random(),
      event_time: new Date().toISOString(),
      client_id: "black_dragon",
      user_id: localStorage.getItem("umbra_active_user_id") || "client_operator",
      event_type: type,
      lead_id: detail.lead_id || detail.entity_id || "",
      city_id: detail.city_id || "",
      stage: detail.stage || "",
      estimated_value: Number(detail.estimated_value || 0),
      closed_value: Number(detail.closed_value || 0),
      note: String(detail.note || "")
    });
    write(events);
    console.log("[BlackDragonActivity]", type, detail);
  }

  function metrics() {
    const events = read();
    const count = (t) => events.filter(e => e.event_type === t).length;
    const closed = events.reduce((sum, e) => sum + Number(e.closed_value || 0), 0);
    const contacted = count("MARK_CONTACTED");
    const converted = count("MARK_CONVERTED");
    return {
      events: events.length,
      leads_viewed: count("VIEW_LEAD"),
      dossiers_opened: count("OPEN_DOSSIER"),
      contacted,
      replied: count("MARK_REPLIED"),
      booked: count("MARK_BOOKED"),
      converted,
      closed_revenue: closed,
      conversion_rate: contacted ? converted / contacted : 0
    };
  }

  window.BlackDragonActivity = {
    event,
    metrics,
    export: read,
    clear: function () { localStorage.removeItem(KEY); }
  };

  document.addEventListener("click", function (e) {
    const target = e.target;
    const text = String(target?.innerText || target?.textContent || "").trim().toLowerCase();

    if (text.includes("dossier")) event("OPEN_DOSSIER", {});
    if (text.includes("contact")) event("MARK_CONTACTED", {});
    if (text.includes("reply")) event("MARK_REPLIED", {});
    if (text.includes("book")) event("MARK_BOOKED", {});
    if (text.includes("convert") || text.includes("sold")) event("MARK_CONVERTED", {});
  }, true);

  console.log("[BlackDragonActivity] local activity tracker ready");
})();
