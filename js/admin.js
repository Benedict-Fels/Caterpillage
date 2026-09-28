'use strict';
/* ---------- Admin-Modus ----------
   Einschalten: im Spiel "admin" tippen, index.html?admin öffnen oder (danach) in den Einstellungen.
   Alles hier wirkt sofort und ohne Kosten auf den Spielstand. */
function setAdmin(on){
  adm.on = on; adm.known = true; saveAdm();
  $('admBtn').hidden = !on; $('pAdm').hidden = !on;
  if (!on && $('admDlg').open) $('admDlg').close();
  if (screen === 'shop') renderShop(); else hud();
}
$('admBtn').onclick = () => openAdmin();
$('admClose').onclick = () => $('admDlg').close();
$('admDlg').addEventListener('close', () => { S = stats(); persist(); if (screen === 'shop') renderShop(); else { buildRunPanel(); hud(); } });
function openAdmin(){ renderAdmin(); if (!$('admDlg').open) $('admDlg').showModal(); }

function admChanged(){ S = stats(); persist(); renderAdmin(); if (screen === 'shop') renderShop(); }
function freeAbilSlot(){                                     // Ring im Baum, in dem noch keine Fähigkeit liegt
  for (let f = 0; f < WORLDS.length - 1; f++) if (!Object.keys(save.abil.own).some(id => save.abil.from[id] === f)) return f;
  return 9;                                                  // sonst ohne Baum-Knoten (Stufen hier im Admin einstellen)
}

/* Bausteine für die Knöpfe */
const slotOf = id => ABIL[id].kind === 'aktiv' ? 'active' : 'passive';
function grantAbil(id){
  const A = save.abil;
  if (!A.own[id]){ A.from[id] = freeAbilSlot(); A.own[id] = 1; }
  if (!A[slotOf(id)]) A[slotOf(id)] = id;
}
function dropAbil(id){
  const A = save.abil, slot = slotOf(id);
  delete A.own[id]; delete A.from[id];
  for (let i = 0; i < 3; i++) delete save.lv[`ab_${id}_${i}`];
  if (A[slot] === id) A[slot] = Object.keys(A.own).find(x => slotOf(x) === slot) || null;
}
function setWorlds(n){                                       // n Welten frei (mindestens 1)
  save.unlocked = Math.max(1, Math.min(WORLDS.length, n));
  if (save.world >= save.unlocked) save.world = save.unlocked - 1;
  save.choice = null;
}
function unlockAll(){
  setWorlds(WORLDS.length);
  for (const id in ABIL) grantAbil(id);
  for (const u of UPG) save.lv[u.id] = u.max;
  for (const id in ABIL) for (let i = 0; i < 3; i++) save.lv[`ab_${id}_${i}`] = 5;
  WORLDS.forEach((w, i) => { addCur(i, 'f', 1e6); addCur(i, 'k', 1e6); });
}
const upgradesOf = w => UPG.filter(u => !u.ab && u.w === w);
let admWipeArmed = 0;

function renderAdmin(){
  const A = save.abil, dlgEl = $('admDlg'), scroll = dlgEl.scrollTop;
  let h = `<div class="asec"><h3>Schnell</h3><div class="arow">
    <button data-a="all" class="go">Alles freischalten</button>
    <button data-a="fresh">${Date.now() - admWipeArmed < 3000 ? 'Wirklich? Nochmal klicken' : 'Alles auf Anfang'}</button>
    ${save.choice ? '<button data-a="nochoice">Offene Fähigkeiten-Wahl verwerfen</button>' : ''}</div>
    <p class="note">Alles freischalten: alle Welten, alle Fähigkeiten, alle Upgrades und Fähigkeiten-Stufen auf Maximum, je 1 Mio. von jeder Währung. Alles auf Anfang setzt den Spielstand zurück (Admin, Steuerung und Ton bleiben).</p></div>`;

  h += `<div class="asec"><h3>Währungen</h3>`;
  WORLDS.forEach((w, i) => {
    h += `<div class="arow"><span class="nm">${w.name}</span>${icon(i, 'f')}<input type="number" min="0" step="1" data-cur="${i}f" value="${Math.floor(cur(i, 'f'))}">
      ${icon(i, 'k')}<input type="number" min="0" step="1" data-cur="${i}k" value="${Math.floor(cur(i, 'k'))}"></div>`;
  });
  h += `<div class="arow"><button data-a="add1">Alles +10 Tsd.</button><button data-a="add2">Alles +1 Mio.</button><button data-a="zero">Alles auf 0</button></div></div>`;

  h += `<div class="asec"><h3>Welten</h3>`;
  WORLDS.forEach((w, i) => {
    const open = i < save.unlocked, here = save.world === i;
    h += `<div class="arow"><span class="nm">${w.name}</span>
      <span class="note">${open ? 'frei' : 'gesperrt'} · ${save.runs[i] || 0} Runs</span>
      ${open ? (i ? `<button data-lock="${i}" title="Sperrt diese und alle späteren Welten">Sperren</button>` : '') : `<button data-unl="${i}" title="Schaltet auch alle Welten davor frei">Freischalten</button>`}
      ${open ? (here ? '<span class="note">nächster Run hier</span>' : `<button data-go="${i}">Hier spielen</button>`) : ''}
      ${save.runs[i] ? `<button data-runs="${i}">Runs auf 0</button>` : ''}</div>`;
  });
  h += `<div class="arow"><button data-a="worlds">Alle Welten frei</button><button data-a="worlds1">Nur Johannisbeere</button></div></div>`;

  h += `<div class="asec"><h3>Upgrades</h3>`;
  WORLDS.forEach((w, wi) => {
    const list = upgradesOf(wi);
    if (!list.length) return;
    h += `<div class="arow"><span class="nm">${w.name}</span><button data-upw="${wi}" data-v="max">Alle Max</button><button data-upw="${wi}" data-v="0">Alle 0</button></div><div class="agrid">`;
    for (const u of list) h += `<label>${u.name}</label><span class="arow"><input class="sm" type="number" min="0" max="${u.max}" data-lv="${u.id}" value="${lv(u.id)}"><span class="note">/ ${u.max}</span>
      <button data-set="${u.id}" data-v="0">0</button><button data-set="${u.id}" data-v="max">Max</button></span>`;
    h += `</div>`;
  });
  h += `<div class="arow"><button data-a="upmax">Alle Upgrades auf Max</button><button data-a="up0">Alle Upgrades auf 0</button></div></div>`;

  const opt = kind => `<option value="">– keine –</option>` + Object.keys(ABIL).filter(id => ABIL[id].kind === kind)
    .map(id => `<option value="${id}" ${A[kind === 'aktiv' ? 'active' : 'passive'] === id ? 'selected' : ''}>${ABIL[id].name}</option>`).join('');
  h += `<div class="asec"><h3>Fähigkeiten</h3>
    <div class="arow"><label>Aktiv <select data-eq="active">${opt('aktiv')}</select></label>
      <label>Passiv <select data-eq="passive">${opt('passiv')}</select></label></div>
    <p class="note">Ausrüsten gibt die Fähigkeit auch gleich in den Besitz. Stufen je Ausbau-Knoten 0–5.</p><div class="agrid">`;
  for (const id in ABIL){
    const a = ABIL[id], own = !!A.own[id], L = abL(id);
    h += `<label class="nm"><input type="checkbox" data-own="${id}" ${own ? 'checked' : ''}> ${a.name} <small class="note">${a.kind}</small></label>
      <span class="arow">${a.nodes.map((n, i) => `<label class="stk"><small>${n.name}</small><input class="xs" type="number" min="0" max="5" data-abl="${id}_${i}" value="${L[i]}"></label>`).join('')}
      <button data-abset="${id}" data-v="0">0</button><button data-abset="${id}" data-v="5">Max</button></span>`;
  }
  h += `</div><div class="arow"><button data-a="aball">Alle besitzen</button><button data-a="abmax">Alle Stufen Max</button><button data-a="abnone">Alle entfernen</button></div></div>`;

  h += `<div class="asec"><h3>Testen</h3>
    <div class="arow"><label><input type="checkbox" data-flag="infStam" ${adm.infStam ? 'checked' : ''}> Unendliche Ausdauer</label>
      <label><input type="checkbox" data-flag="noCd" ${adm.noCd ? 'checked' : ''}> Keine Abklingzeit</label></div>
    <div class="arow"><label><input type="checkbox" data-flag="noSave" ${adm.noSave ? 'checked' : ''}> Testlauf: Ertrag nicht gutschreiben</label>
      <label><input type="checkbox" data-flag="meter" ${adm.meter ? 'checked' : ''}> Messwerte im Run zeigen</label></div>
    <div class="arow"><label>Bisskraft × <input class="sm" type="number" min="0.1" step="0.5" data-num="pow" value="${adm.pow}"></label>
      <label>Biss-Takt × <input class="sm" type="number" min="0.1" step="0.25" data-num="rate" value="${adm.rate}"></label>
      <label>Spieltempo × <input class="sm" type="number" min="0.1" max="8" step="0.25" data-num="speed" value="${adm.speed}"></label></div>
    <p class="note">Messwerte zeigen je Quelle (Biss, Brennhaare, Spucke …) den Schaden ohne Überschuss, DPS, gefressene Pixel und Ertrag – so lässt sich vergleichen, wie stark eine Fähigkeit wirklich ist.</p></div>`;

  h += `<div class="asec"><h3>Musik</h3>
    <div class="arow"><label>Bisse/s <input class="sm" type="number" min="0.8" max="3.5" step="0.05" id="admSongRate" value="${adm.songRate || 1}"></label>
      <button data-a="song">Run-Song als WAV speichern</button><button data-a="songShop">Shop-Musik als WAV</button><span class="note" id="admSongNote"></span></div>
    <p class="note">Rendert den Song einmal komplett (32 Takte), so als würde die Raupe mit dieser Biss-Geschwindigkeit durchgehend fressen. 1 Biss/s = 120 BPM.</p></div>`;

  let snap = null;
  try { snap = JSON.parse(localStorage.getItem(SNAP_KEY) || 'null'); } catch (e) {}
  h += `<div class="asec"><h3>Spielstand</h3><div class="arow">
    <button data-a="snap">Stand merken</button><button data-a="restore" ${snap ? '' : 'disabled'}>Gemerkten Stand laden${snap ? ` (${new Date(snap.t).toLocaleString('de-DE', { dateStyle: 'short', timeStyle: 'short' })})` : ''}</button>
    <button data-a="export">Exportieren</button><button data-a="import">Importieren</button></div>
    <textarea id="admIO" placeholder="Hier erscheint der Export. Zum Importieren Text einfügen und Importieren drücken." hidden></textarea></div>`;
  $('admBody').innerHTML = h;
  dlgEl.scrollTop = scroll;

  const body = $('admBody'), on = (sel, ev, fn) => { for (const el of body.querySelectorAll(sel)) el[ev] = () => fn(el, el.dataset); };
  on('[data-cur]', 'onchange', (i, d) => { save.cur[d.cur] = Math.max(0, +i.value || 0); admChanged(); });
  on('[data-unl]', 'onclick', (b, d) => { setWorlds(+d.unl + 1); admChanged(); });
  on('[data-lock]', 'onclick', (b, d) => { setWorlds(+d.lock); admChanged(); });
  on('[data-go]', 'onclick', (b, d) => { save.world = +d.go; admChanged(); });
  on('[data-runs]', 'onclick', (b, d) => { save.runs[+d.runs] = 0; admChanged(); });
  on('[data-lv]', 'onchange', (i, d) => { const u = U[d.lv]; save.lv[u.id] = Math.max(0, Math.min(u.max, Math.round(+i.value || 0))); admChanged(); });
  on('[data-set]', 'onclick', (b, d) => { const u = U[d.set]; save.lv[u.id] = d.v === 'max' ? u.max : 0; admChanged(); });
  on('[data-upw]', 'onclick', (b, d) => { for (const u of upgradesOf(+d.upw)) save.lv[u.id] = d.v === 'max' ? u.max : 0; admChanged(); });
  on('[data-eq]', 'onchange', (s, d) => { const id = s.value; if (id) grantAbil(id); A[d.eq] = id || null; admChanged(); });
  on('[data-own]', 'onchange', (i, d) => { if (i.checked) grantAbil(d.own); else dropAbil(d.own); admChanged(); });
  on('[data-abl]', 'onchange', (i, d) => { save.lv['ab_' + d.abl] = Math.max(0, Math.min(5, Math.round(+i.value || 0))); admChanged(); });
  on('[data-abset]', 'onclick', (b, d) => { for (let i = 0; i < 3; i++) save.lv[`ab_${d.abset}_${i}`] = +d.v; admChanged(); });
  on('[data-flag]', 'onchange', (i, d) => { adm[d.flag] = i.checked; saveAdm(); });
  on('[data-num]', 'onchange', (i, d) => { adm[d.num] = Math.max(0.1, Math.min(d.num === 'speed' ? 8 : 1000, +i.value || 1)); saveAdm(); S = stats(); });
  on('[data-a]', 'onclick', async (b, d) => {
    const a = d.a, io = $('admIO');
    if (a === 'all') unlockAll();
    if (a === 'fresh'){
      if (Date.now() - admWipeArmed >= 3000){ admWipeArmed = Date.now(); renderAdmin(); setTimeout(() => { if ($('admDlg').open) renderAdmin(); }, 3100); return; }
      admWipeArmed = 0; save = freshSave(); selected = 'kiefer';
    }
    if (a === 'nochoice') save.choice = null;
    if (a === 'add1' || a === 'add2') WORLDS.forEach((w, i) => { addCur(i, 'f', a === 'add1' ? 1e4 : 1e6); addCur(i, 'k', a === 'add1' ? 1e4 : 1e6); });
    if (a === 'zero') save.cur = {};
    if (a === 'worlds') setWorlds(WORLDS.length);
    if (a === 'worlds1') setWorlds(1);
    if (a === 'upmax') for (const u of UPG) if (!u.ab) save.lv[u.id] = u.max;
    if (a === 'up0') for (const u of UPG) if (!u.ab) delete save.lv[u.id];
    if (a === 'aball') for (const id in ABIL) grantAbil(id);
    if (a === 'abmax') for (const id in ABIL){ grantAbil(id); for (let i = 0; i < 3; i++) save.lv[`ab_${id}_${i}`] = 5; }
    if (a === 'abnone') for (const id in ABIL) dropAbil(id);
    if (a === 'song' || a === 'songShop'){
      const r = Math.max(0.8, Math.min(3.5, +$('admSongRate').value || 1)), note = $('admSongNote');
      adm.songRate = r; saveAdm();
      AU.unlock(); b.disabled = true; note.textContent = 'wird erzeugt …';
      try { const bpm = await AU.exportSong(a === 'song' ? 'groove' : 'shop', r); note.textContent = `gespeichert (${bpm} BPM)`; }
      catch (e) { note.textContent = 'ging nicht: ' + e.message; }
      b.disabled = false;
      return;
    }
    if (a === 'snap'){ try { localStorage.setItem(SNAP_KEY, JSON.stringify({ t: Date.now(), save })); } catch (e) {} }
    if (a === 'restore'){
      try { const sn = JSON.parse(localStorage.getItem(SNAP_KEY)); save = Object.assign(freshSave(), sn.save); } catch (e) {}
    }
    if (a === 'export'){ io.hidden = false; io.value = JSON.stringify(save); io.select(); return; }
    if (a === 'import'){
      if (io.hidden || !io.value.trim()){ io.hidden = false; io.value = ''; io.focus(); return; }
      try { save = Object.assign(freshSave(), JSON.parse(io.value)); } catch (e) { io.value = 'Das war kein gültiger Spielstand.'; return; }
    }
    admChanged();
  });
}
