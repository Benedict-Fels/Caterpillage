'use strict';
/* =====================================================================
   Upgrade-Screen
   ===================================================================== */
let selected = 'kiefer';

function nodeAngle(u){ return BR[u.br] + u.off; }
function nodePos(u){
  const a = nodeAngle(u) * Math.PI / 180, r = RINGS[nodeRing(u)] || RINGS[4];
  return { x: 50 + Math.cos(a) * r, y: 50 + Math.sin(a) * r };
}
function lineFrom(u){
  if (u.parent) return nodePos(U[u.parent]);
  if (u.ab && u.idx > 0) return nodePos(U[`ab_${u.ab}_0`]);
  if (u.ab){                                               // an die Fähigkeit im Ring davor oder an die Raupe
    const prev = Object.keys(ABIL).find(id => save.abil.own[id] && save.abil.from[id] === save.abil.from[u.ab] - 1);
    return prev ? nodePos(U[`ab_${prev}_0`]) : { x: 50, y: 50 };
  }
  return { x: 50, y: 50 };
}

function buildTree(){
  const tree = $('tree');
  const root = document.createElement('div');
  root.className = 'node root';
  root.style.left = '50%'; root.style.top = '50%';
  root.innerHTML = '<span class="lbl">Raupe</span>';
  tree.appendChild(root);
  for (const u of UPG){
    const b = document.createElement('button');
    b.className = 'node' + (u.ab ? ' abn' : ''); b.id = 'n-' + u.id;
    b.addEventListener('click', () => {
      if (selected === u.id){ if (canBuy(u)) buy(u); else AU.sfx('nope'); }
      else { selected = u.id; AU.sfx('tick'); renderShop(); }
    });
    tree.appendChild(b);
  }
}

function buy(u){
  if (!canBuy(u)) return;
  const c = costOf(u);
  addCur(c.w, 'f', -c.f);
  if (c.k) addCur(c.kw, 'k', -c.k);
  save.lv[u.id] = lv(u.id) + 1;
  AU.sfx(lv(u.id) >= u.max ? 'maxed' : 'buy', lv(u.id) / u.max);
  S = stats();
  persist();
  renderShop();
}

function costHtml(c){ return money(c.w, 'f', c.f) + (c.k ? ' + ' + money(c.kw, 'k', c.k) : ''); }
function missing(c){
  const a = [];
  if (cur(c.w, 'f') < c.f) a.push(money(c.w, 'f', Math.ceil(c.f - cur(c.w, 'f'))));
  if (c.k && cur(c.kw, 'k') < c.k) a.push(money(c.kw, 'k', Math.ceil(c.k - cur(c.kw, 'k'))));
  return a.join(' + ');
}

function renderTree(){
  const v = RINGS[Math.min(4, save.unlocked + 1)] + 8, z = 50 / v;
  const svg = $('treeLines');
  svg.setAttribute('viewBox', `${50 - v} ${50 - v} ${2 * v} ${2 * v}`);
  let s = '';
  for (let w = 1; w < save.unlocked; w++){
    const ta = 60 * Math.PI / 180, tr = BANDS[w] + 1.2;
    s += `<circle class="band" cx="50" cy="50" r="${BANDS[w]}"/><text x="${50 + Math.cos(ta) * tr}" y="${50 + Math.sin(ta) * tr}" transform="rotate(-30 ${50 + Math.cos(ta) * tr} ${50 + Math.sin(ta) * tr})">${WORLDS[w].name.toUpperCase()}</text>`;
  }
  for (const u of UPG){
    const b = $('n-' + u.id), vis = visible(u);
    b.hidden = !vis;
    if (!vis) continue;
    const p = nodePos(u), q = lineFrom(u), l = lv(u.id), open = unlocked(u);
    s += `<line class="${open ? 'on' : ''}${u.ab ? ' ab' : ''}" x1="${q.x}" y1="${q.y}" x2="${p.x}" y2="${p.y}"/>`;
    b.style.left = (50 + (p.x - 50) * z) + '%'; b.style.top = (50 + (p.y - 50) * z) + '%';
    b.classList.toggle('up', Math.sin(nodeAngle(u) * Math.PI / 180) < -0.3);
    b.classList.toggle('locked', !open);
    b.classList.toggle('max', l >= u.max);
    b.classList.toggle('can', canBuy(u));
    b.classList.toggle('sel', selected === u.id);
    b.innerHTML = `<span class="lv">${l}<small>/${u.max}</small></span><span class="lbl">${u.name}</span>`;
    b.setAttribute('aria-label', `${u.name}, Stufe ${l} von ${u.max}` + (open ? '' : ', gesperrt'));
  }
  svg.innerHTML = s;
}

function renderShop(){
  let bank = '';
  for (let w = 0; w < save.unlocked; w++){
    const here = w === save.world ? ' class="here"' : '';
    bank += `${icon(w, 'f')}<b${here} title="${WORLDS[w].fruitCur}">${fmtInt(cur(w, 'f'))}</b>${icon(w, 'k')}<b${here} title="${WORLDS[w].coreCur}">${fmtInt(cur(w, 'k'))}</b>`;
  }
  $('bank').innerHTML = bank;
  $('sub').textContent = `${WORLDS[save.world].name} · Upgrades`;

  renderTree();

  if (!visible(U[selected])) selected = 'kiefer';
  const u = U[selected], l = lv(u.id), open = unlocked(u), maxed = l >= u.max;
  const c = costOf(u), wn = WORLDS[c.w].name;
  let html = `<div class="branch">${u.br} · ${wn}</div><h3>${u.name}</h3>
    <p>${u.desc}</p>
    <p class="note">Stufe ${l} von ${u.max}</p>`;
  if (!open) html += `<p class="req">Braucht ${U[u.parent].name} auf Stufe ${u.need}.</p>`;
  if (maxed) html += `<p class="change">${nodeVal(u, l)} <span class="note">(voll ausgebaut)</span></p>`;
  else {
    const a = nodeVal(u, l), b = nodeVal(u, l + 1), pre = (a.match(/^[^\d−+×]*/) || [''])[0];
    html += `<p class="change"><span class="now">${a}</span><span class="arrow">→</span><span class="next">${pre && b.startsWith(pre) ? b.slice(pre.length) : b}</span></p>`;
    if (open){
      const short = afford(c) ? '' : ` <span class="miss">(fehlt: ${missing(c)})</span>`;
      html += `<button class="wide primary" id="buyBtn" ${canBuy(u) ? '' : 'disabled'}>Kaufen: ${costHtml(c)}</button>${short ? `<p class="note">${short}</p>` : ''}`;
    }
  }
  if (adm.on) html += `<div class="admrow"><span>Admin</span><button data-lv="0">0</button><button data-lv="-1">−1</button><button data-lv="1">+1</button><button data-lv="max">Max</button></div>`;
  $('detail').innerHTML = html;
  const bb = $('buyBtn');
  if (bb) bb.onclick = () => buy(u);
  for (const b of $('detail').querySelectorAll('[data-lv]')) b.onclick = () => {
    const d = b.dataset.lv, now = lv(u.id);
    save.lv[u.id] = Math.max(0, Math.min(u.max, d === 'max' ? u.max : d === '0' ? 0 : now + +d));
    S = stats(); persist(); renderShop();
  };

  $('nextRun').textContent = `Nächster Run: ${WORLDS[save.world].name}`;
  const L = save.last;
  if (L){
    const w = WORLDS[L.w];
    $('lastRun').innerHTML = `Letzter Run (${w.name}): ${money(L.w, 'f', L.f, '+')}` + (L.k >= 1 ? `, ${money(L.w, 'k', L.k, '+')}` : '') + (L.test ? ' <b>(Testlauf, nicht gutgeschrieben)</b>' : '') +
      `<br>${[1, 2, 3].map(k => `${w.layers[k].name} ${Math.round(L.p[k])} %`).join(', ')}.`;
  } else $('lastRun').innerHTML = '';

  renderWorlds();
  renderAbilities();
}

function renderWorlds(){
  let h = '';
  for (let w = 0; w < WORLDS.length; w++){
    const x = WORLDS[w];
    if (w < save.unlocked){
      const sel = w === save.world;
      h += `<div class="wrow${sel ? ' sel' : ''}"><span class="dot" style="background:${x.color}"></span>
        <span class="wname">${x.name}<small>${save.runs[w]} Runs · ${money(w, 'k', cur(w, 'k'))}</small></span>
        ${sel ? '<span class="note">gewählt</span>' : `<button data-pick="${w}">Wählen</button>`}</div>`;
    } else if (w === save.unlocked){
      const need = x.unlockCost, have = cur(w - 1, 'k');
      h += `<div class="wrow"><span class="dot" style="background:${x.color};opacity:.5"></span>
        <span class="wname">${x.name}<small>${icon(w - 1, 'k')}${fmtInt(Math.min(have, need))} / ${need} ${WORLDS[w - 1].coreCur}</small></span>
        <button class="primary" data-unlock="${w}" ${have >= need ? '' : 'disabled'}>Freischalten</button></div>`;
    } else {
      h += `<div class="wrow future"><span class="dot" style="background:${x.color}"></span><span class="wname">${x.name}<small>später</small></span></div>`;
    }
  }
  FUTURE.forEach((f, j) => {
    const txt = j === 0 && save.unlocked >= WORLDS.length ? 'folgt in der nächsten Ausbaustufe' : 'später';
    h += `<div class="wrow future"><span class="dot" style="background:${f.color}"></span><span class="wname">${f.name}<small>${txt}</small></span></div>`;
  });
  $('worlds').innerHTML = h;
  for (const b of document.querySelectorAll('[data-pick]')) b.onclick = () => { save.world = +b.dataset.pick; persist(); AU.sfx('tick'); renderShop(); };
  for (const b of document.querySelectorAll('[data-unlock]')) b.onclick = () => unlockWorld(+b.dataset.unlock);
}

function unlockWorld(w){
  const need = WORLDS[w].unlockCost;
  if (w !== save.unlocked || cur(w - 1, 'k') < need) return;
  addCur(w - 1, 'k', -need);
  save.unlocked = w + 1;
  save.world = w;
  save.choice = { from: w - 1, options: drawChoices() };
  AU.sfx('unlock');
  persist();
  renderShop();
  openChoice();
}

function drawChoices(){
  const pool = Object.keys(ABIL).filter(id => !save.abil.own[id]);
  const shuffle = a => { for (let i = a.length - 1; i > 0; i--){ const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const act = shuffle(pool.filter(id => ABIL[id].kind === 'aktiv'));
  const pas = shuffle(pool.filter(id => ABIL[id].kind === 'passiv'));
  const pick = [];
  if (act.length) pick.push(act.shift());
  if (pas.length) pick.push(pas.shift());
  const rest = shuffle(act.concat(pas));
  while (pick.length < 3 && rest.length) pick.push(rest.shift());
  return shuffle(pick);
}

function openChoice(){
  const c = save.choice;
  if (!c) return;
  const cd = $('choiceDlg');
  $('choiceTitle').textContent = `${WORLDS[c.from].name} geschafft`;
  $('choiceNote').textContent = `Wähle eine neue Fähigkeit. Die anderen können nach einer späteren Welt wieder angeboten werden. `
    + (c.from + 1 < WORLDS.length ? `Ihre drei Ausbau-Knoten erscheinen im Baum und kosten ${WORLDS[c.from + 1].fruitCur} und ${WORLDS[c.from].coreCur}.` : '');
  $('choices').innerHTML = c.options.map(id => `<button class="choice" data-choose="${id}">
      <small>${ABIL[id].kind}</small><b>${ABIL[id].name}</b><span>${ABIL[id].desc([0, 0, 0])}</span>
      <span class="note">Ausbau: ${ABIL[id].nodes.map(n => n.name).join(', ')}</span></button>`).join('');
  for (const b of cd.querySelectorAll('[data-choose]')) b.onclick = () => choose(b.dataset.choose);
  if (!cd.open) cd.showModal();
}
$('choiceDlg').addEventListener('cancel', e => e.preventDefault());

function choose(id){
  const c = save.choice;
  if (!c || !c.options.includes(id)) return;
  save.abil.own[id] = 1;
  save.abil.from[id] = c.from;
  const slot = ABIL[id].kind === 'aktiv' ? 'active' : 'passive';
  if (!save.abil[slot]) save.abil[slot] = id;
  save.choice = null;
  AU.sfx('choose');
  S = stats();
  persist();
  if ($('choiceDlg').open) $('choiceDlg').close();
  selected = `ab_${id}_0`;
  renderShop();
}

function renderAbilities(){
  const A = save.abil;
  $('slots').innerHTML = ['active', 'passive'].map(slot => {
    const id = A[slot];
    return `<div class="slot${id ? ' full' : ''}">${slot === 'active' ? `Aktiv, alle ${S.cd} s` : 'Passiv'}<b>${id ? ABIL[id].name : 'leer'}</b></div>`;
  }).join('');
  const owned = Object.keys(A.own);
  if (!owned.length){
    $('abils').innerHTML = `<p class="note">Nach jeder geschafften Welt wählst du aus drei Fähigkeiten eine aus. Die erste gibt es beim Freischalten der Kirsche.</p>`;
    return;
  }
  $('abils').innerHTML = owned.map(id => {
    const a = ABIL[id], slot = a.kind === 'aktiv' ? 'active' : 'passive', eq = A[slot] === id;
    const Ls = abL(id);
    return `<div class="acard"><h3>${a.name} <small>${a.kind} · Ausbau ${Ls.join(' / ')}</small></h3>
      <p>${a.desc(Ls)}</p>
      <div class="row">${eq ? '<span class="note">ausgerüstet</span>' : `<button data-equip="${id}">Ausrüsten</button>`}
      <button data-show="${id}">Im Baum zeigen</button></div></div>`;
  }).join('');
  for (const b of document.querySelectorAll('[data-equip]')) b.onclick = () => {
    const id = b.dataset.equip; A[ABIL[id].kind === 'aktiv' ? 'active' : 'passive'] = id; S = stats(); persist(); renderShop();
  };
  for (const b of document.querySelectorAll('[data-show]')) b.onclick = () => {
    selected = `ab_${b.dataset.show}_0`; renderShop(); $('tree').scrollIntoView({ behavior: 'smooth', block: 'center' });
  };
}
