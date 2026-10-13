/* operator-dashboard.js - station operations and charger availability */
startPage(function () {
  const mine = myStations(), ids = mine.map(s => s.id), cs = state.chargers.filter(c => ids.includes(c.stationId));
  const today = state.bookings.filter(b => ids.includes(b.stationId) && b.date === addDays(0) && b.status === "upcoming").length;
  const n = k => cs.filter(c => c.status === k).length;
  $("#view").innerHTML = head("Station operator dashboard", "Charger availability and activity across your stations.", `<a class="btn" href="manage.html">Manage stations & chargers</a>`) + `
  <div class="grid g4" style="margin-bottom:16px">
    <div class="card stat"><div class="num">${n("available")}</div><div class="lbl">Available chargers</div></div>
    <div class="card stat"><div class="num">${n("in-use")}</div><div class="lbl">In use</div></div>
    <div class="card stat"><div class="num">${n("maintenance")}</div><div class="lbl">Under maintenance</div></div>
    <div class="card stat"><div class="num">${today}</div><div class="lbl">Bookings today</div></div></div>
  ${mine.length ? mine.map(s => `<div class="card" style="margin-bottom:16px"><div class="card-head"><h2>${esc(s.name)}</h2><span class="muted">${esc(s.address)}</span></div>
    ${chargersOf(s.id).length ? `<div class="tbl-wrap"><table><thead><tr><th>Charger</th><th>Type</th><th>Power</th><th>Rate</th><th>Status</th></tr></thead><tbody>${chargersOf(s.id).map(c => `<tr><td><b>${esc(c.name)}</b></td><td>${c.type}</td><td>${c.power} kW</td><td>${inr(c.rate)}/kWh</td><td>${statusBadge(c.status)}</td></tr>`).join("")}</tbody></table></div>` : empty("No chargers", "Add a charger from Stations & Chargers.")}</div>`).join("")
   : `<div class="card">${empty("No stations assigned", "Add a station to start managing chargers.", `<a class="btn primary" href="manage.html">Add a station</a>`)}</div>`}`;
});
