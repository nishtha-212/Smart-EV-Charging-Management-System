/* history.js - previous charging sessions and their costs */
startPage(function () {
  const list = state.history.filter(h => h.userId === me().id).sort((a, b) => b.date.localeCompare(a.date));
  const total = list.reduce((a, h) => a + h.cost, 0);
  $("#view").innerHTML = head("Charging history", "Your previous charging sessions and what they cost.") +
  (list.length ? `<div class="tbl-wrap"><table><thead><tr><th>Date</th><th>Station</th><th>Charger</th><th>Duration</th><th>Energy</th><th>Cost</th></tr></thead><tbody>
  ${list.map(h => { const s = station(h.stationId), c = charger(h.chargerId); return `<tr><td>${fmtDate(h.date)}${h.simulated ? ' <span class="badge info">Simulated</span>' : ""}</td><td>${esc(s ? s.name : "Removed station")}</td><td>${esc(c ? c.name : "—")}</td><td>${h.duration} min</td><td>${h.energy.toFixed(1)} kWh</td><td>${inr(h.cost)}</td></tr>`; }).join("")}
  </tbody><tfoot><tr><td colspan="5"><b>Total</b></td><td><b>${inr(total)}</b></td></tr></tfoot></table></div>`
  : `<div class="card">${empty("No charging history yet", "Completed sessions will appear here.")}</div>`);
});
