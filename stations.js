/* stations.js - Find Charging Stations: search and filters */
startPage(function () {
  const f = {q: "", type: state.prefs.defaultConnector || "Any", avail: "all"};

  function cards() {
    const q = f.q.trim().toLowerCase();
    const list = state.stations.filter(s => {
      const cs = chargersOf(s.id);
      if (q && !(s.name + " " + s.address).toLowerCase().includes(q)) return false;
      if (f.type !== "Any" && !cs.some(c => c.type === f.type)) return false;
      if (f.avail === "free" && !cs.some(c => c.status === "available" && (f.type === "Any" || c.type === f.type))) return false;
      return true;
    });
    if (!list.length) return empty("No stations match", "Try a different search or clear the filters.", `<button class="btn" data-act="clear-filters">Clear filters</button>`);
    return `<div class="grid gauto">${list.map(s => {
      const a = stationAvail(s.id), types = [...new Set(chargersOf(s.id).map(c => c.type))], rates = chargersOf(s.id).map(c => c.rate);
      return `<div class="card stack"><div><h2>${esc(s.name)}</h2><p class="muted">${esc(s.address)}</p></div>
        <div class="row">${types.map(t => `<span class="badge">${t}</span>`).join("")}</div>
        <div class="row between"><span class="badge ${a.free ? "ok" : "warn"}"><span class="dot"></span>${a.free} of ${a.total} available</span><span class="muted">${rates.length ? inr(Math.min(...rates)) + " – " + inr(Math.max(...rates)) + "/kWh" : "No chargers"}</span></div>
        <div class="row"><a class="btn" href="station-details.html?id=${s.id}">View details</a><a class="btn primary" href="book.html?station=${s.id}">Book</a></div></div>`;
    }).join("")}</div>`;
  }

  function render() {
    $("#view").innerHTML = head("Find charging stations", "Search by name or area and filter by connector type.") + `
    <div class="card" style="margin-bottom:16px"><div class="grid g3">
      <div class="field"><label for="fq">Search</label><input class="input" id="fq" type="search" placeholder="Station name or area" value="${esc(f.q)}"></div>
      <div class="field"><label for="ft">Connector type</label><select class="input" id="ft"><option>Any</option>${CONNECTORS.map(c => `<option ${f.type === c ? "selected" : ""}>${c}</option>`).join("")}</select></div>
      <div class="field"><label for="fa">Availability</label><select class="input" id="fa"><option value="all" ${f.avail === "all" ? "selected" : ""}>All stations</option><option value="free" ${f.avail === "free" ? "selected" : ""}>Has available chargers</option></select></div>
    </div></div><div id="results">${cards()}</div>`;
  }
  render();

  document.addEventListener("input", e => { if (e.target.id === "fq") { f.q = e.target.value; $("#results").innerHTML = cards(); } });
  document.addEventListener("change", e => {
    if (e.target.id === "ft") { f.type = e.target.value; $("#results").innerHTML = cards(); }
    if (e.target.id === "fa") { f.avail = e.target.value; $("#results").innerHTML = cards(); }
  });
  document.addEventListener("click", e => {
    if (e.target.closest('[data-act="clear-filters"]')) { f.q = ""; f.type = "Any"; f.avail = "all"; render(); }
  });
});
