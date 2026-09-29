'use strict';
/* =====================================================================
   Frucht-Raster (Größe hängt von der Welt ab)
   ===================================================================== */
let SIM = 240, N = SIM * SIM, SC = 3, CX = 132, CY = 120, R = 78;
let type, hp, hpMax, col, img, D;
const totals = { 1: 0, 2: 0, 3: 0, 4: 0 };               // 4 = Sonderstelle
const eaten = { 1: 0, 2: 0, 3: 0, 4: 0 };
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
function clearFruit(){ for (const k of [1, 2, 3, 4]){ totals[k] = 0; eaten[k] = 0; } }
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
const GEN = { johannisbeere: genCurrant, kirsche: genCherry, walnuss: genWalnut };

function shade(i){
  const o = i * 4, f = 0.55 + 0.45 * Math.max(0, hp[i] / hpMax[i]);
  D[o] = col[i*3] * f; D[o+1] = col[i*3+1] * f; D[o+2] = col[i*3+2] * f;
}
