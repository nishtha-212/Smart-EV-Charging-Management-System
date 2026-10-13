/* session.js - Charging Session Monitoring (simulated data) */
startPage(function () {
  function body() {
    const s = sessionInfo();
    if (!s) {
      const free = state.chargers.filter(c => c.status === "available");
      return `<div class="card stack" style="max-width:560px"><h2>Start a simulated session</h2>
        ${free.length ? `<div class="field"><label for="sCharger">Available charger</label><select class="input" id="sCharger">${free.map(c => `<option value="${c.id}">${esc(station(c.stationId) ? station(c.stationId).name : "")} · ${esc(c.name)} · ${c.type} · ${c.power} kW</option>`).join("")}</select></div>
        <div><button class="btn primary" data-act="start-session">Start simulated session</button></div>`
        : empty("No chargers available", "All chargers are in use or under maintenance.")}</div>`;
    }
    const c = s.charger, hh = Math.floor(s.minutes / 60), mm = s.minutes % 60;
    return `<div class="grid g2"><div class="card stack"><div class="row between"><h2>${esc(s.station.name)} · ${esc(c.name)}</h2><span class="badge ok"><span class="dot"></span>Charging</span></div>
      <div><div class="muted">Session duration</div><div class="big-timer">${pad(hh)}:${pad(mm)}</div></div>
      <div class="grid g2"><div><div class="muted">Energy consumed</div><div class="num" style="font-size:1.4rem;font-weight:700">${s.energy.toFixed(2)} kWh</div></div>
      <div><div class="muted">Estimated cost</div><div class="num" style="font-size:1.4rem;font-weight:700">${inr(s.cost)}</div></div></div>
      <div class="muted">Rate ${inr(c.rate)}/kWh · ${c.type} · ${c.power} kW</div>
      <div><button class="btn danger" data-act="stop-session">Stop session</button></div></div>
      <div class="card stack"><h3>About this simulation</h3><p class="muted">Values are generated in your browser at 1 real second = 1 simulated minute, at 80% of the charger's rated power. Stopping the session saves it to Charging History as simulated data.</p></div></div>`;
  }
  function draw() { $("#sessionBody").innerHTML = body(); }

  $("#view").innerHTML = head("Charging session monitor", "Session duration, energy consumed, charging status and estimated cost.") +
    `<div class="sim-box" style="margin-bottom:16px">Simulated data. This does not control a physical charger and no payment is processed.</div><div id="sessionBody"></div>`;
  draw();
  setInterval(() => { if (state.session) draw(); }, 1000);

  document.addEventListener("click", e => {
    const b = e.target.closest("[data-act]"); if (!b) return;
    if (b.dataset.act === "start-session") {
      const c = charger($("#sCharger").value);
      if (!c || c.status !== "available") return toast("That charger is no longer available.", true);
      c.status = "in-use"; state.session = {chargerId: c.id, stationId: c.stationId, startedAt: Date.now()}; save();
      toast("Simulated session started"); draw();
    }
    if (b.dataset.act === "stop-session") {
      const s = sessionInfo(); if (!s) return;
      s.charger.status = "available";
      state.history.push({id: "h" + (state.histSeq++), userId: me().id, stationId: s.station.id, chargerId: s.charger.id, date: addDays(0), duration: Math.max(1, s.minutes), energy: s.energy, cost: s.cost, simulated: true});
      state.session = null; save();
      toast("Session stopped and saved to history"); draw();
    }
  });
});
