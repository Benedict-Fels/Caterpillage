'use strict';
/* =====================================================================
   Zeichnen
   ===================================================================== */
const cv = $('cv'), ctx = cv.getContext('2d');
let stageColor = '#D5E3C1', accent = '#B3122E';
function readTheme(){
  const cs = getComputedStyle(document.documentElement);
  stageColor = cs.getPropertyValue('--stage').trim() || stageColor;
  accent = cs.getPropertyValue('--accent').trim() || accent;
}

function drawCat(){
  const segs = segments(), n = segs.length;
  const tired = run.over ? 0.72 : 1;
  const rausch = run.rauschT > 0;
  const hairs = save.abil.passive === 'brennhaare';
  const hairLen = hairs ? hairReach(abNode('brennhaare', 1)) : 0;
  for (let i = n - 1; i >= 0; i--){
    const s = segs[i], prev = segs[Math.max(0, i - 1)];
    const a = i ? Math.atan2(prev.y - s.y, prev.x - s.x) : cat.dir;
    const rad = s.r * SC, X = s.x * SC, Y = s.y * SC;
    const lift = cat.lift[i] || 0;
    if (hairs){
      ctx.strokeStyle = `rgba(255,${190 + 50 * run.hairFx | 0},70,${0.7 + 0.3 * run.hairFx})`;
      ctx.lineWidth = Math.max(1.6, SC * 0.7);
      for (let q = 0; q < 10; q++){
        const qa = a + q * 0.628 + (i % 2) * 0.3;
        const len = rad + hairLen * SC * (0.8 + 0.2 * Math.sin(q * 7 + i));
        ctx.beginPath();
        ctx.moveTo(X + Math.cos(qa) * rad * 0.8, Y - lift * 2.5 + Math.sin(qa) * rad * 0.8);
        ctx.lineTo(X + Math.cos(qa) * len, Y - lift * 2.5 + Math.sin(qa) * len);
        ctx.stroke();
      }
    }
    if (i === 0) break;
    if (lift < 0.4){
      ctx.fillStyle = '#2F4A1A';
      for (const side of [-1, 1]){
        const lx = X + Math.cos(a + side * 1.5708) * rad * 0.95;
        const ly = Y + Math.sin(a + side * 1.5708) * rad * 0.95;
        ctx.beginPath(); ctx.arc(lx, ly, rad * 0.2, 0, 6.283); ctx.fill();
      }
    }
    const base = rausch ? (i % 2 ? [190, 120, 40] : [214, 146, 52]) : (i % 2 ? [108, 170, 52] : [126, 192, 64]);
    const L = (1 + lift * 0.18) * tired;
    ctx.fillStyle = `rgb(${Math.min(255, base[0]*L)|0},${Math.min(255, base[1]*L)|0},${Math.min(255, base[2]*L)|0})`;
    ctx.beginPath(); ctx.arc(X, Y - lift * 2.5, rad, 0, 6.283); ctx.fill();
    ctx.fillStyle = 'rgba(255,240,170,0.55)';
    ctx.beginPath(); ctx.arc(X, Y - lift * 2.5, rad * 0.22, 0, 6.283); ctx.fill();
  }

  const h = segs[0], HX = h.x * SC, HY = h.y * SC, hr = h.r * SC;
  const c = Math.cos(cat.dir), s = Math.sin(cat.dir);
  const p = cat.t;
  let open = run.over ? 0.3 : 0.75;
  if (!run.over && p < P_BITE){
    const q = p / P_BITE;
    open = q < 0.45 ? 0.75 + 0.35 * (q / 0.45) : 0.1 + 0.65 * smooth((q - 0.45) / 0.55);
    if (q >= 0.45 && q < 0.6) open = 0.05;
  }
  ctx.strokeStyle = '#2A1A0E'; ctx.lineWidth = Math.max(2, hr * 0.2); ctx.lineCap = 'round';
  for (const side of [-1, 1]){
    const bx = HX + c * hr * 0.7 - s * hr * 0.45 * side;
    const by = HY + s * hr * 0.7 + c * hr * 0.45 * side;
    const ang = cat.dir + side * open * 0.9;
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.quadraticCurveTo(
      bx + Math.cos(ang) * hr * 0.6, by + Math.sin(ang) * hr * 0.6,
      bx + Math.cos(cat.dir - side * 0.5) * hr * 0.75, by + Math.sin(cat.dir - side * 0.5) * hr * 0.75);
    ctx.stroke();
  }
  ctx.fillStyle = run.over ? '#56703A' : rausch ? '#C07A1E' : run.hardStreak > 2 ? '#6D7F3E' : '#4B8A28';
  ctx.beginPath(); ctx.arc(HX, HY, hr * (1 + snap * 0.06), 0, 6.283); ctx.fill();
  for (const side of [-1, 1]){
    const ex = HX + c * hr * 0.4 - s * hr * 0.45 * side;
    const ey = HY + s * hr * 0.4 + c * hr * 0.45 * side;
    ctx.fillStyle = '#1A120B';
    if (run.over){
      ctx.fillRect(ex - hr * 0.2, ey - hr * 0.04, hr * 0.4, hr * 0.08);
    } else {
      ctx.beginPath(); ctx.arc(ex, ey, hr * 0.2, 0, 6.283); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.beginPath(); ctx.arc(ex - hr * 0.05, ey - hr * 0.06, hr * 0.06, 0, 6.283); ctx.fill();
    }
  }
}

function draw(){
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = stageColor;
  ctx.fillRect(0, 0, cv.width, cv.height);
  const sk = shake * ([0, 0.35, 1][ui.shake] ?? 0.35);          // Wackeln je nach Einstellung
  const sx = sk ? (Math.random() - 0.5) * sk * 2 : 0;
  const sy = sk ? (Math.random() - 0.5) * sk * 2 : 0;
  ctx.setTransform(1, 0, 0, 1, sx, sy);
  fctx.putImageData(img, 0, 0);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(fruitCv, 0, 0, SIM * SC, SIM * SC);
  if (run.pool){
    ctx.fillStyle = `rgba(200,224,74,${0.25 + 0.15 * Math.sin(performance.now() / 90)})`;
    ctx.beginPath(); ctx.arc(run.pool.x * SC, run.pool.y * SC, run.pool.r * SC, 0, 6.283); ctx.fill();
  }
  drawCat();
  drawSpecial();

  if (run.beamEnd){
    const h = cat.trail[0];
    ctx.strokeStyle = 'rgba(255,255,245,0.9)'; ctx.lineWidth = Math.max(2, SC * 1.4) + Math.random() * 2; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(h.x * SC + Math.cos(cat.dir) * headR() * SC, h.y * SC + Math.sin(cat.dir) * headR() * SC);
    ctx.lineTo(run.beamEnd.x * SC, run.beamEnd.y * SC); ctx.stroke();
  }
  if (run.proj){
    ctx.fillStyle = '#C8E04A';
    ctx.beginPath(); ctx.arc(run.proj.x * SC, run.proj.y * SC, Math.max(4, SC * 2.3), 0, 6.283); ctx.fill();
  }
  const cs = Math.max(3, SC * 2);
  for (const c of crumbs){
    ctx.globalAlpha = Math.min(1, c.life * 2);
    ctx.fillStyle = c.c;
    ctx.fillRect(c.x * SC - cs / 2, c.y * SC - cs / 2, cs, cs);
  }
  ctx.globalAlpha = 1;
  ctx.textAlign = 'center';
  ctx.lineJoin = 'round';
  // Auf kleinen Bildschirmen wird das Canvas verkleinert: Zahlen dann etwas größer zeichnen
  const numScale = Math.max(1, Math.min(1.8, 720 / (cv.clientWidth || 720) * 0.8));
  for (const p of pops){
    ctx.globalAlpha = Math.min(1, p.life * 2.5);
    if (p.kind === 'label'){
      ctx.fillStyle = accent;
      ctx.font = `800 30px 'Bricolage Grotesque', system-ui, sans-serif`;
      ctx.fillText(p.text, Math.min(630, Math.max(90, p.x * SC)), Math.max(40, p.y * SC));
      continue;
    }
    // Zahlen mit dunkler Kontur, damit sie auf jeder Fruchtfarbe lesbar sind
    const size = (p.kind === 'crit' ? 30 : p.kind === 'gain' ? 21 : 19) * numScale;
    ctx.font = `800 ${size}px 'Bricolage Grotesque', system-ui, sans-serif`;
    const X = Math.min(700, Math.max(20, p.x * SC)), Y = Math.max(28, p.y * SC);
    let tx = X;
    if (p.ic){
      const w = ctx.measureText(p.text).width, is = size * 1.05, im = iconImg(p.ic[0], p.ic[1]);
      tx = X + is / 2 + 2;
      if (im.complete) ctx.drawImage(im, X - w / 2 - is / 2 - 1, Y - size * 0.82, is, is);
    }
    ctx.lineWidth = p.kind === 'crit' ? 5 : 4;
    ctx.strokeStyle = 'rgba(20,14,8,0.85)';
    ctx.strokeText(p.text, tx, Y);
    ctx.fillStyle = p.kind === 'crit' ? '#FFD23F' : p.kind === 'gain' ? '#E9FFD6' : '#FFFFFF';
    ctx.fillText(p.text, tx, Y);
  }
  ctx.globalAlpha = 1;
  if (flash > 0){
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    const k = Math.min(1, flash);
    ctx.globalAlpha = k;
    ctx.fillStyle = accent;
    ctx.font = `800 ${64 + (1 - k) * 18}px 'Bricolage Grotesque', system-ui, sans-serif`;
    ctx.fillText(W.breakText, cv.width / 2, 80);
    ctx.globalAlpha = 1;
  }
}

/* =====================================================================
   Anzeige Run
   ===================================================================== */
function buildRunPanel(){
  $('resF').innerHTML = `${icon(WI, 'f')}<span id="sF">0</span>`;
  $('resF').title = W.fruitCur;
  $('resK').innerHTML = `${icon(WI, 'k')}<span id="sK">0</span>`;
  $('resK').title = W.coreCur;
  $('runStats').innerHTML = [1, 2, 3].map(k => `<span>${W.layers[k].name}</span><span id="sL${k}">0 %</span>`).join('')
    + (SP.def ? `<span>${SP.def.plural}</span><span id="sL4"></span>` : '');
  $('legend').innerHTML = [1, 2, 3].map(k =>
    `<div><span class="sw" style="background:${W.layers[k].sw}"></span>${W.layers[k].name}, ${W.layers[k].note}</div>`).join('')
    + (SP.def ? `<div><span class="sw" style="background:${W.layers[4].sw}"></span>${SP.def.name}, ${W.layers[4].note}</div>` : '');
  const id = save.abil.active, b = $('abilBtn');
  b.hidden = !id;
  b.dataset.t = '';
}

/* Admin-Messwerte: Schaden je Quelle, DPS, Pixel, Ertrag */
function meterHtml(){
  const t = Math.max(0.001, run.time);
  const rows = Object.entries(run.m).filter(([, m]) => m.dmg > 0 || m.px > 0 || m.uses);
  const tot = rows.reduce((a, [, m]) => a + m.dmg, 0) || 1;
  let h = `<h3>Messwerte</h3><table><tr><th>Quelle</th><th>Schaden</th><th>DPS</th><th>Anteil</th><th>Ertrag</th></tr>`;
  for (const [src, m] of rows.sort((a, b) => b[1].dmg - a[1].dmg)){
    h += `<tr><td>${src}${m.uses ? ` ×${m.uses}` : ''}</td><td>${fmtNum(m.dmg)}</td><td>${fmtNum(m.dmg / t)}</td><td>${Math.round(m.dmg / tot * 100)} %</td><td>${fmtNum(m.f)}${m.k ? ' + ' + fmtNum(m.k) + ' K' : ''}</td></tr>`;
  }
  h += `</table><p>${fmtInt(Object.values(run.m).reduce((a, m) => a + m.px, 0))} Pixel · ${nf1.format(run.time)} s · ${fmtNum(tot / t)} DPS gesamt · ${fmtNum(run.spent)} Ausdauer verbraucht` +
    (run.sogGain ? ` · ${fmtNum(run.sogGain)} per Saftsog zurück` : '') + `. Gabeldrüse zählt die Aufweichung als Schaden.</p>`;
  return h;
}

function hud(){
  $('stO').textContent = `${fmtInt(Math.ceil(run.stamina))} / ${fmtInt(run.max)}`;
  const f = run.max ? run.stamina / run.max : 0;
  $('stFill').style.width = (f * 100).toFixed(1) + '%';
  $('stBar').classList.toggle('low', f < 0.25);
  $('sF').textContent = fmtInt(run.f);
  $('sK').textContent = fmtInt(run.k);
  for (const k of [1, 2, 3]) $('sL' + k).textContent = Math.round(pctOf(k)) + ' %';
  if (SP.def && $('sL4')) $('sL4').textContent = spSummary().val;
  $('vPow').textContent = fmt2(effPower());
  $('vRate').textContent = fmt2(effRate());
  $('vSeg').textContent = S.segs;
  $('vMouth').textContent = fmt(headR());
  $('vCrit').textContent = S.crit ? `${Math.round(S.crit * 100)} % · ${Math.round(S.critMult * 100)} %` : '–';
  $('vPass').textContent = save.abil.passive ? ABIL[save.abil.passive].name : '–';
  $('sub').textContent = `${W.name} · Run ${save.runs[WI] + (run.over ? 0 : 1)}`;
  const b = $('abilBtn'), id = save.abil.active;
  if (id){
    const ready = run.charge >= 1, busy = effectOn();
    b.disabled = !ready || run.over;
    b.classList.toggle('charging', !ready);
    b.style.setProperty('--ch', run.charge.toFixed(3));
    const txt = ready ? `${ABIL[id].name}<kbd>Leertaste</kbd>` : busy ? `${ABIL[id].name}<kbd>wirkt</kbd>` : `${ABIL[id].name}<kbd>${Math.ceil((1 - run.charge) * S.cd)} s</kbd>`;
    if (b.dataset.t !== txt){ b.innerHTML = txt; b.dataset.t = txt; }
  }
  $('pauseBtn').disabled = run.over;
  const mt = $('meter');
  mt.hidden = !(adm.on && adm.meter);
  if (!mt.hidden) mt.innerHTML = meterHtml();

  const hint = $('hint');
  let msg, warn = false;
  if (run.over) msg = 'Keine Kraft mehr.';
  else if (run.bites === 0) msg = (save.runs.every(x => !x) ? CTRL_HINT[ctrl.mode] + ' Die Ausdauer sinkt mit der Zeit, jeder Biss kostet extra.' : `Neue ${W.name}, volle Ausdauer. Los.`)
    + (save.abil.active ? ` ${ABIL[save.abil.active].name} ist nach ${S.cd} s wieder bereit.` : '');
  else if (run.hardStreak > 2){ msg = 'Zu hart für diesen Biss. Mehr Bisskraft hilft, oder dranbleiben.'; warn = true; }
  else msg = W.hint(run);
  hint.textContent = msg;
  hint.classList.toggle('warn', warn);
}
