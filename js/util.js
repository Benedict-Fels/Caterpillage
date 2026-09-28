'use strict';
const $ = id => document.getElementById(id);
const nf = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 2 });
const nf1 = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 1 });
const nf2 = new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmt = x => nf.format(x);
const fmt2 = x => nf2.format(x);                       // feste zwei Nachkommastellen (Bisskraft, Biss-Takt)
const fmtInt = x => nf.format(Math.floor(x + 1e-9));
const pct = x => Math.round(x * 100) + ' %';
/* Schwebende Zahlen: klein genau, groß kompakt */
const fmtNum = x => x < 10 ? nf.format(Math.round(x * 100) / 100) : x < 1000 ? nf1.format(x) : x < 1e6 ? nf1.format(x / 1e3) + ' Tsd.' : nf1.format(x / 1e6) + ' Mio.';
