'use strict';
/* =====================================================================
   Werte: Stufen der Knoten, Kosten, Gesamtwerte der Raupe (S)
   ===================================================================== */
const lv = id => save.lv[id] || 0;
/* Kosten eines Knotens: { w, f, kw, k } */
function costOf(u){
  const l = lv(u.id);
  if (u.ab){
    const from = save.abil.from[u.ab];
    const baseF = [60, 250, 900, 1500, 3000][from] || 3000, baseK = [6, 25, 120, 300, 600][from] || 600;
    return { w: from + 1, f: Math.round(baseF * Math.pow(u.grow, l)), kw: from, k: Math.round(baseK * Math.pow(u.kgrow, l)) };
  }
  return { w: u.w, f: Math.round(u.cost * Math.pow(u.grow, l)), kw: null, k: 0 };
}
function nodeWorld(u){ return u.ab ? (save.abil.from[u.ab] ?? 99) + 1 : u.w; }
function nodeRing(u){ return u.ab ? nodeWorld(u) + 2 : u.ring; }
const ownsActive = () => Object.keys(save.abil.own).some(id => ABIL[id].kind === 'aktiv');
const inTree = u => !u.gut;                                   // Darm-Knoten stehen im Darm-Screen, nicht im Baum
const visible = u => u.ab ? !!save.abil.own[u.ab] && nodeWorld(u) < save.unlocked
  : u.w < save.unlocked && (!u.needActive || ownsActive());
/* Werte mit einer anderen Stufe eines Knotens (für "jetzt → danach") */
function statsWith(id, l){
  const old = save.lv[id];
  save.lv[id] = l;
  const s = stats();
  if (old === undefined) delete save.lv[id]; else save.lv[id] = old;
  return s;
}
const nodeVal = (u, l) => u.show ? u.show(statsWith(u.id, l)) : u.val(l);
const unlocked = u => visible(u) && (!u.parent || lv(u.parent) >= u.need);
const afford = c => cur(c.w, 'f') >= c.f && (!c.k || cur(c.kw, 'k') >= c.k);
const canBuy = u => unlocked(u) && lv(u.id) < u.max && afford(costOf(u));

/* Wahrscheinlichkeit je Sonderstelle: fest 5 % je Stufe (ausgeschaltet = 0), der Rest hat keine */
function spChances(){
  const off = save.spOff || {}, p = {};
  let sum = 0;
  for (const k of ['faul', 'kristall', 'blase']){ p[k] = off[k] ? 0 : SP_STEP * lv('sp_' + k); sum += p[k]; }
  p.none = Math.max(0, 1 - sum);
  return p;
}
function stats(){
  const kc = lv('krit') + lv('krit2') + lv('krit3') + lv('krit4') + lv('krit5') + lv('krit6');
  const kd = lv('kritd2') + lv('kritd3') + lv('kritd4') + lv('kritd5') + lv('kritd6');
  const durst = save.abil.passive === 'saftsog' ? 1 + 0.04 * abNode('saftsog', 2) : 1;
  return {
    power: (1 + lv('kiefer') + 3 * lv('kiefer2') + 8 * lv('kiefer3') + 25 * lv('kiefer4') + 70 * lv('kiefer5') + 200 * lv('kiefer6'))
      * (1 + 0.1 * lv('mandibeln') + 0.15 * lv('mandibeln2') + 0.15 * lv('mandibeln3')),
    crit: 0.01 * kc,
    critMult: 1.5 + 0.05 * kd,
    mouth: 4 + 0.4 * lv('maul') + 0.3 * lv('maul2') + 0.3 * lv('maul3') + 0.4 * lv('maul4'),
    falloff: 0.55 - 0.07 * lv('kaukraft'),
    stamina: Math.round((30 + 5 * lv('ausdauer') + 10 * lv('ausdauer2') + 10 * lv('ausdauer3') + 15 * lv('ausdauer4') + 20 * lv('ausdauer5') + 30 * lv('ausdauer6')) * durst),
    hardMult: 1 - 0.08 * lv('zaeh') - 0.04 * lv('zaeh2') - 0.03 * lv('zaeh3'),
    cd: 30 - 3 * lv('aufladung'),                          // Abklingzeit der aktiven Fähigkeit in Sekunden
    yieldW: [
      1 + 0.15 * lv('verdauung') + 0.3 * lv('enzyme'),
      1 + 0.15 * lv('verdauung2'),
      1 + 0.15 * lv('verdauung3'),
      1 + 0.15 * lv('verdauung4'),
      1 + 0.15 * lv('verdauung5'),
      1 + 0.15 * lv('verdauung6'),
    ],
    rate: 1 + 0.05 * (lv('tempo') + lv('tempo2') + lv('tempo3') + lv('tempo4') + lv('tempo5') + lv('tempo6')),
    segs: 6 + lv('segment') + lv('segment2') + lv('segment3') + lv('segment4'),
    gutConv: 1 + 0.1 * lv('darmflora'),                    // Darm: Ertrag je verdautem Brocken
    gutCap: GUT.cap0 + lv('magen'),                        // Magen: Portionen
    gutCilia: GUT.cilia0 + lv('zilien'),                   // Zilien im Darm
    gutMem: lv('gedaechtnis') > 0,                         // eigene Stellung je Frucht
    gutBile: lv('galle') > 0,                              // Gallen-Zilie eingebaut
    spP: spChances(), spOff: Object.assign({}, save.spOff),
  };
}
let S = stats();
let W = WORLDS[0], WI = 0;
