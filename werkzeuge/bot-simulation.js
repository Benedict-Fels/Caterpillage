// Bot-Simulation: spielt den echten Spielcode headless (braucht Node und Playwright mit Chromium).
// Aufruf aus dem Projektordner:  node werkzeuge/bot-simulation.js . 100 '{"abil":["fressrausch","saftsog"]}'
// Optionen (JSON): abil = feste Fähigkeiten nach Welt 1 und 2; sp = Sonderstellen zuerst ansteuern;
// eval = JS vor dem Start, z. B. "WORLDS[2].drain=2" oder "adm.on=true;adm.sp='none'";
// stopAt = aufhören, sobald diese Welt frei ist; noDigest = nie verdauen (zum Vergleich mit dem Spiel ohne Darm);
// randomPf = Pförtner zufällig statt an der besten Stelle.
// Ausgabe: eine Zeile pro Run (Welt, Sonderstelle, deren Ertrag spF, Dauer, Ertrag, % je Schicht).
const { chromium } = require('playwright');
const path = require('path');
const gameDir = process.argv[2], maxRuns = +process.argv[3] || 60;
const over = process.argv[4] || '{}';

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  await p.route(/fonts\.(googleapis|gstatic)/, r => r.abort());
  p.on('console', m => console.log(m.text()));
  p.on('pageerror', e => console.error('PAGEERR', e.message));
  await p.goto('file://' + path.resolve(gameDir, 'index.html'));
  await p.waitForTimeout(300);
  const res = await p.evaluate(async ([maxRuns, over]) => {
    const O = JSON.parse(over);
    if (O.eval) eval(O.eval);                     // Parameter-Überschreibungen
    const cp = window.__cp; cp.dev.manual = true;
    localStorage.clear(); cp.save = JSON.parse(JSON.stringify({ v: 3, cur: {}, lv: {}, runs: [0,0,0,0,0,0], unlocked: 1, world: 0,
      abil: { own: {}, from: {}, active: null, passive: null }, choice: null, best: {}, last: null, spOff: {}, gut: { p: [] } }));
    ctrl.mode = 'mouse';
    const log = [];
    let totalT = 0;
    for (let n = 0; n < maxRuns; n++){
      // neueste Welt spielen
      cp.save.world = cp.save.unlocked - 1;
      cp.startRun(); delete cp.run._tx;
      let t = 0, brokeT = null, ticks = 0;
      while (!cp.run.over && t < 600){
        // Ziel: vor dem Durchbruch Mitte, danach nächstes Pixel der Kernschicht
        const h = cp.cat.trail[0];
        let tx = CX, ty = CY;
        if ((run.broke || WI === 2) && (ticks++ % 12 === 0 || cp.run._tx === undefined)){
          let best = 1e9;
          const want = 3;
          for (let i = 0; i < N; i += 1){ if (type[i] !== want) continue; const x = i % SIM, y = (i / SIM) | 0, d = (x - h.x) ** 2 + (y - h.y) ** 2; if (d < best){ best = d; tx = x; ty = y; } }
          if (best === 1e9){ tx = CX; ty = CY; }
          cp.run._tx = tx; cp.run._ty = ty;
        } else if (cp.run._tx !== undefined){ tx = cp.run._tx; ty = cp.run._ty; }
        if (O.sp){                                   // Sonderstellen zuerst ansteuern
          const it = SP.items.filter(b => b.left > 0 && !b.popped).sort((a, b) => Math.hypot(a.x - h.x, a.y - h.y) - Math.hypot(b.x - h.x, b.y - h.y))[0];
          if (it){ tx = it.x; ty = it.y; }
        }
        { const dx = tx - h.x, dy = ty - h.y, d = Math.hypot(dx, dy) || 1; cp.cat.target.x = h.x + dx / d * 30; cp.cat.target.y = h.y + dy / d * 30; }
        if (cp.run.charge >= 1 && save.abil.active) cp.useActive();
        cp.update(0.02); t += 0.02;
        if (brokeT === null && cp.run.broke) brokeT = t;
      }
      const spF = SP.kind === 'blase' ? (run.m['Saftblase'] ? run.m['Saftblase'].f : 0) : SP.kind ? eaten[4] * W.layers[4].f * S.yieldW[WI] : 0;
      const L = cp.save.last;
      // verdauen, sobald der Magen voll ist (gleiche Physik, Pförtner pendelt); gut = Ertrag aus dem Darm
      // Pförtner wie ein ordentlicher Spieler: je Frucht die beste Stelle für die Grundstellung der Zilien
      const bestPf = {};
      const pick = (k, L) => { if (bestPf[k] === undefined){ let bx = L.pf, bp = -1; for (let x = 24; x <= 456; x += 8){ const p = gutSimulate(k, x, L.z).points; if (p > bp){ bp = p; bx = x; } } bestPf[k] = bx; } return bestPf[k]; };
      const gut = O.noDigest || cp.save.gut.p.length < cp.S.gutCap ? 0 : Math.round(Object.values(cp.digestAll(O.randomPf ? (k, L) => 24 + Math.random() * 432 : pick)).reduce((a, b) => a + b, 0));
      totalT += t;
      console.log(JSON.stringify({ n, w: L.w, gut, sp: SP.kind, spF: Math.round(spF), t: +t.toFixed(1), f: Math.round(L.f), k: +L.k.toFixed(1), p: [1,2,3].map(k => Math.round(L.p[k])) }));
      log.push({ n, w: L.w, t: +t.toFixed(1), brokeT: brokeT && +brokeT.toFixed(1), f: Math.round(L.f), k: +L.k.toFixed(1), p: [1,2,3].map(k => Math.round(L.p[k])), clean: L.clean, stam: cp.S.stamina, rate: +cp.S.rate.toFixed(2), pow: +cp.S.power.toFixed(1) });
      // einkaufen: immer das Billigste (in Fruchtwährung der eigenen Welt normiert)
      for (let g = 0; g < 200; g++){
        const opts = cp.UPG.filter(u => cp.canBuy(u));
        if (!opts.length) break;
        opts.sort((a, b) => cp.costOf(a).f - cp.costOf(b).f);
        cp.buy(opts[0]);
      }
      const nx = cp.save.unlocked;
      if (nx < cp.WORLDS.length && cp.cur(nx - 1, 'k') >= cp.WORLDS[nx].unlockCost){
        cp.unlockWorld(nx);
        const opts = cp.save.choice.options;
        if (O.abil){ const id = O.abil[nx - 1]; cp.save.choice.options = [id]; cp.choose(id); }
        else cp.choose(opts[0]);
        console.log('UNLOCK ' + nx + ' after ' + (n+1) + ' runs, ' + (totalT/60).toFixed(1) + ' min');
        log.push({ unlock: nx, afterRuns: n + 1, totalMin: +(totalT / 60).toFixed(1) });
      }
      if (O.stopAt && cp.save.unlocked > O.stopAt) break;
    }
    log.push({ totalMin: +(totalT / 60).toFixed(1) });
    return log;
  }, [maxRuns, over]);
  await b.close();
})();
