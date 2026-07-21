# Andersen Web Tools

## Projektvertrag

- Dieses Repository ist die eigenständige Source of Truth für Andersen Web Tools.
- Die Anwendung bleibt statisch und verarbeitet Dateien sowie Eingaben im Browser.
- Keine Datei-Uploads, Nutzerkonten, Analyse, Werbung oder externe Laufzeitdienste ohne ausdrücklichen Auftrag.
- Sichtbare Texte sprechen mit den Nutzern. Interne Arbeitsnotizen und Prompttexte gehören nicht in die Oberfläche.
- Jedes Werkzeug und jeder Rechner besitzt eine eigene indexierbare Seite, eine konkrete Aufgabenbeschreibung, eine kurze Bedienfolge und verständliche Erklärungen aller nicht alltäglichen Begriffe.
- Rechnerfelder brauchen eine direkt am Feld sichtbare Erklärung. Ein neues Feld ohne Erklärung lässt den gemeinsamen Rechnerkatalog beim Laden geschlossen fehlschlagen.
- Nutzer geben nur Tatsachen ein, die das Werkzeug nicht zuverlässig selbst kennen oder ableiten kann. Formeln, gesetzliche Werte, Grenzwerte, Datumswerte und technisch eindeutige Zwischenschritte übernimmt die Anwendung.
- Rechner und Vorschauen aktualisieren sich nach gültigen Eingaben ohne zusätzlichen Startknopf. Dateiwerkzeuge beginnen nach der letzten nötigen Auswahl automatisch; der Download bleibt eine bewusste Nutzeraktion.
- Seltene Abweichungen liegen unter `Weitere Einstellungen`. Jahresgebundene Werte werden zentral mit Bezugsjahr gepflegt und dürfen nicht als verstreute Standardwerte in einzelnen Rechnern liegen.
- Die zentrale Werkzeugübersicht, `sitemap.xml`, `llms.txt` und `werkzeuge.json` werden aus denselben öffentlichen Katalogdaten erzeugt, damit Menschen, Suchmaschinen und Agenten nicht auf unterschiedliche Bestände treffen.
- Datenschutz-, Impressums- und Funktionsaussagen müssen mit der tatsächlichen Implementierung übereinstimmen.
- Öffentliche Copy wird nicht im selben Arbeitslauf freigegeben, der sie geschrieben hat. `npm run public-copy:prepare` erzeugt aus dem gebauten Stand eine vollständige strukturierte Besucherfläche; `npm run public-copy:review` lässt nur diese Fläche und das öffentliche Briefing semantisch prüfen. Jede Text- oder Routenänderung macht die Hash-Freigabe ungültig.
- `npm run build` und `npm run release` fallen geschlossen aus, wenn die unabhängige Public-Copy-Freigabe fehlt, abgelehnt wurde oder nicht exakt zum gebauten Stand passt. Keyword-, Regex- und Quellcode-Selbstprüfungen ersetzen diesen Empfänger-Pass nicht.

## Deployment

- Primäres Liveziel ist `https://tools.andersen-webworks.de/`.
- Der Standardbuild verwendet diese Subdomain mit dem Basispfad `/`; `SITE_URL` und `BASE_PATH` dürfen für klar benannte alternative Ziele überschrieben werden.
- `npm run build` erzeugt einmalig `pages-output/` und überschreibt keinen vorhandenen Build.
- Pushes auf `main` werden weiterhin durch `.github/workflows/deploy-pages.yml` gebaut und als vorhandener GitHub-Pages-Stand veröffentlicht; die Subdomain ist die kanonische Portaladresse.
- Der Webspace-Upload ist ein eigener, ausdrücklich freizugebender Schritt. FTP-Zugang und Zielpfad bleiben außerhalb dieses Repositories in der zentralen Credential-SSOT.

## Sicherheit

- Keine produktiven Dateien oder Build-Ausgaben löschen, leeren oder überschreiben, solange Ziel und Wiederherstellungsweg nicht ausdrücklich freigegeben sind.
- Keine Git-Rollbacks und kein Force-Push ohne ausdrücklichen Auftrag.
- Credentials und lokale Laufzeitdaten bleiben außerhalb des Repositories.
- Laufende Server oder Prozesse werden nicht eigenmächtig neu gestartet.
