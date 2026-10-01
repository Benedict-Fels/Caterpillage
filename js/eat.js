'use strict';
/* =====================================================================
   Fressen
   ===================================================================== */
let shake = 0, flash = 0, snap = 0;
const crumbs = [], pops = [];
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

function removePixel(i, k, vx, vy, src = 'Biss'){
  type[i] = 0; D[i*4+3] = 0; eaten[k]++;
  const L = W.layers[k], m = meter(src);
  m.px++;
  if (L.f){ const g = L.f * S.yieldW[WI]; run.f += g; run.gF += g; m.f += g; if (k === 4 && SP.kind === 'kristall') run.fx += g; }   // fx: wird zu Kristall-Brocken im Darm
  if (L.k){ run.k += L.k; run.gK += L.k; m.k += L.k; }
  if (L.juicy && save.abil.passive === 'saftsog'){
    const cap = L.cost * (0.6 + 0.07 * abNode('saftsog', 1));
    if (run.sogCycle < cap){
      const g = Math.min(cap - run.sogCycle, (0.006 + 0.002 * abNode('saftsog', 0)));
      run.sogCycle += g; run.sogGain += g; run.stamina = Math.min(run.max, run.stamina + g);
    }
  }
  if (k === W.breakLayer && !run.broke){ run.broke = true; flash = 1.4; AU.sfx('break'); AU.intensity(1); }
  if (Math.random() < 0.18 && crumbs.length < 260){
    const px = i % SIM, py = (i / SIM) | 0;
    crumbs.push({ x: px + 0.5, y: py + 0.5, vx: vx + (Math.random() - 0.5) * 20, vy: vy + (Math.random() - 0.5) * 20,
      life: 0.5 + Math.random() * 0.4, c: `rgb(${col[i*3]},${col[i*3+1]},${col[i*3+2]})` });
  }
  if (k === 4) specialEaten(i);
  if (--run.left <= 0 && !run.over){ run.clean = true; endRun(); }
}
function damage(i, dmg, vx = 0, vy = 0, src = 'Biss'){
  const k = type[i];
  if (!k) return false;
  run.touched[k] = true;
  meter(src).dmg += Math.min(dmg, Math.max(0, hp[i]));
  hp[i] -= dmg;
  if (hp[i] <= 0){ removePixel(i, k, vx, vy, src); return true; }
  shade(i); return false;
}
function disc(x, y, rr, fn){
  const r2 = rr * rr;
  for (let py = Math.max(0, Math.floor(y - rr)); py <= Math.min(SIM - 1, Math.ceil(y + rr)); py++){
    for (let px = Math.max(0, Math.floor(x - rr)); px <= Math.min(SIM - 1, Math.ceil(x + rr)); px++){
      const dx = px + 0.5 - x, dy = py + 0.5 - y, d2 = dx*dx + dy*dy;
      if (d2 > r2) continue;
      const i = py * SIM + px;
      if (type[i]) fn(i, dx, dy, Math.sqrt(d2));
    }
  }
}

let offs = [], offsFor = -1;
function buildOffsets(reach){
  offs = [];
  const m = Math.ceil(reach) + 1;
  for (let y = -m; y <= m; y++) for (let x = -m; x <= m; x++) offs.push([x, y, Math.hypot(x, y)]);
  offs.sort((a, b) => a[2] - b[2]);
  offsFor = reach;
}
function lineFree(hx, hy, tx, ty, target){
  const dx = tx - hx, dy = ty - hy, d = Math.hypot(dx, dy);
  const n = Math.floor(d / 0.5);
  for (let k = 1; k < n; k++){
    const i = Math.floor(hy + dy * k / n) * SIM + Math.floor(hx + dx * k / n);
    if (i !== target && type[i]) return false;
  }
  return true;
}

function bite(){
  const h = cat.trail[0], r = headR(), reach = r * 2.35;
  const cx = Math.cos(cat.dir), cy = Math.sin(cat.dir);
  if (offsFor !== reach) buildOffsets(reach);
  const bx = Math.floor(h.x), by = Math.floor(h.y);
  const crit = Math.random() < S.crit;
  const power = effPower() * (crit ? S.critMult : 1);
  let hit = 0, removed = 0, hardest = 0, hardestCost = -1;
  const src = run.rauschT > 0 ? 'Biss im Fressrausch' : 'Biss';
  run.sogCycle = 0;
  /* Biss mit Kraft-Budget: Jedes erreichbare Pixel im Bisskegel bringt seinen Anteil Bisskraft mit
     (zum Rand hin schwächer, Kaukraft). Ausgegeben wird die Kraft immer am vordersten noch stehenden
     Pixel, zuerst ein maulgroßer Brocken vor dem Kopf. Ein schwacher Biss frisst so einen kleineren
     Kegel ganz weg, statt alles nur anzukratzen. */
  let budget = 0;
  const cand = [];
  for (const [ox, oy, od] of offs){
    if (od > reach + 0.8) break;
    const px = bx + ox, py = by + oy;
    if (px < 0 || py < 0 || px >= SIM || py >= SIM) continue;
    const dx = px + 0.5 - h.x, dy = py + 0.5 - h.y, d = Math.hypot(dx, dy);
    if (d > reach) continue;
    if (d > r * 0.6 && (dx * cx + dy * cy) / d < 0.25) continue;
    const wgt = 1 - S.falloff * d / reach;
    const i = py * SIM + px;
    if (type[i]) cand.push([i, d, dx, dy, wgt]);
  }
  // Reihenfolge: zuerst ein maulgroßer Brocken direkt vor dem Kopf, damit die Raupe durchpasst
  const fx = h.x + cx * r * 0.6, fy = h.y + cy * r * 0.6;
  for (const c of cand){ const q = c[0]; c[5] = Math.hypot(q % SIM + 0.5 - fx, (q / SIM | 0) + 0.5 - fy); }
  cand.sort((a, b) => a[5] - b[5]);
  // Jedes erreichbare Pixel bringt seinen Anteil Kraft mit; ausgegeben wird sie immer zuerst am vordersten
  // noch stehenden Pixel. So wird der Brocken vor dem Maul ganz weggefressen, statt alles anzukratzen.
  // Die Kraft bleibt nach Herkunftsschicht getrennt und darf nur in gleich harte oder weichere Pixel
  // überlaufen: Sonst schiebt weiches Fruchtfleisch seinen ganzen Überschuss in einen angrenzenden Kern.
  const pool = {}, ord = Object.keys(W.layers).map(Number).sort((a, b) => W.layers[a].hp - W.layers[b].hp);
  for (const q of ord) pool[q] = 0;
  const open = [];
  for (const c of cand){
    const [i, d, dx, dy, wgt] = c, k = type[i];
    if (!k || !lineFree(h.x, h.y, i % SIM + 0.5, (i / SIM | 0) + 0.5, i)) continue;
    pool[k] += power * wgt;
    budget += power * wgt;
    hit++;
    if (W.layers[k].cost > hardestCost){ hardestCost = W.layers[k].cost; hardest = k; }
    open.push(c);
    for (let o = 0; o < open.length && budget > 1e-9; o++){
      const [j, dj, ex, ey] = open[o], kj = type[j];
      if (!kj){ open.splice(o--, 1); continue; }
      const need = W.layers[kj].hp;
      let want = Math.max(0, hp[j]), use = 0;
      for (const q of ord){                                   // weichste passende Kraft zuerst, harte bleibt für harte Pixel
        if (W.layers[q].hp < need || !pool[q]) continue;
        const u = Math.min(pool[q], want - use);
        pool[q] -= u; use += u;
        if (use >= want) break;
      }
      if (use <= 0) continue;
      budget -= use;
      if (damage(j, use + 1e-9, ex / (dj || 1) * 30 - cx * 12, ey / (dj || 1) * 30 - cy * 12, src)){ removed++; open.splice(o--, 1); }
    }
  }
  if (save.abil.passive === 'gabeldruese'){
    const L = abL('gabeldruese');
    const frac = 0.04 + 0.02 * L[0], far = reach * (1.9 + 0.2 * L[1]), cone = Math.cos(coneDeg(L[2]) / 2 * Math.PI / 180);
    disc(h.x, h.y, far, (i, dx, dy, d) => {
      if (d < reach * 0.8 || (dx * cx + dy * cy) / d < cone) return;
      const nh = Math.max(hpMax[i] * 0.08, hp[i] - hpMax[i] * frac);
      if (nh < hp[i]){ meter('Gabeldrüse').dmg += hp[i] - nh; hp[i] = nh; shade(i); }
    });
  }
  run.bites++;
  if (hit){
    snap = 1;
    meter(src).hits++;
    if (crit) run.crits++;
    dmgPop(h.x + cx * r * 2.6, h.y + cy * r * 2.6 - 4, power, crit);
    if (!reduceMotion) shake = Math.min(3.5, 0.6 + removed * 0.04 + (W.layers[hardest].hard ? 0.8 : 0) + (crit ? 1 : 0));
    run.hardStreak = removed === 0 ? run.hardStreak + 1 : 0;
  }
  AU.bite(hit ? AU.kind(W, hardest) : null, removed, crit && hit);
  return hardest;
}
/* Einblendungen im Spielfeld: kind 'label' (Fähigkeit, groß), 'dmg', 'crit', 'gain' (mit Währungs-Icon) */
function pop(x, y, text, kind = 'label', ic = null){
  pops.push({ x, y, life: kind === 'label' ? 0.9 : kind === 'gain' ? 1.1 : 0.75, max: 1, text, kind, ic,
    dx: kind === 'label' ? 0 : (Math.random() - 0.5) * 10 });
  if (pops.length > 60) pops.splice(0, pops.length - 60);
}
function dmgPop(x, y, v, crit){
  if (!ui.nums) return;
  pop(x + (Math.random() - 0.5) * 10, y + (Math.random() - 0.5) * 6, fmtNum(v) + (crit ? '!' : ''), crit ? 'crit' : 'dmg');
}
/* Ertrag sammeln und etwa dreimal pro Sekunde als "+x" am Kopf zeigen */
function gainStep(dt){
  run.gT -= dt;
  if (run.gT > 0) return;
  run.gT = 0.5;
  if (run.gK >= 0.01) AU.sfx('kern');
  // Ertrag über dem Körper, Schaden vor dem Maul: so überlagern sich die Zahlen kaum
  const b = pointAt(stride() * 0.5 + headR() * 3);
  if (ui.nums && run.gF >= 0.05) pop(b.x - 4, b.y - 20, '+' + fmtNum(run.gF), 'gain', [WI, 'f']);
  if (ui.nums && run.gK >= 0.01) pop(b.x + 10, b.y - 30, '+' + fmtNum(run.gK), 'gain', [WI, 'k']);
  run.gF = 0; run.gK = 0;
}

/* Passiv: Brennhaare – brennen dauerhaft rund um den Körper, solange die Raupe unterwegs ist */
function hairStep(dt){
  const L = abL('brennhaare');
  run.hairT -= dt;
  if (run.hairT > 0) return;
  run.hairT = 0.35 - 0.04 * L[2];
  run.hairFx = 1;
  const dmg = effPower() * (0.12 + 0.04 * L[0]), reach = hairReach(L[1]);
  const segs = segments();
  for (let j = 0; j < segs.length; j++){
    const s = segs[j];
    disc(s.x, s.y, s.r + reach, i => damage(i, dmg, 0, 0, 'Brennhaare'));
  }
}

/* Ausdauer: Grundverbrauch pro Sekunde (W.drain, läuft auch im Stand) plus Kosten je Biss nach dem
   härtesten getroffenen Material. Ein Biss ins Leere kostet wenig. Im Fressrausch kostet nichts. */
function spend(k){
  const L = k ? W.layers[k] : null;
  loseStamina(L ? L.cost * (L.hard ? S.hardMult : 1) : EMPTY_BITE);
}
function drainStep(dt){ loseStamina(W.drain * dt); }
function loseStamina(c){
  if (run.rauschT > 0 || run.over) return;
  run.spent += c;
  if (cheat('infStam')) return;
  run.stamina = Math.max(0, run.stamina - c);
  const fr = run.stamina / run.max;                        // Warnton bei 25 % und 10 %
  if (fr > 0 && fr < 0.1 && run.warn < 2){ run.warn = 2; AU.sfx('low2'); }
  else if (fr > 0 && fr < 0.25 && run.warn < 1){ run.warn = 1; AU.sfx('low1'); }
  if (run.stamina <= 0) exhausted();
}
function exhausted(){
  if (save.abil.passive === 'haeutung' && !run.molted){
    const L = abL('haeutung');
    run.molted = true;
    run.stamina = run.max * (0.25 + 0.05 * L[0]);
    run.moltT = 6 + L[2];
    const h = cat.trail[0]; pop(h.x, h.y - 10, 'Häutung!'); run.warn = 0; AU.sfx('molt');
    return;
  }
  endRun();
}

/* ---------- Aktive Fähigkeiten ---------- */
function useActive(){
  const id = save.abil.active;
  if (!id || run.charge < 1 || !run.active || run.over || paused) return;
  run.charge = cheat('noCd') ? 1 : 0;
  meter(ABIL[id].name).uses = (meter(ABIL[id].name).uses || 0) + 1;
  const L = abL(id), h = cat.trail[0];
  if (id === 'fressrausch'){ run.rauschT = 3 + L[0]; pop(h.x, h.y - 10, 'Fressrausch!'); }
  if (id === 'schub'){ run.dash = 30 + 8 * L[0]; pop(h.x, h.y - 10, 'Schub!'); }
  if (id === 'spucke'){ run.proj = { x: h.x, y: h.y, dx: Math.cos(cat.dir), dy: Math.sin(cat.dir), dist: 0 }; }
  if (id === 'seidenfaden'){ run.beamT = 2.5 + 0.5 * L[0]; run.beamTick = 0; AU.beam(run.beamT); }
  AU.sfx({ fressrausch: 'rausch', schub: 'dash', spucke: 'spit' }[id]);
  hud();
}

function dashStep(dt){
  const L = abL('schub');
  let move = Math.min(run.dash, 170 * dt);
  run.dash -= move;
  const r = headR() * (1 + 0.1 * L[1]);
  const cx = Math.cos(cat.dir), cy = Math.sin(cat.dir);
  while (move > 0){
    const h = cat.trail[0], nx = h.x + cx * STEP, ny = h.y + cy * STEP;
    disc(nx, ny, r, (i, dx, dy) => { const k = type[i]; if (!W.layers[k].hard){ meter('Schub').dmg += Math.max(0, hp[i]); removePixel(i, k, dx * 8 - cx * 20, dy * 8 - cy * 20, 'Schub'); } });
    if (blocked(nx, ny)){
      run.dash = 0;
      if (L[2]){                                              // Wucht: Aufprall an der harten Schicht
        const dmg = effPower() * 3 * L[2];
        disc(nx + cx * r, ny + cy * r, r * 1.6, (i, dx, dy, d) => damage(i, dmg * (1 - 0.5 * d / (r * 1.6)), dx * 4, dy * 4, 'Schub'));
        AU.sfx('wumms'); pop(nx, ny - 8, 'Wumms!'); dmgPop(nx + cx * r, ny + cy * r, dmg, true); if (!reduceMotion) shake = 3.5;
      }
      break;
    }
    cat.trail.unshift({ x: nx, y: ny });
    move -= STEP;
  }
  if (!reduceMotion) shake = Math.max(shake, 1.2);
}

function projStep(dt){
  const p = run.proj;
  let move = 150 * dt;
  while (move > 0){
    p.x += p.dx * 0.5; p.y += p.dy * 0.5; p.dist += 0.5; move -= 0.5;
    const px = Math.floor(p.x), py = Math.floor(p.y);
    const out = px < 0 || py < 0 || px >= SIM || py >= SIM;
    if (out || p.dist > 160 || type[py * SIM + px]){
      if (!out) explode(p.x, p.y);
      run.proj = null; return;
    }
  }
}
function spitDmg(){ return Math.max(40, S.power * admMul('pow') * 10) * (1 + 0.3 * abNode('spucke', 1)); }
function explode(x, y){
  const L = abL('spucke'), rr = 9 + 1.5 * L[0], dmg = spitDmg();
  disc(x, y, rr, (i, dx, dy, d) => damage(i, dmg * (1 - 0.5 * d / rr), dx * 4, dy * 4, 'Säurespucke'));
  if (L[2]) run.pool = { x, y, r: rr * 1.1, t: L[2], tick: 0 };
  AU.sfx('splash'); pop(x, y - 6, 'Zisch!'); dmgPop(x, y + 4, dmg, true);
  if (!reduceMotion) shake = 3;
}
function poolStep(dt){
  const p = run.pool;
  p.t -= dt; p.tick -= dt;
  if (p.tick <= 0){
    p.tick = 0.2;
    const dmg = spitDmg() * 0.1;
    disc(p.x, p.y, p.r, i => damage(i, dmg, 0, 0, 'Säurespucke'));
    dmgPop(p.x, p.y, dmg, false);
  }
  if (p.t <= 0) run.pool = null;
}

function beamStep(dt){
  const L = abL('seidenfaden');
  run.beamT -= dt;
  run.beamTick -= dt;
  const h = cat.trail[0], cx = Math.cos(cat.dir), cy = Math.sin(cat.dir);
  const dmg = effPower() * (0.4 + 0.1 * L[1]), depth = 5 + 2 * L[2];
  let end = null;
  const tick = run.beamTick <= 0;
  if (tick) run.beamTick = 0.08;
  for (const side of [0, -1, 1]){
    let hits = 0;
    for (let s = headR() * 0.9; s < 120; s += 0.5){
      const x = h.x + cx * s - cy * side, y = h.y + cy * s + cx * side;
      const px = Math.floor(x), py = Math.floor(y);
      if (px < 0 || py < 0 || px >= SIM || py >= SIM) break;
      const i = py * SIM + px;
      if (!type[i]) continue;
      if (side === 0 && !end) end = { x, y };
      if (tick) damage(i, dmg, cx * 25, cy * 25, 'Seidenfaden');
      if (++hits >= depth) break;
    }
  }
  run.beamEnd = end || { x: h.x + cx * 120, y: h.y + cy * 120 };
  if (tick && end && (run.beamAcc = (run.beamAcc || 0) + 1) % 3 === 0) dmgPop(end.x, end.y, dmg, false);
  if (run.beamT <= 0) run.beamEnd = null;
}
