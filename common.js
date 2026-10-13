"use strict";
/* common.js - shared by every page: helpers, sample data, navigation, theme, dialogs */

/* ---------- helpers ---------- */
const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const P = {
  grid:'<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>',
  search:'<circle cx="11" cy="11" r="8"/><path d="M21 21l-4.3-4.3"/>',
  cal:'<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  list:'<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
  bolt:'<path d="M13 2L3 14h9l-1 8 10-12h-9z"/>',
  clock:'<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  user:'<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  sliders:'<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>',
  shield:'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
  pulse:'<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
  menu:'<path d="M3 12h18M3 6h18M3 18h18"/>',
  moon:'<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
  sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>'
};
const ico = n => `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${P[n]}</svg>`;
const inr = n => "₹" + (Math.round(n * 100) / 100).toLocaleString("en-IN", {minimumFractionDigits:2, maximumFractionDigits:2});
const isoDay = d => { const x = new Date(d); return x.getFullYear() + "-" + String(x.getMonth()+1).padStart(2,"0") + "-" + String(x.getDate()).padStart(2,"0"); };
const addDays = n => { const d = new Date(); d.setDate(d.getDate() + n); return isoDay(d); };
const fmtDate = s => new Date(s + "T00:00:00").toLocaleDateString("en-IN", {day:"numeric", month:"short", year:"numeric"});
const pad = n => String(n).padStart(2, "0");
const CONNECTORS = ["CCS2", "CHAdeMO", "Type 2 AC"];
const STATUS_LABEL = {available:"Available", "in-use":"In use", maintenance:"Maintenance"};
const STATUS_CLASS = {available:"ok", "in-use":"info", maintenance:"warn"};
const BK_CLASS = {upcoming:"info", completed:"ok", cancelled:"bad"};

/* ---------- navigation (one HTML file per module) ---------- */
const HOME = {user:"dashboard.html", operator:"operator-dashboard.html", admin:"admin-dashboard.html"};
const NAV = {
  user:[["dashboard.html","Dashboard","grid"],["stations.html","Find Stations","search"],["book.html","Book a Slot","cal"],["my-bookings.html","My Bookings","list"],["session.html","Charging Session","bolt"],["history.html","Charging History","clock"],["profile.html","Profile & Settings","user"]],
  operator:[["operator-dashboard.html","Operator Dashboard","pulse"],["manage.html","Stations & Chargers","sliders"],["profile.html","Profile & Settings","user"]],
  admin:[["admin-dashboard.html","Admin Dashboard","shield"],["manage.html","Stations & Chargers","sliders"],["profile.html","Profile & Settings","user"]]
};

/* ---------- sample data (kept in sessionStorage so it is shared between pages) ---------- */
const STORE_KEY = "ev-demo-state-v1";
function seedState(){
  return {
    role:"user", userIds:{user:"u1", operator:"u3", admin:"u4"}, flash:"", bkSeq:8, histSeq:5, session:null,
    prefs:{theme:"auto", defaultConnector:"Any"},
    users:[
      {id:"u1", name:"Nishi Porwal", email:"nishi.porwal@gmail.com", phone:"+91 94092 40240", role:"EV Driver", active:true},
      {id:"u2", name:"Priya Nair", email:"priya.nair@example.com", phone:"+91 98200 22222", role:"EV Driver", active:true},
      {id:"u3", name:"Harsh Patel", email:"harsh.patel@gmail.com", phone:"+91 98200 33333", role:"Station Operator", active:true},
      {id:"u4", name:"Nishtha Ghatiya", email:"nishtha.ghatiya@gmail.com", phone:"+91 93992 36477", role:"Admin", active:true},
      {id:"u5", name:"Karan Desai", email:"karan.desai@example.com", phone:"+91 98200 55555", role:"EV Driver", active:false}
    ],
    stations:[
      {id:"s1", name:"Bandra Kurla Fast Hub", address:"BKC Road, Bandra East, Mumbai", operatorId:"u3"},
      {id:"s2", name:"Powai Lakeside Charge Point", address:"Hiranandani Gardens, Powai, Mumbai", operatorId:"u3"},
      {id:"s3", name:"Navi Mumbai Vashi Plaza", address:"Sector 17, Vashi, Navi Mumbai", operatorId:"u3"},
      {id:"s4", name:"Thane Highway Station", address:"Eastern Express Hwy, Thane", operatorId:"u3"}
    ],
    chargers:[
      {id:"c1", stationId:"s1", name:"BKC-01", type:"CCS2", power:60, rate:18, status:"available"},
      {id:"c2", stationId:"s1", name:"BKC-02", type:"CCS2", power:60, rate:18, status:"in-use"},
      {id:"c3", stationId:"s1", name:"BKC-03", type:"Type 2 AC", power:22, rate:12, status:"available"},
      {id:"c4", stationId:"s2", name:"PWI-01", type:"Type 2 AC", power:22, rate:11, status:"available"},
      {id:"c5", stationId:"s2", name:"PWI-02", type:"CHAdeMO", power:50, rate:16, status:"maintenance"},
      {id:"c6", stationId:"s3", name:"VSH-01", type:"CCS2", power:120, rate:20, status:"available"},
      {id:"c7", stationId:"s3", name:"VSH-02", type:"CHAdeMO", power:50, rate:16, status:"in-use"},
      {id:"c8", stationId:"s4", name:"THN-01", type:"Type 2 AC", power:22, rate:11, status:"maintenance"},
      {id:"c9", stationId:"s4", name:"THN-02", type:"CCS2", power:60, rate:17, status:"in-use"}
    ],
    bookings:[
      {id:"b1", userId:"u1", stationId:"s1", chargerId:"c1", date:addDays(1), time:"10:00", duration:60, status:"upcoming"},
      {id:"b2", userId:"u1", stationId:"s3", chargerId:"c6", date:addDays(3), time:"18:30", duration:30, status:"upcoming"},
      {id:"b3", userId:"u1", stationId:"s2", chargerId:"c4", date:addDays(-4), time:"09:00", duration:120, status:"completed"},
      {id:"b4", userId:"u1", stationId:"s1", chargerId:"c3", date:addDays(-9), time:"20:00", duration:60, status:"completed"},
      {id:"b5", userId:"u1", stationId:"s4", chargerId:"c9", date:addDays(-2), time:"14:00", duration:60, status:"cancelled"},
      {id:"b6", userId:"u2", stationId:"s1", chargerId:"c2", date:addDays(0), time:"23:00", duration:60, status:"upcoming"},
      {id:"b7", userId:"u5", stationId:"s3", chargerId:"c7", date:addDays(2), time:"12:00", duration:90, status:"upcoming"}
    ],
    history:[
      {id:"h1", userId:"u1", stationId:"s2", chargerId:"c4", date:addDays(-4), duration:118, energy:36.4, cost:400.4},
      {id:"h2", userId:"u1", stationId:"s1", chargerId:"c3", date:addDays(-9), duration:60, energy:17.2, cost:206.4},
      {id:"h3", userId:"u1", stationId:"s3", chargerId:"c6", date:addDays(-15), duration:35, energy:48.9, cost:978},
      {id:"h4", userId:"u1", stationId:"s1", chargerId:"c1", date:addDays(-22), duration:52, energy:41.5, cost:747}
    ]
  };
}
let state = null;
try { state = JSON.parse(sessionStorage.getItem(STORE_KEY)); } catch (e) { state = null; }
if (!state || !state.stations) state = seedState();
function save(){ try { sessionStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) {} }
try { const t = localStorage.getItem("ev-theme"); if (t) state.prefs.theme = t; } catch (e) {}

const me = () => state.users.find(u => u.id === state.userIds[state.role]);
const station = id => state.stations.find(s => s.id === id);
const charger = id => state.chargers.find(c => c.id === id);
const chargersOf = sid => state.chargers.filter(c => c.stationId === sid);
const myStations = () => state.role === "admin" ? state.stations : state.stations.filter(s => s.operatorId === me().id);
const stationAvail = sid => { const cs = chargersOf(sid); return {total:cs.length, free:cs.filter(c => c.status === "available").length}; };
const estCost = (c, mins) => c.power * (mins / 60) * c.rate;

/* simulated charging session: 1 real second = 1 simulated minute, at 80% of rated power */
function sessionInfo(){
  const s = state.session; if (!s) return null;
  const c = charger(s.chargerId), st = station(s.stationId);
  if (!c || !st) { state.session = null; save(); return null; }
  const minutes = Math.max(0, Math.floor((Date.now() - s.startedAt) / 1000));
  const energy = minutes * c.power * 0.8 / 60;
  return {charger:c, station:st, minutes, energy, cost:energy * c.rate};
}

/* ---------- theme ---------- */
function isDark(){ const t = state.prefs.theme; return t === "dark" || (t === "auto" && matchMedia("(prefers-color-scheme: dark)").matches); }
function applyTheme(){
  const t = state.prefs.theme, root = document.documentElement;
  if (t === "auto") root.removeAttribute("data-theme"); else root.setAttribute("data-theme", t);
  $("#themeBtn").innerHTML = isDark() ? ico("sun") : ico("moon");
  try { localStorage.setItem("ev-theme", t); } catch (e) {}
  save();
}
function toggleTheme(){
  state.prefs.theme = isDark() ? "light" : "dark"; applyTheme();
  const sel = $("#prTheme"); if (sel) sel.value = state.prefs.theme;
}

/* ---------- UI utilities ---------- */
function toast(msg, bad){ const t = document.createElement("div"); t.className = "toast" + (bad ? " bad" : ""); t.textContent = msg; $("#toasts").appendChild(t); setTimeout(() => t.remove(), 3200); }
function flash(msg){ state.flash = msg; save(); }
function statusBadge(s){ return `<span class="badge ${STATUS_CLASS[s]}"><span class="dot"></span>${STATUS_LABEL[s]}</span>`; }
function bkBadge(s){ return `<span class="badge ${BK_CLASS[s]}">${s[0].toUpperCase() + s.slice(1)}</span>`; }
function head(title, sub, actions){ return `<div class="page-head"><div><h1>${title}</h1>${sub ? `<p>${sub}</p>` : ""}</div>${actions ? `<div class="row">${actions}</div>` : ""}</div>`; }
function empty(title, text, action){ return `<div class="empty"><h3>${title}</h3><p>${text}</p>${action ? `<div style="margin-top:14px">${action}</div>` : ""}</div>`; }
function openDialog(html){ const d = $("#dlg"); d.innerHTML = html; if (!d.open) d.showModal(); }
function closeDialog(){ const d = $("#dlg"); if (d.open) d.close(); }
function confirmDialog(msg, onYes){
  openDialog(`<h2>Please confirm</h2><p class="muted" style="margin:8px 0 18px">${esc(msg)}</p><div class="row" style="justify-content:flex-end"><button class="btn" data-act="close-dlg">Keep</button><button class="btn danger" id="yesBtn">Confirm</button></div>`);
  $("#yesBtn").onclick = () => { closeDialog(); onYes(); };
}
function statusSelect(c){
  return `<select class="input" style="min-height:30px;padding:3px 8px;width:auto" data-act="set-status" data-id="${c.id}" aria-label="Status of ${esc(c.name)}">${Object.keys(STATUS_LABEL).map(k => `<option value="${k}" ${c.status === k ? "selected" : ""}>${STATUS_LABEL[k]}</option>`).join("")}</select>`;
}

/* ---------- page shell + role guard ---------- */
function closeNav(){ $("#sidebar").classList.remove("open"); $("#scrim").classList.remove("show"); }
function buildShell(){
  const here = document.body.dataset.nav || location.pathname.split("/").pop();
  $("#nav").innerHTML = NAV[state.role].map(([href, label, icon]) =>
    `<a href="${href}" class="${here === href ? "active" : ""}" ${here === href ? 'aria-current="page"' : ""}>${ico(icon)}<span>${label}</span></a>`).join("");
  $("#sideFoot").innerHTML = `Signed in as<br><b style="color:var(--text)">${esc(me().name)}</b>`;
  $("#roleSel").value = state.role;
  $("#roleSel").onchange = e => { state.role = e.target.value; save(); location.href = HOME[state.role]; };
  $("#menuBtn").innerHTML = ico("menu");
  $("#menuBtn").onclick = () => { $("#sidebar").classList.add("open"); $("#scrim").classList.add("show"); };
  $("#scrim").onclick = closeNav;
  $("#themeBtn").onclick = toggleTheme;
  document.addEventListener("keydown", e => { if (e.key === "Escape") closeNav(); });
  document.addEventListener("click", e => { const b = e.target.closest('[data-act="close-dlg"]'); if (b) closeDialog(); });
  applyTheme();
  if (state.flash) { toast(state.flash); state.flash = ""; save(); }
}
/* every page script calls startPage(function(){ ... }) */
function startPage(init){
  const roles = (document.body.dataset.roles || "user").split(",");
  if (!roles.includes(state.role)) { location.replace(HOME[state.role]); return; }
  buildShell();
  init();
}
