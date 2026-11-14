# MALUM — Designkritik

14. November 2026. Zwei unabhängige Bewertungen: visuelle Prüfung mit Quellcode und deterministischer Scan. Geprüft: Collection, Hover, Großansicht, Menü, Bomber-Produktseite und mobile Auswahl. Ziel: Kleidung entdecken, Originalprodukt prüfen, gezielt anfragen. Die Bewertung beschreibt den Ausgangszustand vor der unten dokumentierten Hover-Vergrößerung.

## Urteil zu Anti-Patterns

Keine typische AI-Slop-Oberfläche. Originales Crest, charakteristische Kleidung und zurückhaltende Gestaltung tragen die Seite. Keine erkannten Verläufe, Glows, Glasflächen oder austauschbaren Kartenmuster. Das Risiko ist eher allgemeiner Fashion-Minimalismus: viel freie Fläche, winzige Funktionstexte und ähnliche Explore-Aktionen. Mehr Eigenständigkeit entsteht durch präzise Proportionen, ein gemeinsames Raster und klare Typohierarchie.

Der Markup-Scan (`impeccable 4.9.1 detect --json`) meldet keine Funde in den drei untersuchten TSX-Dateien. CSS-Module werden dabei nicht vollständig ausgewertet. Die zusätzliche Browseranalyse meldet 70 wiederholte Vorkommen von zwei Typografie-Regeln in fünf Zuständen, **keine 70 verschiedenen Probleme**:

| Zustand | undersized-ui-text | tiny-text |
|---|---:|---:|
| Collection | 8 | 1 |
| Hover | 10 | 1 |
| Menü geöffnet | 14 | 1 |
| Bomber-Produktseite | 23 | 0 |
| Mobile, Bomber ausgewählt | 11 | 1 |

Beide Bewertungen bestätigen zu kleine Funktionstexte. Der Detektor ergänzt, dass dies auch Produktmetadaten und Footer betrifft. Copyright, dekorative Nummern und darunterliegende Texte bei geöffnetem Menü sind teils Fehlalarme oder Wiederholungen. Schriftgröße allein beweist keinen WCAG-Verstoß. Der in der Skillbeschreibung vorgesehene Overlay-Server war mit den verfügbaren CLI-Versionen nicht nutzbar; die Browseranalyse lief in isolierten Headless-Tabs. Es bleibt kein sichtbarer Overlay-Tab offen.

## Gesamtbild und Stärken

Ruhig und skulptural, mit überzeugender großer Produktansicht. Kleidung darf die Fläche stärker beanspruchen; die Bedienung braucht klarere Beschriftungen.

- Fünf getrennte Silhouetten erlauben schnellen Vergleich von Schnitt und Material.
- Die Produktseite mit großem Foto links und konzentrierter Information rechts besitzt eine klare Hierarchie.
- Das Menü gruppiert drei primäre Links, die aktuelle Kollektion und sekundäre Links sinnvoll. Crest und Produktfoto verbinden es mit der Marke.

## Heuristische Bewertung

0 = schwach, 4 = ausgezeichnet. Dies ist ein Designreview, kein vollständiger Accessibility- oder Fehlertest. Hilfe und Fehlerbehebung sind bei einer Kollektion weniger aussagekräftig als bei einer komplexen Anwendung.

| # | Heuristik | Punkte | Wichtigster Befund |
|---|---|---:|---|
| 1 | Sichtbarkeit des Status | 3 | Auswahl erkennbar, Statusbeschriftung sehr klein |
| 2 | Sprache der Nutzer | 3 | Explore/View unterscheiden ihre Ziele zu wenig |
| 3 | Kontrolle und Freiheit | 3 | Back/Escape vorhanden; Großansicht ohne eigene URL |
| 4 | Konsistenz | 3 | Hover-Bildwechsel nicht in allen Betrachtungsebenen gleich |
| 5 | Fehlervermeidung | 3 | Erster Mobile-Tap navigiert nicht versehentlich weiter |
| 6 | Wiedererkennen | 2 | Ähnliche Explore-Aktionen, Namen erst nach Interaktion |
| 7 | Effizienz | 2 | Vorschau, Großansicht und Produkt wiederholen Betrachtung |
| 8 | Ästhetik und Reduktion | 3 | Gute Reduktion, Proportionen und Lesbarkeit ausbaufähig |
| 9 | Fehlerbehebung | 2 | Kein eigener Bild-Ersatz-/Wiederholzustand im geprüften Code |
| 10 | Hilfe und Orientierung | 2 | Anfrage führt ohne Produktkontext zur allgemeinen Kontaktseite |
| | **Gesamt** | **26/40** | **Akzeptabel; gestalterisch starke Basis, Bedienung ausbaufähig** |

## Priorisierte Verbesserungen

1. **P2 — Hauptbild im Hover zu klein. Bereits umgesetzt.** Desktop jetzt 1,90 statt 1,55: rund 23 % größer als der bisherige Hoverzustand. Tablet 1,65 statt 1,40. Nachbarn rücken weiter auseinander; der Picker hat angepasste Abstände auch in kurzen Fenstern. Mobile Auswahl bleibt bei 1,30. Bestehende 250-ms-Verzögerung und 480-ms-Rückkehr bleiben erhalten. Miniaturen skalieren nicht mehr und bleiben ohne Unterstreichung. `/layout` → `/polish`.
2. **P2 — Bedienung wird durch 8–10-px-Schrift unnötig schwer lesbar.** Navigation und Aktionen auf wenige Stufen um 12 px, Produktnamen im Picker auf 13–14 px, Status auf 10–11 px vereinheitlichen. Weißraum über Abstände schaffen. Kleines MALUM und Crest beibehalten. Quellen: `components/malum-minimal-collection.module.css`, `components/atelier-header.module.css`, `app/product/[slug]/product-detail.module.css`. `/typeset`.
3. **P2 — Mobile zeigt zwei fast gleich benannte Aktionen mit unterschiedlichen Zielen.** „Explore piece“ öffnet das gewählte Stück, „Explore pieces“ immer den ersten Mantel. Den allgemeinen Einstieg während einer Auswahl ausblenden; die Auswahlaktion eindeutig benennen. Die ausdrücklich gewünschten zwei Taps bis zur Großansicht beibehalten. `/clarify` → `/distill`.
4. **P2 — Großansicht und Produktseite haben zu ähnliche Aufgaben.** Die Großansicht bewusst als Galerie gestalten; nächste Aktion „Details & inquiry“ statt „View piece“. Einheitlicher Miniatur-Hover in allen Ansichten; bei dauerhafter Galerie einen adressierbaren Auswahlzustand vorsehen. Eine Anfrage sollte das konkrete Produkt mitnehmen. `/shape` → `/clarify`.
5. **P3 — Menü und Collection teilen nicht dieselben Textachsen.** Das Menü verwendet eigene 8-%-Einzüge, die Collection ein Fünfspaltenraster. Außenränder und Textachsen angleichen, drei große Menüpunkte behalten. Keine zusätzlichen Karten, Nummern oder Dekoration nötig. `/layout` → `/polish`.

## Kognitive Belastung

Die acht Prüfpunkte: Fokus bestanden; Gruppengröße formal nicht bestanden; räumliche Gruppierung bestanden; Hierarchie bestanden; eine Entscheidung zur Zeit bestanden; Optionsanzahl formal nicht bestanden; Arbeitsgedächtnis bestanden; progressive Offenlegung bestanden.

Formal **2/8 Verstöße, moderat**, beide betreffen dieselben fünf Kleidungsstücke. Daraus folgt hier keine Empfehlung, ein Stück zu entfernen: fünf vergleichbare Silhouetten sind überschaubar. Die Bedeutung der Aktionen ist das größere Problem.

Optionszahlen: Übersicht fünf Stücke plus allgemeiner Einstieg; Hover drei bis vier Bilder; Menü drei primäre Links plus getrenntes Feature und zwei sekundäre Links; Großansicht drei bis vier Bilder, Produktlink, Back und zwei Pfeile; Bomber-Produktseite neun Miniaturen.

## Persona-Prüfung

- **Jordan, Erstbesucher:** „Explore pieces“ klingt nach Übersicht, öffnet aber direkt Stück 01. Nach Mobile-Auswahl erscheinen zwei ähnlich benannte Ziele. Präzisere Aktionsnamen helfen mehr als zusätzliche Erklärungstexte.
- **Casey, mobile Besucherin:** Zwei Taps funktionieren und Flächen sind groß genug; die 8–10-px-Beschriftung fordert unnötiges Hinsehen. Die aktive Auswahl schiebt den zweiten allgemeinen Einstieg unter die Falz.
- **Riley, prüfender Besucher:** Reload verwirft den lokalen Auswahlzustand; kein eigener Link zur Großansicht. Miniatur-Hover verhält sich zwischen Ansichten unterschiedlich. Anfrage enthält keinen Produktbezug.

## Emotionale Reise und kleinere Beobachtungen

Ruhe und Distanz passen zu skulpturaler, seltener Mode. Der positive Höhepunkt ist die große Kleidungsansicht mit sichtbarem Material. Die allgemeine Kontaktseite beendet diese produktspezifische Reise weniger präzise. Kein Zahlungs- oder destruktiver Ablauf im untersuchten Bereich.

„Collection 05“ oben rechts kann wie eine Kollektionsnummer gelesen werden und verändert in der Übersicht sichtbar nichts. Die nicht ausgewählten Stücke könnten nach der Hover-Vergrößerung etwas weniger stark verblassen. Unterschiedliche Fotohintergründe lassen in Miniaturen vereinzelt helle Rechtecke erkennen. Das Menüfoto lädt korrekt; kein fehlendes Bild festgestellt.

## Fragen für den nächsten Pass

1. Zuerst Typografie und gemeinsame Rasterachsen oder den Weg von Auswahl zu Produkt/Anfrage verbessern?
2. Soll die Großansicht eine reine Galerie bleiben oder direkt eine produktbezogene Anfrage ermöglichen?

Die übrigen Empfehlungen sind noch nicht umgesetzt. Nach Auswahl des Umfangs: passende Maßnahmen priorisieren, mit `/polish` abschließen und erneut `/critique` ausführen.

## Prüfung der umgesetzten Hover-Vergrößerung

Visuell: 1440×900, 1440×760, 1024×768 und 1920×1080. Interaktion: Hover-Bildwechsel, unveränderte verzögerte Rückkehr und Abstand zwischen Picker und unterer Aktion bei kurzen Fenstern. Produktionsbuild und `git diff --check` erfolgreich.
