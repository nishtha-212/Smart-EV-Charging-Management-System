/* dashboard.js - EV driver dashboard */
startPage(function () {
  const u = me();
  const upcoming = state.bookings.filter(b => b.userId === u.id && b.status === "upcoming").sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  const hist = state.history.filter(h => h.userId === u.id);
  const energy = hist.reduce((a, h) => a + h.energy, 0), spent = hist.reduce((a, h) => a + h.cost, 0);
  const next = upcoming[0];
  const s = sessionInfo();
  $("#view").innerHTML = head(`Welcome back, ${esc(u.name.split(" ")[0])}`, "Your charging activity at a glance.") + `
  <div class="grid g4" style="margin-bottom:16px">
    <div class="card stat"><div class="num">${upcoming.length}</div><div class="lbl">Upcoming bookings</div></div>
    <div class="card stat"><div class="num">${hist.length}</div><div class="lbl">Completed sessions</div></div>
    <div class="card stat"><div class="num">${energy.toFixed(1)} kWh</div><div class="lbl">Energy charged</div></div>
    <div class="card stat"><div class="num">${inr(spent)}</div><div class="lbl">Total spent</div></div>
  </div>
  <div class="grid g2">
    <div class="card"><div class="card-head"><h2>Next booking</h2></div>
      ${next ? `<dl class="kv"><dt>Station</dt><dd>${esc(station(next.stationId).name)}</dd><dt>Charger</dt><dd>${esc(charger(next.chargerId).name)} (${charger(next.chargerId).type})</dd><dt>When</dt><dd>${fmtDate(next.date)}, ${next.time}</dd><dt>Duration</dt><dd>${next.duration} min</dd></dl>`
        : empty("No upcoming bookings", "Book a slot to reserve a charger.", `<a class="btn primary" href="book.html">Book a slot</a>`)}
    </div>
    <div class="card"><div class="card-head"><h2>Charging session</h2>${s ? '<span class="badge info">Simulated</span>' : ""}</div>
      ${s ? `<p>Charging at <b>${esc(s.station.name)}</b> on ${esc(s.charger.name)}.</p><p class="muted">${s.energy.toFixed(2)} kWh so far, ${inr(s.cost)} estimated.</p><div style="margin-top:12px"><a class="btn" href="session.html">Open session monitor</a></div>`
        : empty("No active session", "Start a simulated session to see live-style monitoring.", `<a class="btn" href="session.html">Open session monitor</a>`)}
    </div>
  </div>
  <div class="card" style="margin-top:16px"><div class="card-head"><h2>Quick actions</h2></div>
    <div class="row"><a class="btn primary" href="stations.html">Find stations</a><a class="btn" href="book.html">Book a slot</a><a class="btn" href="my-bookings.html">My bookings</a><a class="btn" href="history.html">Charging history</a></div></div>`;
});
