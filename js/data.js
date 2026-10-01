'use strict';
/* =====================================================================
   Welten
   Schicht 1 = außen, 2 = Mitte, 3 = innen.
   drain = Grundverbrauch an Ausdauer pro Sekunde (läuft auch im Stand),
   hp = Härte, cost = zusätzliche Ausdauer je Biss (härtestes getroffenes Material), f/k = Frucht-/Kernwährung je Pixel,
   hard = harte Schicht (Zähigkeit wirkt, Schub stoppt), juicy = Saftsog wirkt.
   R = Fruchtradius im Raster. Echte Durchmesser (Johannisbeere ~9 mm,
   Kirsche ~22 mm, Walnuss mit Hülle ~45 mm, Pflaume ~50, Apfel ~80,
   Kürbis ~350 mm) werden mit der Wurzel gestaucht, sonst wäre die
   Raupe in der Walnuss nur ein Punkt: R = 78 · √(d / 9 mm).
   ===================================================================== */
const WORLDS = [
  {
    id: 'johannisbeere', spHost: 2, spRot: 0.86, drain: 0.5, name: 'Johannisbeere', fruitCur: 'Beerensaft', coreCur: 'Beerenkerne', color: '#D42A40', R: 78,
    layers: {
      1: { name: 'Schale', hp: 3.5, cost: 1.4, f: 1, hard: true, sw: '#7E0818', note: 'zäh, kostet doppelt Ausdauer' },
      2: { name: 'Fruchtfleisch', hp: 1.4, cost: 0.7, f: 0.15, juicy: true, sw: '#E03448', note: 'weich und saftig' },
      3: { name: 'Kerne', hp: 90, cost: 2.8, k: 1, hard: true, sw: '#EBDDBA', note: 'steinhart' },
    },
    breakLayer: 2, breakText: 'Durchbruch!', unlockCost: 0,
    hint(r){
      if (!r.broke) return 'Die Schale ist zäh und kostet doppelt so viel Ausdauer. Dranbleiben.';
      if (!eaten[3]) return 'Im Fruchtfleisch geht es schnell voran. Die Kerne um die Mitte bezahlen den Weg zur Kirsche.';
      return 'Die Kerne sind steinhart. Jeder Happen zählt.';
    },
  },
  {
    id: 'kirsche', spHost: 2, spRot: 0.88, drain: 0.8, name: 'Kirsche', fruitCur: 'Kirschsaft', coreCur: 'Kirschkerne', color: '#8A0E26', R: 122,
    layers: {
      1: { name: 'Haut', hp: 30, cost: 2.8, f: 1, hard: true, sw: '#4E0514', note: 'fest und glänzend' },
      2: { name: 'Fruchtfleisch', hp: 6, cost: 1.05, f: 0.15, juicy: true, sw: '#A8142E', note: 'dunkel und saftig' },
      3: { name: 'Stein', hp: 500, cost: 4.9, k: 1, hard: true, sw: '#D9C9A3', note: 'ein großer, steinharter Kern' },
    },
    breakLayer: 2, breakText: 'Durchbruch!', unlockCost: 40,
    hint(r){
      if (!r.broke) return 'Die Kirschhaut ist fest, und jeder Biss kostet hier mehr Ausdauer.';
      if (!eaten[3]) return 'Dunkles, saftiges Fruchtfleisch. In der Mitte liegt der Stein.';
      return 'Der Kirschstein ist steinhart. Er bezahlt den Weg zur Walnuss.';
    },
  },
  {
    id: 'walnuss', spHost: 1, spHosts: { blase: 3, kristall: 3 },
    spOver: { blase: { name: 'Öltropfen', plural: 'Öltropfen', mult: 1.5, tint: [238, 198, 84], dropCol: '#E9C457',
      L: { sw: '#E9C457', note: 'platzt auf, das Öl fließt zur Raupe (Walnusskerne)' } } }, spRot: 0.87, drain: 2.2, name: 'Walnuss', fruitCur: 'Nussholz', coreCur: 'Walnusskerne', color: '#8A6A3E', R: 175,
    layers: {
      1: { name: 'Grüne Hülle', hp: 10, cost: 1.4, f: 0.2, sw: '#5E8A34', note: 'weich, bringt wenig' },
      2: { name: 'Holzschale', hp: 220, cost: 4.2, f: 0.5, hard: true, sw: '#8E6438', note: 'steinhart, auch die Trennwände innen' },
      3: { name: 'Nusskern', hp: 15, cost: 1.4, k: 0.03, juicy: true, sw: '#DDBF86', note: 'weich, der Lohn' },
    },
    breakLayer: 3, breakText: 'Geknackt!', unlockCost: 200,
    hint(r){
      if (!eaten[2] && !r.touched[2]) return 'Die grüne Hülle ist weich. Darunter wartet die Holzschale.';
      if (!r.broke) return 'Die Holzschale ist steinhart. Dahinter liegt der weiche Nusskern.';
      return 'Geknackt! Der Nusskern ist weich. Die Trennwände sind wieder Holz.';
    },
  },
  {
    id: 'pflaume', spHost: 2, spRot: 0.88, drain: 3.0, name: 'Pflaume', fruitCur: 'Pflaumenmus', coreCur: 'Pflaumensteine', color: '#4B2E6B', R: 193,
    layers: {
      1: { name: 'Haut', hp: 260, cost: 4.2, f: 1, hard: true, sw: '#3E1E5A', note: 'fest, mit Wachsreif; die Naht ist weich', snd: 'crunch' },
      2: { name: 'Fruchtfleisch', hp: 28, cost: 1.6, f: 0.15, juicy: true, sw: '#E8B640', note: 'goldgelb und saftig', snd: 'squish' },
      3: { name: 'Stein', hp: 2600, cost: 7, k: 1, hard: true, sw: '#B4845A', note: 'flach, liegt lose in seinem Hohlraum', snd: 'stone' },
    },
    breakLayer: 2, breakText: 'Durchbruch!', unlockCost: 300,
    hint(r){
      if (!r.broke) return 'Die Pflaumenhaut ist fest. Such die Naht: Dort ist sie weich.';
      if (!eaten[3]) return 'Goldgelbes Fruchtfleisch. Der Stein liegt lose in der Mitte, von allen Seiten erreichbar.';
      return 'Der Pflaumenstein ist steinhart. Er bezahlt den Weg zum Apfel.';
    },
  },
  {
    id: 'apfel', spHost: 2, spRot: 0.9, drain: 3.6, name: 'Apfel', fruitCur: 'Apfelsaft', coreCur: 'Apfelkerne', color: '#8DB33A', R: 232, brown: 2,
    layers: {
      1: { name: 'Schale', hp: 4000, cost: 5, f: 1, hard: true, sw: '#B8343A', note: 'dünn, aber sehr zäh', snd: 'crunch' },
      2: { name: 'Fruchtfleisch', hp: 70, cost: 2, f: 0.15, juicy: true, sw: '#F1EAC4', note: 'saftig, wird an der Luft braun', snd: 'squish' },
      3: { name: 'Kerngehäuse', hp: 2500, cost: 4, f: 0.1, hard: true, sw: '#D6CC98', note: 'Pergament, härter, bringt weniger', snd: 'leaf' },
      4: { name: 'Kerne', hp: 8000, cost: 9, k: 1, hard: true, sw: '#6A3A1C', note: 'je einer in den fünf Kammern', snd: 'stone' },
    },
    breakLayer: 2, breakText: 'Durchbruch!', unlockCost: 1500,
    hint(r){
      if (!r.broke) return 'Die Apfelschale ist dünn, aber sehr zäh. Mehr Bisskraft oder eine Faulstelle hilft.';
      if (!eaten[4]) return 'Das Kerngehäuse in der Mitte ist zäh. In seinen fünf Kammern liegen die Kerne.';
      return 'Die Apfelkerne sind steinhart. Sie bezahlen den Weg zum Kürbis.';
    },
  },
  {
    id: 'kuerbis', spHost: 2, spRot: 0.88, drain: 4.5, name: 'Kürbis', fruitCur: 'Kürbismus', coreCur: 'Kürbiskerne', color: '#E07A1F', R: 486,
    layers: {
      1: { name: 'Schale', hp: 900, cost: 6, f: 1, hard: true, sw: '#C2641A', note: 'dick und hart, mit Rippen', snd: 'wood' },
      2: { name: 'Fruchtfleisch', hp: 220, cost: 2.5, f: 0.15, juicy: true, sw: '#F29A3A', note: 'fest und orange', snd: 'crunch' },
      3: { name: 'Fasern', hp: 15, cost: 1, f: 0.02, juicy: true, sw: '#F6C46A', note: 'weich, bringen fast nichts', snd: 'leaf' },
      4: { name: 'Kerne', hp: 20000, cost: 9, k: 0.2, hard: true, sw: '#EFE6CB', note: 'flach und hart, verstreut im Hohlraum', snd: 'nut' },
    },
    breakLayer: 2, breakText: 'Durchbruch!', unlockCost: 900,
    hint(r){
      if (!r.broke) return 'Die Kürbisschale ist dick und hart. Das wird ein langer Weg.';
      if (!eaten[4]) return 'Festes Fruchtfleisch, dahinter ein Hohlraum mit Fasern und vielen Kernen.';
      return 'Kürbiskerne überall. Jeder ist steinhart.';
    },
  },
];
const EMPTY_BITE = 0.2;                                  // Ausdauer für einen Biss, der nichts trifft
/* =====================================================================
   Sonderstellen (Schicht 4). Pro Frucht genau eine Art. layer(host, w) leitet die
   Werte aus der Wirtsschicht ab (spHost der Welt): Fruchtfleisch, bei der Walnuss die grüne Hülle.
   spHosts = abweichender Wirt je Art (Walnuss: Öltropfen und Kristalle im Nusskern), spKinds = erlaubte Arten (Standard: alle),
   spOver = Abweichungen je Art (Walnuss: Öltropfen statt Saftblase),
   spRot = Abstand der Faulstelle von der Mitte (relativ, sie sitzt auf dem Rand).
   n = Anzahl von–bis, r = Radius relativ zur Frucht.
   ===================================================================== */
const SP_STEP = 0.05;                                      // Anteil der Früchte je Stufe eines Sonderstellen-Knotens (5 × 5 % = 25 % je Art)
const SPECIAL = {
  blase: { name: 'Saftblase', plural: 'Saftblasen', n: [2, 4], r: 0.1, mult: 3.5,
    layer: h => ({ name: 'Saftblase', hp: h.hp, cost: h.cost, f: 0, juicy: true, sw: '#F4A8B4', note: 'platzt beim Anbeißen, der Saft fliegt zur Raupe', snd: 'squish' }) },
  kristall: { name: 'Zuckerkristall', plural: 'Zuckerkristalle', n: [2, 4], r: 0.15,
    layer: h => ({ name: 'Zuckerkristall', hp: h.hp * 3, cost: h.cost * 2, f: (h.f || 0) * 5, k: (h.k || 0) * 1.5, hard: true, sw: '#DDA24A', note: 'hart, aber sehr süß', snd: 'stone' }) },
  faul: { name: 'Faulstelle', plural: 'Faulstellen', n: [1, 2], r: 0.2,
    layer: h => ({ name: 'Faulstelle', hp: h.hp * 0.4, cost: h.cost, f: h.f, juicy: h.juicy, sw: '#7A5230', note: 'weich, ein Weg nach innen', snd: 'squish' }) },
};
const FUTURE = [];                                         // weitere Welten (noch nicht gebaut)

/* ---------- Icons der Währungen ---------- */
const ICON = [
  { f: '<path d="M12 2.5C9 7 5.5 10.6 5.5 14.6a6.5 6.5 0 0 0 13 0C18.5 10.6 15 7 12 2.5Z" fill="#D42A40"/><ellipse cx="9.6" cy="14" rx="1.6" ry="2.6" fill="#fff" opacity=".45"/>',
    k: '<ellipse cx="12" cy="12" rx="5.2" ry="7.8" transform="rotate(28 12 12)" fill="#EBDDBA" stroke="#9C8A62" stroke-width="1.3"/>' },
  { f: '<path d="M12 2.5C9 7 5.5 10.6 5.5 14.6a6.5 6.5 0 0 0 13 0C18.5 10.6 15 7 12 2.5Z" fill="#7A0C22"/><ellipse cx="9.6" cy="14" rx="1.6" ry="2.6" fill="#fff" opacity=".35"/>',
    k: '<ellipse cx="12" cy="12" rx="7.6" ry="8.8" fill="#D9C9A3" stroke="#8C7A52" stroke-width="1.3"/><path d="M12 3.6v16.8" stroke="#8C7A52" stroke-width="1.3"/>' },
  { f: '<path d="M4 8.5 16.5 4l3.5 9.5L7.5 19Z" fill="#9A6B3A" stroke="#6A4520" stroke-width="1.2" stroke-linejoin="round"/><path d="M7 10.5l8-3M8.4 14.2l8.2-3" stroke="#6A4520" stroke-width="1" opacity=".7"/>',
    k: '<path d="M12 3.5c-4.5 0-7.5 3.5-7.5 8.5s3 8.5 7.5 8.5 7.5-3.5 7.5-8.5-3-8.5-7.5-8.5Z" fill="#DDBF86" stroke="#9A7A44" stroke-width="1.2"/><path d="M12 3.8v16.4M7.5 8c1.8 1 1.8 3 0 4s-1.8 3 0 4M16.5 8c-1.8 1-1.8 3 0 4s1.8 3 0 4" stroke="#9A7A44" stroke-width="1.1" fill="none"/>' },
  { f: '<path d="M6 9h12l-1.2 10.2a2 2 0 0 1-2 1.8H9.2a2 2 0 0 1-2-1.8Z" fill="#5A2E7A"/><rect x="5" y="5.5" width="14" height="3.5" rx="1" fill="#C9A86A"/><ellipse cx="10" cy="14" rx="1.4" ry="2.6" fill="#fff" opacity=".35"/>',
    k: '<path d="M12 3c4 2.5 5.5 6 5.5 9s-1.5 6.5-5.5 9c-4-2.5-5.5-6-5.5-9S8 5.5 12 3Z" fill="#B4845A" stroke="#7A5434" stroke-width="1.2"/><path d="M12 3.5v17" stroke="#7A5434" stroke-width="1.3"/>' },
  { f: '<path d="M12 2.5C9 7 5.5 10.6 5.5 14.6a6.5 6.5 0 0 0 13 0C18.5 10.6 15 7 12 2.5Z" fill="#E2B13A"/><ellipse cx="9.6" cy="14" rx="1.6" ry="2.6" fill="#fff" opacity=".45"/>',
    k: '<path d="M12 3c3 3.2 4.6 7 4.6 10.4a4.6 4.6 0 0 1-9.2 0C7.4 10 9 6.2 12 3Z" fill="#6A3A1C" stroke="#3E200E" stroke-width="1.1"/><ellipse cx="10.6" cy="12.5" rx="1" ry="2.2" fill="#fff" opacity=".35"/>' },
  { f: '<path d="M4.5 9.5h15v8a3 3 0 0 1-3 3h-9a3 3 0 0 1-3-3Z" fill="#E07A1F"/><path d="M9 9.5v11M15 9.5v11" stroke="#B35A12" stroke-width="1.1"/><path d="M12 9.5V5.5" stroke="#5E8A34" stroke-width="2" stroke-linecap="round"/>',
    k: '<ellipse cx="12" cy="12" rx="5.6" ry="8.6" transform="rotate(20 12 12)" fill="#F1E7C9" stroke="#B8A57A" stroke-width="1.3"/><ellipse cx="12" cy="12" rx="3.6" ry="6.4" transform="rotate(20 12 12)" fill="none" stroke="#D7C9A0" stroke-width="1"/>' },
];
const iconImgs = {};
function iconImg(w, t){                                      // Icon als Bild für das Canvas
  const key = w + t;
  if (!iconImgs[key]){
    const im = new Image();
    im.src = 'data:image/svg+xml,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">${ICON[w][t]}</svg>`);
    iconImgs[key] = im;
  }
  return iconImgs[key];
}
const icon = (w, t) => `<svg class="ic" viewBox="0 0 24 24" aria-hidden="true">${ICON[w][t]}</svg>`;
const curName = (w, t) => t === 'f' ? WORLDS[w].fruitCur : WORLDS[w].coreCur;
const money = (w, t, x, sign = '') => `<span class="cost" title="${curName(w, t)}">${sign}${icon(w, t)}${fmtInt(x)}</span>`;

/* =====================================================================
   Fähigkeiten: Basiswirkung beim Wählen, dazu je drei Ausbau-Knoten im Baum.
   ===================================================================== */
const ABIL = {
  fressrausch: { name: 'Fressrausch', short: 'Rausch', kind: 'aktiv',
    nodes: [
      { name: 'Dauer', val: l => `${3 + l} s` },
      { name: 'Kraft', val: l => `×${fmt(2 + 0.25 * l)} Bisskraft` },
      { name: 'Takt', val: l => `×${fmt(1.5 + 0.1 * l)} Biss-Takt` } ],
    desc: L => `${3 + L[0]} s lang ×${fmt(2 + 0.25 * L[1])} Bisskraft, ×${fmt(1.5 + 0.1 * L[2])} Biss-Takt und kein Ausdauerverbrauch.` },
  schub: { name: 'Schub', short: 'Schub', kind: 'aktiv',
    nodes: [
      { name: 'Weite', val: l => `Reichweite ${30 + 8 * l}` },
      { name: 'Breite', val: l => `${100 + 10 * l} % Kopfbreite` },
      { name: 'Wucht', val: l => l ? `Aufprall mit ${3 * l}-facher Bisskraft` : 'kein Aufprall' } ],
    desc: L => `Sprint geradeaus, frisst weiches Material auf ${30 + 8 * L[0]} Länge, stoppt an harten Schichten` + (L[2] ? ` und prallt dort mit ${3 * L[2]}-facher Bisskraft auf.` : '.') },
  spucke: { name: 'Säurespucke', short: 'Spucke', kind: 'aktiv',
    nodes: [
      { name: 'Radius', val: l => `Radius ${fmt(9 + 1.5 * l)}` },
      { name: 'Ätzkraft', val: l => `+${30 * l} % Schaden` },
      { name: 'Pfütze', val: l => l ? `${l} s Nachätzen` : 'kein Nachätzen' } ],
    desc: L => `Spuckt Verdauungssaft nach vorn. Löst beim Aufprall einen Kreis mit Radius ${fmt(9 + 1.5 * L[0])} an, auch harte Schichten` + (L[2] ? `, und ätzt ${L[2]} s nach.` : '.') },
  seidenfaden: { name: 'Seidenfaden', short: 'Faden', kind: 'aktiv',
    nodes: [
      { name: 'Dauer', val: l => `${fmt(2.5 + 0.5 * l)} s` },
      { name: 'Schärfe', val: l => `${40 + 10 * l} % Bisskraft je Tick` },
      { name: 'Tiefe', val: l => `${5 + 2 * l} Pixel tief` } ],
    desc: L => `${fmt(2.5 + 0.5 * L[0])} s lang ein Seidenstrahl, der sich geradeaus ${5 + 2 * L[2]} Pixel tief ins Material schneidet.` },
  brennhaare: { name: 'Brennhaare', short: 'Haare', kind: 'passiv',
    nodes: [
      { name: 'Brennkraft', val: l => `${12 + 4 * l} % Bisskraft` },
      { name: 'Länge', val: l => `${fmt(hairReach(l))} weit` },
      { name: 'Takt', val: l => `alle ${fmt(0.35 - 0.04 * l)} s` } ],
    desc: L => `Solange die Raupe unterwegs ist, brennen die Haare alle ${fmt(0.35 - 0.04 * L[2])} s rund um den Körper: ${12 + 4 * L[0]} % der Bisskraft, ${fmt(hairReach(L[1]))} weit.` },
  saftsog: { name: 'Saftsog', short: 'Sog', kind: 'passiv',
    nodes: [
      { name: 'Menge', val: l => `${fmt(0.6 + 0.2 * l)} je 100 Happen` },
      { name: 'Deckel', val: l => `bis ${60 + 7 * l} % der Bisskosten` },
      { name: 'Durst', val: l => `+${4 * l} % Ausdauer` } ],
    desc: L => `Saftige Schichten geben Ausdauer zurück: ${fmt(0.6 + 0.2 * L[0])} je 100 Happen, höchstens ${60 + 7 * L[1]} % der Bisskosten.` + (L[2] ? ` +${4 * L[2]} % Ausdauer.` : '') },
  haeutung: { name: 'Häutung', short: 'Häutung', kind: 'passiv',
    nodes: [
      { name: 'Menge', val: l => `${25 + 5 * l} % zurück` },
      { name: 'Wachstum', val: l => `+${25 + 5 * l} % Maul` },
      { name: 'Dauer', val: l => `${6 + l} s` } ],
    desc: L => `Einmal pro Run bei leerer Ausdauer: ${25 + 5 * L[0]} % zurück und ${6 + L[2]} s lang +${25 + 5 * L[1]} % Maul.` },
  gabeldruese: { name: 'Gabeldrüse', short: 'Drüse', kind: 'passiv',
    nodes: [
      { name: 'Stärke', val: l => `−${4 + 2 * l} % Härte je Biss` },
      { name: 'Reichweite', val: l => `${fmt(1.9 + 0.2 * l)}× Bissweite` },
      { name: 'Kegel', val: l => `${coneDeg(l)}° breit` } ],
    desc: L => `Jeder Biss weicht einen Kegel vor dem Kopf auf, auch hinter der Schale: −${4 + 2 * L[0]} % Härte.` },
};
function hairReach(l){ return 4.5 + 1 * l; }              // Reichweite der Brennhaare
function coneDeg(l){ return 74 + 10 * l; }                // Öffnungswinkel der Gabeldrüse, gleichmäßig je Stufe
const abNode = (id, i) => lv(`ab_${id}_${i}`);
const abL = id => [0, 1, 2].map(i => abNode(id, i));

/* =====================================================================
   Upgrade-Baum. Sechs Äste, Ringe nach Welten:
   Ring 1–2 Johannisbeere, Ring 3 Kirsche, Ring 4 Walnuss, Ring 5 Pflaume, Ring 6 Apfel, Ring 7 Kürbis.
   w = Welt, deren Fruchtwährung bezahlt; kc/kw = zusätzliche Kernwährung.
   ===================================================================== */
const RINGS = [0, 12.5, 22, 32, 42, 52, 62, 72];
const BANDS = [0, 27, 37, 47, 57, 67];
const BR = { Kiefer: -90, Maul: -30, Ausdauer: 30, Verdauung: 90, Tempo: 150, 'Fähigkeiten': 210 };
/* show(s) liefert den echten Gesamtwert aus stats(); im Shop steht "jetzt → nach dem Kauf".
   Alle Knoten wirken linear: jede Stufe bringt gleich viel, auch die erste. */
const SH = {
  power: s => `Bisskraft ${fmt2(s.power)}`,
  crit: s => `${pct(s.crit)} Krit-Chance`,
  critDmg: s => `${pct(s.critMult)} Krit-Schaden`,
  mouth: s => `Maulgröße ${fmt2(s.mouth)}`,
  stamina: s => `Ausdauer ${s.stamina}`,
  hard: s => `Kosten in harten Schichten ${pct(s.hardMult)}`,
  rate: s => `${fmt2(s.rate)} Bisse/s`,
  segs: s => `${s.segs} Segmente`,
  yieldOf: w => s => `Ertrag ${pct(s.yieldW[w])} ${WORLDS[w].fruitCur}`,
  sp: k => s => `${Math.round(s.spP[k] * 100)} % der Früchte` + (s.spOff[k] ? ' (aus)' : ''),
};
const UPG = [
  // --- Johannisbeere ---
  { id: 'kiefer', w: 0, ring: 1, br: 'Kiefer', off: 0, name: 'Kiefer', max: 20, cost: 25, grow: 1.55,
    desc: 'Mehr Bisskraft: +1 je Stufe.', show: SH.power },
  { id: 'krit', w: 0, ring: 2, br: 'Kiefer', off: -20, parent: 'kiefer', need: 3, name: 'Kritischer Biss', max: 5, cost: 100, grow: 1.9,
    desc: 'Je Stufe +1 % Chance auf einen kritischen Biss (150 % Schaden). Jede Welt bringt einen eigenen Knoten für die Krit-Chance, ab der Kirsche auch einen für den Krit-Schaden.', show: SH.crit },
  { id: 'mandibeln', w: 0, ring: 2, br: 'Kiefer', off: 20, parent: 'kiefer', need: 6, name: 'Scharfe Mandibeln', max: 10, cost: 600, grow: 1.8,
    desc: 'Je Stufe +10 % Bisskraft.', show: SH.power },
  { id: 'maul', w: 0, ring: 1, br: 'Maul', off: 0, name: 'Maul', max: 10, cost: 50, grow: 1.7,
    desc: 'Ein größeres Maul erfasst mehr Fläche: +0,4 je Stufe. Der Kopf braucht dafür ein größeres Loch.', show: SH.mouth },
  { id: 'kaukraft', w: 0, ring: 2, br: 'Maul', off: -10, parent: 'maul', need: 3, name: 'Kaukraft', max: 5, cost: 150, grow: 1.9,
    desc: 'Auch am Rand des Bisses kommt mehr Kraft an: +7 % je Stufe.', show: s => `${Math.round((1 - s.falloff) * 100)} % Kraft am Rand` },
  { id: 'ausdauer', w: 0, ring: 1, br: 'Ausdauer', off: 0, name: 'Ausdauer', max: 20, cost: 10, grow: 1.45,
    desc: 'Mehr Ausdauer, der Run dauert länger: +5 je Stufe.', show: SH.stamina },
  { id: 'zaeh', w: 0, ring: 2, br: 'Ausdauer', off: 10, parent: 'ausdauer', need: 3, name: 'Zähigkeit', max: 5, cost: 150, grow: 1.9,
    desc: 'Bisse in harten Schichten kosten weniger Ausdauer: −8 % je Stufe.', show: SH.hard },
  { id: 'verdauung', w: 0, ring: 1, br: 'Verdauung', off: 0, name: 'Verdauung', max: 20, cost: 30, grow: 1.55,
    desc: 'Mehr Beerensaft aus jedem Happen: +15 % je Stufe. Wirkt nur in der Johannisbeere.', show: SH.yieldOf(0) },
  { id: 'enzyme', w: 0, ring: 2, br: 'Verdauung', off: 10, parent: 'verdauung', need: 5, name: 'Enzyme', max: 10, cost: 500, grow: 1.8,
    desc: 'Nochmals mehr Beerensaft: +30 % je Stufe. Wirkt nur in der Johannisbeere.', show: SH.yieldOf(0) },
  { id: 'sp_faul', w: 0, ring: 2, br: 'Verdauung', off: -16, parent: 'verdauung', need: 2, spKind: 'faul', name: 'Faulstellen', max: 5, cost: 120, grow: 1.8,
    desc: 'Schaltet Faulstellen frei: weiche, braune Flecken am Rand, ein schneller Weg nach innen. Dafür bringen sie weniger als die Schale, die sie ersetzen. Jede Stufe: +5 % der Früchte. Lassen sich ausschalten.', show: SH.sp('faul') },
  { id: 'tempo', w: 0, ring: 1, br: 'Tempo', off: 0, name: 'Tempo', max: 7, cost: 35, grow: 1.6,
    desc: 'Schnellerer Biss-Takt: +0,05 Bisse/s je Stufe. Jede Welt bringt ihren eigenen Tempo-Knoten.', show: SH.rate },
  { id: 'segment', w: 0, ring: 2, br: 'Tempo', off: 10, parent: 'tempo', need: 2, name: 'Segment', max: 4, cost: 60, grow: 1.9,
    desc: 'Ein Segment mehr. Eine längere Raupe schiebt sich pro Zyklus weiter vor.', show: SH.segs },
  { id: 'aufladung', w: 0, ring: 2, br: 'Fähigkeiten', off: -18, needActive: true, name: 'Aufladung', max: 5, cost: 300, grow: 2,
    desc: 'Kürzere Abklingzeit der aktiven Fähigkeit: −3 s je Stufe.',
    show: s => `Abklingzeit ${s.cd} s` },

  // --- Kirsche ---
  { id: 'kiefer2', w: 1, ring: 3, br: 'Kiefer', off: 0, parent: 'kiefer', need: 5, name: 'Kirschkiefer', max: 15, cost: 60, grow: 1.6,
    desc: 'Deutlich mehr Bisskraft: +3 je Stufe.', show: SH.power },
  { id: 'krit2', w: 1, ring: 3, br: 'Kiefer', off: -20, parent: 'krit', need: 1, name: 'Krit-Chance II', max: 5, cost: 250, grow: 1.9,
    desc: 'Je Stufe +1 % Chance auf einen kritischen Biss.', show: SH.crit },
  { id: 'kritd2', w: 1, ring: 3, br: 'Kiefer', off: 38, parent: 'mandibeln', need: 1, name: 'Krit-Schaden II', max: 5, cost: 250, grow: 1.9,
    desc: 'Je Stufe +5 % Krit-Schaden.', show: SH.critDmg },
  { id: 'maul2', w: 1, ring: 3, br: 'Maul', off: 10, parent: 'maul', need: 2, name: 'Weiter Schlund', max: 5, cost: 200, grow: 1.9,
    desc: 'Noch mehr Maul: +0,3 je Stufe.', show: SH.mouth },
  { id: 'ausdauer2', w: 1, ring: 3, br: 'Ausdauer', off: -10, parent: 'ausdauer', need: 3, name: 'Fettreserve', max: 15, cost: 50, grow: 1.55,
    desc: 'Mehr Ausdauer: +10 je Stufe.', show: SH.stamina },
  { id: 'verdauung2', w: 1, ring: 3, br: 'Verdauung', off: -10, parent: 'verdauung', need: 3, name: 'Kirschmagen', max: 15, cost: 80, grow: 1.6,
    desc: 'Mehr Kirschsaft: +15 % je Stufe. Wirkt nur in der Kirsche.', show: SH.yieldOf(1) },
  { id: 'sp_kristall', w: 1, ring: 3, br: 'Verdauung', off: -28, parent: 'sp_faul', need: 1, spKind: 'kristall', name: 'Zuckerkristalle', max: 5, cost: 250, grow: 1.8,
    desc: 'Schaltet Zuckerkristalle frei: harte, süße Büschel mit viel Ertrag (in der Walnuss im Nusskern). Jede Stufe: +5 % der Früchte. Lassen sich ausschalten.', show: SH.sp('kristall') },
  { id: 'tempo2', w: 1, ring: 3, br: 'Tempo', off: -10, parent: 'tempo', need: 1, name: 'Takt II', max: 7, cost: 80, grow: 1.7,
    desc: 'Schnellerer Biss-Takt: +0,05 Bisse/s je Stufe.', show: SH.rate },
  { id: 'segment2', w: 1, ring: 3, br: 'Tempo', off: 10, parent: 'segment', need: 1, name: 'Segment II', max: 3, cost: 300, grow: 2.2,
    desc: 'Noch ein Segment.', show: SH.segs },

  // --- Walnuss ---
  { id: 'kiefer3', w: 2, ring: 4, br: 'Kiefer', off: 0, parent: 'kiefer2', need: 3, name: 'Nussknacker', max: 15, cost: 60, grow: 1.6,
    desc: 'Kiefer, die Holz knacken: +8 Bisskraft je Stufe.', show: SH.power },
  { id: 'krit3', w: 2, ring: 4, br: 'Kiefer', off: -20, parent: 'krit2', need: 1, name: 'Krit-Chance III', max: 5, cost: 250, grow: 1.9,
    desc: 'Je Stufe +1 % Chance auf einen kritischen Biss.', show: SH.crit },
  { id: 'kritd3', w: 2, ring: 4, br: 'Kiefer', off: 38, parent: 'kritd2', need: 1, name: 'Krit-Schaden III', max: 5, cost: 250, grow: 1.9,
    desc: 'Je Stufe +5 % Krit-Schaden.', show: SH.critDmg },
  { id: 'mandibeln2', w: 2, ring: 4, br: 'Kiefer', off: 20, parent: 'mandibeln', need: 1, name: 'Stahlmandibeln', max: 8, cost: 600, grow: 1.8,
    desc: 'Je Stufe +15 % Bisskraft.', show: SH.power },
  { id: 'ausdauer3', w: 2, ring: 4, br: 'Ausdauer', off: -10, parent: 'ausdauer2', need: 3, name: 'Winterspeck', max: 15, cost: 50, grow: 1.55,
    desc: 'Mehr Ausdauer: +10 je Stufe.', show: SH.stamina },
  { id: 'zaeh2', w: 2, ring: 4, br: 'Ausdauer', off: 10, parent: 'zaeh', need: 1, name: 'Hornhaut', max: 5, cost: 300, grow: 1.9,
    desc: 'Harte Schichten kosten noch weniger Ausdauer: −4 % je Stufe.', show: SH.hard },
  { id: 'verdauung3', w: 2, ring: 4, br: 'Verdauung', off: -10, parent: 'verdauung2', need: 2, name: 'Nussmagen', max: 15, cost: 80, grow: 1.6,
    desc: 'Mehr Nussholz: +15 % je Stufe. Wirkt nur in der Walnuss.', show: SH.yieldOf(2) },
  { id: 'sp_blase', w: 2, ring: 4, br: 'Verdauung', off: -28, parent: 'sp_kristall', need: 1, spKind: 'blase', name: 'Saftblasen', max: 5, cost: 300, grow: 1.8,
    desc: 'Schaltet Saftblasen frei (in der Walnuss Öltropfen): Sie platzen beim Anbeißen, der Saft fliegt von selbst zur Raupe. Jede Stufe: +5 % der Früchte. Lassen sich ausschalten.', show: SH.sp('blase') },
  { id: 'tempo3', w: 2, ring: 4, br: 'Tempo', off: -10, parent: 'tempo2', need: 1, name: 'Takt III', max: 7, cost: 80, grow: 1.7,
    desc: 'Schnellerer Biss-Takt: +0,05 Bisse/s je Stufe.', show: SH.rate },
  { id: 'segment3', w: 2, ring: 4, br: 'Tempo', off: 10, parent: 'segment2', need: 1, name: 'Segment III', max: 3, cost: 400, grow: 2.2,
    desc: 'Noch ein Segment.', show: SH.segs },
  // --- Pflaume ---
  { id: 'kiefer4', w: 3, ring: 5, br: 'Kiefer', off: 0, parent: 'kiefer3', need: 3, name: 'Steinbeißer', max: 15, cost: 80, grow: 1.6,
    desc: 'Kiefer für Pflaumensteine: +25 Bisskraft je Stufe.', show: SH.power },
  { id: 'krit4', w: 3, ring: 5, br: 'Kiefer', off: -20, parent: 'krit3', need: 1, name: 'Krit-Chance IV', max: 5, cost: 300, grow: 1.9,
    desc: 'Je Stufe +1 % Chance auf einen kritischen Biss.', show: SH.crit },
  { id: 'kritd4', w: 3, ring: 5, br: 'Kiefer', off: 38, parent: 'kritd3', need: 1, name: 'Krit-Schaden IV', max: 5, cost: 300, grow: 1.9,
    desc: 'Je Stufe +5 % Krit-Schaden.', show: SH.critDmg },
  { id: 'maul3', w: 3, ring: 5, br: 'Maul', off: 10, parent: 'maul2', need: 2, name: 'Backentaschen', max: 5, cost: 250, grow: 1.9,
    desc: 'Noch mehr Maul: +0,3 je Stufe.', show: SH.mouth },
  { id: 'ausdauer4', w: 3, ring: 5, br: 'Ausdauer', off: -10, parent: 'ausdauer3', need: 3, name: 'Vorratsfett', max: 15, cost: 60, grow: 1.55,
    desc: 'Mehr Ausdauer: +15 je Stufe.', show: SH.stamina },
  { id: 'verdauung4', w: 3, ring: 5, br: 'Verdauung', off: -10, parent: 'verdauung3', need: 2, name: 'Pflaumenmagen', max: 15, cost: 100, grow: 1.6,
    desc: 'Mehr Pflaumenmus: +15 % je Stufe. Wirkt nur in der Pflaume.', show: SH.yieldOf(3) },
  { id: 'tempo4', w: 3, ring: 5, br: 'Tempo', off: -10, parent: 'tempo3', need: 1, name: 'Takt IV', max: 7, cost: 100, grow: 1.7,
    desc: 'Schnellerer Biss-Takt: +0,05 Bisse/s je Stufe.', show: SH.rate },

  // --- Apfel ---
  { id: 'kiefer5', w: 4, ring: 6, br: 'Kiefer', off: 0, parent: 'kiefer4', need: 3, name: 'Apfelkiefer', max: 15, cost: 120, grow: 1.6,
    desc: 'Kiefer, die durch Kerngehäuse beißen: +70 Bisskraft je Stufe.', show: SH.power },
  { id: 'krit5', w: 4, ring: 6, br: 'Kiefer', off: -20, parent: 'krit4', need: 1, name: 'Krit-Chance V', max: 5, cost: 450, grow: 1.9,
    desc: 'Je Stufe +1 % Chance auf einen kritischen Biss.', show: SH.crit },
  { id: 'kritd5', w: 4, ring: 6, br: 'Kiefer', off: 38, parent: 'kritd4', need: 1, name: 'Krit-Schaden V', max: 5, cost: 450, grow: 1.9,
    desc: 'Je Stufe +5 % Krit-Schaden.', show: SH.critDmg },
  { id: 'mandibeln3', w: 4, ring: 6, br: 'Kiefer', off: 20, parent: 'mandibeln2', need: 1, name: 'Diamantmandibeln', max: 8, cost: 900, grow: 1.8,
    desc: 'Je Stufe +15 % Bisskraft.', show: SH.power },
  { id: 'ausdauer5', w: 4, ring: 6, br: 'Ausdauer', off: -10, parent: 'ausdauer4', need: 3, name: 'Fettkörper', max: 15, cost: 90, grow: 1.55,
    desc: 'Mehr Ausdauer: +20 je Stufe.', show: SH.stamina },
  { id: 'zaeh3', w: 4, ring: 6, br: 'Ausdauer', off: 10, parent: 'zaeh2', need: 1, name: 'Panzerhaut', max: 5, cost: 450, grow: 1.9,
    desc: 'Harte Schichten kosten noch weniger Ausdauer: −3 % je Stufe.', show: SH.hard },
  { id: 'verdauung5', w: 4, ring: 6, br: 'Verdauung', off: -10, parent: 'verdauung4', need: 2, name: 'Apfelmagen', max: 15, cost: 150, grow: 1.6,
    desc: 'Mehr Apfelsaft: +15 % je Stufe. Wirkt nur im Apfel.', show: SH.yieldOf(4) },
  { id: 'tempo5', w: 4, ring: 6, br: 'Tempo', off: -10, parent: 'tempo4', need: 1, name: 'Takt V', max: 7, cost: 150, grow: 1.7,
    desc: 'Schnellerer Biss-Takt: +0,05 Bisse/s je Stufe.', show: SH.rate },

  // --- Kürbis ---
  { id: 'kiefer6', w: 5, ring: 7, br: 'Kiefer', off: 0, parent: 'kiefer5', need: 3, name: 'Kürbiskiefer', max: 15, cost: 250, grow: 1.6,
    desc: 'Kiefer für Kürbisschale: +200 Bisskraft je Stufe.', show: SH.power },
  { id: 'krit6', w: 5, ring: 7, br: 'Kiefer', off: -20, parent: 'krit5', need: 1, name: 'Krit-Chance VI', max: 5, cost: 900, grow: 1.9,
    desc: 'Je Stufe +1 % Chance auf einen kritischen Biss.', show: SH.crit },
  { id: 'kritd6', w: 5, ring: 7, br: 'Kiefer', off: 38, parent: 'kritd5', need: 1, name: 'Krit-Schaden VI', max: 5, cost: 900, grow: 1.9,
    desc: 'Je Stufe +5 % Krit-Schaden.', show: SH.critDmg },
  { id: 'maul4', w: 5, ring: 7, br: 'Maul', off: 10, parent: 'maul3', need: 2, name: 'Riesenschlund', max: 5, cost: 700, grow: 1.9,
    desc: 'Noch mehr Maul: +0,4 je Stufe.', show: SH.mouth },
  { id: 'ausdauer6', w: 5, ring: 7, br: 'Ausdauer', off: -10, parent: 'ausdauer5', need: 3, name: 'Winterruhe', max: 15, cost: 180, grow: 1.55,
    desc: 'Mehr Ausdauer: +30 je Stufe.', show: SH.stamina },
  { id: 'verdauung6', w: 5, ring: 7, br: 'Verdauung', off: -10, parent: 'verdauung5', need: 2, name: 'Kürbismagen', max: 15, cost: 300, grow: 1.6,
    desc: 'Mehr Kürbismus: +15 % je Stufe. Wirkt nur im Kürbis.', show: SH.yieldOf(5) },
  { id: 'tempo6', w: 5, ring: 7, br: 'Tempo', off: -10, parent: 'tempo5', need: 1, name: 'Takt VI', max: 7, cost: 300, grow: 1.7,
    desc: 'Schnellerer Biss-Takt: +0,05 Bisse/s je Stufe.', show: SH.rate },
  { id: 'segment4', w: 5, ring: 7, br: 'Tempo', off: 10, parent: 'segment3', need: 1, name: 'Segment IV', max: 3, cost: 900, grow: 2.2,
    desc: 'Noch ein Segment.', show: SH.segs },

  // --- Darm (gut: stehen nicht im Baum, sondern im Darm-Screen; wirken für alle Früchte) ---
  { id: 'zilien', w: 0, gut: true, name: 'Mehr Zilien', max: 2, cost: 250, grow: 3,
    desc: 'Eine Zilie mehr im Darm. Sie taucht an einer freien Stelle auf und lässt sich wie die anderen verschieben.',
    show: s => `${s.gutCilia} Zilien` },
  { id: 'darmflora', w: 0, gut: true, name: 'Darmflora', max: 10, cost: 120, grow: 1.7,
    desc: 'Mehr nützliche Bakterien: Jeder verdaute Brocken bringt 10 % mehr Fruchtwährung.',
    show: s => `×${fmt2(s.gutConv)} Ertrag` },
  { id: 'magen', w: 1, gut: true, name: 'Dehnbarer Magen', max: 3, cost: 200, grow: 2.2,
    desc: 'Der Magen fasst eine Portion mehr, du kannst also einen Run länger fressen, bevor du verdauen musst.',
    show: s => `${s.gutCap} Portionen` },
  { id: 'gedaechtnis', w: 1, gut: true, name: 'Gedächtnis', max: 1, cost: 600, grow: 1,
    desc: 'Der Darm merkt sich eine eigene Stellung (Pförtner und Zilien) für jede Frucht. Kommt ein Brocken einer anderen Frucht an die Reihe, gleiten Pförtner und Zilien von selbst in dessen Stellung.',
    show: s => s.gutMem ? 'eine Stellung je Frucht' : 'eine Stellung für alles' },
  { id: 'galle', w: 2, gut: true, name: 'Gallen-Zilie', max: 1, cost: 900, grow: 1,
    desc: 'Eine grüne Zilie, die du wie die anderen stellst. Fett-Brocken (Walnussöl, später Kürbis), die sie berühren, werden emulgiert: Sie haften nicht mehr und springen besser ab. Echt: Gallensäuren zerteilen Fett in feine Tröpfchen.',
    show: s => s.gutBile ? 'eingebaut' : 'keine' },
];
// Ausbau-Knoten jeder Fähigkeit. Sie erscheinen im Ast "Fähigkeiten" im Ring der Welt nach der Wahl
// und kosten deren Fruchtwährung plus Kernwährung der geschafften Welt.
for (const id in ABIL){
  ABIL[id].nodes.forEach((n, i) => UPG.push({ id: `ab_${id}_${i}`, ab: id, idx: i, br: 'Fähigkeiten', off: [0, -22, 22][i],
    name: `${ABIL[id].short}: ${n.name}`, max: 5, grow: 1.75, kgrow: 1.6,
    desc: `Baut ${ABIL[id].name} aus.`, val: n.val }));
}
const U = Object.fromEntries(UPG.map(u => [u.id, u]));
