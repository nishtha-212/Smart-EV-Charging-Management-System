/* book.js - Book a Charging Slot: station, charger, date, time, duration */
startPage(function () {
  if (!state.stations.length) {
    $("#view").innerHTML = head("Book a charging slot", "") + `<div class="card">${empty("No stations available", "Stations must be added before slots can be booked.")}</div>`;
    return;
  }
  const preset = new URLSearchParams(location.search).get("station");
  const d = {stationId: station(preset) ? preset : state.stations[0].id, chargerId: "", date: addDays(0), time: "", duration: "60", errors: {}};

  function formHtml() {
    const cs = chargersOf(d.stationId), c = charger(d.chargerId), e = d.errors || {};
    return `<form id="bookForm" class="card stack" novalidate style="max-width:640px">
      <div class="field"><label for="bStation">Station</label><select class="input" id="bStation" name="stationId">${state.stations.map(s => `<option value="${s.id}" ${s.id === d.stationId ? "selected" : ""}>${esc(s.name)}</option>`).join("")}</select></div>
      <div class="field"><label for="bCharger">Charger</label><select class="input ${e.chargerId ? "invalid" : ""}" id="bCharger" name="chargerId"><option value="">Select a charger</option>
        ${cs.map(x => `<option value="${x.id}" ${x.id === d.chargerId ? "selected" : ""} ${x.status === "maintenance" ? "disabled" : ""}>${esc(x.name)} · ${x.type} · ${x.power} kW · ${inr(x.rate)}/kWh${x.status === "maintenance" ? " (maintenance)" : ""}</option>`).join("")}</select>${e.chargerId ? `<span class="err">${e.chargerId}</span>` : ""}</div>
      <div class="grid g3">
        <div class="field"><label for="bDate">Date</label><input class="input ${e.date ? "invalid" : ""}" type="date" id="bDate" name="date" min="${addDays(0)}" value="${esc(d.date)}">${e.date ? `<span class="err">${e.date}</span>` : ""}</div>
        <div class="field"><label for="bTime">Start time</label><input class="input ${e.time ? "invalid" : ""}" type="time" id="bTime" name="time" value="${esc(d.time)}">${e.time ? `<span class="err">${e.time}</span>` : ""}</div>
        <div class="field"><label for="bDur">Duration</label><select class="input" id="bDur" name="duration">${[30, 60, 90, 120].map(m => `<option value="${m}" ${String(m) === String(d.duration) ? "selected" : ""}>${m} min</option>`).join("")}</select></div>
      </div>
      <div class="sim-box" style="border-style:solid">${c ? `Estimated cost: <b>${inr(estCost(c, +d.duration))}</b> (assumes the charger runs at its rated ${c.power} kW; actual cost depends on energy used). No payment is taken in this demo.` : "Select a charger to see an estimated cost."}</div>
      ${e.general ? `<span class="err">${e.general}</span>` : ""}
      <div class="row"><button class="btn primary" type="submit">Confirm booking</button><a class="btn" href="my-bookings.html">Cancel</a></div>
    </form>`;
  }
  function draw() { $("#bookWrap").innerHTML = formHtml(); }
  function readForm() {
    const f = $("#bookForm"); if (!f) return;
    d.stationId = f.stationId.value; d.chargerId = f.chargerId.value; d.date = f.date.value; d.time = f.time.value; d.duration = f.duration.value;
  }
  function submit() {
    readForm();
    const e = {}, c = charger(d.chargerId);
    if (!d.chargerId) e.chargerId = "Select a charger.";
    else if (c.status === "maintenance") e.chargerId = "This charger is under maintenance.";
    if (!d.date) e.date = "Choose a date."; else if (d.date < addDays(0)) e.date = "Date cannot be in the past.";
    if (!d.time) e.time = "Choose a start time.";
    else if (d.date === addDays(0)) { const now = new Date(); if (d.time < pad(now.getHours()) + ":" + pad(now.getMinutes())) e.time = "Start time has already passed today."; }
    if (!Object.keys(e).length) {
      const toMin = t => +t.slice(0, 2) * 60 + +t.slice(3);
      const s1 = toMin(d.time), e1 = s1 + +d.duration;
      const clash = state.bookings.find(b => b.chargerId === d.chargerId && b.date === d.date && b.status === "upcoming" && s1 < toMin(b.time) + b.duration && toMin(b.time) < e1);
      if (clash) e.general = `This charger is already booked from ${clash.time} for ${clash.duration} min. Pick another time or charger.`;
    }
    d.errors = e;
    if (Object.keys(e).length) { draw(); return; }
    state.bookings.push({id: "b" + (state.bkSeq++), userId: me().id, stationId: d.stationId, chargerId: d.chargerId, date: d.date, time: d.time, duration: +d.duration, status: "upcoming"});
    flash("Booking confirmed");
    location.href = "my-bookings.html";
  }

  $("#view").innerHTML = head("Book a charging slot", "Choose a station, charger, date, time and duration.") + `<div id="bookWrap"></div>`;
  draw();

  document.addEventListener("submit", e => { e.preventDefault(); if (e.target.id === "bookForm") submit(); });
  document.addEventListener("change", e => {
    const t = e.target;
    if (t.id === "bStation") { readForm(); d.chargerId = ""; d.errors = {}; draw(); }
    else if (["bCharger", "bDate", "bTime", "bDur"].includes(t.id)) { readForm(); draw(); const el = $("#" + t.id); if (el) el.focus(); }
  });
});
