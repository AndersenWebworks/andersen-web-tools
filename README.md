# Andersen Web Tools

Die Plattform enthält neben den Datei-, Text- und Webwerkzeugen einen eigenen Rechnerbereich mit 24 Rechnern. Die verbindliche Aufteilung von Welle 1 und Welle 2 steht in [`docs/rechner-roadmap.md`](docs/rechner-roadmap.md).

Statische Mehrseiten-App mit kostenlosen Werkzeugen, die Eingaben und Dateien vollständig im Browser verarbeiten. Die gebaute Ausgabe benötigt weder Datenbank noch Anwendungsserver.

## Version 3.1

- zentrale Seite mit allen 36 Werkzeugen und Rechnern, nach konkreten Aufgaben geordnet
- drei klare Bedienungsschritte und verständliche Begriffserklärungen auf jeder Werkzeugseite
- direkte Feldhilfen, Begriffserklärungen, häufige Fragen und passende Folgerechner auf allen 24 Rechnerseiten
- vollständige ItemList-, Breadcrumb- und FAQ-Strukturdaten für die jeweiligen Seitentypen
- maschinenlesbarer öffentlicher Werkzeugkatalog unter `werkzeuge.json`
- kompaktes Agentenverzeichnis unter `llms.txt`
- gemeinsame Katalogdaten für sichtbare Navigation, Sitemap und maschinenlesbare Ausgaben

Die Grundlage aus Version 3 bleibt vollständig enthalten:

- eigener Rechner-Hub mit 24 Rechnern in zwei Wellen
- indexierbare Einzelseite für jeden Rechner
- gemeinsame Formular-, Ergebnis- und Fehlerlogik
- sichtbare Rechenwege und anpassbare Annahmen bei veränderlichen Tarifen
- Prozent, Mehrwertsteuer, Rabatt, Marge, Zinseszins, Zahlungsgebühren, Fahrt, Strom, Urlaub, Zeitspannen, Skonto und Stückpreise
- Stundenlohn, Arbeitgeberkosten, Minijob, Brutto-Netto-Schätzung, GKV, Pflegeversicherung, Krankengeld, Firmenwagen, Pendlerpauschale, GKV-PKV-Vergleich und Monatsbudget

Die bestehenden Werkzeuge aus Version 2 bleiben vollständig enthalten:

- PDF-Dateien mit qpdf-WASM strukturell optimieren und bei Bedarf mit wählbarer Bildqualität verkleinern
- Bilder komprimieren, skalieren und in JPG, PNG, WebP oder AVIF umwandeln
- HEIC- und HEIF-Fotos in JPG umwandeln
- PDF-Dateien sortieren und zusammenfügen
- JPG-, PNG- und WebP-Bilder in PDF sowie PDF-Seiten in JPG umwandeln
- eine sichtbare Unterschrift zeichnen oder als Bild in eine PDF einsetzen
- Wörter, Zeichen, Sätze, Absätze, Zeilen sowie Lese- und Sprechzeit zählen
- Arbeitszeit, Pause, Dezimalstunden, Industrieminuten, Sollsaldo und Feierabend berechnen
- IBANs formal prüfen und SEPA-Überweisungs-QR-Codes erzeugen
- QR-Codes für Links, Text, WLAN und Kontaktdaten erzeugen
- Farbkontraste nach WCAG 2.2 prüfen
- Meta-Tags und Social-Media-Vorschauen erstellen

Jedes Werkzeug besitzt eine eigene HTML-Seite mit eigenem Seitentitel, Beschreibung, Canonical-URL und strukturierten Daten. Dateien werden nicht übertragen. Die einzige reguläre serverseitige Verarbeitung beim Aufruf sind technisch notwendige Hosting-Logs.

## Lokal

```powershell
npm install
npm run dev
```

Die Entwicklungsvorschau läuft standardmäßig unter `http://127.0.0.1:4178/`.

## Produktionsbuild

Öffentliche Copy besitzt einen eigenen fail-closed Freigabeschritt. Planung, Roadmap und Arbeitsnotizen werden nicht an den Reviewer gegeben; geprüft wird nur die tatsächlich gebaute Besucherfläche.

```powershell
npm run public-copy:prepare
npm run public-copy:review
npm run public-copy:verify
```

Die Freigabe ist an Zielgruppe, öffentlichen Zweck, alle 80 öffentlichen Routen einschließlich Fehlerseite sowie `werkzeuge.json`, `llms.txt` und den exakten Hash der sichtbaren Copy gebunden. Jede Text- oder Routenänderung verlangt einen neuen unabhängigen Review. `npm run build` und `npm run release` prüfen die Freigabe automatisch und brechen bei einem fehlenden oder veralteten Stand ab.

```powershell
npm run build
npm run preview
```

Ohne weitere Konfiguration baut die Anwendung für die primäre Portaladresse:

```text
https://tools.andersen-webworks.de/
```

`npm run build` erzeugt `pages-output/`. Ein vorhandener Ausgabeordner wird nicht überschrieben; der Build bricht stattdessen geschlossen ab. In einem frischen GitHub-Actions-Checkout ist das Ziel immer leer.

Pushes auf `main` starten weiterhin `.github/workflows/deploy-pages.yml`. Der Workflow installiert die festgeschriebenen Abhängigkeiten, baut die Mehrseiten-App und veröffentlicht den Stand zusätzlich über GitHub Pages. Canonicals, Sitemap und interne Links weisen dabei auf die primäre Subdomain.

Im GitHub-Repository muss unter **Settings > Pages > Build and deployment** einmalig **GitHub Actions** als Quelle gewählt werden. Danach läuft die Veröffentlichung mit jedem Push auf `main`.

## Alternatives Buildziel

Für ein abweichendes Ziel werden Zieladresse und Basispfad beim Build gesetzt:

```powershell
$env:SITE_URL='https://andersenwebworks.github.io/andersen-web-tools'
$env:BASE_PATH='/andersen-web-tools/'
npm run build
```

`SITE_URL` steuert Canonical-URLs, strukturierte Daten, Sitemap und `robots.txt`. `BASE_PATH` steuert interne Links und Assets. Ohne diese Variablen wird `https://tools.andersen-webworks.de/` verwendet.

## Versioniertes Release

```powershell
npm run release
```

Dieser Befehl erzeugt unter `releases/` einen neuen, eindeutig benannten Ordner mit vollständigem Webroot, ZIP-Archiv und `release.json`. Vorhandene Releases werden weder geleert noch überschrieben.

## Veröffentlichung

1. Public-Copy-Fläche für die Produktionsdomain vorbereiten, unabhängig prüfen und die Hash-Freigabe verifizieren.
2. Einen additiven Produktionsbuild oder ein versioniertes Release erzeugen.
3. Den Webspace-Upload für `tools.andersen-webworks.de` ausdrücklich freigeben und einmal mit `npm run ftp:deploy` ausführen. Das Skript wählt nur den neuesten vollständigen, sauberen Produktionsrelease und verwendet die zentral hinterlegten Zugangsdaten.
4. Startseite, Rechner-Hub, alle zwölf Werkzeuge, alle 24 Rechner, `sitemap.xml`, `robots.txt`, Impressum und Datenschutz über die Subdomain prüfen.
5. Danach die Sitemap bei den vorgesehenen Suchmaschinen einreichen.

GitHub Pages behält die Deployment-Historie des Workflows. Für unabhängige Archivstände bleibt zusätzlich der versionierte Release-Befehl verfügbar. Der FTP-Zugang und der serverseitige Zielpfad werden nicht in diesem Repository gespeichert.

Werden später Analyse, externe Schriftarten, Zahlungsanbieter oder eingebettete Inhalte ergänzt, müssen Content-Security-Policy und Datenschutzerklärung vor der Veröffentlichung angepasst werden.

Die sichtbare PDF-Unterschrift ist ein eingefügtes Bild und keine qualifizierte oder zertifikatbasierte elektronische Signatur. Die IBAN-Prüfung kontrolliert Format und Prüfziffer, nicht die Existenz oder den Inhaber des Kontos. Der PDF-Kompressor versucht zuerst eine strukturerhaltende Optimierung mit qpdf-WASM und bietet niemals eine größere Ersatzdatei an. Ein Neuaufbau der Seiten als Bilder wird nur verwendet, wenn er stärker verkleinert; digital signierte PDFs werden nicht verändert.
