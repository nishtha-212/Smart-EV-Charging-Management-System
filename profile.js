/* profile.js - basic profile information and application preferences */
startPage(function () {
  function render() {
    const u = me();
    $("#view").innerHTML = head("Profile & settings", "Basic profile information and application preferences.") + `<div class="grid g2">
    <form id="profileForm" class="card stack" novalidate><h2>Profile</h2>
      <div class="field"><label for="pName">Full name</label><input class="input" id="pName" name="name" value="${esc(u.name)}"></div>
      <div class="field"><label for="pEmail">Email</label><input class="input" id="pEmail" name="email" type="email" value="${esc(u.email)}"></div>
      <div class="field"><label for="pPhone">Phone</label><input class="input" id="pPhone" name="phone" value="${esc(u.phone)}"></div>
      <div class="field"><label>Role</label><input class="input" value="${esc(u.role)}" disabled></div>
      <span class="err" id="pErr"></span>
      <div><button class="btn primary" type="submit">Save changes</button></div></form>
    <div class="card stack"><h2>Preferences</h2>
      <div class="field"><label for="prTheme">Theme</label><select class="input" id="prTheme"><option value="auto" ${state.prefs.theme === "auto" ? "selected" : ""}>Match system</option><option value="dark" ${state.prefs.theme === "dark" ? "selected" : ""}>Dark</option><option value="light" ${state.prefs.theme === "light" ? "selected" : ""}>Light</option></select></div>
      <div class="field"><label for="prConn">Default connector filter</label><select class="input" id="prConn"><option>Any</option>${CONNECTORS.map(c => `<option ${state.prefs.defaultConnector === c ? "selected" : ""}>${c}</option>`).join("")}</select></div>
      <p class="muted">The default connector filter is applied when you open Find Stations.</p></div></div>`;
  }
  render();

  document.addEventListener("submit", e => {
    e.preventDefault(); if (e.target.id !== "profileForm") return;
    const f = e.target, name = f.name.value.trim(), email = f.email.value.trim();
    if (!name) return $("#pErr").textContent = "Name is required.";
    if (!/^\S+@\S+\.\S+$/.test(email)) return $("#pErr").textContent = "Enter a valid email address.";
    Object.assign(me(), {name, email, phone: f.phone.value.trim()}); save();
    $("#sideFoot").innerHTML = `Signed in as<br><b style="color:var(--text)">${esc(me().name)}</b>`;
    toast("Profile saved"); render();
  });
  document.addEventListener("change", e => {
    if (e.target.id === "prTheme") { state.prefs.theme = e.target.value; applyTheme(); toast("Theme updated"); }
    if (e.target.id === "prConn") { state.prefs.defaultConnector = e.target.value; save(); toast("Preference saved"); }
  });
});
