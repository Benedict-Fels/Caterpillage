'use strict';
const keys = { left: 0, right: 0, up: 0, down: 0 };
function toSim(e){                                         // Zeiger → Raster, über die Kamera
  const r = cv.getBoundingClientRect();
  ptr.on = true; ptr.u = (e.clientX - r.left) / r.width; ptr.v = (e.clientY - r.top) / r.height;
  return { x: cam.x + ptr.u * cam.V, y: cam.y + ptr.v * cam.V };
}
cv.addEventListener('pointermove', e => { if (ctrl.mode !== 'mouse' || paused) return; const p = toSim(e); cat.target.x = p.x; cat.target.y = p.y; });
cv.addEventListener('pointerdown', e => {
  if (ctrl.mode !== 'mouse' || paused) return;
  cv.setPointerCapture(e.pointerId);
  const p = toSim(e); cat.target.x = p.x; cat.target.y = p.y;
});
const modalOpen = () => dlg.open || $('choiceDlg').open || $('admDlg').open;
let typed = '';
addEventListener('keydown', e => {
  const tag = e.target && e.target.tagName;
  if (tag !== 'INPUT' && tag !== 'TEXTAREA' && e.key && e.key.length === 1){
    typed = (typed + e.key.toLowerCase()).slice(-5);
    if (typed === 'admin'){ typed = ''; setAdmin(!adm.on); pop(cat.trail[0].x, cat.trail[0].y - 12, adm.on ? 'Admin an' : 'Admin aus'); }
  }
  if (e.code === 'KeyM' && tag !== 'INPUT' && tag !== 'TEXTAREA' && !typed.endsWith('adm') && !e.ctrlKey && !e.metaKey && !e.altKey && !e.repeat){ toggleMute(); return; }
  if (screen !== 'game' || modalOpen() || e.ctrlKey || e.metaKey || e.altKey) return;
  if (e.code === 'Escape' || e.code === 'KeyP'){
    if (!run.active || run.over) return;
    e.preventDefault();
    if (paused) resumeGame(); else pauseGame();
    return;
  }
  if (paused) return;
  if (e.code === 'Space'){ e.preventDefault(); if (!e.repeat) useActive(); return; }
  const k = KEYSETS[ctrl.mode] && KEYSETS[ctrl.mode][e.code];
  if (!k) return;
  keys[k] = 1; e.preventDefault();
});
addEventListener('keyup', e => { const k = KEYSETS[ctrl.mode] && KEYSETS[ctrl.mode][e.code]; if (k) keys[k] = 0; });
addEventListener('blur', () => { keys.up = keys.down = keys.left = keys.right = 0; });

$('abilBtn').onclick = e => { e.currentTarget.blur(); useActive(); };
$('toShop').onclick = () => { run.active = false; show('shop'); };
$('nextRun').onclick = startRun;
let wipeArmed = 0;
$('wipe').onclick = () => {
  const b = $('wipe');
  if (Date.now() - wipeArmed < 3000){
    save = freshSave(); persist(); S = stats(); selected = 'kiefer';
    try { for (const k of OLD_KEYS) localStorage.removeItem(k); } catch (e) {}
    b.textContent = 'Spielstand löschen'; wipeArmed = 0;
    startRun();
  } else {
    wipeArmed = Date.now(); b.textContent = 'Wirklich löschen? Nochmal klicken';
    setTimeout(() => { if (Date.now() - wipeArmed >= 3000) b.textContent = 'Spielstand löschen'; }, 3100);
  }
};

matchMedia('(prefers-color-scheme: dark)').addEventListener('change', readTheme);
new MutationObserver(readTheme).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

let last = performance.now(), frame = 0;
const dev = { manual: false };
function loop(now){
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  AU.pause(screen === 'game' && (paused || modalOpen()));   // Musik gedämpft in Pause und Dialogen
  if (screen === 'game' && !dev.manual && !modalOpen()){
    if (!paused){
      // Spieltempo (Admin) in kleinen Schritten, damit kein Biss übersprungen wird
      let rest = dt * admMul('speed');
      while (rest > 1e-6){ const st = Math.min(rest, 0.02); update(st); rest -= st; }
    }
    draw();
    if (++frame % 6 === 0) hud();
  }
  if (screen === 'gut') gutFrame(dt);
  // Taktgeber für die Musik: Biss-Takt in Echtzeit und Phase bis zum nächsten Biss
  if (screen === 'game' && run.active && !run.over && !paused && !modalOpen() && !dev.manual){
    AU.clock(effRate() * admMul('speed'), cat.t - P_BITE * 0.45, run.moving);
  }
  requestAnimationFrame(loop);
}
