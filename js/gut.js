'use strict';
/* =====================================================================
   Darm (Stufe 17): Plinko mit Zilien. Physik ohne Seite, damit Darm-Screen,
   Kalibrierung und Bot-Simulation dieselbe Rechnung nutzen.
   - Pförtner und Zilien stellt der Spieler selbst. Zilien sind federnde Büschel:
     Ein Treffer stößt den Brocken ab (die Beere höchstens etwa 5 Zilienradien weit).
   - Jede Zilie gibt einem Brocken höchstens 3-mal Punkte (3, 2, 1), danach nur noch weiche Abpraller.
   - Unten die Ausgänge des Dünndarms mit Bonus auf alle gesammelten Punkte.
   - Feste Schrittweite, kein Zufall: gleiche Frucht + gleiche Stellung = gleicher Weg.
   ===================================================================== */
const GUT = {
  W: 480, H: 880,                  // Spielfläche in Spieleinheiten
  PF_Y: 190,                       // Höhe des Pförtners (Ende des Schlauchs vom Magen)
  FLOOR: 790,                      // darunter die Ausgänge
  G: 1100, CIL_R: 17, WALL: 16,    // Schwerkraft, Radius einer Zilie, Saum der Flimmerhärchen an den Wänden
  GAIN: [3, 2, 1], BASE: 1,        // Punkte je Treffer derselben Zilie; jeder Brocken bringt mindestens BASE
  STEP: 1 / 240,
  // Wirtschaft
  share: 0.25,                     // Anteil der gefressenen Fruchtwährung, der als Nahrungsbrei in den Magen geht
  cap0: 5,                         // Portionen im Magen (eine je Run), Dehnbarer Magen +1 je Stufe
  perPortion: 3,                   // Brocken je Portion
  full: 14,                        // so viele Punkte gelten als "ganz verdaut": Brocken bringt Punkte/full seiner Nährstoffe
  cilia0: 3,                       // Zilien am Anfang, "Mehr Zilien" +1 je Stufe
};
GUT.HAIR = GUT.CIL_R + 19;                                        // Reichweite der Härchen (auch beim Aufspreizen)
GUT.BOUNCE = Math.sqrt(2 * GUT.G * 5 * GUT.CIL_R);                // Abprall der Beere: etwa 5 Zilienradien weit (h = v² / 2g)
GUT.MIN_DIST = 2 * GUT.HAIR + 4;                                  // Zilien berühren sich nicht, auch nicht mit den Härchen
GUT.EDGE = GUT.WALL + GUT.CIL_R + 2 * 10.5 + 6;                   // Spalt zur Wand bleibt breiter als der dickste Brocken (sonst klemmt er)
/* Brockenarten je Welt: r Radius, jump Anteil am vollen Abprall, keep Anteil der Seitwärtsbewegung beim Treffer,
   wall Sprungkraft an der Wand, drag Zähigkeit (bremst den Fall), stick Haften an der Zilie. Spätere Welten: vorerst wie die Beere. */
GUT.TYPES = [
  { id: 'beere', name: 'Beerenbrocken', col: '#D42A40', r: 7, jump: 1.0, keep: 0.8, wall: 0.75, drag: 0, stick: 0 },
  { id: 'kirsche', name: 'Kirschbrocken', col: '#8A0E26', r: 10.5, jump: 0.5, keep: 0.9, wall: 0.35, drag: 0, stick: 0 },
  { id: 'oel', name: 'Walnussöl', col: '#E3B94A', r: 8, jump: 0.08, keep: 1.0, wall: 0.05, drag: 1.6, stick: 900 },
];
const gutType = w => GUT.TYPES[w] || GUT.TYPES[0];
/* Unten: Übergang vom Dünndarm. Nicht symmetrisch. fat = Bonus für Öl statt mult. */
GUT.HOLES = [
  { id: 'dick', name: 'Dickdarm', x1: GUT.WALL, x2: 104, mult: 1, col: '#6B3A2E' },
  { id: 'pfort', name: 'Pfortader', sub: 'zur Leber', x1: 104, x2: 176, mult: 1.5, col: '#B3243A' },
  { id: 'dick', name: 'Dickdarm', x1: 176, x2: 290, mult: 1, col: '#6B3A2E' },
  { id: 'lymph', name: 'Lymphgefäß', sub: 'Fett ×2', x1: 290, x2: 370, mult: 1.3, fat: 2, col: '#D9B84A' },
  { id: 'dick', name: 'Dickdarm', x1: 370, x2: 426, mult: 1, col: '#6B3A2E' },
  { id: 'blind', name: 'Blinddarm', x1: 426, x2: GUT.W - GUT.WALL, mult: 2, col: '#8A4FB3' },
];
const gutMult = (h, b) => b.T.id === 'oel' && h.fat ? h.fat : h.mult;
GUT.DEFAULT = [[140, 390], [320, 450], [210, 570], [370, 630], [100, 680], [300, 330], [420, 400]];   // Grundstellung der Zilien

/* Zilien in die erlaubten Grenzen holen und auseinanderschieben */
function gutClampCilium(x, y, others){
  const G = GUT;
  x = Math.max(G.EDGE, Math.min(G.W - G.EDGE, x)); y = Math.max(G.PF_Y + 70, Math.min(G.FLOOR - 70, y));
  for (const o of others){ const d = Math.hypot(x - o.x, y - o.y); if (d < G.MIN_DIST){ x = o.x + (x - o.x) / (d || 1) * G.MIN_DIST; y = o.y + (y - o.y) / (d || 1) * G.MIN_DIST; } }
  return [Math.max(G.EDGE, Math.min(G.W - G.EDGE, x)), Math.max(G.PF_Y + 70, Math.min(G.FLOOR - 70, y))];
}
/* Stellung { pf, z: [[x, y], …] } auf n Zilien bringen: fehlende aus der Grundstellung, zu viele weg */
function gutFitLayout(L, n){
  const z = (L && L.z ? L.z.slice(0, n) : []).map(p => p.slice());
  for (const p of GUT.DEFAULT){
    if (z.length >= n) break;
    if (z.every(q => Math.hypot(q[0] - p[0], q[1] - p[1]) >= GUT.MIN_DIST)) z.push(p.slice());
  }
  while (z.length < n) z.push([GUT.W / 2, GUT.PF_Y + 100 + z.length * 80]);
  const out = [];
  for (const p of z){ const c = gutClampCilium(p[0], p[1], out.map(q => ({ x: q[0], y: q[1] }))); out.push(c); }
  return { pf: L && typeof L.pf === 'number' ? Math.max(GUT.WALL + 8, Math.min(GUT.W - GUT.WALL - 8, L.pf)) : GUT.W / 2, z: out };
}

function gutBall(k, px){
  const T = gutType(k);
  return { x: Math.max(GUT.WALL + T.r, Math.min(GUT.W - GUT.WALL - T.r, px)), y: GUT.PF_Y + 12, vx: 0, vy: 60, T, k,
    got: GUT.BASE, hitsBy: new Map(), touching: new Set(), chain: 0, done: false, trail: [], still: 0 };
}

/* Ein Physikschritt. cilia: [{x, y, fl}], ev: hit(b, z, gain, n), soft(b, vn), land(b, hole, mult, points) */
function gutStep(balls, cilia, dt, ev){
  const G = GUT;
  for (const b of balls){
    if (b.done) continue;
    const T = b.T, r = T.r;
    b.vy += G.G * dt;
    if (T.drag){ b.vx *= 1 - T.drag * dt; b.vy *= 1 - T.drag * dt * 0.6; }     // Öl ist zäh
    const sp = Math.hypot(b.vx, b.vy); if (sp > 900){ b.vx *= 900 / sp; b.vy *= 900 / sp; }
    b.x += b.vx * dt; b.y += b.vy * dt;
    if (b.x < G.WALL + r){ b.x = G.WALL + r; b.vx = Math.abs(b.vx) * T.wall; }
    if (b.x > G.W - G.WALL - r){ b.x = G.W - G.WALL - r; b.vx = -Math.abs(b.vx) * T.wall; }
    const now = new Set();
    for (const z of cilia){
      const dx = b.x - z.x, dy = b.y - z.y, d = Math.hypot(dx, dy), R = r + G.CIL_R;
      if (d >= R + (T.stick ? 1.5 : 0)) continue;
      const nx = dx / (d || 1), ny = dy / (d || 1);
      now.add(z);
      if (d < R){ b.x = z.x + nx * R; b.y = z.y + ny * R; }
      const vn = b.vx * nx + b.vy * ny;
      const fresh = !b.touching.has(z);                           // neuer Kontakt = ein Treffer (Rollen zählt nicht mehrfach)
      const n = b.hitsBy.get(z) || 0, gain = fresh && n < G.GAIN.length ? G.GAIN[n] : 0;
      if (vn < 0){
        const vtx = b.vx - vn * nx, vty = b.vy - vn * ny;
        let out;
        if (gain > 0) out = Math.min(G.BOUNCE * T.jump, -vn * 0.6 * T.jump + 160 * T.jump);   // federnd, gedeckelt
        else out = -vn * (T.stick ? 0 : 0.4);                                                 // erschöpft: weich
        b.vx = vtx * T.keep + nx * out; b.vy = vty * T.keep + ny * out;
        const cap = G.BOUNCE * 1.05, s2 = Math.hypot(b.vx, b.vy); if (gain > 0 && s2 > cap){ b.vx *= cap / s2; b.vy *= cap / s2; }
      }
      // Öl haftet: zieht zur Zilie hin und läuft um sie herum, bis die Schwerkraft es unten abreißt
      if (T.stick && ny < 0.6){ b.vx -= nx * T.stick * dt; b.vy -= ny * T.stick * dt; }
      // Genau oben auf der Kuppe bliebe ein Brocken liegen: die Härchen schieben ihn zur Seite, auf der er mehr hängt (rechts, wenn genau mittig)
      if (ny < -0.9 && Math.abs(b.vx) < 40 && (T.stick || gain === 0)) b.vx += (dx >= 0 ? 1 : -1) * 900 * dt;
      if (fresh){
        if (gain > 0){ b.got += gain; b.chain++; z.fl = 1; ev.hit && ev.hit(b, z, gain, n); }
        else if (Math.abs(vn) > 60) ev.soft && ev.soft(b, vn);
        b.hitsBy.set(z, n + 1);
      }
    }
    b.touching = now;
    // Trennwände zwischen den Ausgängen
    if (b.y > G.FLOOR - 24){
      for (const h of G.HOLES){ const px = h.x1; if (px <= G.WALL) continue; const dx = b.x - px; if (Math.abs(dx) < r + 3){ b.x = px + Math.sign(dx || 1) * (r + 3); b.vx = -b.vx * 0.5; } }
    }
    if (b.y > G.FLOOR + 12){
      const h = G.HOLES.find(h => b.x >= h.x1 && b.x < h.x2) || G.HOLES[0], m = gutMult(h, b);
      b.done = true; b.hole = h; b.mult = m; b.points = b.got * m;
      ev.land && ev.land(b, h, m, b.points);
      continue;
    }
    // Sicherung: liegt ein Brocken über eine Sekunde fast still, schieben ihn die Härchen weg von der nächsten Wand (fest, kein Zufall)
    if (Math.hypot(b.vx, b.vy) < 12){ b.still += dt; if (b.still > 1){ b.vx += (b.x < G.W / 2 ? 1 : -1) * 140; b.vy -= 60; b.still = 0; } } else b.still = 0;
  }
}

/* Einen Brocken ohne Zeichnen durchfallen lassen: Punkte (gesammelt × Ausgang) und Ausgang */
function gutSimulate(k, px, layoutZ){
  const cil = layoutZ.map(([x, y]) => ({ x, y, fl: 0 })), balls = [gutBall(k, px)];
  let res = null;
  const ev = { land: (b, h, m, pts) => { res = { points: pts, got: b.got, mult: m, hole: h.id }; } };
  for (let s = 0; s < 240 * 40 && !res; s++) gutStep(balls, cil, GUT.STEP, ev);
  return res || { points: balls[0].got, got: balls[0].got, mult: 1, hole: 'dick' };
}

if (typeof module !== 'undefined') module.exports = { GUT, gutType, gutMult, gutBall, gutStep, gutSimulate, gutFitLayout, gutClampCilium };
