'use strict';
readTheme();
loadSave();
applyFull();
$('admBtn').hidden = !adm.on; $('pAdm').hidden = !adm.on;
buildTree();
if (save.runs.some(x => x) || save.choice){
  S = stats(); WI = save.world; W = WORLDS[WI]; setupGrid(W); clearFruit(); GEN[W.id](); finishFruit(); resetCat(); show('shop');
} else startRun();
requestAnimationFrame(loop);

/* Zugriff für automatische Tests */
window.__cp = { dev, update, draw, hud, run, cat, ctrl, keys, startRun, endRun, buy, useActive, unlockWorld, choose,
  U, UPG, WORLDS, ABIL, stats, costOf, lv, cur, canBuy, pctOf, renderShop, visible, nodeVal, pauseGame, resumeGame,
  setAdmin, openAdmin, adm, ui, pops, meterHtml, AU, snd, digestAll, openGut, gut, gutDrop,
  get paused(){ return paused; },
  get CX(){ return CX; }, get CY(){ return CY; }, get R(){ return R; }, get SIM(){ return SIM; },
  get save(){ return save; }, set save(v){ save = v; }, get S(){ return S; } };
