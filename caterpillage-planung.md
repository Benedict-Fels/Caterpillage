# Chompillar – Planungsstand

(Arbeitstitel bis 29.09.2026: Caterpillage. Umbenannt, weil es ein Handyspiel "Caterpillage" mit ähnlichem Prinzip gibt; siehe "Veröffentlichung".)

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

- Die Ausdauer ist die Rundenuhr. Sie sinkt ständig um einen **Grundverbrauch pro Sekunde** (auch im Stand), und jeder Biss kostet zusätzlich, harte Schichten mehr als weiche (seit Stufe 9).
- Bei Ausdauer 0 ist der Run vorbei, es gibt **keine Regeneration**. Stattdessen geht es in einen separaten Upgrade-Screen.
- **Jeder Run beginnt mit einer frischen, ganzen Frucht.**

- **Kein Prestige** (entschieden 29.09.2026). Langzeitziele kommen über Welten, Fundstücke (Setzkasten) und Meilensteine (Fressbuch).

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

## Umsetzung Stufe 8: Name, Musik pro Welt, schneller zurück ins Menü

- **Name:** Chompillar (Fenstertitel, Überschrift, Dateinamen beim Musik-Export). Die Speicher-Schlüssel im Browser heißen weiter `caterpillage.*`, damit Spielstände erhalten bleiben. Ordner- und Dateinamen im Projekt sind unverändert.
- **Eigener Song pro Welt** (alle im Biss-Takt, Kick und Bass kommen weiter vom Biss):
  - Johannisbeere: der bisherige Groove (C-Dur, Four-on-the-floor, Rechteck-Lead).
  - Kirsche: Funk in d-Moll mit leichtem Swing, Pizzicato-Lead, E-Piano-Stabs auf den Nachschlägen, Fingerschnipsen, Rimshot, Geister-Sechzehntel im Bass.
  - Walnuss: G-Mixolydisch, Kalimba-Melodie, Holzblöcke, Kick auf 1 und 3 und Holztrommel auf 2 und 4 (fällt ein Biss darauf, spielt er die Holztrommel), Bass in Quinten, Trommelwirbel vor dem Teilwechsel.
  - Spätere Welten ohne eigenen Song nutzen den Johannisbeer-Song. Neue Instrumente: kalimba, keys (E-Piano); neue Trommeln: snap, shaker, tom, rim.
  - Export im Admin mit Auswahl des Songs; Aufnahmen in `musik/chompillar-*.wav`.
- **Pause → Run beenden:** Ertrag wird gutgeschrieben, ohne Ergebnis-Fenster und ohne Abschluss-Jingle direkt ins Hauptmenü (~0,1 s). Die Hauptmenü-Musik blendet in 0,5 s ein (vorher 1,2 s). "Neu starten" spielt ebenfalls keinen Jingle mehr.

## Umsetzung Stufe 9: Ausdauer mit Grundverbrauch

Rückblick (29.09.2026): Mit Kosten nur pro Biss war die Zahl der Bisse pro Run fest. Tempo-Upgrades machten den Run dadurch nur kürzer, nicht ergiebiger, und Stillstehen kostete nichts. Gleichzeitig stapelten sich Fettreserve und Winterspeck in der Walnuss auf bis zu 685 Ausdauer, sodass die Runs dort auf 1,5 min und mehr wuchsen. Entscheidung Bene: **Grundverbrauch pro Sekunde plus Kosten je Biss nach Härte** ("Aktivität kostet mehr").

- **Grundverbrauch je Welt** (`drain` in `data.js`), läuft auch im Stand: Johannisbeere 0,5/s · Kirsche 0,8/s · Walnuss 2,2/s. Spätere, größere Früchte zehren also stärker.
- **Bisskosten** (härtestes getroffenes Material, auf 70 % der alten Werte gesenkt): Johannisbeere 1,4 · 0,7 · 2,8 · Kirsche 2,8 · 1,05 · 4,9 · Walnuss 1,4 · 4,2 · 1,4. Ein Biss ins Leere kostet 0,2 (vorher 0,5). Zähigkeit/Hornhaut wirken wie bisher nur auf harte Schichten.
- **Fressrausch** kostet weiterhin gar nichts, auch keinen Grundverbrauch. Saftsog gibt nur Bisskosten zurück, nicht den Grundverbrauch.
- **Ausdauer-Knoten:** Fettreserve +10 (vorher +12), Winterspeck +10 (vorher +25). Maximum damit 30 + 100 + 150 + 150 = 430 statt 685.
- **Holzschale** Härte 180 (vorher 250), damit die Walnuss trotz kürzerer Runs nicht später geknackt wird.
- Tempo lohnt sich jetzt: Mehr Bisse pro Sekunde verteilen den Grundverbrauch auf mehr Ertrag.
- Hinweistext beim ersten Run: "Die Ausdauer sinkt mit der Zeit, jeder Biss kostet extra."

**Bot-Simulation** (`werkzeuge/bot-simulation.js`: echter Spielcode in Headless-Chromium; frisst zur Mitte, nach dem Durchbruch zum nächsten Kernpixel; kauft immer das Billigste; Fähigkeiten fest Fressrausch + Saftsog, damit die Läufe vergleichbar sind):

| | vorher | Stufe 9 |
|---|---|---|
| Run 1 | 17 s | 18 s |
| Kirsche frei | nach 15 Runs / 5,5 min | nach 13–15 Runs / 5,2–6,2 min |
| Walnuss frei | nach 28 Runs / 10,6 min | nach 26 Runs / 10,6–10,9 min |
| Runs Johannisbeere / Kirsche | 22–23 s / 23–25 s | 23–28 s / 24–26 s |
| Walnuss geknackt | nach ~12 min Walnuss | nach ~8–9 min Walnuss |
| Runs Walnuss früh → spät | 39 → 92 s | 28 → 60–70 s |

Erträge pro Run bleiben gleich, pro Minute steigen sie in der Walnuss. Getestete Alternativen: Grundverbrauch 1/s in allen Welten (Walnuss-Runs bis 116 s), Walnuss 1,5–1,6/s (Knacken dauerte 12–16 min), 2,5/s mit Holz 160 (Knacken schon nach ~5 min). Die Simulation streut stark je nach Fähigkeit: Mit Säurespucke geht das Knacken deutlich schneller.

## Umsetzung Stufe 10: Sonderstellen

Jede Frucht bekommt genau eine Art Sonderstelle, zufällig gezogen. Sie liegen als eigene Schicht (Schicht 4) im Raster, ihre Werte leiten sich aus der Wirtsschicht der Welt ab (`spHost`: Fruchtfleisch in Johannisbeere und Kirsche, grüne Hülle in der Walnuss). Neue Datei `js/special.js`, Werte in `SPECIAL` in `data.js`.

| Art | Anzahl | Größe | Werte |
|---|---|---|---|
| **Saftblase** | 2–4 | Radius 7,5 % der Frucht (Walnuss ×0,6, weil die Hülle dünn ist) | Härte und Bisskosten wie der Wirt. Beim ersten Anbeißen platzt die ganze Blase ("Plopp!"), der Saft (5-facher Wert der Fläche) fliegt als Tröpfchen zur Raupe und zählt beim Ankommen. Tröpfchen, die am Run-Ende noch unterwegs sind, zählen trotzdem. |
| **Zuckerkristall** | 2–4 | Radius 6 % | 3-fache Härte und doppelte Bisskosten des Wirts, zählt als harte Schicht (Zähigkeit wirkt, Schub stoppt). 12-facher Ertrag je Pixel. Funkelt. |
| **Faulstelle** | 1–2 | Fleck vom Rand nach innen, 15 % breit, bis 55 % (Johannisbeere), 50 % (Kirsche), 70 % (Walnuss, reicht in die Holzschale) | 40 % der Wirtshärte, Ertrag wie der Wirt, kleine Löcher in der Außenschicht. Kerne und Stein bleiben hart. |

- Beim Start steht 2,6 s lang unten im Spielfeld "Diese Johannisbeere hat Saftblasen". Seitenleiste mit Legende und Stand ("1 / 3 geplatzt" bzw. % bei Kristall und Faulstelle), ebenso im Ergebnis-Fenster.
- Klänge: Kristall klackt wie Stein, Blase und Faulstelle schmatzen; neu "Plopp" beim Platzen und ein leises Pling für ankommende Tröpfchen.
- Admin (Testen): Sonderstelle erzwingen (zufällig / Saftblase / Zuckerkristall / Faulstelle / keine).

**Bot-Simulation:** Wer die Sonderstellen gezielt ansteuert, holt 20–39 % des Run-Ertrags direkt aus ihnen (Johannisbeere: Kristalle ~370, Blasen ~200 Saft pro Run). Freischaltungen verschieben sich kaum (Kirsche nach 13–15 Runs, Walnuss nach 23–27). Nebenbefund: Frei im Fruchtfleisch bzw. in der Hülle herumzufressen bringt deutlich mehr Fruchtwährung als der direkte Weg zum Kern (in der Walnuss ein Vielfaches). Das Ansteuern der Sonderstellen verstärkt das; beim Anspielen beobachten.

## Umsetzung Stufe 11: Formen, Walnuss, Brennhaare, neuer Biss

Rückmeldung Bene zu Stufe 10: Faulstellen eher wellig-rund, Kristalle sternförmig, Blasen an der Frucht orientieren; in der Walnuss Kristalle innen und keine Blasen; Brennhaare mit mehr Reichweite; Biss soll nicht überall anknabbern, sondern bei zu wenig Kraft einen kleineren Kegel ganz wegfressen.

- **Saftblase:** hellere, glasige Stelle in der Fruchtfarbe (Adern bleiben sichtbar), weicher Rand, kleiner Glanzpunkt, Radius 10 %.
- **Zuckerkristall:** Stern mit 5–6 Zacken, zwei Facetten je Zacke, dunkle Kante, Radius 11 %.
- **Faulstelle:** wellig-runder Fleck (Radius 20 %), sitzt auf dem Rand (Mitte bei 86–88 % des Radius), dunklerer Saum, Löcher in der Außenschicht. Erfasst nur Außenschicht und Wirt; Kerne, Stein und Holzschale bleiben hart (vorher reichte sie in der Walnuss ins Holz und machte das Knacken zu leicht).
- **Walnuss:** nur Kristalle und Faulstellen (`spKinds`). Kristalle liegen im Nusskern (`spHosts`) und bringen das 4-Fache an Walnusskernen. Keine Saftblasen, bis ein passender Ersatz entschieden ist.
- **Brennhaare:** Reichweite 4,5 + 1 je Stufe (vorher 2,5 + 0,8).

**Neuer Biss (Kraft-Budget):** Jedes Pixel im Bisskegel, das der Biss frei erreicht, bringt seinen Anteil Bisskraft mit (zum Rand hin schwächer, Kaukraft wirkt wie bisher). Ausgegeben wird die Kraft immer am vordersten noch stehenden Pixel, zuerst ein maulgroßer Brocken direkt vor dem Kopf. Reicht die Kraft nicht für den ganzen Kegel, wird ein kleinerer Kegel ganz weggefressen, statt alles anzukratzen. Der Gesamtschaden pro Biss ist gleich wie vorher, er geht nur nicht mehr verloren. Die Bisskosten richten sich nach dem härtesten wirklich getroffenen Pixel.

Weil kein Schaden mehr verpufft, kommt die Raupe etwa doppelt so schnell durch harte Schichten (Messung: Kirschhaut bei Bisskraft 3 in 85 statt 177 s, Holzschale bei Bisskraft 80 in 56 statt 127 s). Ausgleich: **Beerenkerne Härte 210** (vorher 70), **Kirschstein 660** (220), **Holzschale 270** (180). Die Schalen bleiben gleich. Zwei Irrwege dabei: Ein Budget aus dem ganzen Kegel (auch hinter der Wand) war ~10-mal zu stark; reines "nächstes Pixel zuerst" bohrte ein Loch, durch das der Kopf nicht passte.

Säurespucke, Seidenfaden, Wucht und Brennhaare wirken weiter pro Pixel; gegen Kerne, Stein und Holz sind sie durch die höhere Härte etwas schwächer geworden. Mit den Admin-Messwerten beobachten.

Bot (Fressrausch + Saftsog): Durchbruch Johannisbeere Run 2–3, Kerne ab Run 4 (vorher 7–8), Kirsche nach 11–12 Runs (vorher 14–15), Walnuss nach ~30 (vorher 25–27), Walnuss geknackt nach 5–9 min (vorher ~8), späte Walnuss-Runs ~55 s.

## Umsetzung Stufe 12: Kandis-Kristalle, Öltropfen

- **Zuckerkristall** jetzt als Kristallbüschel von oben (Vorbild: Kristallbüschel und Kandis vom Stiel, Bilder von Bene): 9–13 längliche Prismen mit Spitze, strahlenförmig aus der Mitte, dazu 3 kurze, klotzige Brocken obenauf. Zwei Längsfacetten je Prisma, Licht von oben links, heller Grat, dunkle Kante, Bernsteinfarben wie Kandis. Radius 15 %. Ertrag 5-fach je Pixel (vorher 12-fach, die Fläche ist jetzt etwa dreimal so groß); in der Walnuss 1,5-fach Walnusskerne.
- **Saftblasen** unregelmäßig (gestreckt, wellige Kontur), Wert 3,5-fach (vorher 5-fach, größere Fläche).
- **Walnuss: Öltropfen** statt Saftblase (`spOver` in `data.js`), im Nusskern, goldgelb und unförmig. Platzt wie die Saftblase, das Öl fließt als Tropfen zur Raupe und bringt Walnusskerne (1,5-facher Wert der Fläche, ~65 je Tropfen). Die Walnuss hat damit wieder alle drei Arten.

**Warum weniger Runs bis zur Kirsche (Stufe 11)?** Bot mit und ohne Sonderstellen verglichen: Ohne Sonderstellen 12 / 30–31 Runs (Kirsche / Walnuss), mit Sonderstellen, aber ohne sie anzusteuern, ebenfalls 12 / 30–31. Der Unterschied zu vorher (14–15 Runs) kommt also allein vom neuen Biss: Die Beerenkerne werden jetzt stetig abgeknabbert statt erst nach vielen Bissen auf einmal, und nichts geht mehr verloren, wenn der Run endet. Wer die Sonderstellen gezielt ansteuert, ist noch schneller (Kirsche nach 9 Runs, Walnuss nach 18–21), weil er deutlich mehr Fruchtwährung für Upgrades bekommt; die Sonderstellen machen dann 33–44 % des Ertrags in Johannisbeere und Kirsche aus.

## Umsetzung Stufe 13: Sonderstellen über Upgrades

Entscheidung Bene: Sonderstellen werden über Upgrades freigeschaltet, manche Früchte haben keine, die Häufigkeit lässt sich hochrüsten, Faulstellen (bringen weniger als die Schale, die sie ersetzen) lassen sich ausschalten.

- Drei Knoten im Ast Verdauung, als Kette auf der rechten Seite, je 5 Stufen, Kosten × 1,8 je Stufe:

| Knoten | Welt / Währung | Start­kosten | Freischaltung |
|---|---|---|---|
| Faulstellen | Johannisbeere, Beerensaft | 120 | Verdauung 2 |
| Zuckerkristalle | Kirsche, Kirschsaft | 250 | Faulstellen 1 |
| Saftblasen (Walnuss: Öltropfen) | Walnuss, Nussholz | 300 | Zuckerkristalle 1 |

- **Häufigkeit:** Jede Art hat das Gewicht ihrer Stufe, "keine Sonderstelle" hat das feste Gewicht 3 (`SP_NONE`). Beispiele: nur Faulstellen 1 → 25 % der Früchte; alle drei auf 1 → je 17 %, 50 % ohne; alle auf 5 → je 28 %, 17 % ohne. Selten zu Beginn, später gleich verteilt. Der Knoten zeigt "jetzt → danach" als Anteil der Früchte.
- **Ausschalten:** Jeder freigeschaltete Sonderstellen-Knoten hat im Upgrade-Screen einen Knopf "… ausschalten / einschalten" (gespeichert in `save.spOff`); im Baum steht dann "(aus)". Gilt für alle drei Arten, gebraucht wird es vor allem für die Faulstellen.
- Alle Welten können alle drei Arten haben (die Einschränkung der Walnuss ist weg, dort Öltropfen statt Saftblasen).
- Beschriftung der Welt-Ringe im Baum nach links unten verlegt (sonst überdeckt vom Kristall-Knoten).
- Admin: Sonderstelle "nach Upgrades" (Standard) oder eine Art bzw. "keine" erzwingen.

Bot: Kirsche nach 13 Runs, Walnuss nach 32–33, Walnuss geknackt nach ~17 Walnuss-Runs. In der Johannisbeere hat der Bot fast nie Sonderstellen, weil er die Faulstellen erst spät kauft.

## Umsetzung Stufe 14: Gleichmäßige Stufen bei Sonderstellen, Krit aufgeteilt

- **Sonderstellen:** Jede Stufe bringt fest **+5 % der Früchte** (`SP_STEP`), 5 Stufen, also bis 25 % je Art. Alle drei voll ausgebaut: 75 % mit, 25 % ohne Sonderstelle. Ausgeschaltete Arten zählen 0, ihr Anteil geht an "keine" (ersetzt die Gewichtung aus Stufe 13).
- **Krit aufgeteilt** in Chance und Schaden, jeweils 5 Stufen:

| Welt | Krit-Chance | Krit-Schaden |
|---|---|---|
| Johannisbeere | Kritischer Biss: +1 % je Stufe (bis 5 %) | – (Grundschaden 150 %) |
| Kirsche | Krit-Chance II: +1 % je Stufe | Krit-Schaden II: +5 % je Stufe (bis +25 %) |
| Walnuss | Krit-Chance III: +1 % je Stufe | Krit-Schaden III: +5 % je Stufe |

  Maximal 15 % Chance und 200 % Schaden (vorher 30 % und 300 %). Die Chance-Knoten bleiben links am Kiefer-Ast, die Schaden-Knoten hängen rechts an "Scharfe Mandibeln" (Stufe 1). Vorhandene Stufen von Krit/Krit II/Krit III bleiben erhalten, wirken aber nur noch auf die Chance.
- Der schwächere Krit machte die Walnuss deutlich zäher (Knacken nach 12–14 statt ~7 min). Ausgleich: **Holzschale Härte 220** (vorher 270). Bot danach: Kirsche nach 13 Runs, Walnuss nach 33–34, Walnuss geknackt nach 5–7 min.

## Umsetzung Stufe 15: Magen und Darm (Plinko), Grundversion (ersetzt durch Stufe 16)

Rückmeldung Bene nach dem Anspielen: zu viele Bälle auf einmal, kein Überblick, am Ende nur ein Durchschnittswert. Außerdem wurde der Darm als Pflicht-Station bei 10 Früchten zur Maut. Neu gedacht in Stufe 16.

Idee Bene (29.09.2026): Nahrungsaufnahme als eigene kleine Mechanik. Ablauf **Fressen → Magen → Darm-Plinko**, ohne Neustart und ohne Prestige. Man kann mehrere Runs hintereinander fressen und erst dann verdauen. Das Plinko soll Spaß machen und darf dauern; wer viel frisst, bekommt viele Brocken.

- **Magen:** Die Fruchtwährung eines Runs wird nicht mehr direkt gutgeschrieben, sondern landet im Magen (`save.gut`, je Welt; Anteil aus Zuckerkristallen getrennt). Die **Kernwährung geht weiter direkt** aufs Konto, damit das Freischalten der Welten unberührt bleibt. Ergebnis-Fenster: "Verdauen (n Brocken)", "Noch ein Run", "Upgrades". Im Upgrade-Screen zeigt ein Kasten, was im Magen liegt.
- **Darm-Screen** (`js/gut.js` Physik ohne Seite, `js/darm.js` Screen): Der Magen gibt die Brocken durch den **Pförtner** in den Darm. Den Pförtner lenkt man mit Maus, Finger oder Pfeiltasten/A/D, sonst pendelt er. Jede **Zotte**, die ein Brocken berührt, gibt +x % auf seinen Wert (leuchtet, wackelt, Ton steigt mit jeder Berührung). Unten 7 **Schalen** ×0,5 · ×0,85 · ×1,1 · ×0,85 · ×1,1 · ×0,85 · ×0,5 (außen Ausscheidung). Brocken stoßen sich gegenseitig an. "Rest sofort verdauen" rechnet den Rest mit derselben Physik ohne Zeichnen.
- **Zahl der Brocken** = 3 · √Menge (höchstens 2500), Kristall-Brocken 0,8 · √Menge. 500 Beerensaft ≈ 67 Brocken, 5.000 ≈ 212.
- **Zucker-Kristall-Brocken:** größer, bernsteinfarben, zerbrechen an den ersten beiden Zotten in zwei Hälften, die getrennt weiter Zotten sammeln (im Schnitt 5–12 % mehr als normale Brocken).
- **Lücken:** Am Anfang fehlen Zotten (nie in der obersten Reihe, nie am Rand, nie zwei übereinander, sonst entsteht ein freier Schacht, der ohne Berührung in eine gute Schale führt).
- **Darm-Upgrades** (stehen im Darm-Screen, nicht im Baum, wirken für alle Früchte):

| Knoten | Welt / Währung | Wirkung | Stufen, Kosten |
|---|---|---|---|
| Enzyme (aus dem Baum verschoben) | Johannisbeere | +5 % je Zotte, +2 %-Punkte je Stufe (bis +25 %) | 10, 300 × 1,75 |
| Zottenwuchs | Johannisbeere | Lücken 40 % → 0 %, 42 → 53 Zotten bei 7 Reihen | 5, 200 × 1,9 |
| Peristaltik | Johannisbeere | 3 → 12 Brocken/s (Komfort, kein Ertrag) | 9, 25 × 1,55 |
| Darmschlinge | Kirsche | 7 → 10 Zottenreihen | 3, 300 × 2,2 |

- **Balance:** Enzyme wirkten vorher nur in der Johannisbeere (+30 % je Stufe, bis ×7 zusammen mit Verdauung). Der Darm bringt am Anfang im Schnitt **×1,0** (kalibriert mit pendelndem Pförtner, ~4,8 Berührungen je Brocken). Mit Enzyme 10 etwa ×1,7, damit kommt die Johannisbeere wieder auf rund ×7. Alles voll ausgebaut etwa ×2,5, für alle Früchte (Eskalation; kostet viel Beerensaft, also Zurückkehren). Gezieltes Lenken bringt je nach Brett 5–20 % mehr als das Pendeln.
- Admin: Abschnitt "Magen" (füllen, Kristall-Brocken, leeren, sofort verdauen). Spielstände ohne Magen laden normal, vorhandene Enzyme-Stufen bleiben und wirken jetzt im Darm.

**Bot-Simulation** (verdaut nach jedem Run den ganzen Magen sofort; `noDigest` schaltet das ab):

| | vorher (heute gemessen) | Stufe 15 |
|---|---|---|
| Kirsche frei | nach 12 Runs | nach 13–14 Runs |
| Walnuss frei | nach 32–33 Runs | nach 34–36 Runs |
| Walnuss-Zeit bis zum ersten Run mit ≥ 100 Walnusskernen | 12–15 min | 11–16 min |
| Verdaut / gefressen | – | ~1,0 früh, ~1,05 später |

Der Bot kauft immer das Billigste und damit auch Peristaltik und Zottenwuchs, die in der Johannisbeere wenig bringen, Enzyme dagegen fast nie (wie vorher). Wer Enzyme kauft und zielt, ist schneller.

Offen für die nächsten Schritte: Schleimhautfalten (bessere Schalen), Goldzotten, Darm-Knoten für jede weitere Welt (bei ~10 geplanten Früchten), Verpuppung und Schmetterling als eigene Minispiele (ohne Neustart).

## Umsetzung Stufe 16: Darm als Nebenschiene (Falten, Zotten, Blinddarm) (Brett ersetzt durch Stufe 17)

Rückmeldung Bene: Nährstoff-Zotten und Blinddarm praktisch nicht zu treffen, unklar, was die Knoten bringen. Danach Prototypen ausprobiert (Ordner `prototypen/`): Rhythmus-Peristaltik und Zotten-Förderband verworfen, Plinko mit selbst gesetzten Zilien für gut befunden. Wirtschaft (Portionen, Magen, Umwandlung in die eigene Welt) bleibt aus Stufe 16.

Vorher recherchiert, was gute Plinko-/Pachinko-/Peggle-Spiele ausmacht: eine Entscheidung, die zählt (Zielen); Ziele auf dem Brett; seltene große Momente; kurze Runden; Wert statt Menge; Nebenspiele bleiben freiwillig. Entscheidungen Bene (29.09.2026): Nebenschiene, kurze Runden mit wenigen Brocken, Darm-Nährstoffe werden nur in die Währung der eigenen Welt umgewandelt, der Magen füllt sich mit einem festen Anteil von allem. Kein pyramidales Brett, sondern nah am echten Darm.

- **Wirtschaft:** Die Fruchtwährung geht wieder **direkt aufs Konto** (wie vor Stufe 15). Zusätzlich legt jeder Run eine **Portion Nahrungsbrei** in den Magen: 25 % der gefressenen Fruchtwährung (`GUT.share`), Anteil aus Zuckerkristallen getrennt. Der Magen fasst **5 Portionen** (`GUT.cap0`), dann "Magen voll", weitere Runs legen nichts mehr hinein. Enzyme sind wieder im Baum (wie vor Stufe 15).
- **Brett nach dem Dünndarm:** Ringfalten (Kerckring-Falten) ragen von beiden Wänden hinein und fallen zur Öffnung ab, obendrauf die Zotten. Die Öffnung wandert von Reihe zu Reihe (mindestens 90 breit versetzt). Am Anfang **5 Faltenreihen**. Unten der Boden mit dem Übergang zum **Dickdarm** in der Mitte (Rest wird ausgeschieden) und einer kleinen Grube für den **Blinddarm** nahe einer Wand (Seite je Runde zufällig): Wer hineinfällt, dessen Rest zählt ×2. Jede Runde ein neues Brett.
- **Wert = Aufnahme statt Strecke:** Jeder Brocken trägt Nährstoffe. Jeder Kontakt mit den Zotten nimmt einen Teil dessen auf, was noch drin ist: ein Schlag beim Aufprall, laufend beim Gleiten. Der Brocken wird dabei sichtbar leerer (Kern schrumpft). Mehr als alles geht nicht. Am Ende jedes Brockens steht, was er gebracht hat und wie viel Prozent aufgenommen wurden.
- **Brockenarten je Frucht** (`GUT.types`): Beere klein und sprunghaft, Kirsche schwer, der Stein zerbricht beim ersten harten Aufprall in zwei Hälften, Walnuss als Öltropfen, der kaum springt und langsam an den Falten entlanggleitet. Zuckerbrocken aus Zuckerkristallen. **Kalibriert** (`werkzeuge/darm-kalibrierung.js`): Jede Art nimmt bei zufälligem Pförtner im Schnitt knapp 50 % auf. Die Unterschiede liegen in der Streuung, nicht im Schnitt:

| Art | Schnitt | Streuung | bester Pförtner-Platz | Blinddarm |
|---|---|---|---|---|
| Beerenbrocken | 47 % | hoch (0,27) | 61 % | 5 % |
| Kirschbrocken | 49 % | mittel (0,16) | 55 % | 4 % |
| Öltropfen | 50 % | niedrig (0,09) | 56 % | 0 % |
| Zuckerbrocken | 47 % | hoch (0,24) | 58 % | 4 % |

- **Runde:** Jede Portion wird zu 3 Brocken (plus ein Zuckerbrocken, wenn Kristalle gefressen wurden), bei vollem Magen also etwa 15. **Einwurf per Klick/Leertaste**, einzeln, am Pförtner (Maus, Finger, Pfeiltasten/A/D). "Rest automatisch einwerfen" wirft alle 0,9 s einen, der Pförtner pendelt. Ein Brocken braucht etwa 9 s bis unten.
- **Nährstoff-Zotten:** 3 goldene Zotten je Brett, frei unter einer Öffnung, leicht versetzt. Jede nimmt beim ersten Kontakt eines Brockens 20 % dessen auf, was noch drin ist. Leuchten alle drei: **Verdauungsrausch** mit Zeitlupe, Klang und doppelter Aufnahme für den Rest der Runde (bei zufälligem Pförtner in etwa jeder zweiten Runde).
- **Umwandeln:** Am Ende der Runde (oder beim Verlassen) werden die Nährstoffe in die Fruchtwährung der eigenen Welt umgewandelt. Wer mitten in der Runde geht, bekommt den Rest als Portion zurück in den Magen.
- **Darm-Upgrades** (im Darm-Screen, wirken für alle Früchte):

| Knoten | Welt | Wirkung | Stufen, Kosten |
|---|---|---|---|
| Längere Zotten | Johannisbeere | Aufnahme +15 % je Stufe | 5, 150 × 1,9 |
| Darmflora | Johannisbeere | 1 Nährstoff = +10 % Währung je Stufe | 10, 120 × 1,7 |
| Dehnbarer Magen | Kirsche | +1 Portion (5 → 8) | 3, 200 × 2,2 |
| Darmschlinge | Kirsche | +1 Faltenreihe (5 → 7) | 2, 400 × 2,5 |

- Umzug von Stufe 15: Reste im alten Magen werden gutgeschrieben, Peristaltik und Zottenwuchs (alt) erstattet, Darmschlinge auf höchstens 2.
- Admin, Abschnitt Magen: füllen, Portion mit Zucker, leeren, sofort verdauen.

**Bot-Simulation** (verdaut, sobald der Magen voll ist, Pförtner pendelt):

| | ohne Darm (heute gemessen) | Stufe 16 |
|---|---|---|
| Kirsche frei | nach 12 Runs | nach 12–13 Runs |
| Walnuss frei | nach 32–33 Runs | nach 33 Runs |
| Walnuss-Zeit bis zum ersten Run mit ≥ 100 Walnusskernen | 12–15 min | 9–14 min |

Der Darm bringt dem Bot etwa 15–25 % zusätzliche Fruchtwährung, kostet ihn aber auch Käufe. Getestet: Anteil 30 % (Walnuss knackt nach 8–13 min), 20 % (9–14 min); gewählt 25 %.

Ideen für später: mehr Brockenarten für jede neue Frucht (je eine eigene Eigenschaft), weitere Sonderzotten (Enzymdrüse, Bakterien-Kolonie mit Multiball), Peristaltik-Welle als aktive Fähigkeit im Darm, Sättigung (voller Magen gibt im nächsten Run Ausdauer).

## Umsetzung Stufe 17: Darm-Plinko mit Zilien (aus dem Prototyp `prototypen/darm-plinko.html`)

- **Brett:** Freies Feld mit Flimmerhärchen an beiden Wänden (Welle nach unten, nur Anzeige). Oben der **Magensack** mit Speiseröhre und Falten; die Brocken liegen darin als Haufen, der Brocken am Ausgang ist markiert und kommt als Nächstes. Vom Ausgang (Pylorus) führt ein **Schlauch** mit Muskelringen zum **Pförtner**, der als Schließmuskel in der Darmdecke sitzt. Beim Einwerfen rutscht der Brocken sichtbar durch den Schlauch (0,55 s).
- **Selbst gestellt:** Pförtner und **Zilien** werden angefasst und gezogen, auch mitten in der Runde. Am Anfang **3 Zilien**. Zilien halten Abstand zur Wand (Spalt breiter als der dickste Brocken, sonst klemmt er) und zueinander (die Härchen berühren sich nicht). Einwerfen: Klick auf den Magen, Leertaste oder "Rest automatisch einwerfen" (alle 0,9 s).
- **Treffer:** Zilien sind federnde Büschel. Eine Zilie gibt einem Brocken höchstens **3, dann 2, dann 1 Punkt**, danach nur weiche Abpraller. Der Abprall der Beere ist gedeckelt auf etwa 5 Zilienradien. Jeder Brocken bringt mindestens 1 Punkt.
- **Ausgänge unten** (anatomisch: Aufnahmewege und Weiterweg): Pfortader ×1,5 (Blut zur Leber), Lymphgefäß ×1,3 (für Walnussöl ×2, Fett geht über die Lymphe), Blinddarm ×2 (schmal, mit Wurmfortsatz), Dickdarm ×1.
- **Früchte unterschiedlich:** Beere klein und leicht, springt voll ab; Kirsche groß und schwer, springt halb so weit; Walnussöl als Tropfen, zäh, haftet an der Zilie und läuft um sie herum. Also braucht jede Frucht eigentlich ihre eigene Stellung.
- **Kein Zufall:** feste Schrittweite (1/240 s), kein Zufallsschubs beim Einwurf. Gleiche Frucht + gleiche Stellung = gleicher Weg. Liegt ein Brocken genau auf der Kuppe einer Zilie oder bleibt fast stehen, schieben ihn die Härchen fest definiert zur Seite.
- **Ertrag:** Brocken trägt die Nährstoffe seiner Portion (Portion / 3, Zuckerkristalle machen ihn nahrhafter). Ertrag = Nährstoffe × Punkte / **14** × Darmflora, sofort in der Währung seiner Welt. Mit der Grundstellung bringt ein zufälliger Pförtner im Schnitt 2,5 bis 3 Punkte, die beste Pförtner-Stelle 10,5 (Beere), 19,5 (Kirsche), 14 (Walnuss); durch Umstellen der Zilien geht mehr.
- **Stellung wird gespeichert** (`save.gutLay`): die zuletzt benutzte für alle Früchte. **Gedächtnis** (Upgrade) merkt sich eine Stellung je Frucht: Beim Einwurf gleiten Pförtner und Zilien in die Stellung der Frucht, die als Nächstes kommt; gespeichert wird die Stellung, mit der ein Brocken dieser Frucht geworfen wurde.
- **Darm-Upgrades:**

| Knoten | Welt | Wirkung | Stufen, Kosten |
|---|---|---|---|
| Mehr Zilien | Johannisbeere | +1 Zilie (3 → 5), erscheint an freier Stelle | 2, 250 × 3 |
| Darmflora | Johannisbeere | +10 % Ertrag je Stufe | 10, 120 × 1,7 |
| Dehnbarer Magen | Kirsche | +1 Portion (5 → 8) | 3, 200 × 2,2 |
| Gedächtnis | Kirsche | eine Stellung je Frucht | 1, 600 |

- Umzug von Stufe 16: Längere Zotten und Darmschlinge werden erstattet und entfernt. Magen, Portionen und Admin-Abschnitt bleiben.
- `werkzeuge/darm-kalibrierung.js` zeigt Punkte je Frucht und Pförtner-Stelle; die Bot-Simulation verdaut bei vollem Magen mit der besten Pförtner-Stelle je Frucht (Option `randomPf` für zufällig).

**Bot-Simulation:**

| | ohne Darm | Stufe 17, beste Pförtner-Stelle | Stufe 17, Pförtner zufällig |
|---|---|---|---|
| Kirsche frei | nach 12 Runs | nach 12–13 Runs | nach 13 Runs |
| Walnuss frei | nach 32–33 Runs | nach 30–32 Runs | nach 34 Runs |
| Walnuss-Zeit bis ≥ 100 Walnusskerne in einem Run | 12–15 min | 10–10,5 min | 16,5 min |

Offen: mehr Brockenarten für neue Früchte (jede mit eigener Eigenschaft), Balance der Darm-Upgrades beim Anspielen, eventuell Sonderzilien.

## Plan: Pflaume, Apfel, Kürbis, Darm-Ausgänge, wachsende Raupe (entschieden 01.10.2026)

### Neue Früchte

| Frucht | Aussehen | Schichten | Wendung |
|---|---|---|---|
| **Pflaume** | dunkles Blauviolett mit weißlichem Wachsreif, goldgelbes Fruchtfleisch, leicht oval mit Bauchnaht | Haut, Fruchtfleisch, Stein (flach, länglich, mit scharfer Kante) | Die **Naht** ist eine weiche Linie durch die Haut (immer da, anders als Faulstellen). Der Stein ist **steinlösend**: Er liegt lose in einem schmalen Hohlraum und lässt sich von allen Seiten anknabbern. |
| **Apfel** | Querschnitt: dünne rot-grüne Schale, cremeweißes Fruchtfleisch, fünfzackiges Kerngehäuse mit fünf Kammern | **vier**: Schale, Fruchtfleisch, Kerngehäuse (Pergament, härter als das Fleisch, bringt aber nicht mehr Fruchtwährung), Kerne (hart, Kernwährung) | Angefressenes Fruchtfleisch wird nach ein paar Sekunden **braun** (nur Optik). |
| **Kürbis** | orange, gerippter Rand, festes Fruchtfleisch, innen Hohlraum mit Fasern und vielen flachen weißen Kernen | vier: Schale, Fruchtfleisch, Fasern (sehr weich, bringen fast nichts), Kerne (hart, Kernwährung) | Die Mitte ist größtenteils leer. Die Kerne liegen verstreut in den Fasern. Erste richtig große Frucht. |

### Darm: verdeckte Ausgänge

- Jede Brockenart hat einen **richtigen Ausgang** (×2,5; Pflaume ×1,6, weil der Dickdarm breit ist; Apfel ×3, weil der Blinddarm schmal ist), alle anderen zählen ×1. Die Multiplikatoren stehen **nicht mehr am Brett**, man findet sie heraus. Der Blinddarm verliert sein ×2 für alle.
- Rückmeldung: Der richtige Ausgang leuchtet kräftig auf und klingt anders. Beim ersten Mal erscheint „Entdeckt!“, und in der Darm-Seitenleiste steht ab dann z. B. „Walnussöl → Lymphgefäß“ mit einem kurzen echten Fakt. Noch nicht entdeckte Brockenarten stehen dort mit „?“.

| Brocken | Eigenschaft | Richtiger Ausgang | Warum (echt) |
|---|---|---|---|
| Beere | klein, springt voll ab | Pfortader | Fruchtzucker und Vitamin C sind wasserlöslich, gehen ins Blut zur Leber |
| Kirsche | groß, schwer | Pfortader | Zucker, Farbstoffe (Anthocyane) |
| Walnussöl | zäh, haftet an der Zilie | Lymphgefäß | Fett wird als Chylomikronen über die Lymphe aufgenommen |
| **Pflaume** | **glitschig**: fällt schnell, kaum Reibung, prallt flach und schräg ab | Dickdarm | Sorbit und Ballaststoffe ziehen Wasser in den Dickdarm (abführend) |
| **Apfel** | **quillt**: wird mit jedem Zilientreffer größer und schwerer, springt immer weniger | Blinddarm | Pektin wird von Bakterien vergoren |
| **Kürbis** | **platzt** beim ersten Zilientreffer in 5 Kerne, die einzeln Punkte sammeln | Lymphgefäß | Beta-Carotin ist fettlöslich, die Kerne sind ölig |

- **Gallen-Zilie** (Darm-Upgrade, bezahlt mit Nussholz, erscheint ab der Walnuss): eine zusätzliche, grüne Zilie, die man wie die anderen stellt. Fett-Brocken (Walnussöl, Kürbis), die sie berühren, sind **emulgiert**: Sie haften nicht mehr und springen besser ab, sammeln also mehr Treffer. Kein eigener Multiplikator, das Lymphgefäß zählt unabhängig von der Galle. (Echt: Gallensäuren zerteilen Fett in feine Tröpfchen; die Galle mündet zusammen mit der Bauchspeicheldrüse direkt hinter dem Magenpförtner.)

### Raupe wächst mit (Larvenstadien) und mitlaufende Kamera

- Mit jeder freigeschalteten Welt häutet sich die Raupe ins nächste **Larvenstadium** (L1 Johannisbeere bis L6 Kürbis). In der neuesten Welt ist alles wie bisher. In früheren Früchten ist die Raupe größer, und zwar im Verhältnis der Fruchtradien im Raster (die schon mit der Wurzel der echten Größe gestaucht sind): Ab dem Kürbis ist sie in der Johannisbeere gut 6-mal so groß und frisst die Beere fast in einem Biss. Die Raupe wächst damit etwas langsamer als die echten Früchte; spätere Früchte wirken größer.
- **Kamera:** Passt die Frucht nicht mehr ins Bild (ab Pflaume, deutlich bei Apfel und Kürbis), folgt die Kamera dem Kopf. Bei größerem Larvenstadium zoomt sie etwas heraus, sodass man sieht, wie groß die Raupe geworden ist.

### Werte

Härte, Kosten, Grundverbrauch und Freischaltkosten werden mit der Bot-Simulation vorjustiert. Neue Upgrade-Ringe 5–7 (Kiefer, Krit-Chance, Krit-Schaden, Ausdauer, Verdauung, Tempo und je ein bis zwei weitere). Songs für die neuen Welten folgen später, bis dahin läuft der Song der Johannisbeere.

## Umsetzung Stufe 18: Pflaume, Apfel, Kürbis, verdeckte Ausgänge, Larvenstadien, Kamera

Umgesetzt nach dem Plan oben. Abweichungen und Werte:

- **Biss-Fix vorher (01.10.2026):** Die Bisskraft bleibt nach Herkunftsschicht getrennt und läuft nur in gleich harte oder weichere Pixel über. Vorher schob weiches Fruchtfleisch seinen ganzen Überschuss in einen angrenzenden Kern (bei der Kirsche etwa 2,6-facher Schaden am Stein). Weil die Kerne dadurch bisher heimlich mitbezahlt wurden, kam die Kirsche nach dem Fix erst nach 19 statt 12 Runs. Ausgleich: **Beerenkerne Härte 90** (vorher 210), **Kirschstein 500** (660).
- **Schichten:** Eine Frucht kann jetzt bis zu vier Schichten haben. Die Sonderstellen liegen dafür als Schicht 9 im Raster (`SPK`), nicht mehr als Schicht 4.
- **Werte der neuen Welten** (Härte / Bisskosten):

| Welt | R | Grundverbrauch | Schichten | Freischalten |
|---|---|---|---|---|
| Pflaume | 193 | 3,0/s | Haut 260 / 4,2 · Fruchtfleisch 28 / 1,6 · Stein 2600 / 7 | 300 Walnusskerne |
| Apfel | 232 | 3,6/s | Schale 700 / 5 · Fruchtfleisch 70 / 2 · Kerngehäuse 2500 / 4 (Ertrag 0,1 statt 0,15) · Kerne 8000 / 9 | 1500 Pflaumensteine |
| Kürbis | 486 | 4,5/s | Schale 900 / 6 · Fruchtfleisch 220 / 2,5 · Fasern 15 / 1 · Kerne 20000 / 9 (0,2 Kürbiskerne je Pixel) | 1200 Apfelkerne |

- **Upgrade-Ringe 5–7** je Welt: Kiefer (+25 / +70 / +200 Bisskraft), Krit-Chance IV–VI, Krit-Schaden IV–VI, Ausdauer (+15 / +20 / +30), Verdauung der Welt, Takt IV–VI; dazu Backentaschen (Pflaume), Diamantmandibeln und Panzerhaut (Apfel), Riesenschlund und Segment IV (Kürbis). Fähigkeiten-Knoten der neuen Ringe kosten 1500 / 3000 Fruchtwährung als Grundpreis.
- **Apfel braun:** Freigelegtes Fruchtfleisch (auch schräg benachbart) wird nach 2–3,5 s braun.
- **Darm:** Brockenarten Pflaume (glitschig: Schwerkraft ×1,35, flacher Abprall, behält die Seitwärtsbewegung), Apfel (quillt je Treffer von Radius 6,5 bis 10,5, springt dabei bis auf 40 % ab), Kürbis (platzt beim ersten Treffer in 5 Kerne, die die bisherigen Punkte und je ein Fünftel der Nährstoffe übernehmen). Die Ausgänge zeigen keine Faktoren mehr. Der richtige Ausgang leuchtet und klingt; beim ersten Mal „Entdeckt!“, die Seitenleiste listet alle Früchte mit „?“ oder Ausgang und Fakt (`save.gutFound`). Gallen-Zilie: Darm-Upgrade für 900 Nussholz, grün, erste freie Stelle unter dem Pförtner, wird mit der Stellung gespeichert (`gutLay.g`). Sie zählt auch als normale Zilie.
- **Kalibrierung** (Grundstellung, 3 Zilien): Schnitt bei zufälligem Pförtner 2,4–3,2 Punkte für alle Arten. Die Pflaume landet bei 70 % der Pförtner-Stellen im Dickdarm, darum nur ×1,6. Mit Gallen-Zilie steigt das Walnussöl bei 5 Zilien von 4,0 auf 4,5 Punkte im Schnitt (bester Wert 17,5 → 22,5).
- **Larvenstadium:** Größe der Raupe = Fruchtradius der neuesten Welt / Fruchtradius der gespielten Welt (Kürbis frei: Johannisbeere ×6,2, Kirsche ×4, Walnuss ×2,8). Maul, Schritt, Brennhaare, Schub, Säurespucke und Seidenfaden wachsen mit. Mit allen frühen Upgrades ist die Johannisbeere ab dem Kürbis in 5 Bissen weg. Die Raupe darf dann auch über den Rand des Rasters hinaus.
- **Kamera:** zeigt bis zu 450 Rasterpixel in der Breite (Kirsche und Walnuss bleiben ganz im Bild), folgt sonst dem Kopf. Im höheren Larvenstadium zoomt sie mit der Wurzel der Raupengröße heraus. Hochgeladen wird nur der sichtbare Ausschnitt des Rasters (der Kürbis hat 1,2 Mio. Pixel).
- **Bot-Simulation** (Fähigkeiten fest, verdaut bei vollem Magen): Kirsche nach 13 Runs (5 min), Walnuss nach 32 (12,5–13 min), Pflaume nach 55–60 (23–26 min), Apfel nach 81–84 (35–37 min), Kürbis nach 104–105 (49–51 min). Im Kürbis frisst ein Run anfangs nur 1–2 % jeder Schicht; er ist als Landschaft gedacht.
- Noch offen: eigene Songs für Pflaume, Apfel und Kürbis (bis dahin der Song der Johannisbeere); der Upgrade-Baum wird mit sieben Ringen außen eng, die Beschriftungen überlappen teils.

## Plan: Setzkasten und Fressbuch (Sonderstellen umgesetzt in Stufe 10)

Ziel: Im Run gibt es etwas anzusteuern, und es gibt Langzeitziele ohne Prestige. Reihenfolge der Umsetzung: Sonderstellen → Setzkasten → Fressbuch → danach neue Früchte.

### Sonderstellen (Ertrag)

Jede Welt kann alle drei Arten haben (auch die Johannisbeere), aber **nie mehrere Arten gleichzeitig** (entschieden): Eine Frucht hat genau eine Art, zufällig gewählt, dafür 2–4 Stück davon. Beim Start blendet der Run kurz ein, was diese Frucht hat ("Diese Beere hat Zuckerkristalle"). Vorschlag: Jede Frucht hat eine Art (nicht nur manche), damit das Steuern immer ein Ziel hat.

| Art | Wo | Wirkung |
|---|---|---|
| **Saftblase** | im Fruchtfleisch | Platzt beim ersten Anbeißen; Tröpfchen fliegen von selbst zur Raupe und zählen als Ertrag (etwa das 30-Fache der Fläche an normalem Fruchtfleisch). |
| **Zuckerkristall** | im Fruchtfleisch, eher tief | Härter als das Fruchtfleisch (etwa Schalenhärte), glitzert, bringt etwa das 10-Fache je Pixel. |
| **Faulstelle** | vom Rand nach innen | Braune, weiche Zone, dazu kleine Lücken in der Schale. Eine Abkürzung nach innen, bringt normalen Ertrag. |

Werte später per Simulation, Häufigkeit und Größe mit der Fruchtgröße skalieren.

### Setzkasten (Fundstücke / Relikte)

- Im Menü hängt ein **Holzkasten mit Fächern**, eine Reihe pro Welt. Leere Fächer zeigen ein "?", man sieht also, wie viele es gibt.
- **4–5 Fundstücke pro Welt.** In der Frucht ist nur eine **funkelnde Stelle** zu sehen, nicht was es ist. Freigelegt wird sie wie normales Material. Erst am Run-Ende wird enthüllt, was es war (eigene kleine Enthüllung im Ergebnis-Fenster), dann wandert es in den Setzkasten.
- **Häufigkeit (entschieden):** Jede Frucht hat mit **10 % Wahrscheinlichkeit** eine funkelnde Stelle, reines Glück, keine Garantie und kein Mitleidszähler. **Ausnahme: das allererste Fundstück ist gesetzt** und kommt sicher in der Johannisbeere, bevor man die Kirsche freischalten kann (Vorschlag: im 5. Run, zu dem Zeitpunkt ist die Schale meist schon durchbrochen; die Stelle liegt gut erreichbar im Fruchtfleisch). Welches Fundstück in einer Frucht liegt, wird zufällig aus den noch fehlenden der Welt gezogen. Nicht mitgenommene Funde verfallen mit der Frucht. Sind alle Fundstücke einer Welt gefunden, erscheinen dort keine mehr. Bei ~13 Runs pro Welt im ersten Durchgang findet man im Schnitt 1–2, den Rest beim Zurückkehren.
- **Wirkung:** passiv und **immer aktiv**, keine Plätze zum Auswählen (entschieden). Ertragsboni gelten für **alle Fruchtwährungen** (z. B. "+8 % Saft aller Früchte"), nicht nur für die eigene Welt. Einige Fundstücke ändern das Verhalten, statt nur Zahlen zu erhöhen.
- **Veredeln:** Jedes Fundstück hat Stufe 1–3, bezahlt mit der Kernwährung seiner Welt. Damit bekommen auch die Walnusskerne eine Verwendung.
- Jedes Fach zeigt Name, Bonus und einen kurzen echten Fakt (das Thema ist echte Raupen- und Obstbiologie).

Entwurf der Fundstücke (Namen und Boni noch offen):

| Welt | Fundstück | Echt | Bonus (Stufe 1) |
|---|---|---|---|
| Johannisbeere | Blütenrest | der vertrocknete Blütenstern an der Beere | +8 % Saft aller Früchte |
| Johannisbeere | Tautropfen | – | −8 % Grundverbrauch |
| Johannisbeere | Honigtau | Ausscheidung der Blattläuse auf Johannisbeeren | Sonderstellen bringen +25 % |
| Johannisbeere | Glasflügler-Schuppe | Johannisbeer-Glasflügler, dessen Raupe sich in die Triebe bohrt | +15 % Schaden an der Außenschicht |
| Johannisbeere | Rispenstiel | Johannisbeeren wachsen an Rispen | +1 Segment |
| Kirsche | Kirschmade | Larve der Kirschfruchtfliege, ein "Mitbewohner" | Jeder 5. Biss beißt ein zweites Mal daneben mit |
| Kirsche | Kirschgummi | Harztropfen an Kirschbäumen | Aktive Fähigkeit wirkt 20 % länger |
| Kirsche | Vogelpick | Vögel picken reife Kirschen an | Jede Frucht startet mit einem Loch in der Haut |
| Kirsche | Kirschstiel | – | +25 % Krit-Schaden |
| Walnuss | Juglon-Fleck | brauner Farbstoff der Walnusshülle | Material rund um den Kopf wird bei jedem Biss 15 % weicher |
| Walnuss | Eichhörnchen-Zahnspur | – | Die Holzschale hat einen Riss |
| Walnuss | Nussöl | Walnüsse sind sehr fettreich | −10 % Grundverbrauch |
| Walnuss | Krähenfeder | Krähen lassen Walnüsse fallen, damit sie platzen | Harte Schichten −10 % Härte |

Später passen z. B. Pflaumenwickler (Pflaume) und Apfelwickler ("der Wurm im Apfel").

### Fressbuch (Meilensteine)

- Eigener Menüpunkt. **Alle Einträge sind von Anfang an sichtbar** (was es gibt und was es bringt), erreichte sind abgehakt.
- Die Schwellen sind so gesetzt, dass sie in zähe Phasen fallen, nicht in die schnellen. Beispiel "Hartnäckig": 8 Runs in einer Welt ohne Durchbruch → +10 % Schaden an deren Außenschicht. Dazu gesammelte Mengen (Kerne gesamt, Pixel gesamt), Ratzeputz pro Welt, alle Fundstücke einer Welt.
- Kunststücke für Rückkehrer: "Durchbruch in einem Biss", später "ganze Frucht in einem Biss" (wenn man stark gewachsen zu einer alten Frucht zurückkommt).
- **Boni klein und dauerhaft**, nie auf Ausdauer (sonst werden die Runs wieder länger): Saft aller Früchte, Krit, Bisskraft in %, Fundchance.

## Plan: weicherer Kontrast im Hauptmenü (noch nicht umgesetzt)

Beobachtung (heller und dunkler Modus): Die härtesten Kontraste sind der fast schwarze (dunkel: fast weiße) Knopf "Nächster Run", die dicken dunklen Äste auf hellem Grund, die satten roten Ringe um jeden kaufbaren Knoten und der harte Schnitt beim Wechsel zwischen Run und Menü.

Mögliche Bausteine:

1. **Hintergrund mit Verlauf:** radial von der Raupe in der Baummitte (heller, leicht warm) nach außen weicher auslaufend, Karte und Seitenleiste gehen weicher in den Hintergrund über (weniger Kante, leichter Schatten statt Linie).
2. **Äste mit Verlauf:** innen kräftig, nach außen blasser und dünner; gekaufte Äste in einem gedeckten Grün statt fast Schwarz.
3. **Knoten ruhiger:** kaufbar = sanftes Leuchten statt harter roter Ring; Farben gedeckter.
4. **Knöpfe:** nur "Kaufen" bleibt der starke Akzent. "Nächster Run" bekommt einen weicheren Farbverlauf in Weltfarbe statt Schwarz/Weiß.
5. **Stimmung je Welt:** Das Menü tönt sich leicht passend zur gewählten Welt (Johannisbeere rötlich, Kirsche dunkelrot, Walnuss braun-grün), beim Weltwechsel fließend überblendet.
6. **Übergang Run ↔ Menü:** kurze Überblendung (~0,3 s) statt hartem Schnitt, z. B. die Frucht blendet aus und der Baum zoomt leicht herein.

Offen: welche Bausteine Bene will (reine Farben/Verläufe 1–5, die Animation 6 oder beides).

## Veröffentlichung (Stand der Prüfung: 29.09.2026)

Ziel Bene: für ein paar Euro auf itch.io, evtl. weiteren Seiten und Steam anbieten. Den Namen als Marke eintragen lassen ist nicht geplant, er soll aber frei sein. (Keine Rechtsberatung, vor dem ersten Verkauf ggf. Steuerberater fragen.)

**Plattformen**

| | itch.io | Steam |
|---|---|---|
| Kosten | keine | 100 $ je Spiel (zurück ab 1.000 $ Umsatz) |
| Anteil der Plattform | frei wählbar 0–100 %, Standard 10 %, plus Zahlungsgebühr (0,30 $ + 2,9 %) | 30 % |
| Umsatzsteuer | "Collected by itch.io": itch führt sie ab | Valve führt sie ab |
| Format | HTML-Spiel direkt als ZIP hochladen, läuft im Browser | Desktop-Programm nötig: Spiel in Electron, NW.js oder Tauri verpacken |
| Wartezeiten | keine; Auszahlung ab 5 $, Prüfung ~10–14 Tage | 30 Tage nach Zahlung, Store-Seite mind. 2 Wochen "Demnächst", Prüfung von Seite und Build |
| Steuerformular | Tax Interview (W-8BEN mit Steuer-ID), sonst 30 % Einbehalt | ebenso, dazu Identität und Bankkonto |
| KI-Angabe | für Spiele freiwillig (nur Asset-Pakete Pflicht) | Pflicht für Musik und Soundeffekte (vorab erzeugt, "Tier 1"); KI-Code ist ausgenommen |

Weitere Seiten wie Newgrounds, CrazyGames oder Poki sind eher für kostenlose Browserspiele mit Werbeeinnahmen, passen also nicht zum Verkaufen.

**Deutschland**

- Vor dem ersten Verkauf Gewerbe anmelden (Gewerbeamt, ca. 20–60 €), danach Fragebogen zur steuerlichen Erfassung über ELSTER.
- Kleinunternehmerregelung (§ 19 UStG): bis 25.000 € Umsatz im Vorjahr und 100.000 € im laufenden Jahr keine Umsatzsteuer. Beim Verkauf über itch/Steam kümmern sich ohnehin die Plattformen um die Steuer der Käufer.
- Gewinn ist einkommensteuerpflichtig (Einnahmen-Überschuss-Rechnung mit der Steuererklärung).
- Impressum (§ 5 DDG) auf der Shop-Seite bzw. eigenen Webseite, mit ladungsfähiger Anschrift. Anonym geht nicht, ein Impressum-Service mit c/o-Adresse ist möglich.
- Bei Anstellung: Nebentätigkeit ggf. dem Arbeitgeber melden.

**Technische To-dos vor dem Release**

- Schrift (Bricolage Grotesque, freie Lizenz) lokal einbinden statt von Google Fonts laden: DSGVO und nötig für Steam/offline.
- Admin-Modus in der Verkaufsversion abschalten (Eintippen von "admin" und `?admin`).
- Menüpunkt mit Credits, Impressum und kurzer Datenschutz-Info (Spielstand liegt nur lokal, kein Tracking).
- Für Steam: Electron-/Tauri-Hülle, Spielstand-Speicherort prüfen, Vollbild/Fenster, Store-Grafiken und Trailer.

**Namenskandidaten** (Websuche nach Spielen gleichen Namens am 29.09.2026)

| Name | Ergebnis |
|---|---|
| Chompillar | keine Treffer |
| Nibbleverse | keine Treffer (auf Steam gibt es "Nibble Quest") |
| Larvageddon | kein Spiel, aber Name eines Erfolgs in Endless Dungeon und eines Items in Wakfu |
| Kernbeißer | kein Spiel; deutsch, international schwer |
| Gnawtorious | keine Treffer (auf Steam gibt es "GNAW") |
| verworfen: Munch to the Core, Core Muncher | zu nah an "To The Core" (Vorbild) und "Munch" (beide auf Steam) |
| verworfen: Instar | Spiel auf itch.io |

## Ideen für später

- (Besonderheiten in der Frucht und Überreifes Obst sind jetzt Teil des Plans "Sonderstellen, Setzkasten, Fressbuch".)
- **Überreifes Obst** als seltener Zufalls-Modifikator: Das Fruchtfleisch bringt mehr, und es gibt Öffnungen, durch die man schneller ins Innere kommt. Nicht als Dauerzustand.
- **Weitere Welten-Ideen** (über die festgelegten sechs hinaus, noch nicht entschieden): Pfirsich, Litschi (harte Schale), Avocado (großer Kern), Kokosnuss, Wollknäuel (Kleidermotte), Bowlingkugel, Asteroid, Mond, Erde (Kruste, Mantel, Eisenkern), Sonne, Schwarzes Loch.

## Vorerst verworfen

- **Prestige / Verpuppung:** kein Prestige im Spiel (Entscheidung Bene, 29.09.2026).
- **Mini-Raupen als Helfer:** reizvoll, brauchen aber eine eigene Logik.
- Ein zunehmend härteres Fruchtfleisch zum Kern hin.

## Offene Punkte

- Darm (Stufe 17) im Spiel anspielen: Ist der Ertrag (ganz verdaut ab 14 Punkten) passend? Lohnt sich das Umstellen je Frucht, und kommt Gedächtnis zur richtigen Zeit?
- Ausdauer- und Ertragswerte sind per Bot-Simulation vorjustiert (siehe "Umsetzung Stufe 1"), müssen aber noch von Hand angespielt werden.
- Kosten- und Wachstumskurven feinjustieren, sobald man selbst gespielt hat.
- Welten 4–6 (Pflaume, Apfel, Kürbis): Plan steht (siehe oben), Werte beim Anspielen prüfen.
- Wofür Walnusskerne ausgegeben werden (bis zur Pflaume noch ohne Verwendung).
- Fähigkeiten-Balance weiter beobachten (Brennhaare und Gabeldrüse in der Johannisbeere stark).
- Mitlaufende Kamera für große Früchte: geplant (siehe oben).
- Neue Ausdauer (Stufe 9) von Hand anspielen, vor allem: Fühlt sich der Grundverbrauch im Stand zu streng an? Ist die Walnuss mit 2,2/s zu hektisch?
- Abklingzeit (30 s) und Stärke der Fähigkeiten mit den Admin-Messwerten nachjustieren.
