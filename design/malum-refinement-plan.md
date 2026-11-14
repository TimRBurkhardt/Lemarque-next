# MALUM — vollständiger Designpass

## Ziel

Eine präzise, minimale Kollektion mit großen Kleidungsbildern, lesbarer Bedienung und einem durchgängigen Weg zur Anfrage. Grundlage ist die Critique vom 14. November 2026. Umsetzung direkt auf main, anschließend Prüfung des Produktionsdeployments.

## Plan und Entscheidungen

- [x] **1. Gemeinsames System:** ein fluides Seitenraster, gemeinsame Außenränder und wenige semantische Schriftgrößen. Kleine Signatur MALUM in Arial, übrige Texte in der vorhandenen Montserrat. Bedienung 12 px, Status 11 px, Produktnamen 14 px, Beschreibung 16 px; alle Größen in rem.
- [x] **2. Menü:** Navigation, Bild und Fußzeile an dieselben fünf Desktop-Spalten anschließen. Mobil zwei Textachsen. Drei Hauptlinks, klares aktuelles Ziel, sichtbarer Tastaturfokus. Die Übersicht bekommt einen echten Link zu allen Stücken statt einer wirkungslosen Collection-05-Aktion.
- [x] **3. Collection:** großer Hover bleibt bei 1,90 / 1,65; Nachbarn weniger ausblenden. Größere Beschriftungen und Miniaturen mit ausreichendem Platz. Mobil nur eine Öffnungsaktion für das ausgewählte Stück. Der allgemeine Einstieg führt tatsächlich zu allen Stücken.
- [x] **4. Galerie:** ruhige Betrachtungsansicht, einheitlicher Miniatur-Hover und Tap. Auswahl und Bildnummer über URL-Hash wiederherstellen; Browser-Zurück/Weiter funktionieren. Klare Weiterführung „Details & inquiry“. Zwei Mobile-Taps bleiben erhalten. Bildfehler erhalten eine erreichbare Wiederholung.
- [x] **5. Produkt und Anfrage:** Produktseite übernimmt Raster, Schriftstufen und Miniaturen ohne Unterstrich. Anfrage öffnet einen Mailentwurf an die verifizierte öffentliche Kontaktadresse mit Produktname und Produktlink; es wird nichts automatisch gesendet. Kontaktalternative bleibt erreichbar.
- [x] **6. Prüfung und Polish:** Desktop 1440/1024, kurze Fenster, Mobile 390/320, Tastatur, Reduced Motion, Browser-History, Bildfehler und Anfrage-Link prüfen. Zwei unabhängige Abschlussbewertungen; nur konkrete Probleme nacharbeiten. Produktionsbuild und Lint. Veröffentlichung auf main und anschließende Liveprüfung als letzter Schritt.

## Gestalterische Leitlinie

Eigenständigkeit durch Verhältnis von Bild und Text, gemeinsame Achsen und bewusst gesetzte Abstände. Kein zusätzliches Dekor, keine neuen Marketingabsätze. Die Galerie konzentriert sich aufs Sehen, die Produktseite auf Materialinformation und Kontakt.

## Abnahme

Die Seite lässt sich ohne Erklärung bedienen; die aktive Auswahl ist sichtbar, der Weg zur Anfrage eindeutig. Der direkte Galerie-Link stellt das richtige Stück wieder her. Auf kleinen Bildschirmen überdecken sich Bild, Picker und Aktionen nicht. Classic bleibt unter der bestehenden URL erreichbar.


## Ergebnis der Abschlussprüfungen

Zwei unabhängige Reviews haben die Umsetzung freigegeben. Heuristikbewertung: **31/40 statt 26/40** (subjektiver Designreview, keine umfassende Accessibility-Zertifizierung).

| Heuristik | Vorher | Nachher |
|---|---:|---:|
| Status | 3 | 3 |
| Sprache | 3 | 3 |
| Kontrolle | 3 | 4 |
| Konsistenz | 3 | 3 |
| Fehlervermeidung | 3 | 3 |
| Wiedererkennen | 2 | 3 |
| Effizienz | 2 | 3 |
| Ästhetik | 3 | 3 |
| Fehlerbehebung | 2 | 3 |
| Orientierung | 2 | 3 |

Der deterministische Abschluss-Scan meldete keine Funde in den drei Markup-Dateien und sieben Browserzuständen. Vorher gab es 70 wiederholte Typografie-Warnungen in fünf Zuständen; die Vergleichsansichten sind nicht identisch. Getestet wurden diesmal Collection, Hover, Menü und Produkt bei 1024 px, mobile Auswahl bei 390 px sowie Menü und Produkt bei 320 px.

Interaktion geprüft: Desktop 1440 px, kurze Fenster 1440×760 und 1024×768; Mobile 390/320 px; zwei Taps; Galerie-Hash mit Bildnummer; Reload; Zurück/Vorwärts; Escape schließt erst das Menü, dann die Galerie; Tastatur-Bildwechsel; unbekannte Stücke und ungültige Bildnummern; Reduced Motion; dauerhaft blockiertes Bild mit erfolgreichem Retry. Keine Runtime-Fehler in diesen Prüfungen. Kein horizontaler Überlauf.

Die Anfrage-Adresse wurde auf der öffentlichen Kontaktseite verifiziert. Getestet wurde ausschließlich der erzeugte Mailto-Link mit Produktname und Produkt-URL. Keine Nachricht wurde geöffnet oder gesendet.

Zusätzlich lädt die Übersicht nur ihre fünf aktiven Bilder; weitere Ansichten werden beim Auswählen eines Stücks vorgeladen. Die Miniaturen nutzen optimierte Bildgrößen. Auf sehr kurzen Desktopfenstern bleibt reguläres Scrollen möglich.
