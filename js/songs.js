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

   Instrumente: marimba, pizz, celesta, bass, pluck (Leadsynth), sub (Groove-Bass).
   Trommeln: kick, clap, hat, ohat (offene Hi-Hat), wood (Holzblock).
   ===================================================================== */
const SONGS = {
  // Run-Song für alle Welten: C-Dur, Four-on-the-floor, Oktav-Bass, Clap auf 2 und 4, Offbeat-Hats.
  // Tempo kommt vom Biss-Takt (sync), Kick und tiefer Bass auf den Bisszählzeiten spielt der Biss selbst (beat).
  groove: { sync: true, key: 60, scale: 'major', res: 16, form: ['A', 'B', 'A', 'B'],
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
