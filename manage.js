/* manage.js - Station and Charger Management: add, edit, delete, availability and maintenance status */
startPage(function () {
  function render() {
    const mine = myStations();
    $("#view").innerHTML = head("Stations & chargers", "Add, edit and manage stations and chargers, including availability and maintenance status.", `<button class="btn primary" data-act="station-form">Add station</button>`) +
    (mine.length ? mine.map(s => `<div class="card" style="margin-bottom:16px"><div class="card-head"><div><h2>${esc(s.name)}</h2><span class="muted">${esc(s.address)}</span></div>
      <div class="row"><button class="btn sm" data-act="charger-form" data-sid="${s.id}">Add charger</button><button class="btn sm" data-act="station-form" data-id="${s.id}">Edit</button><button class="btn sm danger" data-act="del-station" data-id="${s.id}">Delete</button></div></div>
      ${chargersOf(s.id).length ? `<div class="tbl-wrap"><table><thead><tr><th>Charger</th><th>Type</th><th>Power</th><th>Rate</th><th>Status</th><th></th></tr></thead><tbody>
      ${chargersOf(s.id).map(c => `<tr><td><b>${esc(c.name)}</b></td><td>${c.type}</td><td>${c.power} kW</td><td>${inr(c.rate)}/kWh</td><td>${statusSelect(c)}</td>
        <td><div class="row"><button class="btn sm" data-act="charger-form" data-sid="${s.id}" data-id="${c.id}">Edit</button><button class="btn sm danger" data-act="del-charger" data-id="${c.id}">Delete</button></div></td></tr>`).join("")}</tbody></table></div>` : empty("No chargers at this station", "Add a charger to make it bookable.")}</div>`).join("")
     : `<div class="card">${empty("No stations yet", "Add your first station to begin.", `<button class="btn primary" data-act="station-form">Add station</button>`)}</div>`);
  }
  function stationForm(id) {
    const s = id ? station(id) : {name: "", address: ""};
    openDialog(`<form id="stationForm" class="stack" novalidate data-id="${id || ""}"><h2>${id ? "Edit station" : "Add station"}</h2>
      <div class="field"><label for="sfName">Station name</label><input class="input" id="sfName" name="name" value="${esc(s.name)}"></div>
      <div class="field"><label for="sfAddr">Address</label><input class="input" id="sfAddr" name="address" value="${esc(s.address)}"></div>
      <span class="err" id="sfErr"></span>
      <div class="row" style="justify-content:flex-end"><button type="button" class="btn" data-act="close-dlg">Cancel</button><button class="btn primary" type="submit">${id ? "Save changes" : "Add station"}</button></div></form>`);
  }
  function chargerForm(sid, id) {
    const c = id ? charger(id) : {name: "", type: "CCS2", power: "", rate: "", status: "available"};
    openDialog(`<form id="chargerForm" class="stack" novalidate data-sid="${sid}" data-id="${id || ""}"><h2>${id ? "Edit charger" : "Add charger"}</h2>
      <div class="field"><label for="cfName">Charger name</label><input class="input" id="cfName" name="name" value="${esc(c.name)}"></div>
      <div class="grid g2"><div class="field"><label for="cfType">Connector type</label><select class="input" id="cfType" name="type">${CONNECTORS.map(t => `<option ${c.type === t ? "selected" : ""}>${t}</option>`).join("")}</select></div>
      <div class="field"><label for="cfStatus">Status</label><select class="input" id="cfStatus" name="status">${Object.keys(STATUS_LABEL).map(k => `<option value="${k}" ${c.status === k ? "selected" : ""}>${STATUS_LABEL[k]}</option>`).join("")}</select></div></div>
      <div class="grid g2"><div class="field"><label for="cfPower">Power (kW)</label><input class="input" id="cfPower" name="power" type="number" min="1" step="1" value="${esc(c.power)}"></div>
      <div class="field"><label for="cfRate">Rate (₹ per kWh)</label><input class="input" id="cfRate" name="rate" type="number" min="0" step="0.5" value="${esc(c.rate)}"></div></div>
      <span class="err" id="cfErr"></span>
      <div class="row" style="justify-content:flex-end"><button type="button" class="btn" data-act="close-dlg">Cancel</button><button class="btn primary" type="submit">${id ? "Save changes" : "Add charger"}</button></div></form>`);
  }
  render();

  document.addEventListener("submit", e => {
    e.preventDefault(); const f = e.target;
    if (f.id === "stationForm") {
      const name = f.name.value.trim(), address = f.address.value.trim();
      if (!name || !address) return $("#sfErr").textContent = "Station name and address are required.";
      if (f.dataset.id) { Object.assign(station(f.dataset.id), {name, address}); toast("Station updated"); }
      else { state.stations.push({id: "s" + Date.now(), name, address, operatorId: state.role === "operator" ? me().id : "u3"}); toast("Station added"); }
      save(); closeDialog(); render();
    }
    if (f.id === "chargerForm") {
      const name = f.name.value.trim(), power = +f.power.value, rate = +f.rate.value;
      if (!name) return $("#cfErr").textContent = "Charger name is required.";
      if (!(power > 0)) return $("#cfErr").textContent = "Enter power greater than 0 kW.";
      if (f.rate.value === "" || rate < 0) return $("#cfErr").textContent = "Enter a rate of 0 or more.";
      const data = {name, type: f.type.value, status: f.status.value, power, rate};
      if (f.dataset.id) { Object.assign(charger(f.dataset.id), data); toast("Charger updated"); }
      else { state.chargers.push({id: "c" + Date.now(), stationId: f.dataset.sid, ...data}); toast("Charger added"); }
      save(); closeDialog(); render();
    }
  });
  document.addEventListener("change", e => {
    if (e.target.dataset.act === "set-status") { const c = charger(e.target.dataset.id); c.status = e.target.value; save(); toast(`${c.name} set to ${STATUS_LABEL[c.status]}`); }
  });
  document.addEventListener("click", e => {
    const b = e.target.closest("[data-act]"); if (!b || b.tagName === "SELECT") return;
    const id = b.dataset.id;
    if (b.dataset.act === "station-form") stationForm(id);
    if (b.dataset.act === "charger-form") chargerForm(b.dataset.sid, id);
    if (b.dataset.act === "del-station") confirmDialog("Delete this station and all of its chargers? Related bookings will remain but show a removed station.", () => {
      state.chargers = state.chargers.filter(c => c.stationId !== id); state.stations = state.stations.filter(s => s.id !== id); save(); toast("Station deleted"); render(); });
    if (b.dataset.act === "del-charger") confirmDialog("Delete this charger?", () => { state.chargers = state.chargers.filter(c => c.id !== id); save(); toast("Charger deleted"); render(); });
  });
});
