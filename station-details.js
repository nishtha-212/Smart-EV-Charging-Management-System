/* station-details.js - station information, chargers, availability and rates */
startPage(function () {
  const id = new URLSearchParams(location.search).get("id");
  const s = station(id);
  if (!s) {
    $("#view").innerHTML = head("Station not found", "") + `<div class="card">${empty("This station does not exist", "It may have been removed.", `<a class="btn" href="stations.html">Back to stations</a>`)}</div>`;
    return;
  }
  const a = stationAvail(s.id), cs = chargersOf(s.id);
  $("#view").innerHTML = head(esc(s.name), esc(s.address), `<a class="btn" href="stations.html">Back</a><a class="btn primary" href="book.html?station=${s.id}">Book a slot</a>`) + `
  <div class="card" style="margin-bottom:16px"><div class="row between"><div><b>${a.free} of ${a.total}</b> chargers available now</div><div style="min-width:160px;flex:1;max-width:260px" class="meter" aria-hidden="true"><span style="width:${a.total ? a.free / a.total * 100 : 0}%"></span></div></div></div>
  ${cs.length ? `<div class="tbl-wrap"><table><thead><tr><th>Charger</th><th>Type</th><th>Power</th><th>Rate</th><th>Status</th></tr></thead><tbody>
  ${cs.map(c => `<tr><td><b>${esc(c.name)}</b></td><td>${c.type}</td><td>${c.power} kW</td><td>${inr(c.rate)}/kWh</td><td>${statusBadge(c.status)}</td></tr>`).join("")}</tbody></table></div>`
    : `<div class="card">${empty("No chargers yet", "This station has no chargers listed.")}</div>`}`;
});
