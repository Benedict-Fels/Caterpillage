# Caterpillage – Planungsstand

Ein Incremental-Spiel, in dem sich eine Raupe durch runde Früchte frisst: erst die harte Schale, dann das weiche Fruchtfleisch, zuletzt der steinharte Kern. Mit den gesammelten Ressourcen kauft man Upgrades, schaltet neue Früchte frei, und am Ende eskaliert das Ganze ins Absurde.

Inspiration: *To the Core* (Raumschiff baut einen Planeten ab und schaltet immer mehr Laser, Drohnen usw. frei).

Ausgangspunkt war ein früher Prototyp (`caterpillage.html`). Er gilt nur als Demonstration und wird nicht weiterentwickelt, sondern neu aufgebaut.

---

## Festgelegt

### Aufbau einer Frucht

Drei Schichten mit klar getrennter Härte:

| Schicht | Härte | Rolle |
|---|---|---|
| Schale | zäh (Test: 14) | Hürde, der Durchbruch ist der Dopamin-Moment |
| Fruchtfleisch | weich und **überall gleich hart** (Test: 2), wird zum Kern hin nicht härter | Viel Ertrag, schnelles Vorankommen |
| Kern | steinhart (Test: 70) | Langzeitziel, liefert die Kern-Währung |

Das Material wird beim Anknabbern dunkler, bevor es verschwindet. Die Schale setzt sich farblich deutlich vom Fruchtfleisch ab.

Die Ansicht ist reine Draufsicht (kein Schatten, kein Stiel).

### Der Run-Loop

- Die Ausdauer ist die Rundenuhr. Jeder Biss kostet Ausdauer, harte Schichten mehr als weiche.
- Bei Ausdauer 0 ist der Run vorbei, es gibt **keine Regeneration**. Stattdessen geht es in einen separaten Upgrade-Screen.
- **Jeder Run beginnt mit einer frischen, ganzen Frucht.**

### Pacing der ersten Frucht

| Run | Ziel |
|---|---|
| 1 | Scheitert an der Schale, gibt aber genug für ein erstes Upgrade |
| 2–3 | Durchbruch durch die Schale, viel Fruchtfleisch als Belohnung |
| ab da | Die Upgrades fangen richtig an |
| ~10 | Man kratzt überhaupt erst am Kern |

### Währungen

Pro Frucht zwei eigene Währungen:

- **Fruchtwährung** aus Schale und Fruchtfleisch, für die normalen Upgrades.
- **Kernwährung** aus dem Kern, für den Aufstieg zur nächsten Frucht und für einige besondere Upgrades.

Weil jede Frucht ihre eigenen Währungen hat, kann es nötig sein, zu früheren Früchten zurückzukehren.

### Upgrades

- Aufbau als **Verzweigungsbaum**, ohne sich an einen bestimmten Obstbaum zu halten.
- Mehrere Upgrades pro Stufe.
- Jedes Upgrade lässt sich mehrfach kaufen (Beispiel: Bisskraft startet bei 1, +1 pro Kauf, bis zu 20-mal, jedes Mal teurer).
- Mischung aus festen Boni (+x) und prozentualen Boni (+x %). Feste lohnen sich früh, prozentuale später.
- Kritischer Biss gehört zu den normalen Upgrades.
- Upgrades späterer Früchte kommen außen am Baum hinzu.
- Grundäste aus dem Prototyp: Kiefer (Bisskraft), Maul (Größe), Ausdauer, Verdauung (Ertrag), Tempo.

### Fähigkeiten

- Nach jeder geschafften Welt erscheinen **3 Optionen**, eine davon wird gewählt (nach Möglichkeit aktiv und passiv gemischt). Nicht gewählte kommen zurück in den Pool und können später wieder angeboten werden.
- **Aktive Fähigkeiten haben eine Abklingzeit von 30 s** (seit Stufe 4, vorher einmal pro Run). Auslösen mit Leertaste oder Button am Spielfeld.
- Jede Fähigkeit hat **drei eigene Ausbau-Knoten im Upgrade-Baum** (Ast "Fähigkeiten", je 5 Stufen, z. B. Fressrausch: Dauer / Kraft / Takt), bezahlt mit der **Fruchtwährung der neuen Welt + der Kernwährung der geschafften Welt** (nach der Johannisbeere gewählt → Kirschsaft + Beerenkerne).
- Pro Run ist **genau eine aktive und eine passive** Fähigkeit ausgerüstet. Zwischen den Runs kann man wechseln.

Vorgemerkt (umgesetzt, siehe Stufe 2):

| Fähigkeit | Art | Wirkung |
|---|---|---|
| Fressrausch | aktiv | Kurzzeitig mehr Bisskraft und kein Ausdauerverbrauch |
| Schub | aktiv | Kurzer Sprint nach vorn durch weiches Material |
| Brennhaare | passiv | Der Körper frisst an den Rändern mit |
| Saftsog | passiv | Ausdauer zurück beim Fressen von Fruchtfleisch |

Weitere Ideen für "vor sich zerstören": Seidenfaden als Strahl (biologisch passend, Raupen spinnen am Mund, nicht hinten) und Säurespucke als Geschoss (angelehnt an das Hervorwürgen von Verdauungssaft zur Abwehr). Die Gabeldrüse des Schwalbenschwanzes und Brennhaare zerstören in echt nichts, im Spiel ist das aber frei.

### Bewegung (als Prototyp umgesetzt und für gut befunden)

Datei: `caterpillage-bewegung.html`

- Ein Zyklus besteht aus **Biss → Welle → Vorschieben**. Die Mandibeln schnappen zu, eine Welle läuft vom Schwanz zum Kopf (angehobene Segmente ohne Beinchen), dann schiebt sich der Kopf nach vorn, während der Schwanz stehen bleibt.
- **Widerstand:** Der Kopf kommt nur dorthin, wo schon alles weggefressen ist. Bei kleinen Kanten rutscht er leicht seitlich ab.
- **Sichtlinie beim Biss:** Nur Material mit freier Linie zum Kopf wird getroffen, von innen nach außen. So kann man nicht durch die Schale hindurch ins Fruchtfleisch beißen.
- Rückmeldung: Krümel, leichtes Wackeln (bei der Schale stärker), Einblendung "Durchbruch!" beim ersten Fruchtfleisch.
- **Tempo = Biss-Takt × Vorschub pro Zyklus.**
  - Biss-Takt über Upgrades zwischen **0,8 und 3** Bissen pro Sekunde.
  - Der Vorschub hängt an der **Segmentzahl**: Die Raupe startet kurz (Test: 6 Segmente) und wächst mit der Zeit.

### Welten

- Nur **runde Objekte**, weil Blätter nicht in den Spielfluss passen.
- Anfangs an echter Raupennahrung orientiert, gegen Ende immer absurder bis zur richtigen Eskalation.
- **Reihenfolge (entschieden): Johannisbeere → Kirsche → Walnuss → Pflaume → Apfel → Kürbis.**
- Johannisbeere: glasig rot mit hellen Adern, 5–7 kleine Kerne um die Mitte.
- Kirsche: dunkle, glänzende Haut, dunkelrotes Fruchtfleisch, ein großer Stein.
- Walnuss: **umgedreht** – weiche grüne Hülle, steinharte Holzschale, innen der weiche Nusskern als Lohn. Die Trennwände im Inneren sind wieder Holz.
- Jede Welt hat eigene Währungen (Frucht + Kern) und eigene Upgrades. Aufstieg zur nächsten Welt kostet Kernwährung der aktuellen.

---

## Umsetzung Stufe 1: Frühes Spiel (`index.html`)

`index.html` ist jetzt das Spiel und ersetzt den Bewegungstest. Umgesetzt:

- Johannisbeere als erste Frucht, Bewegung wie im Bewegungstest.
- **Ausdauer als Rundenuhr:** Jeder Biss kostet nach dem härtesten getroffenen Material: nichts getroffen 0,5 · Fruchtfleisch 1 · Schale 2 · Kern 5. Stillstehen kostet nichts. Bei 0 ist der Run vorbei.
- **Fruchtwährung "Saft":** Schale 1 je Pixel, Fruchtfleisch 0,15 je Pixel (das Fruchtfleisch hat ~5-mal so viele Pixel und ist billiger zu fressen).
- Kerne zählen schon als Kernwährung mit, haben aber noch keine Verwendung.
- **Upgrade-Screen** nach jedem Run: radialer Baum, Mitte = Raupe, 5 Grundäste, Unterknoten werden ab einer Stufe des Elternknotens frei.
- **Segmente als Upgrade** (entschieden), Unterknoten von Tempo.
- **Spielstand** automatisch im Browser (localStorage), mit "Spielstand löschen".

Startwerte: Bisskraft 1 · Maul 4 · Ausdauer 30 · 1 Biss/s · 6 Segmente. Härte: Schale 4, Fruchtfleisch 1,4, Kern 90.

| Knoten | Ast | Wirkung je Stufe | Max | Startkosten × Wachstum | Freischaltung |
|---|---|---|---|---|---|
| Kiefer | Kiefer | +1 Bisskraft | 20 | 25 × 1,55 | – |
| Kritischer Biss | Kiefer | +4 % Chance auf 2,5-fachen Schaden | 10 | 120 × 1,7 | Kiefer 3 |
| Scharfe Mandibeln | Kiefer | +10 % Bisskraft | 10 | 600 × 1,8 | Kiefer 6 |
| Maul | Maul | +0,4 Maulgröße | 10 | 50 × 1,7 | – |
| Kaukraft | Maul | weniger Kraftverlust am Bissrand | 5 | 150 × 1,9 | Maul 3 |
| Ausdauer | Ausdauer | +10 Ausdauer | 20 | 15 × 1,5 | – |
| Zähigkeit | Ausdauer | −8 % Kosten in Schale und Kern | 5 | 150 × 1,9 | Ausdauer 3 |
| Verdauung | Verdauung | +25 % Saft (fest auf den Grundwert) | 20 | 30 × 1,55 | – |
| Enzyme | Verdauung | +15 % Saft (multiplikativ) | 10 | 500 × 1,8 | Verdauung 5 |
| Tempo | Tempo | +0,05 Bisse/s (seit Stufe 2) | 7 | 35 × 1,6 | – |
| Segment | Tempo | +1 Segment | 4 (seit Stufe 2) | 60 × 1,9 | Tempo 2 |

Bot-Simulation (fährt stur zur Mitte, kauft immer das billigste Upgrade): Run 1 dauert ~17 s, scheitert an der Schale und bringt ~25–30 Saft, genug für die erste Stufe Ausdauer. Durchbruch in Run 3, danach dauern die Runs 30–40 s.

Angespielt (Bene): Die Kerne sind sehr hart, nach einigen Runs ist nur die Oberfläche angekratzt. Für den Moment in Ordnung.

**Anzeige im Baum:** Jeder Knoten zeigt Stufe/Maximum (z. B. 3/20), gesperrte Knoten gestrichelt.

**Steuerung** (Button "Steuerung" oben rechts, wird getrennt vom Spielstand gespeichert): Maus/Finger, WASD oder Pfeiltasten. Für Tasten zwei Lenkarten: *Richtung* (Taste = Himmelsrichtung, zwei Tasten = Diagonale) oder *Drehen* (links/rechts drehen, vorwärts frisst). Ohne gedrückte Taste bleibt die Raupe stehen und verbraucht nichts. Das Spiel pausiert, solange das Fenster offen ist.

## Umsetzung Stufe 2: Welten 1–3 (`index.html`)

**Ablauf:** Welt schaffen = genug Kernwährung für den Aufstieg sammeln (Kirsche: 40 Beerenkerne, Walnuss: 200 Kirschkerne), dann 3er-Wahl einer Fähigkeit. Im Upgrade-Screen gibt es unten "Welten" (wählen, wohin der nächste Run geht, auch zurück) und "Fähigkeiten" (ausrüsten, ausbauen). Alte Spielstände werden übernommen, zu viel gekaufte Tempo-/Segment-Stufen werden zu alten Preisen erstattet.

**Tempo:** Jede Welt hat einen eigenen Tempo-Knoten mit 7 × 0,05 Bissen/s = +0,35 pro Welt. Start 1,0 → nach 6 Welten ≈ 3,1 Bisse/s. Segmente ebenso verteilt (4 / 3 / 3).

**Upgrade-Baum:** Ring 1–2 Johannisbeere, Ring 3 Kirsche, Ring 4 Walnuss. Neue Ringe erscheinen erst mit der Welt, der Baum zoomt auf die freigeschalteten Ringe. Knoten zeigen Stufe/Maximum.

| Welt | Knoten (Wirkung je Stufe, Max) |
|---|---|
| Kirsche (Kirschsaft) | Kirschkiefer +3 Bisskraft (15) · Wuchtbiss +0,5 Krit-Schaden (6) · Weiter Schlund +0,3 Maul (5) · Fettreserve +20 Ausdauer (15) · Kirschmagen ×(1+0,2) Ertrag (10) · Takt II (7) · Segment II (3) |
| Walnuss (Nussholz) | Nussknacker +8 Bisskraft (15) · Stahlmandibeln +15 % Bisskraft (8) · Winterspeck +40 Ausdauer (15) · Hornhaut −6 % harte Kosten (5) · Nussmagen ×(1+0,25) Ertrag (10) · Takt III (7) · Segment III (3) |

**Schichten** (Härte · Ausdauer je Biss · Ertrag je Pixel):

| Welt | Außen | Mitte | Innen |
|---|---|---|---|
| Johannisbeere | Schale 4 · 2 · 1 Saft | Fruchtfleisch 1,4 · 1 · 0,15 Saft | Kerne 90 · 5 · 1 Kern |
| Kirsche | Haut 40 · 2 · 1 | Fruchtfleisch 6 · 1 · 0,15 | Stein 600 · 5 · 1 Kern |
| Walnuss | Grüne Hülle 40 · 1 · 0,1 | Holzschale 400 · 3 · 0,3 | Nusskern 15 · 1 · 0,05 Kern |

**Fähigkeiten** (Pool von 8, Stufe 1–5):

| Fähigkeit | Art | Wirkung |
|---|---|---|
| Fressrausch | aktiv | 3 s + 1 s/Stufe: doppelte Bisskraft, 1,5-facher Takt, kein Ausdauerverbrauch |
| Schub | aktiv | Sprint geradeaus durch weiches Material, stoppt an harten Schichten |
| Säurespucke | aktiv | Geschoss, löst beim Aufprall einen Kreis an, auch harte Schichten |
| Seidenfaden | aktiv | Strahl aus dem Maul für 2 s + 0,5 s/Stufe, schneidet sich geradeaus durch |
| Brennhaare | passiv | Körpersegmente fressen bei jedem Biss am Rand mit |
| Saftsog | passiv | Saftige Schichten geben Ausdauer zurück |
| Häutung | passiv | Einmal pro Run bei leerer Ausdauer: Teil zurück, kurz größeres Maul |
| Gabeldrüse | passiv | Jeder Biss weicht einen Kegel vor dem Kopf auf, auch hinter der Schale |

**Bot-Simulation** (frisst zur Mitte, kauft immer das Billigste, geht nie zurück): Kirsche frei nach Run 12, Walnuss nach Run ~23 (11 Kirsch-Runs), Walnuss geknackt im 3.–5. Walnuss-Run. Kirsch-Runs ~45 s, Walnuss-Runs 70–150 s.

## Umsetzung Stufe 3: Feedback nach dem Anspielen (`index.html`)

Rückmeldung Bene nach Stufe 2: Anfang zu schwer; Ausdauer ab der Kirsche viel zu hoch; Krit zu extrem; Fähigkeiten-Ausbau lieber im Baum und vielfältiger; Brennhaare wirkten kaum; Kirsche in 3 Runs komplett ausgebaut, Walnuss in 2, danach Johannisbeere in 4 Runs komplett. Änderungen:

- **Anfang leichter:** Johannisbeer-Schale Härte 3,5 (statt 4), Kerne Härte 70 und **4 Ausdauer** (statt 90 / 5), erste Ausdauer-Stufe kostet 10.
- **Ausdauer runter:** Ausdauer +5 je Stufe (statt +10), Fettreserve +12 (statt +20), Winterspeck +25 (statt +40).
- **Neue Welten fordern mehr Ausdauer:** Kirsche Haut 4 · Fleisch 1,5 · Stein 7; Walnuss Hülle 2 · Holzschale 6 · Nusskern 2 (Johannisbeere 2 · 1 · 4).
- **Krit:** ein Knoten pro Welt mit 5 Stufen, je +2 % Chance und +10 % Krit-Schaden. Grundschaden 150 %, nach der Johannisbeere also bis 200 %, pro Welt +50 %.
- **Erträge nur noch in der eigenen Welt:** Verdauung/Enzyme gelten nur für Beerensaft, Kirschmagen nur für Kirschsaft, Nussmagen nur für Nussholz. Damit schießen spätere Welten nicht mehr durch Multiplikatoren aus früheren Welten davon.
- **Brennhaare** brennen jetzt dauerhaft (alle 0,35 s, solange die Raupe unterwegs ist), nicht nur beim Biss. Die Haare sind sichtbar.
- **Saftsog** kann pro Biss höchstens einen Teil der Bisskosten zurückgeben (vorher war Fressen im Fruchtfleisch damit gratis).
- **Ratzeputz:** Ist die Frucht komplett gefressen, endet der Run sofort.
- **Sammelanzeige** mit Icons oben am Spielfeld; Werte der Raupe nur noch klein in der Seitenleiste. Jede Währung hat ein eigenes Icon (Tropfen für Saft, Kern-Formen, Holzspan für Nussholz).
- **Größenverhältnisse:** Echte Durchmesser – Johannisbeere ~9 mm, Kirsche ~22 mm, Walnuss mit Hülle ~45 mm, Pflaume ~50, Apfel ~80, Kürbis ~350 mm. Linear wäre die Raupe in der Walnuss ein Punkt, deshalb mit der Wurzel gestaucht: Radius = 78 · √(d / 9 mm) → Johannisbeere 78, Kirsche 122, Walnuss 175 (später Pflaume ~185, Apfel ~235, Kürbis ~490 – dafür braucht es dann eine mitlaufende Kamera). Die Raupe bleibt gleich groß, die Frucht wächst, die ganze Frucht bleibt im Bild.
- Spielstände aus Stufe 2 werden übernommen (Fähigkeiten starten wieder bei der Grundstufe, Knoten werden auf die neuen Obergrenzen gekappt).

Bot-Simulation (fährt zur Mitte, kreist um den Kern, kauft das Billigste): Kirsche frei nach ~20 Runs, Walnuss nach ~13 Kirsch-Runs, Walnuss geknackt im ~7. Walnuss-Run. Nach 13 Kirsch-Runs sind die Kirsch-Knoten erst etwa zur Hälfte ausgebaut. Rückkehr zur Johannisbeere mit Walnuss-Werten: ganze Beere pro Run (12–25 Tsd. Beerensaft), nach 5 Runs ist Kiefer bei 13/20. Ein Mensch ist schneller als der Bot, vor allem beim Zielen auf die Kerne.

## Umsetzung Stufe 4: Komfort, Anzeige, Admin (`index.html`)

Rückmeldung Bene: Stufen ungleichmäßig, Pause fehlt, Vollbild fehlt, Kontrast des gesperrten Kaufen-Knopfs schlecht, Schadens- und Ertragsanzeige gewünscht, Biss-Takt mit zwei Nachkommastellen, Fähigkeiten nur einmal pro Run, Admin-Modus zum Testen. Änderungen:

- **Gleichmäßige Stufen:** Jeder Knoten wirkt linear, jede Stufe bringt gleich viel. Umgestellt: Kaukraft +7 % Kraft am Rand je Stufe (45 → 80 %), Zähigkeit und Hornhaut addieren sich (−8 % / −4 % je Stufe, zusammen höchstens −60 %), Enzyme addieren +30 % Beerensaft je Stufe auf die Verdauung, Gabeldrüse-Kegel +10° je Stufe (74° → 124°).
- **Anzeige "jetzt → danach":** Der Shop zeigt den echten Gesamtwert, z. B. "Ausdauer 30 → 35", "1,05 → 1,10 Bisse/s". Bisskraft und Biss-Takt mit zwei Nachkommastellen. Fehlender Betrag steht unter dem Kaufen-Knopf.
- **Pause:** Esc, P oder Pause-Knopf in der Leiste. Menü mit Weiter, Neu starten (Ertrag wird gutgeschrieben, sofort eine frische Frucht – für "Upgrade lohnt sich noch nicht, nochmal rein"), Run beenden (Ertrag gutgeschrieben, weiter zu den Upgrades), Vollbild, Einstellungen. Pausiert auch automatisch, wenn der Tab verlassen oder das Browser-Vollbild beendet wird.
- **Vollbild:** Knopf oben und in Pause/Einstellungen. Das Spielfeld füllt dann den Bildschirm, die Seitenleiste verschwindet. Auf dem Handy standardmäßig an (echtes Browser-Vollbild beim ersten Antippen, weil Browser dafür eine Berührung verlangen; auf dem iPhone nur das Layout).
- **Kontraste:** Gesperrte Knöpfe werden nicht mehr per Deckkraft ausgegraut, sondern bekommen einen hellen Grund mit voller Schriftfarbe. Währungs-Icons sitzen auf der Textlinie.
- **Schwebende Zahlen:** Schaden pro Biss vor dem Maul (Krit gelb mit "!"), Ertrag als "+x" mit Währungs-Icon über dem Körper, auch für Spucke, Wucht, Faden. Abschaltbar in den Einstellungen.
- **Abklingzeit aktiver Fähigkeiten:** 30 s nach dem Einsatz wieder bereit; die Zeit läuft erst, wenn die Wirkung vorbei ist, und steht in der Pause. Der Knopf zeigt die restlichen Sekunden. Neuer Knoten **Aufladung** (Ast Fähigkeiten, Johannisbeer-Ring, erscheint mit der ersten aktiven Fähigkeit): −3 s je Stufe, 5 Stufen → 15 s, Kosten 300 × 2 Beerensaft. (Zwischenstand über verbrauchte Ausdauer auf Wunsch von Bene verworfen; Stillstehen zum Aufladen wird in Kauf genommen.)
- **Admin-Modus:** Im Spiel "admin" tippen oder `index.html?admin` öffnen; danach auch in den Einstellungen schaltbar. Bietet: Währungen setzen, alle Welten frei, alle Upgrades 0/Max, im Baum pro Knoten 0/−1/+1/Max gratis, Fähigkeiten besitzen/ausrüsten/Stufen setzen, unendliche Ausdauer, keine Aufladezeit, Testlauf ohne Gutschrift, Multiplikatoren für Bisskraft, Biss-Takt und Spieltempo, Stand merken/laden, Export/Import. **Messwerte** im Run und am Run-Ende: Schaden je Quelle (Biss, Biss im Fressrausch, Brennhaare, Gabeldrüse-Aufweichung, Schub, Säurespucke, Seidenfaden), DPS, Anteil, Ertrag, Pixel, verbrauchte Ausdauer, Saftsog-Rückgabe.

## Umsetzung Stufe 5: Musik und Soundeffekte (`index.html`)

Alles wird im Browser per Web Audio erzeugt. Es gibt keine Sounddateien, `index.html` bleibt eine einzelne Datei. Browser erlauben Ton erst nach dem ersten Klick oder Tastendruck, deshalb startet die Musik dann. Sicherung des Stands davor: `index-vor-sound.html`.

**Musik** (verspielt und gemütlich, entschieden von Bene; je 2 × 8 Takte, Form A–B–A–B mit Variation):

| Stück | Tonart · Tempo | Klang |
|---|---|---|
| Johannisbeere | C-Dur · 112 | Marimba, Pizzicato-Bass, Shaker, im 3. Teil eine Oktave höher |
| Kirsche | d-Moll mit Swing · 100 | Pizzicato + Marimba gedoppelt, laufender Bass, Fingerschnipsen |
| Walnuss | G-Mixolydisch · 94 | Kalimba, Holzblock, holziger Bass |
| Upgrade-Screen | F-Dur · 76 | Celesta über weicher Fläche, Spieluhr-Arpeggio, keine Drums |

- Vor dem Durchbruch spielt die Run-Musik reduziert (weniger Schlagwerk), danach voll.
- Im Fressrausch zieht das Tempo um 12 % an.
- In der Pause und in offenen Dialogen wird die Musik leiser und dumpf gefiltert.
- Am Run-Ende blendet die Musik aus, im Upgrade-Screen startet die Shop-Musik.

**Effekte:**

- Biss je Material: Schale knackt, Fruchtfleisch schmatzt, Kern/Stein klackt, Walnuss-Hülle raschelt, Holzschale klopft, Nusskern knuspert. Ohne Treffer nur ein leises Mandibel-Klicken. Tonhöhe leicht zufällig.
- Kritischer Biss mit hellem "Ting", Durchbruch/Geknackt mit aufsteigendem Arpeggio, Kernwährung mit leisem "Pling".
- Warnton bei 25 % und 10 % Ausdauer, Run-Ende absteigend ("Erschöpft") oder Fanfare ("Ratzeputz").
- Fähigkeiten: Fressrausch (Knurren + Arpeggio), Schub (Wusch), Wumms, Säurespucke (Ptoo + Zischen), Seidenfaden (Sirren, solange er läuft), Häutung, "wieder bereit"-Klang.
- Shop: Auswahl-Klick, Kaufen (Tonhöhe steigt mit der Stufe), Maximum erreicht, "zu teuer"-Bonk, Welt freigeschaltet, Fähigkeit gewählt, Pause/Weiter.

**Einstellungen:** Regler für Musik (Start 60 %) und Effekte (80 %), Stumm per Häkchen, Knopf "Ton aus" oben oder Taste M. Wird getrennt vom Spielstand gespeichert (`caterpillage.sound.v1`).

Offen: Lautstärkeverhältnis Musik/Effekte und Tempo der Stücke von Hand anspielen. Für Pflaume, Apfel und Kürbis fehlen noch eigene Stücke (bis dahin läuft das Johannisbeer-Thema). Einzelne Klänge lassen sich später durch echte Aufnahmen ersetzen.

## Umsetzung Stufe 6: Musik im Biss-Takt (`index.html`)

Rückmeldung Bene: Musik peppiger, erst einmal nur ein Song; Musik und Bisse sollen nicht nebeneinander herlaufen, sondern der Biss soll der Takt sein. Änderungen (Stand davor: `index-vor-biss-takt.html`):

- **Ein Run-Song für alle Welten** ("groove"): C-Dur, Four-on-the-floor, Oktav-Bass in Achteln, Clap auf 2 und 4, Offbeat-Hats und Akkord-Stabs, 16tel-Melodie mit Refrain (I–V–vi–IV). Vor dem Durchbruch Marimba-Melodie und leichteres Schlagwerk, danach Rechteck-Lead und offene Hats. Die drei Welten-Stücke aus Stufe 5 sind entfernt (stecken noch in der Sicherung). Die Shop-Musik bleibt.
- **Tempo = Biss-Takt:** Ein Biss dauert k Viertel, k wird pro Run so gewählt, dass das Tempo zwischen 95 und 190 BPM liegt. 1,0 Bisse/s → 120 BPM (Biss auf 1 und 3), 1,35 → 162 BPM, ab ~1,6 fällt ein Biss auf jede Zählzeit (1,7 → 102 BPM), bei 2,6 → 156 BPM. Tempo-Upgrades machen die Musik also hörbar schneller.
- **Fressrausch** beschleunigt die Musik mit (seit Stufe 7 ohne Obergrenze, der Takt bleibt gleich).
- **Einrasten:** Das Spiel meldet jedes Bild Biss-Takt und Phase, die Musik zieht ihr Raster nach, sodass die Bisse auf den Zählzeiten liegen (gemessen: im Mittel ~10 ms, höchstens ~20 ms Abstand).
- **Der Biss ist der Beat:** Auf den Zählzeiten, auf die ein Biss fällt, spielt der Biss selbst Kick und Bassschlag (Grundton des aktuellen Akkords), darüber das Materialgeräusch. Steht die Raupe, spielt die Musik diese Schläge nur leise selbst – die Musik wird dünner, wenn man nicht frisst.
- In der Pause läuft die Musik gedämpft im letzten Tempo weiter und rastet beim Weiterspielen wieder ein.

Offen: Song von Hand anhören (Tempo, Lautstärke Kick/Bass gegen Materialgeräusch). Wenn er passt, Varianten pro Welt auf derselben Technik bauen.

## Umsetzung Stufe 7: Aufteilung, Admin, Feinschliff

Rückmeldung Bene: Song gefällt; `index.html` zu groß; Wackeln zu stark; im Fressrausch soll der Takt nicht springen; Admin soll alles freischalten und einzeln zurücksetzen können. Stand davor: `index-vor-aufteilung.html`.

**Dateien** (kein Framework, normale `<script>`-Dateien, damit `index.html` weiter per Doppelklick läuft; Reihenfolge in `index.html` ist wichtig):

| Datei | Inhalt |
|---|---|
| `index.html` | nur noch das HTML-Gerüst |
| `css/style.css` | alle Styles |
| `js/util.js` | Kürzel und Zahlenformate |
| `js/data.js` | Welten, Währungs-Icons, Fähigkeiten, Upgrade-Baum |
| `js/save.js` | Spielstand, Anzeige- und Admin-Einstellungen |
| `js/songs.js` | **Songs als Noten-Text** (Aufbau oben in der Datei erklärt) |
| `js/audio.js` | Klangerzeugung, Sequencer, Biss-Takt-Kopplung, Effekte, WAV-Export |
| `js/stats.js` | Stufen, Kosten, Gesamtwerte der Raupe |
| `js/fruit.js`, `js/caterpillar.js`, `js/eat.js`, `js/run.js` | Frucht, Raupe, Fressen und Fähigkeiten, Run-Ablauf |
| `js/draw.js`, `js/shop.js`, `js/screens.js` | Zeichnen und Run-Anzeige, Upgrade-Screen, Screens/Pause/Vollbild/Einstellungen |
| `js/admin.js`, `js/input.js`, `js/main.js` | Admin-Modus, Eingabe und Spielschleife, Start |

Falls später ein Build-Werkzeug gewünscht ist (z. B. Vite mit ES-Modulen), braucht es einen lokalen Server statt Doppelklick. Vorerst bewusst ohne.

- **Fressrausch:** Das Verhältnis Biss zu Takt bleibt im ganzen Run gleich. Die Musik läuft im Rausch entsprechend schneller (z. B. 114 → 228 BPM bei voll ausgebautem Fressrausch) und springt danach zurück.
- **Wackeln:** Standard jetzt "leicht" (35 % der alten Stärke), in den Einstellungen wählbar: aus / leicht / stark.
- **Admin:** "Alles freischalten" (alle Welten, Fähigkeiten, Upgrades und Fähigkeiten-Stufen auf Max, je 1 Mio. Währung), "Alles auf Anfang" (Doppelklick). Welten einzeln freischalten/sperren, "Hier spielen", Runs zurücksetzen. Alle Upgrades als Liste pro Welt mit Stufe, 0 und Max. Fähigkeiten direkt ausrüsten per Auswahl (gibt sie gleich in den Besitz), Besitz und Stufen einzeln. Offene Fähigkeiten-Wahl verwerfen.
- **Song speichern:** Im Admin unter "Musik": Run-Song oder Shop-Musik als WAV (32 Takte, Tempo über Bisse/s wählbar, 1 Biss/s = 120 BPM). Eine Aufnahme liegt in `musik/caterpillage-groove-120bpm.wav`.

## Ideen für später

- **Besonderheiten in der Frucht:** Zuckerkristalle oder Saftblasen im Fruchtfleisch als seltene Ertragsquellen (wie Erzadern in *To the Core*), geben dem Steuern ein Ziel.
- **Überreifes Obst** als seltener Zufalls-Modifikator: Das Fruchtfleisch bringt mehr, und es gibt Öffnungen, durch die man schneller ins Innere kommt. Nicht als Dauerzustand.
- **Verpuppung als Prestige:** Raupe verpuppt sich, wird zum Schmetterling, die nächste Generation startet mit dauerhaften Boni.
- **Weitere Welten-Ideen** (über die festgelegten sechs hinaus, noch nicht entschieden): Pfirsich, Litschi (harte Schale), Avocado (großer Kern), Kokosnuss, Wollknäuel (Kleidermotte), Bowlingkugel, Asteroid, Mond, Erde (Kruste, Mantel, Eisenkern), Sonne, Schwarzes Loch.

## Vorerst verworfen

- **Mini-Raupen als Helfer:** reizvoll, brauchen aber eine eigene Logik.
- Ein zunehmend härteres Fruchtfleisch zum Kern hin.

## Offene Punkte

- Ausdauer- und Ertragswerte sind per Bot-Simulation vorjustiert (siehe "Umsetzung Stufe 1"), müssen aber noch von Hand angespielt werden.
- Kosten- und Wachstumskurven feinjustieren, sobald man selbst gespielt hat.
- Welten 4–6 (Pflaume, Apfel, Kürbis): Aufbau, Werte, Upgrade-Ringe.
- Wofür Walnusskerne ausgegeben werden (bis zur Pflaume noch ohne Verwendung).
- Fähigkeiten-Balance weiter beobachten (Brennhaare und Gabeldrüse in der Johannisbeere stark).
- Mitlaufende Kamera für große Früchte (ab Apfel/Kürbis).
- Runs werden in der Walnuss lang (1,5–2,5 min). Prüfen, ob das stört.
- Abklingzeit (30 s) und Stärke der Fähigkeiten mit den Admin-Messwerten nachjustieren.
