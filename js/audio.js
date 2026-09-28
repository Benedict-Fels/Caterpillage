'use strict';
/* =====================================================================
   Ton: Musik und Effekte, komplett per Web Audio erzeugt (keine Dateien)
   Browser erlauben Ton erst nach dem ersten Klick oder Tastendruck; bis
   dahin merkt sich AU nur, welches Stück laufen soll.

   Im Run gibt die Raupe den Takt vor: Das Tempo folgt dem Biss-Takt, das
   Taktraster rastet auf die Bisse ein, und jeder Biss spielt selbst den
   Kick und den Bassschlag auf seiner Zählzeit (AU.clock / AU.bite).
   ===================================================================== */
const SND_KEY = 'caterpillage.sound.v1';
const snd = { music: 60, sfx: 80, mute: false };
try { Object.assign(snd, JSON.parse(localStorage.getItem(SND_KEY) || '{}')); } catch (e) {}
const saveSnd = () => { try { localStorage.setItem(SND_KEY, JSON.stringify(snd)); } catch (e) {} };

const AU = (() => {
  let ac = null, master, musicBus, musicLp, sfxBus, nbuf;
  let want = null, cur = null, fading = [], paused = false, tempoMul = 1, inten = 0.4, beamN = null;
  let clk = { r: 0, ph: 0, moving: false, at: -1 }, baseK = 2;
  const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
  const vol = v => Math.pow(Math.max(0, Math.min(100, v)) / 100, 1.6);
  const ok = () => ac && ac.state === 'running';

  function init(){
    const C = window.AudioContext || window.webkitAudioContext;
    if (!C) return false;
    try { ac = new C({ latencyHint: 'interactive' }); } catch (e) { return false; }
    build();
    apply();
    setInterval(pump, 20);
    document.addEventListener('visibilitychange', () => { if (!ac) return; if (document.hidden) ac.suspend(); else ac.resume(); });
    return true;
  }
  // Klangkette: Musik- und Effekt-Bus → Hall → Kompressor → Ausgang (auch für den Offline-Export)
  function build(){
    const comp = ac.createDynamicsCompressor();
    comp.threshold.value = -12; comp.knee.value = 10; comp.ratio.value = 4; comp.attack.value = 0.003; comp.release.value = 0.2;
    master = ac.createGain(); master.connect(comp).connect(ac.destination);
    musicLp = ac.createBiquadFilter(); musicLp.type = 'lowpass'; musicLp.frequency.value = 18000;
    musicBus = ac.createGain(); musicBus.connect(musicLp).connect(master);
    sfxBus = ac.createGain(); sfxBus.connect(master);
    // Hall: kurzer, weicher Raum aus abklingendem Rauschen
    const verb = ac.createConvolver();
    const len = Math.floor(ac.sampleRate * 1.4), ir = ac.createBuffer(2, len, ac.sampleRate);
    for (let c = 0; c < 2; c++){ const d = ir.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3); }
    verb.buffer = ir;
    const wet = ac.createGain(); wet.gain.value = 0.2; verb.connect(wet).connect(master);
    const ms = ac.createGain(); ms.gain.value = 0.25; musicLp.connect(ms).connect(verb);
    const ss = ac.createGain(); ss.gain.value = 0.12; sfxBus.connect(ss).connect(verb);
    nbuf = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
    const nd = nbuf.getChannelData(0); for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
  }
  function apply(){
    if (!ac) return;
    const t = ac.currentTime;
    master.gain.setTargetAtTime(snd.mute ? 0 : 1, t, 0.03);
    musicBus.gain.setTargetAtTime(vol(snd.music) * 0.6 * (paused ? 0.5 : 1), t, 0.05);
    sfxBus.gain.setTargetAtTime(vol(snd.sfx) * 0.9, t, 0.03);
  }

  /* ---------- Bausteine ---------- */
  function env(g, t, a, peak, d){
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(peak, t + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t + a + d);
  }
  function tone(type, f, t, d, peak, dest, o = {}){
    const osc = ac.createOscillator(), g = ac.createGain(), a = o.a || 0.004;
    osc.type = type; osc.frequency.setValueAtTime(f, t);
    if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t + (o.glide || d));
    let n = osc;
    if (o.lp){
      const fl = ac.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.setValueAtTime(o.lp, t);
      if (o.lpTo) fl.frequency.exponentialRampToValueAtTime(o.lpTo, t + d);
      if (o.q) fl.Q.value = o.q;
      n.connect(fl); n = fl;
    }
    env(g, t, a, peak, d);
    n.connect(g).connect(dest || sfxBus);
    osc.start(t); osc.stop(t + a + d + 0.05);
  }
  function hiss(t, d, peak, type, f, o = {}){
    const s = ac.createBufferSource(), fl = ac.createBiquadFilter(), g = ac.createGain(), a = o.a || 0.002;
    s.buffer = nbuf; s.loop = true;
    fl.type = type; fl.frequency.setValueAtTime(f, t); fl.Q.value = o.q || 1;
    if (o.to) fl.frequency.exponentialRampToValueAtTime(o.to, t + d);
    env(g, t, a, peak, d);
    s.connect(fl).connect(g).connect(o.dest || sfxBus);
    s.start(t, Math.random() * 0.8); s.stop(t + a + d + 0.05);
  }
  function pad(ms, t, d, v, dest){
    for (const m of ms) for (const cents of [-8, 8]){
      const o = ac.createOscillator(), fl = ac.createBiquadFilter(), g = ac.createGain();
      o.type = 'sawtooth'; o.frequency.value = mtof(m); o.detune.value = cents;
      fl.type = 'lowpass'; fl.frequency.value = 900;
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(v, t + 0.5);
      g.gain.setValueAtTime(v, t + Math.max(0.5, d)); g.gain.exponentialRampToValueAtTime(0.0001, t + Math.max(0.5, d) + 0.9);
      o.connect(fl).connect(g).connect(dest || sfxBus); o.start(t); o.stop(t + Math.max(0.5, d) + 1);
    }
  }
  const INST = {
    marimba(m, t, v, d, dest){ const f = mtof(m); tone('sine', f, t, 0.5, 0.5 * v, dest, { a: 0.003 }); tone('sine', f * 4, t, 0.06, 0.14 * v, dest, { a: 0.001 }); tone('triangle', f * 2, t, 0.12, 0.07 * v, dest); },
    pizz(m, t, v, d, dest){ const f = mtof(m); tone('sawtooth', f, t, 0.28, 0.2 * v, dest, { lp: f * 7, lpTo: f * 1.2, a: 0.003 }); tone('triangle', f, t, 0.22, 0.25 * v, dest); },
    celesta(m, t, v, d, dest){ const f = mtof(m); tone('sine', f, t, 1.1 + d * 0.3, 0.3 * v, dest, { a: 0.003 }); tone('sine', f * 2, t, 0.35, 0.08 * v, dest); tone('sine', f * 3.01, t, 0.12, 0.035 * v, dest); },
    bass(m, t, v, d, dest){ const f = mtof(m); tone('triangle', f, t, 0.32, 0.5 * v, dest, { a: 0.005 }); tone('sawtooth', f, t, 0.18, 0.12 * v, dest, { lp: f * 4, lpTo: f * 1.5 }); },
    // Leadsynth: gezupfte Rechteckwelle mit Filterschlag
    pluck(m, t, v, d, dest){ const f = mtof(m); tone('square', f, t, 0.12 + Math.min(0.5, d * 0.7), 0.1 * v, dest, { lp: f * 8, lpTo: f * 1.6, a: 0.004, q: 2 }); tone('triangle', f * 2, t, 0.07, 0.06 * v, dest); },
    // Groove-Bass: kurz und knackig, damit er zum Biss passt
    sub(m, t, v, d, dest){ const f = mtof(m); tone('triangle', f, t, 0.2, 0.6 * v, dest, { a: 0.003 }); tone('sawtooth', f, t, 0.13, 0.2 * v, dest, { lp: f * 6, lpTo: f * 1.3 }); },
  };
  const DRUM = {
    kick(t, v, dest){ tone('sine', 165, t, 0.24, 0.95 * v, dest, { to: 42, glide: 0.09, a: 0.001 }); hiss(t, 0.012, 0.22 * v, 'highpass', 2500, { dest }); },
    clap(t, v, dest){ for (const o of [0, 0.011, 0.022]) hiss(t + o, 0.025, 0.28 * v, 'bandpass', 1500, { dest, q: 1.3 }); hiss(t + 0.03, 0.11, 0.22 * v, 'bandpass', 1300, { dest }); },
    hat(t, v, dest){ hiss(t, 0.028, 0.18 * v, 'highpass', 8000, { dest }); },
    ohat(t, v, dest){ hiss(t, 0.15, 0.15 * v, 'highpass', 7000, { dest, a: 0.004 }); },
    wood(t, v, dest, f = 900){ tone('sine', f, t, 0.06, 0.4 * v, dest, { a: 0.001 }); hiss(t, 0.02, 0.1 * v, 'bandpass', f * 2, { dest, q: 3 }); },
  };

  /* ---------- Musik ----------
     Die Songs selbst (Noten als Text) stehen in songs.js. */
  const SCALES = { major: [0, 2, 4, 5, 7, 9, 11], minor: [0, 2, 3, 5, 7, 8, 10], mixo: [0, 2, 4, 5, 7, 9, 10] };
  const QUAL = { M: [0, 4, 7], m: [0, 3, 7], 7: [0, 4, 7, 10], M7: [0, 4, 7, 11], m7: [0, 3, 7, 10] };
  function prep(song){
    if (song.ready) return;
    const sc = SCALES[song.scale];
    for (const k of ['A', 'B']){
      const sec = song[k];
      sec.chords = sec.ch.trim().split(/\s+/).map(c => { const [r, q] = c.split(':'); return { r: +r, t: QUAL[q] }; });
      sec.notes = sec.mel.map(b => {
        const tk = b.replace(/\|/g, ' ').trim().split(/\s+/);
        return tk.map((x, i) => {
          const mm = /^([#b]?)(\d)([',]*)$/.exec(x);
          if (!mm) return null;
          let s = sc[mm[2] - 1] + (mm[1] === '#' ? 1 : mm[1] === 'b' ? -1 : 0);
          for (const c of mm[3]) s += c === "'" ? 12 : -12;
          let n = 1; while (tk[i + n] === '-') n++;
          return { s, n };
        });
      });
    }
    song.ready = true;
  }
  const secAt = (song, bar) => { const name = song.form[Math.floor(bar / 8) % song.form.length]; return { name, sec: song[name[0]], bi: bar % 8 }; };
  function mkX(song, ch, t, sd, out){
    const root = song.key + ch.r;
    let lo = root; while (lo < 40) lo += 12; while (lo >= 52) lo -= 12;
    return { root, bassLo: lo,
      n: (inst, m, v, d = 1) => INST[inst](m, t, v * (0.9 + Math.random() * 0.2), d * sd * 2, out),
      dr: (name, v, f) => DRUM[name](t, v * (0.85 + Math.random() * 0.3), out, f),
      chord: lo => ch.t.map(i => { let n = root + i; while (n < lo) n += 12; while (n >= lo + 12) n -= 12; return n; }).sort((a, b) => a - b),
      pad: (ms, v) => pad(ms, t, 16 * sd, v, out) };
  }
  const clockLive = () => clk.r > 0 && ac.currentTime - clk.at < 0.2;
  function step(s){
    const song = s.song;
    if (song.sync && s.kWant && s.kWant !== s.k && s.pos % (4 * Math.max(s.k, s.kWant)) === 0) s.k = s.kWant;
    const sd = song.sync ? s.sd : 60 / (song.bpm * tempoMul) / 4;
    const st = s.pos % 16, bar = Math.floor(s.pos / 16), { name, sec, bi } = secAt(song, bar);
    let t = s.next;
    if (song.swing && st % 4 === 2) t += song.swing * sd * 2;
    const x = mkX(song, sec.chords[bi], t, sd, s.out);
    const per = 16 / (song.res || 8);
    if (name[1] !== '-' && st % per === 0){
      const nt = sec.notes[bi][st / per];
      if (nt){
        const lead = typeof song.lead === 'function' ? song.lead(inten) : song.lead;
        for (const [inst, v, sh] of lead) INST[inst](song.key + nt.s + sh, t, v, nt.n * sd * per, s.out);
      }
    }
    if (song.beat){
      // Zählzeiten, auf die ein Biss fällt, spielt der Biss. Steht die Raupe, spielt die Musik sie leise selbst.
      const owned = song.sync && s.pos % (4 * s.k) === 0;
      if (!owned) song.beat(st, x, 1);
      else if (s.full) song.beat(st, x, 1);                    // Export: so, als würde die Raupe durchgehend fressen
      else if (!(clockLive() && clk.moving)) song.beat(st, x, 0.45);
    }
    song.acc(st, x, inten, name[0], bi);
    s.next += sd; s.pos++;
  }
  // Biss-Takt → Tempo: k Viertel je Biss, einmal pro Run so gewählt, dass das Grundtempo zwischen 95 und 190 BPM liegt.
  // Danach bleibt k fest: Im Fressrausch läuft die Musik einfach entsprechend schneller.
  const kBase = r => Math.min(4, Math.max(0.5, Math.pow(2, Math.floor(Math.log2(190 / (60 * r))))));
  const kFor = () => baseK;
  function syncSeq(s, now){
    if (!clockLive()) return;                                  // Pause, Run-Ende: im letzten Tempo weiterlaufen
    s.kWant = kFor(clk.r);
    const T = 1 / clk.r, spb = 4 * s.k;
    s.sd = T / spb;
    const ph = clk.ph + clk.r * (now - clk.at);
    const tb = now + (1 - (((ph % 1) + 1) % 1)) % 1 * T;       // nächster Biss in Audiozeit
    const j = Math.ceil(s.pos / spb) * spb;                     // nächste Biss-Zählzeit im Raster
    const tg = s.next + (j - s.pos) * s.sd;
    let e = ((tg - tb) % T + T) % T; if (e > T / 2) e -= T;
    if (s.fresh || Math.abs(e) > 0.06){                         // grob daneben: einrasten
      s.fresh = false;
      let nx = s.next - e;
      while (nx < now + 0.005) nx += T;
      s.next = nx;
    } else s.next -= e * 0.3;                                   // sonst sanft nachziehen
  }
  function start(id){
    if (cur){ fadeOut(cur); cur = null; }
    if (!id) return;
    const song = SONGS[id] || SONGS.groove;
    prep(song);
    const out = ac.createGain(), t = ac.currentTime + 0.03;
    out.connect(musicBus);
    out.gain.setValueAtTime(0.0001, t); out.gain.exponentialRampToValueAtTime(1, t + (song.sync ? 0.15 : 1.2));
    cur = { id, song, out, next: t + 0.05, pos: 0, k: baseK, sd: 1 / (Math.max(0.5, clk.r || 1) * 4 * baseK), fresh: true };
  }
  function fadeOut(s){
    const t = ac.currentTime;
    s.out.gain.cancelScheduledValues(t);
    s.out.gain.setValueAtTime(Math.max(0.0001, s.out.gain.value), t);
    s.out.gain.exponentialRampToValueAtTime(0.0001, t + 0.8);
    s.stopAt = t + 0.8;
    fading.push(s);
  }
  function pump(){
    if (!ok()) return;
    const now = ac.currentTime;
    for (const s of [cur, ...fading]){
      if (!s) continue;
      if (s.song.sync && !s.stopAt) syncSeq(s, now);
      if (s.next < now - 0.3) s.next = now + 0.05;             // nach Aussetzern nicht nachholen
      while (s.next < now + 0.1){
        if (s.stopAt && s.next > s.stopAt){ s.dead = true; const o = s.out; setTimeout(() => o.disconnect(), 2000); break; }
        step(s);
      }
    }
    fading = fading.filter(s => !s.dead);
  }
  // Der Biss spielt Kick und Bass der Zählzeit, auf die er fällt (nur wenn er im Raster liegt)
  function groove(){
    const s = cur;
    if (!s || !s.song.sync || !s.song.beat || s.stopAt) return false;
    const now = ac.currentTime, P = s.pos - (s.next - now) / s.sd, spb = 4 * s.k;
    const Q = Math.round(P / spb) * spb;
    if (Q < 0 || Math.abs(Q - P) > 0.6) return false;
    const { sec, bi } = secAt(s.song, Math.floor(Q / 16));
    const tQ = s.next + (Q - s.pos) * s.sd;                     // leicht zu früh: genau aufs Raster legen
    s.song.beat(Q % 16, mkX(s.song, sec.chords[bi], tQ > now && tQ - now < 0.05 ? tQ : now, s.sd, s.out), 1);
    return true;
  }

  /* ---------- Effekte ---------- */
  const LAYER = { johannisbeere: [0, 'crunch', 'squish', 'stone'], kirsche: [0, 'crunch', 'squish', 'stone'], walnuss: [0, 'leaf', 'wood', 'nut'] };
  function bite(kind, removed, crit){
    if (!ok()) return;
    const beat = groove();
    const t = ac.currentTime, r = 0.92 + Math.random() * 0.16, v = (0.7 + Math.min(0.3, removed * 0.01)) * (beat ? 0.8 : 1);
    switch (kind){
      case 'crunch':
        for (let i = 0; i < 3; i++) hiss(t + i * 0.018 + Math.random() * 0.006, 0.03, 0.5 * v * (1 - i * 0.2), 'bandpass', 2600 * r * (1 - i * 0.12), { q: 1.4 });
        tone('sine', 230 * r, t, 0.06, 0.25 * v, null, { to: 110 }); break;
      case 'squish':
        hiss(t, 0.13, 0.4 * v, 'bandpass', 1500 * r, { q: 3, to: 380 });
        tone('sine', 320 * r, t, 0.1, 0.28 * v, null, { to: 140 });
        tone('sine', 700 * r, t + 0.05, 0.04, 0.08 * v, null, { to: 1000 }); break;
      case 'stone':
        tone('sine', 1900 * r, t, 0.05, 0.22 * v); tone('sine', 3150 * r, t, 0.03, 0.1 * v);
        hiss(t, 0.015, 0.3 * v, 'highpass', 4000); tone('sine', 160 * r, t, 0.08, 0.3 * v, null, { to: 90 }); break;
      case 'wood':
        tone('sine', 520 * r, t, 0.08, 0.4 * v, null, { to: 470 }); tone('sine', 1260 * r, t, 0.03, 0.14 * v);
        hiss(t, 0.04, 0.22 * v, 'bandpass', 1000 * r, { q: 4 }); break;
      case 'leaf':
        for (let i = 0; i < 2; i++) hiss(t + i * 0.025, 0.035, 0.32 * v, 'bandpass', 1700 * r, { q: 0.9 });
        tone('sine', 190 * r, t, 0.05, 0.16 * v, null, { to: 120 }); break;
      case 'nut':
        for (let i = 0; i < 2; i++) hiss(t + i * 0.03, 0.05, 0.3 * v, 'bandpass', 900 * r, { q: 1.2, to: 600 });
        tone('sine', 240 * r, t, 0.07, 0.22 * v, null, { to: 150 }); break;
      default:                                                  // Luftbiss: nur die Mandibeln
        hiss(t, 0.02, 0.1, 'highpass', 3000); tone('sine', 1400 * r, t, 0.02, 0.05);
    }
    if (crit){ tone('sine', 1560 * r, t + 0.02, 0.28, 0.16, null, { to: 1760, glide: 0.05 }); tone('sine', 2340 * r, t + 0.02, 0.2, 0.08); }
  }
  const jingle = (inst, ms, gap, v, t0 = 0) => { const t = ac.currentTime + t0; ms.forEach((m, i) => m && INST[inst](m, t + i * gap, v, 0.3, sfxBus)); };
  const FX = {
    break(){ jingle('marimba', [72, 76, 79, 84], 0.07, 0.8); INST.celesta(88, ac.currentTime + 0.3, 0.7, 0.5, sfxBus); },
    kern(){ INST.celesta(84 + [0, 2, 4, 7][Math.floor(Math.random() * 4)], ac.currentTime, 0.4, 0.2, sfxBus); },
    low1(){ jingle('marimba', [57, 57], 0.14, 0.7); },
    low2(){ jingle('marimba', [55, 55, 55], 0.11, 0.8); },
    tired(){ jingle('marimba', [67, 64, 60, 55], 0.2, 0.7); INST.bass(43, ac.currentTime + 0.8, 0.8, 1, sfxBus); },
    clean(){ jingle('marimba', [60, 64, 67, 72, 76, 79], 0.07, 0.8); for (const m of [72, 76, 79, 84]) INST.celesta(m, ac.currentTime + 0.45, 0.35, 1, sfxBus); },
    molt(){ hiss(ac.currentTime, 0.45, 0.3, 'bandpass', 400, { q: 2, to: 3200, a: 0.1 }); jingle('celesta', [84, 88, 91], 0.08, 0.5, 0.35); },
    rausch(){ tone('sawtooth', 85, ac.currentTime, 0.4, 0.3, null, { lp: 500, to: 70 }); jingle('pizz', [60, 67, 72, 79], 0.05, 0.8, 0.05); },
    dash(){ hiss(ac.currentTime, 0.28, 0.45, 'lowpass', 350, { to: 4500, a: 0.03 }); },
    wumms(){ const t = ac.currentTime; tone('sine', 95, t, 0.35, 0.9, null, { to: 35, glide: 0.25 }); hiss(t, 0.2, 0.4, 'lowpass', 400); },
    spit(){ const t = ac.currentTime; tone('sine', 720, t, 0.12, 0.35, null, { to: 180 }); hiss(t, 0.06, 0.2, 'bandpass', 1300, { q: 2 }); },
    splash(){
      const t = ac.currentTime;
      hiss(t, 0.7, 0.28, 'highpass', 2600, { a: 0.01 });
      for (let i = 0; i < 5; i++){ const f = 500 + Math.random() * 700; tone('sine', f, t + 0.03 + Math.random() * 0.4, 0.05, 0.12, null, { to: f * 1.6 }); }
      tone('sine', 140, t, 0.15, 0.4, null, { to: 60 });
    },
    ready(){ jingle('celesta', [84, 91], 0.07, 0.4); },
    buy(a = 0){ const m = 64 + Math.round(a * 12); jingle('marimba', [m, m + 7], 0.06, 0.8); hiss(ac.currentTime, 0.03, 0.08, 'highpass', 5000); },
    maxed(){ jingle('marimba', [72, 76, 79, 84], 0.05, 0.8); },
    nope(){ const t = ac.currentTime; tone('triangle', 196, t, 0.1, 0.35, null, { to: 150 }); tone('triangle', 147, t + 0.09, 0.14, 0.3, null, { to: 120 }); },
    tick(){ DRUM.wood(ac.currentTime, 0.35, sfxBus, 1500); },
    unlock(){ jingle('marimba', [60, 64, 67, 72, 76, 79, 84], 0.06, 0.8); pad([60, 64, 67, 72], ac.currentTime + 0.35, 0.8, 0.03, sfxBus); jingle('celesta', [84, 88, 91, 96], 0.1, 0.4, 0.45); },
    choose(){ jingle('celesta', [72, 76, 79, 84, 88], 0.09, 0.55); },
    pauseOn(){ jingle('marimba', [72, 67], 0.07, 0.4); },
    pauseOff(){ jingle('marimba', [67, 72], 0.07, 0.4); },
  };
  function beam(d){
    if (!ok()) return;
    stopBeam();
    const t = ac.currentTime, o = ac.createOscillator(), o2 = ac.createOscillator(), lfo = ac.createOscillator();
    const lg = ac.createGain(), g = ac.createGain(), o2g = ac.createGain();
    o.type = 'sine'; o.frequency.value = 1320; o2.type = 'triangle'; o2.frequency.value = 660;
    lfo.frequency.value = 7; lg.gain.value = 18; lfo.connect(lg); lg.connect(o.frequency); lg.connect(o2.frequency);
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.1, t + 0.05);
    g.gain.setValueAtTime(0.1, t + d); g.gain.linearRampToValueAtTime(0.0001, t + d + 0.2);
    o2g.gain.value = 0.6; o2.connect(o2g).connect(g); o.connect(g).connect(sfxBus);
    for (const n of [o, o2, lfo]){ n.start(t); n.stop(t + d + 0.25); }
    beamN = { g, end: t + d + 0.25, all: [o, o2, lfo] };
    hiss(t, 0.1, 0.2, 'highpass', 3000);
  }
  function stopBeam(){
    if (!beamN || !ac) return;
    const t = ac.currentTime;
    if (t < beamN.end){
      beamN.g.gain.cancelScheduledValues(t); beamN.g.gain.setTargetAtTime(0.0001, t, 0.03);
      for (const n of beamN.all) try { n.stop(t + 0.15); } catch (e) {}
    }
    beamN = null;
  }

  /* ---------- Export: Song als WAV-Datei ----------
     Spielt den Song einmal komplett in einen Offline-Renderer (schneller als Echtzeit),
     so als würde die Raupe mit r Bissen je Sekunde durchgehend fressen. */
  async function renderSong(id = 'groove', r = 1, loops = 1){
    const song = SONGS[id];
    prep(song);
    const k = kBase(r), sd = song.sync ? 1 / (r * 4 * k) : 60 / song.bpm / 4;
    const steps = song.form.length * 8 * 16 * loops, rate = 44100;
    const off = new OfflineAudioContext(2, Math.ceil((steps * sd + 2.5) * rate), rate);
    const keep = { ac, master, musicBus, musicLp, sfxBus, nbuf, inten };
    try {
      ac = off; build(); inten = 1;
      musicBus.gain.value = 0.5; sfxBus.gain.value = 0;
      const s = { song, out: musicBus, next: 0.05, pos: 0, k, sd, full: true };
      for (let i = 0; i < steps; i++) step(s);
    } finally { ({ ac, master, musicBus, musicLp, sfxBus, nbuf, inten } = keep); }
    const buf = await off.startRendering();
    return { buf, bpm: Math.round(60 / (sd * 4)) };
  }
  function wav(buf){                                           // 16 Bit, Stereo
    const n = buf.length, ch = [buf.getChannelData(0), buf.getChannelData(1)];
    const dv = new DataView(new ArrayBuffer(44 + n * 4));
    const str = (o, t) => { for (let i = 0; i < t.length; i++) dv.setUint8(o + i, t.charCodeAt(i)); };
    str(0, 'RIFF'); dv.setUint32(4, 36 + n * 4, true); str(8, 'WAVEfmt '); dv.setUint32(16, 16, true);
    dv.setUint16(20, 1, true); dv.setUint16(22, 2, true); dv.setUint32(24, buf.sampleRate, true);
    dv.setUint32(28, buf.sampleRate * 4, true); dv.setUint16(32, 4, true); dv.setUint16(34, 16, true);
    str(36, 'data'); dv.setUint32(40, n * 4, true);
    let o = 44;
    for (let i = 0; i < n; i++) for (const c of ch){ const v = Math.max(-1, Math.min(1, c[i])); dv.setInt16(o, v < 0 ? v * 0x8000 : v * 0x7fff, true); o += 2; }
    return new Blob([dv], { type: 'audio/wav' });
  }
  async function exportSong(id = 'groove', r = 1, loops = 1){
    const { buf, bpm } = await renderSong(id, r, loops);
    const a = document.createElement('a');
    a.href = URL.createObjectURL(wav(buf));
    a.download = `caterpillage-${id}-${bpm}bpm.wav`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    return bpm;
  }

  return {
    exportSong, renderSong, wav,
    unlock(){
      if (!ac && !init()) return;
      if (ac.state === 'suspended' && !document.hidden) ac.resume();
      if ((cur ? cur.id : null) !== want) start(want);
    },
    song(id){ want = id; if (ac && (cur ? cur.id : null) !== id) start(id); },
    apply,
    pause(on){ if (on === paused) return; paused = on; if (!ac) return; musicLp.frequency.setTargetAtTime(on ? 650 : 18000, ac.currentTime, 0.08); apply(); },
    tempo(m){ tempoMul = m; },
    intensity(v){ inten = v; },
    // Neuer Run: Grundtempo aus dem Biss-Takt festlegen (Bisse je Sekunde)
    runStart(r){ baseK = kBase(r); clk = { r: 0, ph: 0, moving: false, at: -1 }; },
    // Taktgeber aus dem Spiel, jedes Bild: Bisse je Sekunde (0 = steht), Phase (0 = Biss), ob die Raupe frisst
    clock(r, ph = 0, moving = false){ if (ac) clk = { r, ph, moving, at: ac.currentTime }; },
    kind(w, k){ return (LAYER[w.id] || [])[k] || (w.layers[k].k ? 'stone' : w.layers[k].hard ? 'crunch' : 'squish'); },
    bite,
    sfx(name, a){ if (ok() && FX[name]) FX[name](a); },
    beam, stopBeam,
    get ctx(){ return ac; },
    get playing(){ return cur ? cur.id : null; },
    get seq(){ return cur && { pos: cur.pos, next: cur.next, sd: cur.sd, k: cur.k }; },
  };
})();
addEventListener('pointerdown', () => AU.unlock(), true);
addEventListener('keydown', () => AU.unlock(), true);

