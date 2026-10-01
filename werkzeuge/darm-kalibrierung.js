// Darm-Kalibrierung: lässt jede Brockenart ohne Zeichnen von jeder Pförtner-Stelle durch
// die Grundstellung der Zilien fallen und zeigt die Punkte (Treffer × Ausgang).
// Aufruf aus dem Projektordner:  node werkzeuge/darm-kalibrierung.js [Zilien] [galle]
// Schnitt = zufälliger Pförtner, bester = beste Pförtner-Stelle (so viel bringt gutes Zielen ohne Umstellen),
// richtig = Anteil der Pförtner-Stellen, die im richtigen Ausgang landen, Treffer = Schnitt der Zilien-Punkte ohne Ausgang.
// Ertrag eines Brockens = Nährstoffe × Punkte / GUT.full (Stand: GUT.full in js/gut.js).
const G = require('../js/gut.js');
const n = +process.argv[2] || G.GUT.cilia0, bile = process.argv[3] === 'galle';
const L = G.gutFitLayout(null, n, bile);
console.log(`${n} Zilien in Grundstellung${bile ? ' + Gallen-Zilie' : ''}, ganz verdaut ab ${G.GUT.full} Punkten, richtiger Ausgang ×${G.GUT.RIGHT}`);
G.GUT.TYPES.forEach((T, k) => {
  const rs = []; for (let x = 24; x <= 456; x += 4) rs.push(G.gutSimulate(k, x, L.z, L.g));
  const pts = rs.map(r => r.points), avg = pts.reduce((a, b) => a + b, 0) / pts.length;
  const got = rs.reduce((a, r) => a + r.got, 0) / rs.length, right = rs.filter(r => r.mult > 1).length / rs.length;
  console.log(T.name.padEnd(16), 'Schnitt', avg.toFixed(2).padStart(5), '· bester', Math.max(...pts).toFixed(1).padStart(5),
    '· Treffer', got.toFixed(2).padStart(5), '· richtig', (Math.round(right * 100) + ' %').padStart(5));
});
