'use strict';
/* =====================================================================
   Run-Ablauf
   ===================================================================== */
function startRun(){
  S = stats();
  WI = save.world; W = WORLDS[WI];
  setupGrid(W);
  clearFruit();
  GEN[W.id]();
  genSpecial();
  finishFruit();
  Object.assign(run, { active: true, over: false, endT: 0, shown: false, stamina: S.stamina, max: S.stamina,
    f: 0, fx: 0, k: 0, bites: 0, crits: 0, broke: false, hardStreak: 0, touched: {}, moving: false,
    charge: 1, rauschT: 0, dash: 0, proj: null, pool: null, beamT: 0, beamTick: 0, beamEnd: null, beamAcc: 0,
    molted: false, moltT: 0, sog: 0, sogCycle: 0, hairT: 0, hairFx: 0, clean: false, left: [...layerKeys(W), SPK].reduce((a, k) => a + (totals[k] || 0), 0), spDone: 0, spT: SP.def ? 2.6 : 0, dropSnd: 0,
    time: 0, spent: 0, warn: 0, sogGain: 0, m: {}, gF: 0, gK: 0, gT: 0 });
  paused = false; $('pauseBox').hidden = true;
  resetCat();
  crumbs.length = 0; pops.length = 0; flash = 0; shake = 0;
  $('endBox').hidden = true;
  buildRunPanel();
  AU.runStart(S.rate * admMul('rate') * admMul('speed')); AU.intensity(0.4);
  show('game');
  hud();
}

const pctOf = k => totals[k] ? eaten[k] / totals[k] * 100 : 0;
function endRun(quick = false){                            // quick: aus dem Pausenmenü, ohne Abschluss-Jingle
  if (run.over) return;
  run.over = true; run.stamina = 0; run.rauschT = 0; run.beamT = 0; run.beamEnd = null; run.dash = 0; run.moltT = 0; run.pool = null;
  flushDrops();                                             // Tröpfchen unterwegs zählen noch
  AU.stopBeam(); AU.song(null); if (!quick) AU.sfx(run.clean ? 'clean' : 'tired');
  paused = false; $('pauseBox').hidden = true;
  const test = cheat('noSave');                             // Admin: Testlauf ohne Gutschrift
  const p = Object.fromEntries(layerKeys(W).map(k => [k, pctOf(k)])), sp = spSummary();
  if (!test){
    addCur(WI, 'f', run.f);
    addCur(WI, 'k', run.k);
    run.portion = stomachAdd(WI, run.f, run.fx);            // ein Teil geht zusätzlich als Nahrungsbrei in den Magen
    save.runs[WI]++;
    const b = save.best[WI] || (save.best[WI] = {});
    for (const k in p) b[k] = Math.max(b[k] || 0, p[k]);
  }
  save.last = { w: WI, f: run.f, fx: run.fx, portion: !!run.portion, k: run.k, bites: run.bites, crits: run.crits, broke: run.broke, clean: run.clean, p, sp, test };
  persist();
}

function showEnd(){
  run.shown = true;
  const L = save.last, w = WORLDS[L.w];
  $('endTitle').textContent = L.clean ? 'Ratzeputz!' : L.broke ? 'Satt und müde' : 'Erschöpft';
  $('endNote').textContent = L.clean ? `Die ganze ${w.name} ist weg.` : L.broke ? 'Gut gefressen. Die Ausdauer ist trotzdem alle.' : 'Die Ausdauer ist aufgebraucht, bevor es richtig losging.';
  let g = `<div>${icon(L.w, 'f')}+${fmtInt(L.f)} <small>${w.fruitCur}</small></div>`;
  if (L.k >= 1) g += `<div>${icon(L.w, 'k')}+${fmtInt(L.k)} <small>${w.coreCur}</small></div>`;
  $('endGain').innerHTML = g;
  const rows = layerKeys(w).map(k => [w.layers[k].name, Math.round(L.p[k] || 0) + ' %']);
  rows.push(['Bisse', L.bites]);
  if (L.sp) rows.push([L.sp.label, L.sp.val]);
  if (L.crits) rows.push(['Kritische Bisse', L.crits]);
  if (L.test) rows.push(['Testlauf', 'nicht gutgeschrieben']);
  else rows.push(['Magen', (L.portion ? '+1 Portion' : stomachFull() ? 'voll' : 'nichts dazu') + ` (${save.gut.p.length}/${S.gutCap})`]);
  $('endStats').innerHTML = rows.map(([a, b]) => `<span>${a}</span><span>${b}</span>`).join('');
  $('endMeter').hidden = !(adm.on && adm.meter);
  if (!$('endMeter').hidden) $('endMeter').innerHTML = meterHtml();
  $('endBox').hidden = false;
  const full = stomachFull();
  $('toGut').hidden = !!L.test || stomachEmpty();
  $('toGut').textContent = full ? `Magen voll: verdauen` : `Verdauen (${save.gut.p.length}/${S.gutCap})`;
  $('toGut').classList.toggle('primary', full);
  $('endNext').classList.toggle('primary', !full);
  if ($('toGut').hidden){ $('endNext').focus(); return; }
  if (!full){ $('endNext').focus(); return; }
  $('toGut').focus();
}

const smooth = x => x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x);

function update(dt){
  if (ctrl.mode !== 'mouse'){
    const h0 = cat.trail[0];
    const kx = keys.right - keys.left, ky = keys.down - keys.up;
    let go = false, a = cat.dir;
    if (ctrl.steer === 'abs'){
      if (kx || ky){ go = true; a = Math.atan2(ky, kx); }
    } else {
      if (kx && run.active && !run.over) cat.dir += kx * 2.4 * dt;
      if (keys.up){ go = true; a = cat.dir; }
    }
    const ahead = go ? 30 * catGrow() : 0;                    // Ziel vor dem Kopf, mit der Raupe größer
    cat.target.x = h0.x + Math.cos(a) * ahead;
    cat.target.y = h0.y + Math.sin(a) * ahead;
  }

  const live = run.active && !run.over;
  const h = cat.trail[0];
  const tx = cat.target.x - h.x, ty = cat.target.y - h.y;
  const far = live && Math.hypot(tx, ty) > headR() * 0.9;
  run.moving = far;
  if (far && run.dash <= 0){
    const want = Math.atan2(ty, tx);
    const diff = Math.atan2(Math.sin(want - cat.dir), Math.cos(want - cat.dir));   // kürzester Weg, egal wie oft die Raupe schon gekreist ist
    const rate = 3.2 * dt;
    cat.dir += Math.max(-rate, Math.min(rate, diff));
  }

  cat.dir = Math.atan2(Math.sin(cat.dir), Math.cos(cat.dir));                      // Richtung bleibt zwischen −180° und 180°
  if (live){
    run.rauschT = Math.max(0, run.rauschT - dt);
    run.moltT = Math.max(0, run.moltT - dt);
    if (run.dash > 0) dashStep(dt);
    if (run.proj) projStep(dt);
    if (run.pool) poolStep(dt);
    if (run.beamT > 0) beamStep(dt);
    if (far && save.abil.passive === 'brennhaare') hairStep(dt);
    // Abklingzeit in Sekunden; läuft erst, wenn die Wirkung vorbei ist
    if (run.charge < 1 && !effectOn()){
      run.charge = cheat('noCd') ? 1 : Math.min(1, run.charge + dt / S.cd);
      if (run.charge >= 1) AU.sfx('ready');
    }
    run.time += dt;
    drainStep(dt);
    cat.t += dt * effRate();
    if (cat.t >= 1){ cat.t -= 1; cat.eStart = cat.e; cat.adv = 0; cat.bitten = false; }
  }
  run.hairFx = Math.max(0, run.hairFx - dt * 5);
  const p = cat.t;
  const gr = gRest(), gc = gComp();
  cat.bump.fill(0); cat.lift.fill(0);

  if (p < P_BITE){
    if (live && !cat.bitten && p >= P_BITE * 0.45){
      cat.bitten = true;
      if (far) spend(bite());
    }
    for (let j = 0; j < S.segs - 1; j++) cat.gaps[j] = gc + (gr - gc) * cat.eStart;
  }
  else if (p < P_PULL){
    const u = (p - P_BITE) / (P_PULL - P_BITE);
    const w = (1 - u) * (S.segs + 1) - 1.5;
    for (let j = 0; j < S.segs - 1; j++) cat.gaps[j] = gc + (gr - gc) * cat.eStart * smooth(w - j + 0.5);
    for (let j = 0; j < S.segs; j++){
      const b = Math.max(0, 1 - Math.abs(j - w - 0.5) / 1.3);
      cat.bump[j] = b; cat.lift[j] = b;
    }
    cat.e = 0; cat.adv = 0;
  }
  else {
    const u = smooth((p - P_PULL) / (1 - P_PULL));
    const wantAdv = far ? stride() * u : cat.adv;
    if (wantAdv > cat.adv) cat.adv += advance(wantAdv - cat.adv);
    cat.e = Math.min(1, cat.adv / stride());
    for (let j = 0; j < S.segs - 1; j++) cat.gaps[j] = gc + (gr - gc) * cat.e;
  }

  if (run.over && !run.shown){
    run.endT += dt;
    if (run.endT > 1.1) showEnd();
  }

  for (let i = crumbs.length - 1; i >= 0; i--){
    const c = crumbs[i];
    c.life -= dt;
    if (c.life <= 0){ crumbs.splice(i, 1); continue; }
    c.x += c.vx * dt; c.y += c.vy * dt; c.vx *= 0.9; c.vy *= 0.9;
  }
  if (live) dropStep(dt);
  if (W.brown && brownQ.length) brownStep();
  run.spT = Math.max(0, (run.spT || 0) - dt);
  if (run.active) gainStep(dt);
  for (let i = pops.length - 1; i >= 0; i--){
    const q = pops[i];
    q.life -= dt; q.y -= dt * (q.kind === 'label' ? 14 : q.kind === 'gain' ? 10 : 22); q.x += q.dx * dt;
    if (q.life <= 0) pops.splice(i, 1);
  }
  shake = Math.max(0, shake - dt * 14);
  flash = Math.max(0, flash - dt);
  snap = Math.max(0, snap - dt * 5);
}
