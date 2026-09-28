'use strict';
/* =====================================================================
   Spielstand
   ===================================================================== */
const SAVE_KEY = 'caterpillage.save.v3', OLD_KEYS = ['caterpillage.save.v2', 'caterpillage.save.v1'];
const freshSave = () => ({ v: 3, cur: {}, lv: {}, runs: [0, 0, 0, 0, 0, 0], unlocked: 1, world: 0,
  abil: { own: {}, from: {}, active: null, passive: null }, choice: null, best: {}, last: null });
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
