'use strict';
/* =====================================================================
   Screens, Eingabe, Schleife
   ===================================================================== */
let screen = 'game';
function show(which){
  screen = which;
  $('game').hidden = which !== 'game';
  $('shop').hidden = which !== 'shop';
  document.body.classList.toggle('ingame', which === 'game');
  AU.song(which === 'game' ? W.id : 'shop');
  if (which === 'shop'){ paused = false; $('pauseBox').hidden = true; renderShop(); if (save.choice) openChoice(); }
}

/* ---------- Pause ---------- */
function pauseGame(){
  if (screen !== 'game' || !run.active || run.over || paused) return;
  paused = true;
  keys.up = keys.down = keys.left = keys.right = 0;
  $('pauseNote').textContent = `${W.name} · Run ${save.runs[WI] + 1} · Ausdauer ${fmtInt(Math.ceil(run.stamina))} / ${fmtInt(run.max)}`;
  $('pFull').textContent = ui.full ? 'Vollbild aus' : 'Vollbild an';
  $('pauseBox').hidden = false;
  $('pResume').focus();
  AU.stopBeam(); AU.sfx('pauseOn');
}
function resumeGame(){
  if (!paused) return;
  paused = false;
  $('pauseBox').hidden = true;
  AU.sfx('pauseOff');
  if (run.beamT > 0) AU.beam(run.beamT);
  reqFull();
}
$('pauseBtn').onclick = e => { e.currentTarget.blur(); pauseGame(); };
$('pResume').onclick = resumeGame;
$('pRestart').onclick = () => { if (run.active && !run.over) endRun(true); startRun(); };   // Ertrag gutschreiben, sofort neue Frucht
// Run beenden: Ertrag gutschreiben und ohne Ergebnis-Fenster direkt ins Hauptmenü
$('pEnd').onclick = () => {
  paused = false; $('pauseBox').hidden = true;
  if (run.active && !run.over) endRun(true);
  run.shown = true; run.active = false;
  show('shop');
};
$('pFull').onclick = () => { toggleFull(); $('pFull').textContent = ui.full ? 'Vollbild aus' : 'Vollbild an'; };
$('pCtrl').onclick = () => { syncCtrlForm(); dlg.showModal(); };
$('pAdm').onclick = () => openAdmin();
document.addEventListener('visibilitychange', () => { if (document.hidden) pauseGame(); });

/* ---------- Vollbild ---------- */
function applyFull(){
  document.body.classList.toggle('full', ui.full);
  $('fullBtn').textContent = ui.full ? 'Vollbild aus' : 'Vollbild';
}
function reqFull(){
  const el = document.documentElement;
  if (!ui.full || document.fullscreenElement || !document.fullscreenEnabled || !el.requestFullscreen) return;
  el.requestFullscreen({ navigationUI: 'hide' })
    .then(() => { try { navigator.keyboard && navigator.keyboard.lock && navigator.keyboard.lock(['Escape']); } catch (e) {} })
    .catch(() => {});
}
function toggleFull(){
  ui.full = !ui.full; saveUi(); applyFull();
  if (ui.full) reqFull();
  else if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
}
$('fullBtn').onclick = toggleFull;
// Esc beendet im Browser-Vollbild das Vollbild selbst: dann wenigstens pausieren
document.addEventListener('fullscreenchange', () => { if (!document.fullscreenElement) pauseGame(); });
// Vollbild braucht eine Berührung/einen Klick: beim Antippen des Spielfelds einschalten (Handy: automatisch an)
cv.addEventListener('pointerdown', () => { if (!paused) reqFull(); });

/* ---------- Einstellungen ---------- */
const CTRL_KEY = 'caterpillage.controls.v1';
const ctrl = { mode: 'mouse', steer: 'abs' };
try { Object.assign(ctrl, JSON.parse(localStorage.getItem(CTRL_KEY) || '{}')); } catch (e) {}
const CTRL_HINT = {
  mouse: 'Führe die Raupe mit Maus oder Finger an die Frucht.',
  wasd: 'Steuere die Raupe mit W, A, S und D an die Frucht.',
  arrows: 'Steuere die Raupe mit den Pfeiltasten an die Frucht.',
};
const KEYSETS = {
  wasd:   { KeyW: 'up', KeyA: 'left', KeyS: 'down', KeyD: 'right' },
  arrows: { ArrowUp: 'up', ArrowLeft: 'left', ArrowDown: 'down', ArrowRight: 'right' },
};
const dlg = $('ctrlDlg');
function syncCtrlForm(){
  for (const r of dlg.querySelectorAll('input[name=mode]')) r.checked = r.value === ctrl.mode;
  for (const r of dlg.querySelectorAll('input[name=steer]')) r.checked = r.value === ctrl.steer;
  $('steerSet').disabled = ctrl.mode === 'mouse';
  $('optFull').checked = ui.full;
  $('optNums').checked = ui.nums;
  for (const r of dlg.querySelectorAll('input[name=shake]')) r.checked = +r.value === ui.shake;
  $('optAdm').checked = adm.on;
  $('optMusic').value = snd.music; $('oMusic').textContent = snd.music + ' %';
  $('optSfx').value = snd.sfx; $('oSfx').textContent = snd.sfx + ' %';
  $('optMute').checked = snd.mute;
  $('admSet').hidden = !(adm.known || adm.on);
}
dlg.addEventListener('change', e => {
  if (e.target.name === 'mode' || e.target.name === 'steer') ctrl[e.target.name] = e.target.value;
  if (e.target.id === 'optFull' && e.target.checked !== ui.full) toggleFull();
  if (e.target.id === 'optNums'){ ui.nums = e.target.checked; saveUi(); }
  if (e.target.name === 'shake'){ ui.shake = +e.target.value; saveUi(); }
  if (e.target.id === 'optAdm') setAdmin(e.target.checked);
  if (e.target.id === 'optMute'){ snd.mute = e.target.checked; saveSnd(); AU.apply(); syncSndBtn(); }
  if (e.target.id === 'optSfx') AU.sfx('buy', 0.3);                // Probeton in der neuen Lautstärke
  try { localStorage.setItem(CTRL_KEY, JSON.stringify(ctrl)); } catch (err) {}
  syncCtrlForm();
  keys.up = keys.down = keys.left = keys.right = 0;
  if (ctrl.mode !== 'mouse'){ const h = cat.trail[0]; cat.target.x = h.x; cat.target.y = h.y; }
});
$('ctrlBtn').onclick = () => { syncCtrlForm(); dlg.showModal(); };
dlg.addEventListener('input', e => {
  if (e.target.id === 'optMusic'){ snd.music = +e.target.value; $('oMusic').textContent = snd.music + ' %'; }
  else if (e.target.id === 'optSfx'){ snd.sfx = +e.target.value; $('oSfx').textContent = snd.sfx + ' %'; }
  else return;
  saveSnd(); AU.apply();
});
function syncSndBtn(){ $('sndBtn').textContent = snd.mute ? 'Ton an' : 'Ton aus'; }
function toggleMute(){ snd.mute = !snd.mute; saveSnd(); AU.apply(); syncSndBtn(); if (dlg.open) syncCtrlForm(); }
$('sndBtn').onclick = e => { e.currentTarget.blur(); toggleMute(); };
syncSndBtn();
