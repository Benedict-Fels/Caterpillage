'use strict';
/* =====================================================================
   Spielstand
   ===================================================================== */
/* Die Speicher-Schlüssel tragen noch den alten Arbeitstitel "caterpillage", damit vorhandene Spielstände erhalten bleiben. */
const SAVE_KEY = 'caterpillage.save.v3', OLD_KEYS = ['caterpillage.save.v2', 'caterpillage.save.v1'];
const freshSave = () => ({ v: 3, cur: {}, lv: {}, runs: [0, 0, 0, 0, 0, 0], unlocked: 1, world: 0,
  abil: { own: {}, from: {}, active: null, passive: null }, choice: null, best: {}, last: null, spOff: {},
  gut: { p: [] },                           // Magen: Portionen { w, n, x } (Nährstoffe normal und aus Zuckerkristallen)
  gutLay: null,                             // Darm-Stellung { pf, z: [[x, y]], g: [x, y] (Gallen-Zilie), per: { Welt: { pf, z, g } } }
  gutFound: {} });                          // entdeckte richtige Ausgänge je Brockenart { oel: 'lymph' }
let save = freshSave();
const cur = (w, t) => save.cur[w + t] || 0;
const addCur = (w, t, x) => { save.cur[w + t] = cur(w, t) + x; };

function loadSave(){
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw){
      const d = JSON.parse(raw);
      save = Object.assign(freshSave(), d);
      save.abil = Object.assign(freshSave().abil, d.abil || {});
      save.gut = Object.assign(freshSave().gut, d.gut || {});
      migrateGut();
      return;
    }
    const v2 = localStorage.getItem(OLD_KEYS[0]);
    if (v2){                                   // Stand der zweiten Version: Obergrenzen neu, Fähigkeiten auf Grundstufe
      const d = JSON.parse(v2);
      save = Object.assign(freshSave(), d, { v: 3 });
      save.abil = Object.assign(freshSave().abil, d.abil || {});
      for (const id in save.abil.own) save.abil.own[id] = 1;
      delete save.lv.krit2;                    // war "Wuchtbiss", ist jetzt Krit II
      for (const id in save.lv) if (!U[id]) delete save.lv[id]; else save.lv[id] = Math.min(save.lv[id], U[id].max);
      persist(); return;
    }
    const v1 = localStorage.getItem(OLD_KEYS[1]);
    if (v1){
      const d = JSON.parse(v1);
      save.cur['0f'] = d.saft || 0; save.cur['0k'] = d.kerne || 0;
      save.lv = d.lv || {}; save.runs[0] = d.runs || 0;
      for (const id in save.lv) if (!U[id]) delete save.lv[id]; else save.lv[id] = Math.min(save.lv[id], U[id].max);
      persist();
    }
  } catch (e) { /* kein Speicher verfügbar */ }
}
/* Stufe 15 → 16: Magen war eine Pflicht-Station für die Fruchtwährung. Rest gutschreiben, alte Darm-Knoten erstatten. */
function migrateGut(){
  const g = save.gut;
  if (g.f || g.x){
    for (const t of ['f', 'x']) for (const w in (g[t] || {})) addCur(+w, 'f', g[t][w] || 0);
    save.gut = { p: [] };
  }
  const refund = (id, w, cost, grow, from = 0) => {
    const l = save.lv[id] || 0;
    for (let i = from; i < l; i++) addCur(w, 'f', Math.round(cost * Math.pow(grow, i)));
  };
  if (save.lv.peristaltik){ refund('peristaltik', 0, 25, 1.55); delete save.lv.peristaltik; }
  if (save.lv.zotten){ refund('zotten', 0, 200, 1.9); delete save.lv.zotten; }
  if (save.lv.darmschlinge > 2){ refund('darmschlinge', 1, 300, 2.2, 2); save.lv.darmschlinge = 2; }
  // Stufe 16 → 17: Falten-Darm durch Zilien-Plinko ersetzt; Längere Zotten und Darmschlinge gibt es nicht mehr
  if (save.lv.zottenlaenge){ refund('zottenlaenge', 0, 150, 1.9); delete save.lv.zottenlaenge; }
  if (save.lv.darmschlinge){ refund('darmschlinge', 1, 400, 2.5); delete save.lv.darmschlinge; }
}
function persist(){ try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch (e) {} }

/* Anzeige-Einstellungen und Admin-Modus, getrennt vom Spielstand gespeichert */
const UI_KEY = 'caterpillage.ui.v1', ADM_KEY = 'caterpillage.admin.v1', SNAP_KEY = 'caterpillage.snapshot.v1';
const isMobile = matchMedia('(pointer: coarse)').matches && Math.min(screen.width, screen.height) < 820;
const ui = { full: isMobile, nums: true, shake: 1 };                // shake: 0 aus, 1 leicht, 2 stark
try { Object.assign(ui, JSON.parse(localStorage.getItem(UI_KEY) || '{}')); } catch (e) {}
const saveUi = () => { try { localStorage.setItem(UI_KEY, JSON.stringify(ui)); } catch (e) {} };
const adm = { on: false, known: false, infStam: false, noCd: false, noSave: false, meter: true, pow: 1, rate: 1, speed: 1 };
try { Object.assign(adm, JSON.parse(localStorage.getItem(ADM_KEY) || '{}')); } catch (e) {}
if (/[?&#]admin\b/.test(location.search + location.hash)){ adm.on = true; adm.known = true; }
const saveAdm = () => { try { localStorage.setItem(ADM_KEY, JSON.stringify(adm)); } catch (e) {} };
const cheat = k => adm.on && adm[k];
const admMul = k => adm.on ? (+adm[k] || 1) : 1;
