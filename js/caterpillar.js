'use strict';
/* =====================================================================
   Raupe
   ===================================================================== */
const MAXSEG = 20;
const STEP = 0.5;
const P_BITE = 0.18, P_PULL = 0.65;

const cat = {
  trail: [], dir: 0, t: 0, bitten: false,
  eStart: 1, adv: 0, e: 1,
  gaps: new Float32Array(MAXSEG), bump: new Float32Array(MAXSEG), lift: new Float32Array(MAXSEG),
  target: { x: 30, y: 128 },
};

const run = { active: false, over: false, endT: 0, shown: false, stamina: 0, max: 0, f: 0, k: 0,
  bites: 0, crits: 0, broke: false, hardStreak: 0, touched: {}, moving: false,
  charge: 1, rauschT: 0, dash: 0, proj: null, pool: null, beamT: 0, beamTick: 0, beamEnd: null, beamAcc: 0,
  molted: false, moltT: 0, sog: 0, sogCycle: 0, hairT: 0, hairFx: 0, time: 0, spent: 0, warn: 0, sogGain: 0, m: {}, gF: 0, gK: 0, gT: 0 };
let paused = false;

const effPower = () => S.power * admMul('pow') * (run.rauschT > 0 ? 2 + 0.25 * abNode('fressrausch', 1) : 1);
const effRate = () => S.rate * admMul('rate') * (run.rauschT > 0 ? 1.5 + 0.1 * abNode('fressrausch', 2) : 1);
const effectOn = () => run.rauschT > 0 || run.dash > 0 || !!run.proj || run.beamT > 0;
/* Messwerte je Quelle: Schaden (ohne Überschuss), gefressene Pixel, Ertrag */
function meter(src){ return run.m[src] || (run.m[src] = { dmg: 0, px: 0, f: 0, k: 0, hits: 0 }); }
const headR = () => S.mouth * (run.moltT > 0 ? 1.25 + 0.05 * abNode('haeutung', 1) : 1);
const gRest = () => headR() * 1.15;
const gComp = () => headR() * 0.72;
const stride = () => (S.segs - 1) * (gRest() - gComp());

function resetCat(){
  cat.trail = [];
  const hx = 26, hy = CY;
  for (let i = 0; i < 400; i++) cat.trail.push({ x: hx - i * STEP, y: hy });
  cat.dir = 0; cat.t = 0; cat.bitten = false;
  cat.eStart = 1; cat.adv = 0; cat.e = 1;
  cat.target.x = hx; cat.target.y = hy;
  cat.gaps.fill(gRest());
}
function pointAt(dist){
  const f = dist / STEP, i = Math.floor(f), tr = cat.trail;
  if (i >= tr.length - 1) return tr[tr.length - 1];
  const a = tr[i], b = tr[i + 1], k = f - i;
  return { x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k };
}
function segments(){
  const r = headR(), segs = S.segs, gr = gRest(), gc = gComp();
  const out = [{ x: cat.trail[0].x, y: cat.trail[0].y, r }];
  let dist = 0;
  for (let j = 0; j < segs - 1; j++){
    dist += cat.gaps[j];
    const p = pointAt(dist), i = j + 1;
    const comp = 1 - (cat.gaps[j] - gc) / (gr - gc);
    const taper = 1 - (i / segs) * 0.35;
    out.push({ x: p.x, y: p.y, r: r * 0.92 * taper * (1 + 0.14 * comp + 0.16 * cat.bump[i]) });
  }
  return out;
}

function blocked(x, y){
  const r = headR() * 0.8, r2 = r * r;
  if (x < r || y < r || x > SIM - r || y > SIM - r) return true;
  for (let py = Math.floor(y - r); py <= Math.ceil(y + r); py++){
    for (let px = Math.floor(x - r); px <= Math.ceil(x + r); px++){
      const dx = px + 0.5 - x, dy = py + 0.5 - y;
      if (dx*dx + dy*dy > r2) continue;
      if (type[py * SIM + px]) return true;
    }
  }
  return false;
}
function advance(want){
  let moved = 0;
  while (moved + STEP <= want + 1e-6){
    const h = cat.trail[0];
    let ok = false;
    for (const off of [0, 0.3, -0.3, 0.6, -0.6]){
      const a = cat.dir + off;
      const nx = h.x + Math.cos(a) * STEP, ny = h.y + Math.sin(a) * STEP;
      if (!blocked(nx, ny)){ cat.trail.unshift({ x: nx, y: ny }); ok = true; break; }
    }
    if (!ok) break;
    moved += STEP;
  }
  if (cat.trail.length > 800) cat.trail.length = 800;
  return moved;
}
