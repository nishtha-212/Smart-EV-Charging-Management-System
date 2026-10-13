/* admin-dashboard.js - system statistics and management of users, stations, chargers and bookings */
startPage(function () {
  const tabs = [["users", "Users"], ["stations", "Stations"], ["chargers", "Chargers"], ["bookings", "Bookings"]];
  let tab = "users";

  function tabBody() {
    if (tab === "users") return `<div class="tbl-wrap"><table><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th></th></tr></thead><tbody>${state.users.map(u => `<tr><td>${esc(u.name)}</td><td>${esc(u.email)}</td><td>${u.role}</td><td><span class="badge ${u.active ? "ok" : "bad"}">${u.active ? "Active" : "Suspended"}</span></td>
      <td>${u.role === "Admin" ? "" : `<button class="btn sm ${u.active ? "danger" : ""}" data-act="toggle-user" data-id="${u.id}">${u.active ? "Suspend" : "Reactivate"}</button>`}</td></tr>`).join("")}</tbody></table></div>`;
    if (tab === "stations") return state.stations.length ? `<div class="tbl-wrap"><table><thead><tr><th>Station</th><th>Address</th><th>Chargers</th><th>Available</th></tr></thead><tbody>${state.stations.map(s => { const a = stationAvail(s.id); return `<tr><td><b>${esc(s.name)}</b></td><td>${esc(s.address)}</td><td>${a.total}</td><td>${a.free}</td></tr>`; }).join("")}</tbody></table></div><p class="muted" style="margin-top:10px">To add, edit or delete stations, use <a href="manage.html" style="color:var(--accent)">Stations & Chargers</a>.</p>` : empty("No stations", "Add one from Stations & Chargers.");
    if (tab === "chargers") return `<div class="tbl-wrap"><table><thead><tr><th>Charger</th><th>Station</th><th>Type</th><th>Power</th><th>Status</th></tr></thead><tbody>${state.chargers.map(c => `<tr><td><b>${esc(c.name)}</b></td><td>${esc(station(c.stationId) ? station(c.stationId).name : "—")}</td><td>${c.type}</td><td>${c.power} kW</td><td>${statusSelect(c)}</td></tr>`).join("")}</tbody></table></div>`;
    return state.bookings.length ? `<div class="tbl-wrap"><table><thead><tr><th>User</th><th>Station</th><th>Charger</th><th>Date</th><th>Time</th><th>Status</th><th></th></tr></thead><tbody>${[...state.bookings].sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time)).map(b => {
      const u = state.users.find(x => x.id === b.userId), s = station(b.stationId), c = charger(b.chargerId);
      return `<tr><td>${esc(u ? u.name : "—")}</td><td>${esc(s ? s.name : "—")}</td><td>${esc(c ? c.name : "—")}</td><td>${fmtDate(b.date)}</td><td>${b.time}</td><td>${bkBadge(b.status)}</td>
      <td>${b.status === "upcoming" ? `<button class="btn sm danger" data-act="cancel-bk" data-id="${b.id}">Cancel</button>` : ""}</td></tr>`; }).join("")}</tbody></table></div>` : empty("No bookings", "Bookings will appear here.");
  }
  function render() {
    $("#view").innerHTML = head("Admin dashboard", "System-level statistics and management.") + `
    <div class="grid g4" style="margin-bottom:16px">
      <div class="card stat"><div class="num">${state.users.length}</div><div class="lbl">Users</div></div>
      <div class="card stat"><div class="num">${state.stations.length}</div><div class="lbl">Stations</div></div>
      <div class="card stat"><div class="num">${state.chargers.length}</div><div class="lbl">Chargers (${state.chargers.filter(c => c.status === "available").length} available)</div></div>
      <div class="card stat"><div class="num">${state.bookings.filter(b => b.status === "upcoming").length}</div><div class="lbl">Upcoming bookings</div></div></div>
    <div class="tabs" role="tablist">${tabs.map(([k, l]) => `<button class="tab ${tab === k ? "active" : ""}" role="tab" aria-selected="${tab === k}" data-act="admin-tab" data-v="${k}">${l}</button>`).join("")}</div>${tabBody()}`;
  }
  render();

  document.addEventListener("change", e => {
    if (e.target.dataset.act === "set-status") { const c = charger(e.target.dataset.id); c.status = e.target.value; save(); toast(`${c.name} set to ${STATUS_LABEL[c.status]}`); render(); }
  });
  document.addEventListener("click", e => {
    const b = e.target.closest("[data-act]"); if (!b || b.tagName === "SELECT") return;
    const id = b.dataset.id;
    if (b.dataset.act === "admin-tab") { tab = b.dataset.v; render(); }
    if (b.dataset.act === "toggle-user") { const u = state.users.find(x => x.id === id); u.active = !u.active; save(); toast(u.active ? "User reactivated" : "User suspended"); render(); }
    if (b.dataset.act === "cancel-bk") confirmDialog("Cancel this booking? This cannot be undone.", () => { state.bookings.find(x => x.id === id).status = "cancelled"; save(); toast("Booking cancelled"); render(); });
  });
});
