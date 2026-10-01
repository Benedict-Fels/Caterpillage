// Darm-Kalibrierung (Stufe 17): lässt jede Brockenart ohne Zeichnen von jeder Pförtner-Stelle durch
// die Grundstellung der Zilien fallen und zeigt die Punkte.
// Aufruf aus dem Projektordner:  node werkzeuge/darm-kalibrierung.js [Zilien]
// Schnitt = zufälliger Pförtner, bester = beste Pförtner-Stelle (so viel bringt gutes Zielen ohne Umstellen),
// ohne Treffer = Anteil der Stellen, an denen der Brocken keine Zilie trifft.
// Ertrag eines Brockens = Nährstoffe × Punkte / GUT.full (Stand: GUT.full in js/gut.js).
const G = require('../js/gut.js');
const n = +process.argv[2] || G.GUT.cilia0, L = G.gutFitLayout(null, n).z;
console.log(`${n} Zilien in Grundstellung, ganz verdaut ab ${G.GUT.full} Punkten`);
G.GUT.TYPES.forEach((T, k) => {
  const pts = []; for (let x = 24; x <= 456; x += 4) pts.push(G.gutSimulate(k, x, L).points);
  const avg = pts.reduce((a, b) => a + b, 0) / pts.length;
  console.log(T.name.padEnd(15), 'Schnitt', avg.toFixed(2), '· bester', Math.max(...pts).toFixed(1), '· ohne Treffer', Math.round(pts.filter(p => p <= 2).length / pts.length * 100) + ' %');
});
