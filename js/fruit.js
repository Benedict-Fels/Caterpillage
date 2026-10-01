'use strict';
/* =====================================================================
   Frucht-Raster (Größe hängt von der Welt ab)
   ===================================================================== */
let SIM = 240, N = SIM * SIM, SC = 3, CX = 132, CY = 120, R = 78;
let type, hp, hpMax, col, img, D, browned;
const brownQ = [];                                       // Apfel: freigelegtes Fruchtfleisch, das gleich braun wird [Pixel, Zeit]
const SPK = 9;                                           // Rasterwert der Sonderstellen (Schichten der Frucht: 1 … 4)
const totals = {}, eaten = {};
/* Schichten einer Welt ohne Sonderstelle, von außen nach innen */
const layerKeys = w => Object.keys(w.layers).map(Number).filter(k => k !== SPK).sort((a, b) => a - b);
const fruitCv = document.createElement('canvas');
const fctx = fruitCv.getContext('2d');

function setupGrid(world){
  R = world.R;
  SIM = Math.ceil(2 * R * 1.06 + 76);
  N = SIM * SIM;
  SC = 720 / SIM;
  CX = SIM - R * 1.06 - 16;
  CY = SIM / 2;
  type = new Uint8Array(N); hp = new Float32Array(N); hpMax = new Float32Array(N); col = new Uint8ClampedArray(N * 3);
  browned = new Uint8Array(N); brownQ.length = 0;
  fruitCv.width = SIM; fruitCv.height = SIM;
  img = fctx.createImageData(SIM, SIM); D = img.data;
  offsFor = -1;
}

function noise(x, y, s){
  return (Math.sin(x * 0.37 + s) * Math.cos(y * 0.29 + s * 1.3)
        + Math.sin((x + y) * 0.11 + s * 2.1) + 2) / 4;
}
function put(i, k, c, n){
  type[i] = k;
  hpMax[i] = hp[i] = W.layers[k].hp * (0.88 + 0.24 * n);
  col[i*3] = c[0]; col[i*3+1] = c[1]; col[i*3+2] = c[2];
  totals[k]++;
}
function clearFruit(){ for (const k of [1, 2, 3, 4, SPK]){ totals[k] = 0; eaten[k] = 0; } }
function finishFruit(){
  for (let i = 0; i < N; i++){
    const o = i * 4;
    if (!type[i]){ D[o+3] = 0; continue; }
    D[o] = col[i*3]; D[o+1] = col[i*3+1]; D[o+2] = col[i*3+2]; D[o+3] = 255;
  }
}
/* Läuft über alle Pixel der Scheibe. q skaliert Muster auf die Fruchtgröße. */
function forDisc(fn){
  const q = 78 / R;
  for (let y = 0; y < SIM; y++) for (let x = 0; x < SIM; x++){
    const dx = x + 0.5 - CX, dy = y + 0.5 - CY;
    fn(x, y, dx, dy, Math.atan2(dy, dx), Math.hypot(dx, dy), q);
  }
}

function genCurrant(){
  const s = Math.random() * 100;
  const seeds = [], nS = 5 + Math.floor(Math.random() * 3);
  for (let j = 0; j < nS; j++){
    const a = j / nS * Math.PI * 2 + (Math.random() - 0.5) * 0.5 + s;
    const rr = R * (0.13 + Math.random() * 0.1);
    const o = a + (Math.random() - 0.5) * 0.6;
    seeds.push({ x: CX + Math.cos(a) * rr, y: CY + Math.sin(a) * rr, c: Math.cos(o), s: Math.sin(o), la: R * 0.085, lb: R * 0.052 });
  }
  forDisc((x, y, dx, dy, a, d, q) => {
    const Rr = R * (1 + 0.012 * Math.sin(3 * a + s));
    if (d > Rr) return;
    const i = y * SIM + x, t = d / Rr, n = noise(x * q, y * q, s);
    if (t > 0.9){
      const band = Math.max(0, 1 - Math.abs(t - 0.945) / 0.04);
      const gl = Math.pow(Math.max(0, Math.cos(a + 2.3)), 5) * band;
      const rim = t > 0.98 ? 0.7 : 1;
      return put(i, 1, [(126 + 20 * n + 110 * gl) * rim, (8 + 170 * gl) * rim, (24 + 6 * n + 160 * gl) * rim], n);
    }
    let qq = 9;
    for (const sd of seeds){
      const ux = x + 0.5 - sd.x, uy = y + 0.5 - sd.y;
      const al = ux * sd.c + uy * sd.s, ac = -ux * sd.s + uy * sd.c;
      qq = Math.min(qq, (al / sd.la) ** 2 + (ac / sd.lb) ** 2);
    }
    if (qq < 1) return put(i, 3, [238 - 34 * qq - 12 * n, 224 - 40 * qq - 12 * n, 188 - 46 * qq - 12 * n], n);
    const glow = 1 - t;
    const vein = Math.pow(Math.abs(Math.cos(a * 8 + n * 0.8 + s)), 60) * Math.min(1, t * 1.6);
    const jelly = qq < 2.4 ? (2.4 - qq) / 1.4 : 0;
    put(i, 2, [212 + 34 * glow - 16 * n + 20 * jelly, 34 + 50 * glow + 70 * vein - 10 * n + 60 * jelly,
               50 + 36 * glow + 60 * vein - 10 * n + 50 * jelly], n);
  });
}

function genCherry(){
  const s = Math.random() * 100, rot = Math.random() * Math.PI;
  const cr = Math.cos(rot), sr = Math.sin(rot);
  forDisc((x, y, dx, dy, a, d, q) => {
    const Rr = R * (1 + 0.035 * Math.sin(2 * a + s) + 0.02 * Math.sin(5 * a));
    if (d > Rr) return;
    const i = y * SIM + x, t = d / Rr, n = noise(x * q, y * q, s);
    if (t > 0.91){
      const band = Math.max(0, 1 - Math.abs(t - 0.95) / 0.04);
      const gl = Math.pow(Math.max(0, Math.cos(a + 2.3)), 4) * band;
      const rim = t > 0.978 ? 0.7 : 1;
      return put(i, 1, [(72 + 10 * n + 130 * gl) * rim, (6 + 120 * gl) * rim, (20 + 120 * gl) * rim], n);
    }
    const ux = dx * cr + dy * sr, uy = -dx * sr + dy * cr;
    const coreD = Math.hypot(ux / 0.8, uy) / Rr;
    if (coreD < 0.27){
      const ridge = Math.abs(uy) < 1.2 / q ? 0.82 : 1;
      const e = coreD / 0.27;
      return put(i, 3, [(222 - 30 * n - 30 * e) * ridge, (206 - 30 * n - 34 * e) * ridge, (166 - 26 * n - 34 * e) * ridge], n);
    }
    const glow = Math.max(0, 1 - Math.abs(coreD - 0.27) * 3);
    const fib = Math.pow(Math.abs(Math.sin(a * 20 + n * 3)), 30) * 0.5;
    put(i, 2, [150 + 30 * glow - 18 * n + 20 * fib, 16 + 30 * glow - 6 * n + 20 * fib, 38 + 26 * glow - 10 * n + 20 * fib], n);
  });
}

function genWalnut(){
  const s = Math.random() * 100, rot = Math.random() * Math.PI;
  const cr = Math.cos(rot), sr = Math.sin(rot);
  forDisc((x, y, dx, dy, a, d, q) => {
    const Rr = R * (1 + 0.03 * Math.sin(2 * a + s) + 0.015 * Math.sin(7 * a + s));
    if (d > Rr) return;
    const i = y * SIM + x, t = d / Rr, n = noise(x * q, y * q, s);
    const inner = 0.62 + 0.03 * Math.sin(9 * a + s) + 0.015 * Math.sin(17 * a);
    if (t > 0.84){
      const spot = Math.pow(noise(x * q * 3.1, y * q * 2.7, s + 5), 12) > 0.35 ? 1 : 0;
      const rim = t > 0.975 ? 0.75 : 1;
      return put(i, 1, [(80 + 22 * n + 90 * spot) * rim, (122 + 22 * n + 80 * spot) * rim, (44 + 10 * n + 50 * spot) * rim], n);
    }
    if (t > inner){
      const groove = Math.pow(Math.abs(Math.sin(a * 13 + t * 26 + n * 3)), 8);
      const e = t > 0.8 ? 0.85 : 1;
      return put(i, 2, [(156 - 30 * n - 50 * groove) * e, (112 - 24 * n - 40 * groove) * e, (64 - 18 * n - 26 * groove) * e], n);
    }
    const ux = dx * cr + dy * sr, uy = -dx * sr + dy * cr;
    if (Math.abs(uy) < 2.4 / q || (Math.abs(ux) < 1.8 / q && t < inner * 0.72)){
      return put(i, 2, [124 - 20 * n, 88 - 16 * n, 50 - 12 * n], n);
    }
    const w = Math.pow(Math.abs(Math.sin(ux * q * 0.45 + Math.sin(uy * q * 0.28 + s) * 2.4)), 5);
    const edge = t > inner - 0.03 ? 0.78 : 1;
    put(i, 3, [(226 - 26 * n - 40 * w) * edge, (194 - 26 * n - 44 * w) * edge, (136 - 22 * n - 40 * w) * edge], n);
  });
}
/* Pflaume: leicht oval, dunkles Blauviolett mit Wachsreif, goldgelbes Fruchtfleisch (unter der Haut rötlich).
   Die Bauchnaht ist eine weiche Furche durch die Haut (Pixel mit Fruchtfleisch-Härte). Der Stein ist flach und
   länglich mit Kiel und liegt lose in einem schmalen Hohlraum (steinlösend). */
function genPlum(){
  const s = Math.random() * 100, rot = Math.random() * Math.PI, cr = Math.cos(rot), sr = Math.sin(rot);
  const seamA = rot + Math.PI / 2 + (Math.random() < 0.5 ? 0 : Math.PI);         // Naht quer zum Stein, eine Seite
  const sc = Math.cos(seamA), ss = Math.sin(seamA);
  forDisc((x, y, dx, dy, a, d, q) => {
    const ux = dx * cr + dy * sr, uy = -dx * sr + dy * cr;
    const e = Math.hypot(ux / 1.06, uy / 0.94);                                   // oval
    const ea = Math.atan2(uy, ux);
    const Rr = R * (1 + 0.012 * Math.sin(3 * ea + s) + 0.008 * Math.sin(7 * ea));
    if (e > Rr) return;
    const i = y * SIM + x, t = e / Rr, n = noise(x * q, y * q, s);
    const along = dx * sc + dy * ss, perp = Math.abs(-dx * ss + dy * sc);        // Lage zur Naht
    if (t > 0.92){
      const rim = t > 0.985 ? 0.7 : 1;
      const bloom = 0.22 + 0.3 * Math.pow(noise(x * q * 2.3, y * q * 2.1, s + 4), 2);   // Wachsreif
      const band = Math.max(0, 1 - Math.abs(t - 0.955) / 0.035), gl = Math.pow(Math.max(0, Math.cos(a + 2.3)), 5) * band;
      let c = [58 + 18 * n, 26 + 8 * n, 84 + 22 * n];
      c = c.map((v, j) => v * (1 - bloom) + [178, 168, 206][j] * bloom + 90 * gl);
      if (along > 0 && perp < 1.7 / q){                                            // Naht: weiche Furche
        return put(i, 2, [34 + 10 * n, 14, 50 + 10 * n], n);
      }
      return put(i, 1, c.map(v => v * rim), n);
    }
    // Stein: flache Linse entlang ux, mit Kiel; drumherum ein schmaler Hohlraum
    const la = R * 0.36, lb = R * 0.19, u = ux / la;
    if (Math.abs(u) < 1){
      const hw = lb * Math.pow(1 - u * u, 0.75);
      if (Math.abs(uy) < hw){
        const keel = Math.abs(uy) < 0.9 / q ? 0.8 : 1, pit = Math.pow(noise(x * q * 3.4, y * q * 3.1, s + 7), 6) > 0.45 ? 0.85 : 1;
        const ee = Math.abs(uy) / hw;
        return put(i, 3, [(182 - 30 * n - 30 * ee) * keel * pit, (132 - 24 * n - 26 * ee) * keel * pit, (88 - 18 * n - 20 * ee) * keel * pit], n);
      }
      if (Math.abs(uy) < hw + 1.6 / q + 0.6) return;                                // Hohlraum um den Stein
    } else if (Math.abs(u) < 1 + 2.2 / q / la * 1 && Math.abs(uy) < 1.5 / q) return;
    const glow = Math.max(0, (t - 0.72) / 0.2);                                     // unter der Haut rötlich
    const fib = Math.pow(Math.abs(Math.sin(ea * 26 + n * 4)), 30) * 0.4;
    const seamLine = along > 0 && perp < 0.8 / q ? 0.88 : 1;
    put(i, 2, [(236 - 14 * n - 30 * glow + 10 * fib) * seamLine, (184 - 16 * n - 80 * glow + 10 * fib) * seamLine, (64 - 10 * n + 10 * glow) * seamLine], n);
  });
}

/* Apfel im Querschnitt: dünne rot-grüne Schale, cremeweißes Fruchtfleisch mit dem Ring der Leitbündel,
   in der Mitte das fünfzackige Kerngehäuse (Pergament) mit fünf Kammern und je einem braunen Kern. */
function genApple(){
  const s = Math.random() * 100, rot = Math.random() * 6.283, redA = Math.random() * 6.283;
  const ch = [];
  for (let k = 0; k < 5; k++){
    const a = rot + k * 1.2566;
    ch.push({ a, c: Math.cos(a), s: Math.sin(a), d: R * 0.2, ra: R * 0.105, rb: R * 0.05 });
  }
  forDisc((x, y, dx, dy, a, d, q) => {
    const Rr = R * (1 + 0.02 * Math.sin(2 * a + s) + 0.012 * Math.sin(5 * a + rot));
    if (d > Rr) return;
    const i = y * SIM + x, t = d / Rr, n = noise(x * q, y * q, s);
    if (t > 0.965){
      const red = Math.pow(Math.max(0, Math.cos(a - redA)) , 0.7);
      const streak = Math.pow(Math.abs(Math.sin(a * 40 + n * 3)), 4) * 0.25 * red;
      const rim = t > 0.99 ? 0.75 : 1;
      const c = [158 + 40 * red - 20 * streak, 186 - 150 * red, 64 - 30 * red];
      return put(i, 1, c.map(v => Math.max(0, v * rim)), n);
    }
    // Kammern: Ellipsen strahlenförmig um die Mitte; drinnen Kern oder Hohlraum, außen herum Pergament
    let best = 9, bc = null, bu = 0, bv = 0;
    for (const c of ch){
      const px = dx - c.c * c.d, py = dy - c.s * c.d;
      const u = px * c.c + py * c.s, v = -px * c.s + py * c.c;
      const qq = (u / c.ra) ** 2 + (v / c.rb) ** 2;
      if (qq < best){ best = qq; bc = c; bu = u; bv = v; }
    }
    if (best < 1){
      const su = bu + bc.ra * 0.1, sq = (su / (bc.ra * 0.78)) ** 2 + (bv / (bc.rb * 0.78 * (1 - 0.35 * su / bc.ra))) ** 2;
      if (sq < 1){                                                                  // Kern, tropfenförmig
        const hi = Math.max(0, 1 - Math.hypot(su + bc.ra * 0.25, bv + bc.rb * 0.3) / (bc.rb * 0.6));
        return put(i, 4, [92 + 40 * hi - 14 * n, 50 + 26 * hi - 8 * n, 24 + 14 * hi], n);
      }
      return;                                                                       // offene Kammer
    }
    if (best < 2.3 || d < R * 0.075){                                               // Pergament um Kammern und Mitte
      const e = Math.min(1, Math.max(0, (best - 1) / 1.3));
      return put(i, 3, [232 - 22 * e - 12 * n, 220 - 26 * e - 12 * n, 168 - 30 * e - 10 * n], n);
    }
    const bundle = Math.abs(t - 0.44) < 0.012 && Math.cos(5 * (a - rot) * 2) > 0.92 ? 1 : 0;   // Leitbündel-Ring
    const green = Math.max(0, (t - 0.86) / 0.1) * 0.5 + bundle * 0.6;
    const core = Math.max(0, 1 - Math.max(0, best - 2.3) / 2) * 0.25;            // um das Gehäuse etwas gelblicher
    put(i, 2, [246 - 14 * n - 24 * green - 6 * core, 240 - 12 * n - 6 * green - 8 * core, 206 - 16 * n - 30 * green - 30 * core], n);
  });
}

/* Kürbis: gerippter Rand (10 Rippen), dicke harte Schale, festes orangefarbenes Fruchtfleisch, innen ein
   Hohlraum mit hellen Fasern und vielen flachen, weißen Kernen. */
function genPumpkin(){
  const s = Math.random() * 100, rot = Math.random() * 6.283;
  const rib = a => Math.pow(Math.abs(Math.cos(5 * (a - rot))), 0.5);              // 1 = Rippe, 0 = Furche
  const seeds = [], inner = 0.6;
  for (let tries = 0; seeds.length < 60 && tries < 3000; tries++){
    const a = Math.random() * 6.283, dd = R * inner * Math.sqrt(Math.random()) * 0.92;
    const sd = { x: CX + Math.cos(a) * dd, y: CY + Math.sin(a) * dd, o: Math.random() * 3.14, la: R * 0.05, lb: R * 0.027 };
    sd.c = Math.cos(sd.o); sd.s = Math.sin(sd.o);
    if (seeds.some(o => Math.hypot(o.x - sd.x, o.y - sd.y) < R * 0.075)) continue;
    seeds.push(sd);
  }
  forDisc((x, y, dx, dy, a, d, q) => {
    const rb = rib(a), Rr = R * (0.955 + 0.045 * rb + 0.006 * Math.sin(17 * a + s));
    if (d > Rr) return;
    const i = y * SIM + x, t = d / Rr, n = noise(x * q, y * q, s);
    if (t > 0.935){
      const rim = t > 0.985 ? 0.7 : 1, groove = 1 - 0.35 * (1 - rb);
      return put(i, 1, [(206 + 20 * n) * groove * rim, (104 + 14 * n) * groove * rim, (24 + 6 * n) * groove * rim], n);
    }
    const inn = inner * (0.94 + 0.06 * rb) + 0.02 * Math.sin(7 * a + s);
    if (t > inn){
      const e = (t - inn) / (0.935 - inn), fib = Math.pow(Math.abs(Math.sin(a * 60 + n * 5)), 40) * 0.25;
      return put(i, 2, [244 - 10 * n - 14 * e + 8 * fib, 150 + 30 * (1 - e) - 14 * n + 10 * fib, 40 + 26 * (1 - e) - 8 * n], n);
    }
    for (const sd of seeds){                                                         // Kerne in den Fasern
      const px = x + 0.5 - sd.x, py = y + 0.5 - sd.y, u = px * sd.c + py * sd.s, v = -px * sd.s + py * sd.c;
      const qq = (u / sd.la) ** 2 + (v / (sd.lb * (1 - 0.25 * u / sd.la))) ** 2;
      if (qq < 1){
        const edge = qq > 0.62 ? 0.84 : 1, hi = qq < 0.25 ? 1.04 : 1;
        return put(i, 4, [(240 - 10 * n) * edge * hi, (232 - 12 * n) * edge * hi, (204 - 14 * n) * edge * hi].map(v2 => Math.min(255, v2)), n);
      }
    }
    // Fasern: wellige Stränge von außen nach innen, dazwischen leer
    const strand = Math.abs(Math.sin(a * 22 + Math.sin(d * q * 0.09 + s) * 2.2 + noise(x * q * 0.6, y * q * 0.6, s + 3) * 3));
    const near = (inn - t) / inn;                                                   // zur Mitte hin lichter
    if (strand > 0.86 + 0.1 * near || (t > inn - 0.035)){
      return put(i, 3, [248 - 10 * n, 196 - 16 * n + 10 * near, 104 - 12 * n + 20 * near], n);
    }
  });
}
const GEN = { johannisbeere: genCurrant, kirsche: genCherry, walnuss: genWalnut, pflaume: genPlum, apfel: genApple, kuerbis: genPumpkin };

/* Apfel: Wird ein Pixel weggefressen, liegen die Nachbarn aus Fruchtfleisch an der Luft und werden nach 2–3,5 s braun */
function exposeBrown(i){
  const k = W.brown, x = i % SIM;
  for (const j of [i - 1, i + 1, i - SIM, i + SIM, i - SIM - 1, i - SIM + 1, i + SIM - 1, i + SIM + 1]){
    if (j < 0 || j >= N || browned[j] || type[j] !== k) continue;
    const jx = j % SIM; if (Math.abs(jx - x) > 1) continue;                    // nicht über den Rand in die nächste Zeile
    browned[j] = 1; brownQ.push([j, run.time + 2 + Math.random() * 1.5]);
  }
}
function brownStep(){
  let n = 0;
  while (brownQ.length && brownQ[0][1] <= run.time && n++ < 4000){
    const [j] = brownQ.shift();
    if (!type[j]) continue;
    const f = 0.6 + 0.15 * ((j * 7919) % 13) / 13;
    col[j*3] = col[j*3] * (1 - f) + 168 * f; col[j*3+1] = col[j*3+1] * (1 - f) + 104 * f; col[j*3+2] = col[j*3+2] * (1 - f) + 44 * f;
    shade(j);
  }
}
function shade(i){
  const o = i * 4, f = 0.55 + 0.45 * Math.max(0, hp[i] / hpMax[i]);
  D[o] = col[i*3] * f; D[o+1] = col[i*3+1] * f; D[o+2] = col[i*3+2] * f;
}
