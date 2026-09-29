'use strict';
/* =====================================================================
   Sonderstellen: Jede Frucht bekommt genau eine Art (Saftblase, Zuckerkristall
   oder Faulstelle), zufällig gezogen, davon mehrere Stück. Sie liegen als
   Schicht 4 im Raster; W.layers[4] wird pro Frucht aus der Wirtsschicht
   (W.spHost) abgeleitet.
   ===================================================================== */
const SP = { kind: null, def: null, items: [], host: 2 };
const drops = [];                                            // Saft-Tröpfchen auf dem Weg zur Raupe

const hexRgb = h => [1, 3, 5].map(o => parseInt(h.substr(o, 2), 16));
function mixCol(i, to, a){                                   // Pixelfarbe Richtung "to" mischen
  for (let c = 0; c < 3; c++) col[i*3+c] = col[i*3+c] * (1 - a) + to[c] * a;
}
/* Pixel i auf Schicht 4 umstellen (Härte und Zählung neu) */
function toSpecial(i, n){
  totals[type[i]]--;
  type[i] = 4;
  hpMax[i] = hp[i] = W.layers[4].hp * (0.88 + 0.24 * n);
  totals[4]++;
}

const spHostOf = kind => (W.spHosts && W.spHosts[kind]) || W.spHost;
const frac = x => x - Math.floor(x);

function genSpecial(){
  SP.items = []; drops.length = 0;
  const kinds = W.spKinds || Object.keys(SPECIAL);
  let pick = adm.on && adm.sp ? adm.sp : kinds[Math.floor(Math.random() * kinds.length)];
  if (pick !== 'none' && !kinds.includes(pick)) pick = kinds[0];     // erzwungene Art gibt es hier nicht
  if (pick === 'none'){ SP.kind = null; SP.def = null; return; }
  const over = (W.spOver && W.spOver[pick]) || {}, hk = spHostOf(pick);
  const def = Object.assign({}, SPECIAL[pick], over);             // z. B. Walnuss: Öltropfen statt Saftblase
  SP.kind = pick; SP.def = def; SP.host = hk;
  W.layers[4] = Object.assign(def.layer(W.layers[hk], W), { name: def.name }, over.L || {});
  const count = def.n[0] + Math.floor(Math.random() * (def.n[1] - def.n[0] + 1));
  if (pick === 'faul') return genRot(count, def);

  // Blasen und Kristalle liegen ganz in der Wirtsschicht
  for (let tries = 0; SP.items.length < count && tries < 500; tries++){
    const r = R * def.r * (tries > 250 ? 0.7 : 1);
    const a = Math.random() * Math.PI * 2, d = R * (0.1 + Math.random() * 0.85);
    const x = CX + Math.cos(a) * d, y = CY + Math.sin(a) * d;
    let all = 0, ok = 0;
    disc(x, y, r * (pick === 'blase' ? 1.5 : 1) + 1.5, i => { all++; if (type[i] === hk) ok++; });
    if (!all || ok < all) continue;
    if (SP.items.some(b => Math.hypot(b.x - x, b.y - y) < (b.r + r) * 1.5 + 4)) continue;
    const item = { x, y, r, left: 0, popped: false, ph: Math.random() * 6.3,
      spikes: 5 + Math.floor(Math.random() * 2), rot: Math.random() * 6.3 };
    if (pick === 'blase') paintBubble(item); else paintCrystal(item);
    SP.items.push(item);
  }
}

/* Saftblase / Öltropfen: hellere, glasige Stelle, unregelmäßig geformt, weicher Rand, kleiner Glanz.
   Farbe: aufgehellte Fruchtfarbe oder (def.tint) eine eigene Farbe wie Öl. */
function paintBubble(b){
  const r = b.r, w1 = Math.random() * 6.3, w2 = Math.random() * 6.3, w3 = Math.random() * 6.3;
  const tint = SP.def.tint, stretch = 0.8 + Math.random() * 0.4, sa = Math.random() * 3.14;
  disc(b.x, b.y, r * 1.35, (i, dx, dy) => {
    const ux = dx * Math.cos(sa) + dy * Math.sin(sa), uy = (-dx * Math.sin(sa) + dy * Math.cos(sa)) * stretch;
    const dd = Math.hypot(ux, uy), th = Math.atan2(uy, ux);
    const rr = r * (1 + 0.1 * Math.sin(2 * th + w1) + 0.06 * Math.sin(3 * th + w2) + 0.04 * Math.sin(5 * th + w3));
    if (dd > rr) return;
    const n = noise(i % SIM, i / SIM | 0, 7), e = dd / rr;
    toSpecial(i, n);
    const c = [col[i*3], col[i*3+1], col[i*3+2]];
    if (tint) mixCol(i, tint, 0.62 * (1 - e * e * 0.5));
    else mixCol(i, c.map(v => Math.min(255, v * 1.28 + 38)), 0.75 * (1 - e * e * 0.6));   // heller zur Mitte
    if (e > 0.84) mixCol(i, tint ? tint.map(v => v * 0.8) : c.map(v => Math.min(255, v * 1.45 + 50)), 0.35);   // Rand
    const hi = Math.max(0, 1 - Math.hypot(dx + r * 0.4, dy + r * 0.4) / (r * 0.22));
    if (hi > 0) mixCol(i, [255, 255, 255], 0.6 * hi);      // kleiner Glanzpunkt
    b.left++;
  });
}

/* Zuckerkristall: Büschel aus länglichen Kristallen, von oben gesehen (wie Kandis).
   Jeder Kristall ist ein Prisma mit Spitze; zwei Längsfacetten, heller Grat, dunkle Kante. */
const AMBER = [[168, 102, 34], [222, 160, 70], [252, 220, 148], [255, 246, 220]];
function paintCrystal(b){
  const r = b.r, shards = [], ns = 9 + Math.floor(Math.random() * 5);
  const lx = -0.6, ly = -0.8;                                    // Licht von oben links
  for (let s = 0; s < ns; s++){
    const a = s / ns * 6.283 + (Math.random() - 0.5) * 0.9, len = r * (0.55 + 0.45 * Math.random());
    const off = r * 0.15 * Math.random(), oa = Math.random() * 6.283;
    shards.push({ a, len, wid: len * (0.2 + 0.14 * Math.random()), x: Math.cos(oa) * off, y: Math.sin(oa) * off,
      c: Math.cos(a), s: Math.sin(a) });
  }
  shards.sort((p, q) => q.len - p.len);                          // lange unten, kurze obenauf
  for (let s = 0; s < 3; s++){                                   // ein paar kurze, klotzige Brocken in der Mitte
    const a = Math.random() * 6.283, len = r * (0.3 + 0.15 * Math.random());
    shards.push({ a, len, wid: len * 0.5, x: 0, y: 0, c: Math.cos(a), s: Math.sin(a) });
  }
  disc(b.x, b.y, r + 1, (i, dx, dy) => {
    for (let q = shards.length - 1; q >= 0; q--){
      const sh = shards[q], px = dx - sh.x, py = dy - sh.y;
      const u = px * sh.c + py * sh.s, v = -px * sh.s + py * sh.c;
      const back = sh.wid * 0.4, tip = sh.wid * 1.3;
      if (u < -back || u > sh.len) continue;
      const hw = sh.wid * Math.min(1, (u + back) / (back * 1.6), (sh.len - u) / tip);
      if (Math.abs(v) > hw) continue;
      toSpecial(i, 0.5);
      const side = v >= 0 ? 1 : -1;
      const nx = -sh.s * side, ny = sh.c * side;                  // Normale der Facette
      let lum = 0.5 + 0.45 * (nx * lx + ny * ly);
      if (u > sh.len - tip) lum += 0.12;                          // Spitze etwas heller
      let c = lum < 0.35 ? AMBER[0] : lum < 0.6 ? AMBER[1] : AMBER[2];
      if (Math.abs(v) < 0.7) c = AMBER[3];                        // Grat
      col[i*3] = c[0]; col[i*3+1] = c[1]; col[i*3+2] = c[2];
      if (hw - Math.abs(v) < 0.8) mixCol(i, [110, 60, 20], 0.45); // dunkle Kante
      b.left++;
      return;
    }
  });
}

/* Faulstelle: wellig-runder brauner Fleck, der auf dem Rand sitzt, mit kleinen Löchern in der Außenschicht */
function genRot(count, def){
  for (let s = 0; s < count; s++){
    const a = Math.random() * Math.PI * 2 + s * 2.4;
    const x = CX + Math.cos(a) * R * W.spRot, y = CY + Math.sin(a) * R * W.spRot;
    const r = R * def.r * (0.85 + Math.random() * 0.3), seed = Math.random() * 50;
    const w1 = Math.random() * 6.3, w2 = Math.random() * 6.3;
    const item = { x, y, r, left: 0 };
    disc(x, y, r * 1.3, (i, dx, dy, dd) => {
      const px = i % SIM + 0.5, py = (i / SIM | 0) + 0.5, th = Math.atan2(dy, dx);
      const n = noise(px * 0.9, py * 0.9, seed);
      const rr = r * (1 + 0.14 * Math.sin(3 * th + w1) + 0.08 * Math.sin(5 * th + w2) + 0.05 * Math.sin(9 * th + seed)) * (0.9 + 0.2 * n);
      if (dd > rr) return;
      if (type[i] !== 1 && type[i] !== SP.host) return;        // nur Außenschicht und Wirt; Kerne und Holz bleiben hart
      if (type[i] === 1 && Math.pow(noise(px * 2.3, py * 2.1, seed + 3), 3) > 0.4){ totals[1]--; type[i] = 0; return; }  // Loch
      toSpecial(i, n);
      const e = dd / rr, spot = Math.pow(noise(px * 1.7, py * 1.9, seed + 9), 4) > 0.3 ? 0.15 : 0;
      mixCol(i, [78, 50, 24], 0.55 + 0.3 * n + spot - 0.12 * e);
      if (e > 0.8) mixCol(i, [60, 38, 18], 0.3 * (e - 0.8) * 5);   // dunklerer Saum
      item.left++;
    });
    SP.items.push(item);
  }
}

/* Welche Stelle enthält Pixel i? */
function spItemAt(i){
  const px = i % SIM + 0.5, py = (i / SIM | 0) + 0.5;
  let best = null, bd = 1e9;
  for (const b of SP.items){ const d = Math.hypot(px - b.x, py - b.y) - b.r; if (d < bd){ bd = d; best = b; } }
  return best;
}
/* Wird aus removePixel aufgerufen, wenn ein Pixel der Schicht 4 verschwindet */
function specialEaten(i){
  const b = spItemAt(i);
  if (b) b.left--;
  if (SP.kind === 'blase' && b && !b.popped) popBubble(b);
}
function popBubble(b){
  b.popped = true;
  let n = 1;                                                 // der angebissene Pixel zählt mit
  disc(b.x, b.y, b.r * 1.6 + 1, j => {
    if (type[j] !== 4 || spItemAt(j) !== b) return;
    type[j] = 0; D[j*4+3] = 0; eaten[4]++; run.left--; n++; b.left--;
  });
  meter(SP.def.name).px += n - 1;
  const hL = W.layers[SP.host], cur = hL.f ? 'f' : 'k';          // Öltropfen im Nusskern bringen Kernwährung
  const v = n * (cur === 'f' ? hL.f * S.yieldW[WI] : hL.k) * SP.def.mult;
  const k = Math.min(26, 8 + Math.round(n / 10));
  for (let q = 0; q < k; q++){
    const a = Math.random() * 6.283, r = Math.random() * b.r;
    drops.push({ cur, x: b.x + Math.cos(a) * r, y: b.y + Math.sin(a) * r, vx: Math.cos(a) * (40 + Math.random() * 50), vy: Math.sin(a) * (40 + Math.random() * 50), v: v / k, t: 0 });
  }
  run.spDone++;
  AU.sfx('pop');
  pop(b.x, b.y - b.r - 4, 'Plopp!');
  if (!reduceMotion) shake = Math.max(shake, 1.5);
  if (run.left <= 0 && !run.over){ run.clean = true; endRun(); }
}
/* Tröpfchen fliegen erst auseinander, dann zur Raupe; der Ertrag zählt beim Ankommen */
function dropStep(dt){
  if (!drops.length) return;
  const h = cat.trail[0], hr = headR();
  let got = 0;
  for (let q = drops.length - 1; q >= 0; q--){
    const d = drops[q];
    d.t += dt;
    const dx = h.x - d.x, dy = h.y - d.y, dist = Math.hypot(dx, dy) || 1;
    if (d.t > 0.25 && dist < hr * 1.3){ collectDrop(d); drops.splice(q, 1); got++; continue; }
    const pull = d.t < 0.25 ? 0 : 520;
    d.vx = (d.vx + dx / dist * pull * dt) * (1 - 2.2 * dt);
    d.vy = (d.vy + dy / dist * pull * dt) * (1 - 2.2 * dt);
    d.x += d.vx * dt; d.y += d.vy * dt;
  }
  if (got && (run.dropSnd = (run.dropSnd || 0) + got) >= 3){ run.dropSnd = 0; AU.sfx('drop'); }
}
function collectDrop(d){
  const m = meter(SP.def ? SP.def.name : 'Saftblase');
  if (d.cur === 'k'){ run.k += d.v; run.gK += d.v; m.k += d.v; }
  else { run.f += d.v; run.gF += d.v; m.f += d.v; }
}
function flushDrops(){ for (const d of drops) collectDrop(d); drops.length = 0; }

/* ---------- Zeichnen: Tröpfchen, Funkeln der Kristalle, Hinweis beim Start ---------- */
function drawSpecial(){
  if (drops.length){
    const c = (SP.def && SP.def.dropCol) || W.layers[SP.host].sw, rr = Math.max(4, SC * 1.9);
    for (const d of drops){
      ctx.fillStyle = c;
      ctx.beginPath(); ctx.arc(d.x * SC, d.y * SC, rr, 0, 6.283); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.beginPath(); ctx.arc(d.x * SC - rr * 0.3, d.y * SC - rr * 0.3, rr * 0.35, 0, 6.283); ctx.fill();
    }
  }
  if (SP.kind === 'kristall'){
    const t = performance.now() / 1000;
    for (const b of SP.items){
      if (b.left <= 0) continue;
      for (let s = 0; s < 2; s++){
        const ph = b.ph + s * 2.1, a = Math.max(0, Math.sin(t * 2.2 + ph));
        if (a < 0.05) continue;
        const x = (b.x + Math.cos(ph * 3) * b.r * 0.5) * SC, y = (b.y + Math.sin(ph * 5) * b.r * 0.5) * SC;
        star(x, y, SC * (1.6 + 1.8 * a), a);
      }
    }
  }
  if (run.spT > 0 && SP.def){
    ctx.save();
    const k = Math.min(1, run.spT, (2.6 - run.spT) * 4);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = Math.max(0, k);
    ctx.textAlign = 'center';
    ctx.font = `800 26px 'Bricolage Grotesque', system-ui, sans-serif`;
    ctx.lineWidth = 5; ctx.strokeStyle = 'rgba(255,255,255,0.75)';
    const txt = `Diese ${W.name} hat ${SP.def.plural}`;
    ctx.strokeText(txt, cv.width / 2, cv.height - 34);
    ctx.fillStyle = accent; ctx.fillText(txt, cv.width / 2, cv.height - 34);
    ctx.restore();
  }
}
function star(x, y, s, a){
  ctx.globalAlpha = a;
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.moveTo(x, y - s); ctx.lineTo(x + s * 0.22, y - s * 0.22); ctx.lineTo(x + s, y); ctx.lineTo(x + s * 0.22, y + s * 0.22);
  ctx.lineTo(x, y + s); ctx.lineTo(x - s * 0.22, y + s * 0.22); ctx.lineTo(x - s, y); ctx.lineTo(x - s * 0.22, y - s * 0.22);
  ctx.closePath(); ctx.fill();
  ctx.globalAlpha = 1;
}
/* Kurzer Stand für Anzeige und Ergebnis */
function spSummary(){
  if (!SP.def) return null;
  const n = SP.items.length;
  if (SP.kind === 'blase') return { label: SP.def.plural, val: `${run.spDone} / ${n} geplatzt` };
  return { label: SP.def.plural, val: Math.round(pctOf(4)) + ' %' };
}
