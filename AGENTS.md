# Andersen Web Tools

## Projektvertrag

- Dieses Repository ist die eigenständige Source of Truth für Andersen Web Tools.
- Die Anwendung bleibt statisch und verarbeitet Dateien sowie Eingaben im Browser.
- Keine Datei-Uploads, Nutzerkonten, Analyse, Werbung oder externe Laufzeitdienste ohne ausdrücklichen Auftrag.
- Sichtbare Texte sprechen mit den Nutzern. Interne Arbeitsnotizen und Prompttexte gehören nicht in die Oberfläche.
- Jedes Werkzeug und jeder Rechner besitzt eine eigene indexierbare Seite, eine konkrete Aufgabenbeschreibung, eine kurze Bedienfolge und verständliche Erklärungen aller nicht alltäglichen Begriffe.
- Rechnerfelder brauchen eine direkt am Feld sichtbare Erklärung. Ein neues Feld ohne Erklärung lässt den gemeinsamen Rechnerkatalog beim Laden geschlossen fehlschlagen.
- Die zentrale Werkzeugübersicht, `sitemap.xml`, `llms.txt` und `werkzeuge.json` werden aus denselben öffentlichen Katalogdaten erzeugt, damit Menschen, Suchmaschinen und Agenten nicht auf unterschiedliche Bestände treffen.
- Datenschutz-, Impressums- und Funktionsaussagen müssen mit der tatsächlichen Implementierung übereinstimmen.
- Öffentliche Copy wird nicht im selben Arbeitslauf freigegeben, der sie geschrieben hat. `npm run public-copy:prepare` erzeugt aus dem gebauten Stand eine vollständige strukturierte Besucherfläche; `npm run public-copy:review` lässt nur diese Fläche und das öffentliche Briefing semantisch prüfen. Jede Text- oder Routenänderung macht die Hash-Freigabe ungültig.
- `npm run build` und `npm run release` fallen geschlossen aus, wenn die unabhängige Public-Copy-Freigabe fehlt, abgelehnt wurde oder nicht exakt zum gebauten Stand passt. Keyword-, Regex- und Quellcode-Selbstprüfungen ersetzen diesen Empfänger-Pass nicht.

## Deployment

- Standardziel ist GitHub Pages unter `https://andersenwebworks.github.io/andersen-web-tools/`.
- `npm run build` erzeugt einmalig `pages-output/` und überschreibt keinen vorhandenen Build.
- Pushes auf `main` werden durch `.github/workflows/deploy-pages.yml` gebaut und veröffentlicht.
- Eine spätere eigene Domain wird über `SITE_URL`, `BASE_PATH` und die GitHub-Pages-Domainkonfiguration angebunden.

## Sicherheit

- Keine produktiven Dateien oder Build-Ausgaben löschen, leeren oder überschreiben, solange Ziel und Wiederherstellungsweg nicht ausdrücklich freigegeben sind.
- Keine Git-Rollbacks und kein Force-Push ohne ausdrücklichen Auftrag.
- Credentials und lokale Laufzeitdaten bleiben außerhalb des Repositories.
- Laufende Server oder Prozesse werden nicht eigenmächtig neu gestartet.
