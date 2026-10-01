'use strict';
/* =====================================================================
   Songs: Noten als Text, der Klang entsteht in audio.js (Web Audio).

   Melodie (mel): ein Zeichen je Rasterschritt, 8 Takte je Teil.
     res = 16: ein Zeichen je Sechzehntel (16 je Takt), res = 8: je Achtel (8 je Takt).
     Ziffer 1–7 = Stufe der Tonleiter (scale) über dem Grundton (key, MIDI-Nummer, 60 = c'),
     ' = eine Oktave höher, , = eine Oktave tiefer, # / b = Halbton höher/tiefer,
     - = vorigen Ton halten, . = Pause, | nur zur Lesbarkeit (trennt die Viertel).
   Akkorde (ch): je Takt "Halbtöne über dem Grundton:Art", Art M = Dur, m = Moll, 7, M7, m7.
   form: Reihenfolge der Teile. "A-" = Teil A ohne Melodie.
   lead: Instrumente der Melodie [Instrument, Lautstärke, Versatz in Halbtönen]
     (Funktion: abhängig von der Intensität, vor dem Durchbruch 0,4, danach 1).
   acc(st, x, I, teil, takt): Begleitung, wird für jeden Sechzehntel st (0–15) aufgerufen.
     x.n(Instrument, MIDI, Lautstärke) spielt einen Ton, x.dr(Trommel, Lautstärke) ein Schlagzeugteil,
     x.chord(ab) liefert die Akkordtöne ab einer Tonhöhe, x.root den Grundton, x.bassLo den tiefen Basston.
   beat(st, x, v): Teile, die ein Biss übernehmen kann (Kick, Bass). Auf den Zählzeiten, auf die ein
     Biss fällt, spielt der Biss sie selbst; steht die Raupe, spielt die Musik sie leise.
   sync: true = Tempo kommt vom Biss-Takt der Raupe, sonst bpm = feste Schläge pro Minute.

   Jede Welt hat einen eigenen Song (Schlüssel = Welt-id), Welten ohne eigenen Song nutzen johannisbeere.

   Instrumente: marimba, pizz, celesta, bass, pluck (Leadsynth), sub (Groove-Bass), kalimba, keys (E-Piano),
     steelpan, nylon (Nylongitarre), flute (Flöte), rhodes (Lo-Fi-E-Piano, langer Ausklang), round (runder, langer Bass).
     x.n(Instrument, MIDI, Lautstärke, Länge) – Länge in Achteln, wirkt bei rhodes, round, flute, keys, pluck.
   Trommeln: kick, clap, hat, ohat (offene Hi-Hat), wood (Holzblock), snap (Fingerschnipsen),
     shaker, tom (Holztrommel, Tonhöhe als 3. Wert), rim (Rimshot), snare (Lo-Fi-Snare), crackle (Vinyl-Knistern),
     drip (Wassertropfen, Tonhöhe), conga (Tonhöhe).
   Tonleitern: major, minor, mixo, dorian. Akkorde: M, m, 7, M7, m7, m9, M9, 9, m7b5.
   lp: eigener Tiefpass für den Song (Hz), z. B. für gedämpften Lo-Fi-Klang. gain: Lautstärke des Songs (Standard 1).
   ===================================================================== */
const SONGS = {
  // Johannisbeere: C-Dur, Four-on-the-floor, Oktav-Bass, Clap auf 2 und 4, Offbeat-Hats, Rechteck-Lead.
  // Tempo kommt vom Biss-Takt (sync), Kick und tiefer Bass auf den Bisszählzeiten spielt der Biss selbst (beat).
  johannisbeere: { sync: true, key: 60, scale: 'major', res: 16, form: ['A', 'B', 'A', 'B'],
    lead: I => I > 0.6 ? [['pluck', 0.9, 0], ['marimba', 0.25, 0]] : [['marimba', 0.5, 0]],
    A: { ch: '0:M 7:M 9:m 5:M 0:M 7:M 5:M 7:M', mel: [
      "1' . 5 . | 1' . 3' . | . 2' . 1' | . . 5 .",
      "7 . 5 . | 7 . 2' . | . 1' . 7 | . . 5 .",
      "1' . 6 . | 1' . 3' . | . 2' . 1' | . . 6 .",
      "6 . 4 . | 6 . 1' . | 2' - 1' . | 6 - . .",
      "1' . 5 . | 1' . 3' . | . 2' . 1' | . . 5 .",
      "7 . 5 . | 7 . 2' . | . 1' . 7 | . . 5 .",
      "4' . 3' . | 1' . 6 . | 4' - 3' . | 1' - . .",
      "2' . . 7 | . . 5 . | 7 . 1' . | 2' . 5' ."] },
    B: { ch: '9:m 5:M 0:M 7:M 9:m 5:M 7:M 7:M', mel: [
      "3' . 3' . | 2' . 1' . | 2' - 1' . | 6 - . .",
      "6 . 1' . | 6 . 1' . | 3' - 2' . | 1' - . .",
      "5 . 5 . | 1' . 2' . | 3' - . 2' | - . 1' .",
      "2' - - . | 7 . 5 . | 7 . 1' . | 2' - . .",
      "3' . 3' . | 2' . 1' . | 2' - 1' . | 6 - . .",
      "6 . 1' . | 6 . 1' . | 4' - 3' . | 1' - . .",
      "2' . 2' . | 3' . 2' . | 7 - 5 . | 7 - . .",
      "5 - - - | . . . . | 5 . 6 . | 7 . 2' ."] },
    // Taktteile, die ein Biss übernehmen kann: Kick auf den Zählzeiten, Bass im Achtel-Oktavsprung
    beat(st, x, v){
      if (st % 4 === 0) x.dr('kick', v);
      if (st % 2 === 0) x.n('sub', x.bassLo + (st % 4 ? 12 : 0), v);
    },
    acc(st, x, I, sec, bar){
      if (st === 4 || st === 12) x.dr('clap', I > 0.6 ? 0.8 : 0.55);
      if (st % 4 === 2){ if (I > 0.6) x.dr('ohat', 0.7); for (const m of x.chord(64)) x.n('pluck', m, 0.35); }
      if (st % 2 === 1) x.dr('hat', I > 0.6 ? (st % 4 === 3 ? 0.6 : 0.4) : 0.3);
      if (I > 0.6 && sec === 'B' && bar === 7 && st >= 12) x.dr('clap', 0.35 + (st - 12) * 0.15);   // kleiner Wirbel vor dem Teilwechsel
    } },
  // Kirsche: Funk in d-Moll mit leichtem Swing. Pizzicato-Lead, E-Piano-Stabs auf den Nachschlägen,
  // hüpfender Bass mit Geister-Sechzehnteln, Fingerschnipsen und Rimshot.
  kirsche: { sync: true, key: 62, scale: 'minor', res: 16, swing: 0.1, form: ['A', 'B', 'A', 'B'],
    lead: I => I > 0.6 ? [['pizz', 0.95, 0], ['keys', 0.35, 0]] : [['keys', 0.6, 0]],
    A: { ch: '0:m7 5:7 0:m7 5:7 8:M7 7:7 0:m 0:m', mel: [
      "1' . 7 5 | . 3 . 5 | . . 7 . | 1' - . .",
      "4 . . 5 | . 7 . 5 | 4 . 2 . | 1 - . .",
      "1' . 7 5 | . 3 . 5 | . . 7 . | 1' . 3' .",
      "2' - 1' . | 7 . 5 . | 4 . 5 . | 7 - . .",
      "6 . . 1' | . 3' . 2' | 1' . 6 . | 5 - . .",
      "#7 . . 2' | . 5' . 4' | 2' . #7 . | 5 - . .",
      "1' . 5 . | 3 . 5 . | 1' . 2' . | 3' - . .",
      "2' . 1' . | 7 . 5 . | 3 . . . | . . . ."] },
    B: { ch: '5:m7 10:7 3:M7 8:M7 5:m7 7:7 0:m 0:m', mel: [
      "4' . 4' . | 3' . 1' . | 6 . 4 . | 6 - . .",
      "3' . 3' . | 2' . 7 . | 5 . 3 . | 5 - . .",
      "3' - . 5' | - . 3' . | 1' . 7 . | 1' - . .",
      "6 . 1' . | 3' . 1' . | 6 . 5 . | 6 - . .",
      "4' . 4' . | 3' . 1' . | 6 . 4 . | 1' - . .",
      "#7 . 2' . | 5' - . 4' | 2' . #7 . | 5 - . .",
      "1' . 2' . | 3' . 5' . | 4' . 3' . | 1' - . .",
      "1' - - - | . . . . | 5 . 7 . | 1' . 2' ."] },
    // Kick auf den Zählzeiten, Bass: tief auf der Zählzeit, Oktave auf dem Nachschlag
    beat(st, x, v){
      if (st % 4 === 0) x.dr('kick', v);
      if (st % 2 === 0) x.n('sub', x.bassLo + (st % 4 ? 12 : 0), v);
    },
    acc(st, x, I, sec, bar){
      if (st === 4 || st === 12){ x.dr('snap', 0.8); if (I > 0.6) x.dr('clap', 0.5); }
      if (st === 3 || st === 6 || st === 11) for (const m of x.chord(62)) x.n('keys', m, st === 6 ? 0.35 : 0.25);
      if (I > 0.6 && (st === 7 || st === 15)) x.n('sub', x.bassLo + 12, 0.45);         // Geister-Sechzehntel im Bass
      if (st % 2 === 1) x.dr('shaker', st % 4 === 3 ? 0.5 : 0.3);
      if (I > 0.6 && st % 4 === 2) x.dr('hat', 0.6);
      if (I > 0.6 && (st === 10 || st === 14)) x.dr('rim', 0.5);
      if (I > 0.6 && sec === 'B' && bar === 7 && st >= 12) x.dr('snap', 0.4 + (st - 12) * 0.15);
    } },
  // Walnuss: G-Mixolydisch, Kalimba-Melodie, Holzblöcke und Holztrommeln statt Clap, Bass in Quinten.
  walnuss: { sync: true, key: 55, scale: 'mixo', res: 16, form: ['A', 'B', 'A', 'B'],
    lead: I => I > 0.6 ? [['kalimba', 0.8, 0], ['marimba', 0.18, 12]] : [['kalimba', 0.65, 0]],
    A: { ch: '0:M 10:M 5:M 0:M 0:M 10:M 5:M 7:M', mel: [
      "5 . 1' . | 5 . 3' . | 2' . 1' . | 5 - . .",
      "4 . 7 . | 4 . 2' . | 1' . 7 . | 4 - . .",
      "4 . 6 . | 1' . 6 . | 4 . 6 . | 1' - 2' .",
      "3' - . 2' | - . 1' . | 5 . . . | . . . .",
      "5 . 1' . | 5 . 3' . | 2' . 1' . | 5 . 6 .",
      "7 . 2' . | 4' . 2' . | 1' . 7 . | 4 - . .",
      "6 . 4 . | 1' . 6 . | 3' . 2' . | 1' - . .",
      "2' . . #7 | . . 5 . | #7 . 1' . | 2' . 5' ."] },
    B: { ch: '9:m 5:M 7:M 0:M 9:m 5:M 7:M 7:M', mel: [
      "6 . . 6 | 1' . 3' . | 2' . 1' . | 6 - . .",
      "4 . . 4 | 6 . 1' . | 3' . 2' . | 1' - . .",
      "5 . . 5 | #7 . 2' . | 5' . 4' . | 2' - . .",
      "1' - . 3' | - . 5' . | 3' . 2' . | 1' - . .",
      "6 . . 6 | 1' . 3' . | 5' . 3' . | 2' - . .",
      "4 . . 4 | 6 . 1' . | 4' . 3' . | 1' - . .",
      "5 . #7 . | 2' . 5' . | 4' . 2' . | #7 - . .",
      "2' - - - | . . . . | 5 . #7 . | 2' . 1' ."] },
    // Kick auf 1 und 3, Holztrommel auf 2 und 4; Bass: Grundton und Quinte
    beat(st, x, v){
      if (st % 8 === 0) x.dr('kick', v);
      else if (st % 4 === 0) x.dr('tom', v * 0.9, 130);
      if (st % 2 === 0) x.n('sub', x.bassLo + (st % 4 ? 7 : 0), v);
    },
    acc(st, x, I, sec, bar){
      if ([3, 6, 10, 14].includes(st)) x.dr('wood', st === 6 || st === 14 ? 0.5 : 0.35, st === 6 || st === 14 ? 720 : 980);
      if (st % 2 === 0){ const c = x.chord(55); x.n('marimba', c[(st / 2) % c.length], 0.12); }
      if (I > 0.6 && st % 2 === 1) x.dr('shaker', st % 4 === 3 ? 0.45 : 0.25);
      if (I > 0.6 && st === 12) x.dr('clap', 0.35);
      if (I > 0.6 && (st === 13 || st === 15)) x.dr('tom', 0.35, st === 13 ? 200 : 170);
      if (I > 0.6 && sec === 'B' && bar === 7 && st >= 8 && st % 2 === 0) x.dr('tom', 0.4 + (st - 8) * 0.06, 220 - (st - 8) * 12);
    } },
  // Pflaume: Bossa nova in D-Dorisch, samtig und spätsommerlich. Nylongitarre, darüber eine weiche Flöte,
  // Gitarren-Comping im Bossa-Rhythmus, Clave auf dem Rand, leiser Shaker, Bass Grundton und Quinte.
  pflaume: { sync: true, key: 62, scale: 'dorian', res: 8, swing: 0.04, gain: 1.45, form: ['A', 'B', 'A', 'B'],
    lead: I => I > 0.6 ? [['flute', 0.9, 12], ['nylon', 0.35, 0]] : [['nylon', 0.7, 0]],
    A: { ch: '0:m9 5:9 0:m9 5:9 2:m7 7:7 0:m9 0:m9', mel: [
      "5 - - 3 | 4 - 5 .",
      "6 - - 4 | 7 - 6 .",
      "5 - - 3 | 1' - 7 .",
      "6 - - - | . . . .",
      "4 - - 2 | 5 - 4 .",
      "3 - - #7, | 2 - 3 .",
      "1 - - - | . 3 5 7",
      "1' - - - | . . . ."] },
    B: { ch: '5:m9 10:9 3:M7 8:M7 2:m7b5 7:7 0:m9 7:7', mel: [
      "4' - - 3' | 2' - 1' .",
      "b6 - - 1' | 2' - 3' .",
      "3' - - 1' | 5 - 6 .",
      "1' - - - | . 4 5 b6",
      "b6 - - 5 | 2' - 1' .",
      "#7 - - 2' | 3' - - .",
      "3' - 2' 1' | 6 - 5 .",
      "5 - - - | #7 - . ."] },
    // Surdo-artig gedämpfter Schlag auf 1 und 3, Bass: Grundton auf 1, Quinte auf 3 (die Auftakte spielt acc)
    beat(st, x, v){
      if (st % 8 === 0){ x.dr('tom', v * 0.7, 85); x.n('bass', x.bassLo + (st ? 7 : 0), v); }
    },
    acc(st, x, I, sec, bar){
      if (st === 6 || st === 14) x.n('bass', x.bassLo + (st === 6 ? 0 : 7), 0.55);              // Auftakte im Bass
      if ([0, 3, 6, 10, 12].includes(st)) for (const m of x.chord(55)) x.n('nylon', m, st === 0 ? 0.18 : 0.13);   // Bossa-Comping
      if ((bar % 2 ? [2, 6, 10, 12] : [0, 6, 12]).includes(st)) x.dr('rim', I > 0.6 ? 0.45 : 0.3);           // Clave
      if (st % 2 === 1) x.dr('shaker', st % 4 === 3 ? 0.28 : 0.16);
      if (I > 0.6 && st === 8 && bar % 4 === 3) x.pad(x.chord(62), 0.012);
    } },
  // Apfel: sommerlicher Calypso in F-Dur, feucht und fröhlich. Steel Pan, Gitarren-Nachschläge, Congas,
  // Shaker, Kick auf jedem Viertel (Soca) und ab und zu ein blubbernder Tropfen.
  apfel: { sync: true, key: 65, scale: 'major', res: 16, swing: 0.06, form: ['A', 'B', 'A', 'B'],
    lead: I => I > 0.6 ? [['steelpan', 0.95, 0], ['marimba', 0.2, -12]] : [['steelpan', 0.6, 0]],
    A: { ch: '0:M 5:M 7:7 0:M 0:M 5:M 7:7 0:M', mel: [
      "5 . 6 5 | . 3 . 1 | 3 . 5 . | 1' . . .",
      "6 . 1' 6 | . 4 . 6 | 1' . 2' . | 1' . 6 .",
      "5 . 7 5 | . 2' . 7 | 5 . 4 . | 3 . 2 .",
      "1 . 3 . | 5 . 1' . | . . 5 . | 3 . . .",
      "5 . 6 5 | . 3 . 1 | 3 . 5 . | 1' . 2' .",
      "3' . 2' 1' | . 6 . 4 | 6 . 1' . | 2' . . .",
      "1' . 7 . | 5 . 2' . | 1' . 7 . | 5 . 4 .",
      "3 . . 5 | . . 1' . | . . . . | 5 . 6 7"] },
    B: { ch: '9:m 5:M 0:M 7:7 2:m 7:7 0:M 7:7', mel: [
      "6 . 6 . | 1' . 6 . | 5 . 6 . | 1' . . .",
      "4 . 4 . | 6 . 4 . | 3 . 4 . | 6 . . .",
      "5 . 5 . | 1' . 3' . | 2' . 1' . | 5 . . .",
      "4 . 5 . | 7 . 2' . | 4' . 2' . | 7 . 5 .",
      "2' . 2' . | 4' . 2' . | 1' . 6 . | 4 . . .",
      "5 . 7 . | 2' . 5' . | 4' . 3' . | 2' . 1' .",
      "1' . 3' . | 5' . 3' . | 1' . 5 . | 3 . 1 .",
      "5 - - - | . . . . | 5 . 6 . | 7 . 1' ."] },
    // Kick auf jedem Viertel; Bass: Grundton, Grundton vorgezogen, Quinte (Calypso)
    beat(st, x, v){
      if (st % 4 === 0) x.dr('kick', v * 0.85);
      if (st === 0 || st === 8) x.n('sub', x.bassLo + (st ? 7 : 0), v);
    },
    acc(st, x, I, sec, bar){
      if (st === 6 || st === 14) x.n('sub', x.bassLo + (st === 6 ? 0 : 12), 0.7);
      if (st % 4 === 2) for (const m of x.chord(65)) x.n('pluck', m, 0.22);                    // Nachschläge
      if (st % 2 === 1) x.dr('shaker', st % 4 === 3 ? 0.45 : 0.25);
      if ([3, 7, 10, 11, 15].includes(st)) x.dr('conga', st === 10 ? 0.45 : 0.32, st === 7 || st === 15 ? 240 : 330);
      if (I > 0.6 && (st === 4 || st === 12)) x.dr('clap', 0.4);
      if (I > 0.6 && st === 14 && bar % 2 === 1) x.dr('drip', 0.5, sec === 'B' ? 820 : 640);   // blubb
      if (I > 0.6 && sec === 'B' && bar === 7 && st >= 8 && st % 2 === 0) x.dr('conga', 0.3 + (st - 8) * 0.05, 360 - (st - 8) * 10);
    } },
  // Kürbis: herbstlicher Lo-Fi in f-Moll. Rhodes mit Nonakkorden, runder Bass, stumpfe Drums mit viel Swing,
  // Vinyl-Knistern und ein Tiefpass über allem (lp), damit es warm und gedämpft klingt.
  kuerbis: { sync: true, key: 65, scale: 'minor', res: 8, swing: 0.18, lp: 2600, gain: 1.15, form: ['A', 'B', 'A', 'B'],
    lead: I => I > 0.6 ? [['rhodes', 0.85, 12], ['celesta', 0.12, 24]] : [['rhodes', 0.7, 12]],
    A: { ch: '5:m9 10:9 3:M9 0:m9 5:m9 10:9 8:M9 7:7', mel: [
      "4 - 3 . | 1 - - .",
      ". 5 6 - | 5 - 3 .",
      "1' - - 7 | 5 - - .",
      ". . 3 4 | 5 - - -",
      "4 - 3 . | 1 - 6, .",
      ". 5 7 - | 2' - 1' .",
      "3' - - 1' | 6 - 5 .",
      "#7 - - - | . . . ."] },
    B: { ch: '8:M9 7:m7 0:m9 0:m9 5:m9 10:9 3:M9 7:7', mel: [
      "6 - 1' - | 3' - 1' .",
      ". 7 - 5 | - . 2 .",
      "3 - 5 - | 7 - 1' .",
      ". . . . | . 5 7 1'",
      "2' - - 1' | 6 - 4 .",
      "5 - 4 . | 2 - - .",
      "3 - 5 - | 1' - 2' .",
      "#7 - - - | 5 - . ."] },
    // Kick auf 1 und 3 (die 3 leiser), Snare auf 2 und 4, Bass lang auf der 1
    beat(st, x, v){
      if (st === 0) { x.dr('kick', v * 0.8); x.n('round', x.bassLo, v, 6); }
      if (st === 8) x.dr('kick', v * 0.55);
      if (st === 4 || st === 12) x.dr('snare', v * 0.75);
    },
    acc(st, x, I, sec, bar){
      if (st === 0) for (const m of x.chord(53)) x.n('rhodes', m, 0.16, 7);                    // Akkord, lang
      if (I > 0.6 && st === 7) for (const m of x.chord(53)) x.n('rhodes', m, 0.08, 4);         // vorgezogen, leise
      if (st === 10) x.n('round', x.bassLo + (bar % 2 ? 7 : 12), 0.45, 3);
      if (I > 0.6 && st === 10) x.dr('kick', 0.4);                                             // Ghost-Kick
      if (st % 2 === 0) x.dr('hat', st % 4 === 2 ? 0.32 : 0.2);
      if (Math.random() < 0.35) x.dr('crackle', 0.7);                                          // Vinyl
      if (I > 0.6 && sec === 'B' && bar === 7 && st === 14) x.dr('snare', 0.35);
    } },
  // Upgrade-Screen: F-Dur, ruhig, Celesta über weicher Fläche, Spieluhr-Arpeggio (festes Tempo)
  shop: { bpm: 76, key: 65, scale: 'major', res: 8, lead: [['celesta', 0.5, 0]], form: ['A', 'B', 'A-', 'B'],
    A: { ch: '0:M7 9:m7 5:M7 7:7 0:M7 4:m7 5:M7 7:7', mel: [
      "5 - - 6 5 - 3 .", "4 - - 3 2 - . .", "4 - - 5 6 - 1' .", "7 - 6 - 5 - . .",
      "5 - - 6 5 - 1' .", "3' - - 2' 1' - . .", "2' - 1' 6 4 - 6 .", "5 - - - . . . ."] },
    B: { ch: '0:M7 9:m7 5:M7 7:7 0:M7 4:m7 5:M7 7:7', mel: [
      "1' - - 7 6 - 5 .", "6 - - 5 4 - 2 .", "4 - 5 6 1' - . .", "2' - - 1' 7 - . .",
      "3' - 2' 1' 5 - . .", "1' - 7 6 3 - . .", "4 - 6 1' 2' - 1' 6", "5 - - - - - . ."] },
    acc(st, x){
      if (st === 0) x.pad(x.chord(57), 0.03);
      if (st % 2 === 0){ const c = x.chord(60).concat(x.chord(72)); x.n('celesta', c[[0, 1, 2, 3, 4, 3, 2, 1][st / 2] % c.length], 0.11); }
      if (st === 0) x.n('marimba', x.root - 12, 0.45);
      if (st === 8) x.n('marimba', x.root - 5, 0.3);
    } },
};
