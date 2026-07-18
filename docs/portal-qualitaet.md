# Qualitätsvertrag für das Werkzeugportal

Stand: 18. Juli 2026

## Ziel

Andersen Web Tools soll nicht durch künstliche Verknappung oder aggressive Werbung überzeugen, sondern durch eine ungewöhnlich gute kostenlose Nutzung. Eine Person muss auf jeder Einstiegsseite innerhalb weniger Sekunden verstehen:

1. Welche Aufgabe das Werkzeug löst.
2. Welche Angaben oder Dateien dafür gebraucht werden.
3. Was einzelne Fachbegriffe bedeuten.
4. Wie das Ergebnis zustande kommt und wo seine Grenzen liegen.
5. Welches Werkzeug als Nächstes zur gleichen Aufgabe passt.

## Seitenvertrag

- Jedes Werkzeug und jeder Rechner hat eine eigene dauerhafte URL, einen eindeutigen Seitentitel und eine konkrete Meta-Beschreibung.
- Die Bedienung wird in drei kurzen Schritten vor oder unmittelbar bei der Arbeitsfläche erklärt.
- Nicht alltägliche Begriffe stehen in einem sichtbaren Begriffsbereich. Rechnerfelder erklären den erwarteten Wert zusätzlich direkt am Feld.
- Ergebnisse zeigen neben der Hauptzahl die wesentlichen Zwischenschritte oder Annahmen.
- Fachlich veränderliche Werte bleiben sichtbar und anpassbar. Grenzen der Rechnung werden dort genannt, wo sie die Entscheidung beeinflussen.
- Passende Folgeseiten sind direkt verlinkt; Sackgassen ohne sinnvollen nächsten Weg werden vermieden.

## Auffindbarkeit

- `/alle-werkzeuge/` ist die vollständige, nach Aufgaben geordnete Portalübersicht.
- `/rechner/` ist der eigene Einstieg für alle Rechnerkategorien.
- Jede öffentliche Seite steht in `sitemap.xml` und erhält eine Canonical-URL.
- Rechnerseiten veröffentlichen strukturierte Angaben als `WebApplication`, `BreadcrumbList` und `FAQPage`.
- `werkzeuge.json` beschreibt Aufgaben, Eingaben, Erklärungen und Ziele maschinenlesbar aus demselben Katalogstand.
- `llms.txt` bietet Agenten ein knappes Verzeichnis aller direkten Einstiegsseiten.

Diese technischen Angaben sind zusätzliche Orientierung. Sie ersetzen keine hilfreiche sichtbare Seite und garantieren keine Platzierung in Suchmaschinen oder KI-Antworten.

## Pflegegrenze

Ein neuer Rechner wird nicht aufgenommen, wenn Feldhilfen, Bedienfolge, Begriffe oder fachliche Grenzen fehlen. Die Katalogladung bricht bei fehlenden Feldhilfen geschlossen ab. Öffentliche Textänderungen bleiben zusätzlich an die unabhängige, hashgebundene Besucherprüfung gebunden.
