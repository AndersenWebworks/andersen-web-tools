export const browserTools = [
  {
    slug: "pdf-verkleinern",
    category: "PDF",
    title: "PDF verkleinern",
    description: "PDF-Dateigröße für E-Mail, Bewerbung oder Upload reduzieren.",
    steps: [
      "Wähle die PDF von deinem Gerät aus.",
      "Entscheide zwischen erhaltener Dokumentstruktur und stärkerer Verkleinerung als Seitenbilder.",
      "Die verkleinerte PDF wird automatisch vorbereitet. Prüfe Größe und Qualität und lade sie herunter."
    ],
    terms: [
      ["Dokumentstruktur", "Auswählbarer Text, Links, Formulare und andere technische Bestandteile einer PDF."],
      ["Auflösung", "Zahl der Bildpunkte einer Seite. Weniger Bildpunkte verkleinern die Datei, können Schrift aber unschärfer machen."],
      ["Kompression", "Verfahren, das für eine kleinere Datei weniger oder einfacher gespeicherte Bilddaten verwendet."]
    ]
  },
  {
    slug: "bilder-komprimieren",
    category: "Bilder",
    title: "Bilder komprimieren",
    description: "Bilder verkleinern, umwandeln und eingebettete Metadaten entfernen.",
    steps: [
      "Wähle ein oder mehrere Bilder aus.",
      "Lege Dateiformat, Qualität und bei Bedarf eine maximale Bildgröße fest.",
      "Die Ergebnisse erscheinen automatisch. Vergleiche sie mit den Originalen und lade einzelne Bilder oder alle als ZIP herunter."
    ],
    terms: [
      ["Pixelmaß", "Breite und Höhe eines Bildes in Bildpunkten, zum Beispiel 2.000 × 1.500 Pixel."],
      ["Bildqualität", "Stärke der verlustbehafteten Kompression. Eine höhere Einstellung bewahrt mehr Details, erzeugt aber meist größere Dateien."],
      ["Metadaten", "Zusatzinformationen in einer Bilddatei, etwa Kameramodell, Aufnahmezeit oder Standort."]
    ]
  },
  {
    slug: "heic-in-jpg",
    category: "Bilder",
    title: "HEIC in JPG umwandeln",
    description: "iPhone-Fotos in weit verbreitete JPG-Dateien umwandeln.",
    steps: [
      "Wähle deine HEIC- oder HEIF-Fotos aus.",
      "Stelle JPG-Qualität und bei Bedarf eine maximale Breite ein.",
      "Die JPG-Dateien werden automatisch vorbereitet. Lade ein einzelnes Ergebnis oder mehrere gemeinsam als ZIP herunter."
    ],
    terms: [
      ["HEIC", "Platzsparendes Bildformat, das vor allem von iPhones verwendet wird, aber nicht von jedem Programm geöffnet werden kann."],
      ["JPG", "Sehr verbreitetes Bildformat für Fotos, das fast überall geöffnet und hochgeladen werden kann."],
      ["Maximale Breite", "Obergrenze der Bildbreite in Pixeln. Kleinere Originale werden nicht vergrößert."]
    ]
  },
  {
    slug: "pdf-zusammenfuegen",
    category: "PDF",
    title: "PDFs zusammenfügen",
    description: "Mehrere PDF-Dateien in einer frei gewählten Reihenfolge verbinden.",
    steps: [
      "Wähle alle PDF-Dateien aus, die in das neue Dokument gehören.",
      "Bringe die Dateien per Ziehen in die richtige Reihenfolge.",
      "Die verbundene PDF wird automatisch neu erstellt, sobald Auswahl oder Reihenfolge stimmen. Lade sie anschließend herunter."
    ],
    terms: [
      ["Dateireihenfolge", "Reihenfolge der vollständigen Quelldateien im neuen PDF-Dokument."],
      ["Geschützte PDF", "PDF mit Kennwort oder technischen Einschränkungen, die eine Verarbeitung verhindern können."],
      ["Quelldatei", "Ursprüngliche Datei. Sie bleibt unverändert auf deinem Gerät erhalten."]
    ]
  },
  {
    slug: "jpg-pdf-umwandeln",
    category: "PDF",
    title: "JPG und PDF umwandeln",
    description: "Bilder zu einer PDF verbinden oder PDF-Seiten als JPG speichern.",
    steps: [
      "Wähle oben die gewünschte Richtung: Bilder zu PDF oder PDF zu JPG.",
      "Lade die Ausgangsdateien und stelle Seitengröße, Rand oder Bildauflösung ein.",
      "Die Umwandlung beginnt automatisch. Lade die fertige PDF oder die JPG-Seiten herunter."
    ],
    terms: [
      ["Seitengröße", "Papierformat der neuen PDF-Seite, zum Beispiel A4."],
      ["Rand", "Freier Abstand zwischen Bild und Seitenkante."],
      ["Rasterbild", "Bild aus einzelnen Pixeln. Umgewandelte JPG-Seiten enthalten deshalb keinen auswählbaren PDF-Text."]
    ]
  },
  {
    slug: "pdf-unterschreiben",
    category: "PDF",
    title: "PDF unterschreiben",
    description: "Eine gezeichnete oder hochgeladene Unterschrift sichtbar in eine PDF einsetzen.",
    steps: [
      "Wähle die PDF und öffne die Seite, auf der unterschrieben werden soll.",
      "Zeichne deine Unterschrift oder lade ein Bild davon hoch.",
      "Setze Position und Größe fest. Die neue PDF wird automatisch vorbereitet und kann danach heruntergeladen werden."
    ],
    terms: [
      ["Sichtbare Unterschrift", "Bild der Unterschrift, das auf einer PDF-Seite platziert wird."],
      ["Digitale Signatur", "Technische Signatur mit Zertifikat und prüfbarer Identität. Dieses Werkzeug erzeugt keine solche Signatur."],
      ["Quelldokument", "Die ursprüngliche PDF, die bei der Bearbeitung nicht verändert wird."]
    ]
  },
  {
    slug: "woerter-zeichen-zaehlen",
    category: "Text",
    title: "Wörter und Zeichen zählen",
    description: "Textlänge, Absätze sowie ungefähre Lese- und Sprechzeit sofort sehen.",
    steps: [
      "Füge deinen Text in das große Eingabefeld ein oder schreibe direkt darin.",
      "Lies Wörter, Zeichen, Sätze, Absätze und Zeilen während der Eingabe ab.",
      "Nutze Lese- und Sprechzeit als praktische Schätzung für Veröffentlichung oder Vortrag."
    ],
    terms: [
      ["Zeichen mit Leerzeichen", "Alle sichtbaren Zeichen sowie Abstände und Zeilenumbrüche."],
      ["Zeichen ohne Leerzeichen", "Buchstaben, Zahlen und Satzzeichen ohne Abstände und Zeilenumbrüche."],
      ["Sprechzeit", "Geschätzte Vortragsdauer auf Grundlage eines durchschnittlichen Sprechtempos."]
    ]
  },
  {
    slug: "arbeitszeitrechner",
    category: "Arbeit",
    title: "Arbeitszeit berechnen",
    description: "Nettoarbeitszeit, Pause, Dezimalstunden, Sollsaldo oder Feierabend berechnen.",
    steps: [
      "Wähle Arbeitsdauer oder Feierabend als gewünschte Rechnung.",
      "Trage Beginn, Ende beziehungsweise gewünschte Arbeitszeit und Pause ein.",
      "Uhrzeit, Nettozeit, Dezimalstunden und Sollsaldo ändern sich sofort mit deinen Eingaben."
    ],
    terms: [
      ["Nettoarbeitszeit", "Anwesenheitszeit nach Abzug der Pause."],
      ["Dezimalstunden", "Stunden als Dezimalzahl. 7 Stunden 30 Minuten entsprechen 7,50 Stunden."],
      ["Sollsaldo", "Unterschied zwischen tatsächlich berechneter Nettozeit und eingetragener Sollzeit."]
    ]
  },
  {
    slug: "iban-pruefen-sepa-qr",
    category: "Geschäft",
    title: "IBAN prüfen und SEPA-QR erstellen",
    description: "IBAN-Format kontrollieren und Überweisungsdaten als Banking-QR-Code ausgeben.",
    steps: [
      "Trage die IBAN ein; Format und Prüfziffer werden während der Eingabe geprüft.",
      "Ergänze Empfänger, Betrag und bei Bedarf BIC sowie Verwendungszweck.",
      "Der SEPA-QR-Code erscheint, sobald die nötigen Angaben vollständig sind. Kontrolliere die Daten erneut in deiner Banking-App."
    ],
    terms: [
      ["IBAN-Prüfziffer", "Zwei Ziffern, mit denen viele Tippfehler in einer IBAN mathematisch erkannt werden können."],
      ["BIC", "Internationale Kennung einer Bank. Bei vielen SEPA-Zahlungen ist sie nicht mehr nötig."],
      ["SEPA-QR", "Standardisierter QR-Code, der Überweisungsdaten in ein Banking-Formular übertragen kann."]
    ]
  },
  {
    slug: "qr-code-erstellen",
    category: "Web",
    title: "QR-Code erstellen",
    description: "Dauerhafte QR-Codes für Links, Text, WLAN oder Kontaktdaten erzeugen.",
    steps: [
      "Wähle Link, Text, WLAN oder Kontakt als Inhaltstyp.",
      "Trage die Informationen ein und stelle Größe, Farben und Fehlerkorrektur ein.",
      "Der Code aktualisiert sich mit jeder Eingabe. Prüfe ihn mit einem Handy und lade ihn als PNG oder SVG herunter."
    ],
    terms: [
      ["Fehlerkorrektur", "Zusätzliche Daten im QR-Code, durch die er trotz kleiner Beschädigungen noch lesbar sein kann."],
      ["PNG", "Pixelbild für Bildschirm, Dokumente und einfache Drucksachen."],
      ["SVG", "Vektordatei, die sich ohne Qualitätsverlust vergrößern lässt."]
    ]
  },
  {
    slug: "farbkontrast-pruefen",
    category: "Web",
    title: "Farbkontrast prüfen",
    description: "Kontrastverhältnis zweier Farben nach WCAG 2.2 beurteilen.",
    steps: [
      "Trage Text- und Hintergrundfarbe ein oder wähle sie mit dem Farbfeld.",
      "Lies Kontrastverhältnis und Ergebnis für normalen sowie großen Text ab.",
      "Nutze bei zu geringem Kontrast den vorgeschlagenen, möglichst ähnlichen Farbwert als Ausgangspunkt."
    ],
    terms: [
      ["Kontrastverhältnis", "Messwert zwischen 1:1 und 21:1 für den Helligkeitsunterschied zweier Farben."],
      ["WCAG", "Internationale Richtlinien für besser zugängliche Webinhalte."],
      ["AA und AAA", "Zwei WCAG-Konformitätsstufen. AAA verlangt bei Text einen höheren Kontrast als AA."]
    ]
  },
  {
    slug: "meta-tags-erstellen",
    category: "Web",
    title: "Meta-Tags erstellen",
    description: "Seitentitel, Beschreibung, Canonical und Social-Media-Vorschau erstellen.",
    steps: [
      "Trage Seitenadresse, Seitentitel und eine konkrete Beschreibung der Seite ein.",
      "Prüfe Suchergebnis und Social-Vorschau und ergänze bei Bedarf Website-Name und Bildadresse.",
      "Der HTML-Block wird während der Eingabe aktualisiert. Kopiere ihn in den Kopfbereich oder die SEO-Einstellungen der Zielseite."
    ],
    terms: [
      ["Meta-Description", "Kurze Seitenbeschreibung, die Suchmaschinen als Text im Suchergebnis verwenden können."],
      ["Canonical", "Hinweis auf die bevorzugte URL, wenn derselbe Inhalt über mehrere Adressen erreichbar ist."],
      ["Open Graph", "Metadaten für die Vorschau eines Links in sozialen Netzwerken und Messengern."]
    ]
  }
];

export const browserToolBySlug = new Map(browserTools.map((tool) => [tool.slug, tool]));
