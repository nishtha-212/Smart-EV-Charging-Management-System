/* my-bookings.js - upcoming, completed and cancelled reservations */
startPage(function () {
  const tabs = ["upcoming", "completed", "cancelled"];
  let tab = new URLSearchParams(location.search).get("tab");
  if (!tabs.includes(tab)) tab = "upcoming";

  function render() {
    const mine = state.bookings.filter(b => b.userId === me().id);
    const list = mine.filter(b => b.status === tab).sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));
    $("#view").innerHTML = head("My bookings", "Your reserved, completed and cancelled slots.", `<a class="btn primary" href="book.html">Book a slot</a>`) +
    `<div class="tabs" role="tablist">${tabs.map(t => `<button class="tab ${t === tab ? "active" : ""}" role="tab" aria-selected="${t === tab}" data-act="bk-tab" data-v="${t}">${t[0].toUpperCase() + t.slice(1)} (${mine.filter(b => b.status === t).length})</button>`).join("")}</div>` +
    (list.length ? `<div class="tbl-wrap"><table><thead><tr><th>Station</th><th>Charger</th><th>Date</th><th>Time</th><th>Duration</th><th>Status</th><th></th></tr></thead><tbody>
      ${list.map(b => { const c = charger(b.chargerId), s = station(b.stationId); return `<tr><td>${esc(s ? s.name : "Removed station")}</td><td>${esc(c ? c.name : "—")}</td><td>${fmtDate(b.date)}</td><td>${b.time}</td><td>${b.duration} min</td><td>${bkBadge(b.status)}</td>
      <td>${b.status === "upcoming" ? `<button class="btn sm danger" data-act="cancel-bk" data-id="${b.id}">Cancel</button>` : ""}</td></tr>`; }).join("")}</tbody></table></div>`
     : `<div class="card">${empty(`No ${tab} bookings`, tab === "upcoming" ? "Reserve a charger to see it here." : "Nothing to show here yet.", tab === "upcoming" ? `<a class="btn primary" href="book.html">Book a slot</a>` : "")}</div>`);
  }
  render();

  document.addEventListener("click", e => {
    const b = e.target.closest("[data-act]"); if (!b) return;
    if (b.dataset.act === "bk-tab") { tab = b.dataset.v; render(); }
    if (b.dataset.act === "cancel-bk") confirmDialog("Cancel this booking? This cannot be undone.", () => {
      state.bookings.find(x => x.id === b.dataset.id).status = "cancelled"; save(); toast("Booking cancelled"); render();
    });
  });
});
