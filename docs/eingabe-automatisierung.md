# Eingabe-Automatisierung für alle Werkzeuge

Stand: 18. Juli 2026

## Ziel

Nutzer geben nur Informationen ein, die das Werkzeug nicht zuverlässig selbst kennen oder ableiten kann. Formeln, gesetzliche Werte, Datumswerte, Beitragsgrenzen und technisch eindeutige Zwischenschritte übernimmt die Anwendung. Ergebnisse aktualisieren sich ohne zusätzlichen Startknopf.

## Gemeinsamer Vertrag

1. Rechnungen und Vorschauen laufen beim Laden und nach jeder gültigen Eingabe automatisch.
2. Persönliche Tatsachen bleiben Haupteingaben. Sätze, Grenzwerte und seltene Abweichungen liegen unter `Weitere Einstellungen`.
3. Heutige Datumswerte werden aus der Berliner Browserzeit eingesetzt.
4. Gesetzliche Werte tragen ein Bezugsjahr und werden zentral statt mehrfach im Katalog gepflegt.
5. Dateiwerkzeuge verarbeiten nach der Dateiauswahl mit einer brauchbaren Voreinstellung. Der notwendige Download bleibt eine bewusste Nutzeraktion.
6. Eine automatisch gesetzte Annahme bleibt änderbar, wenn sie je nach Vertrag, Kasse, Betrieb oder Einzelfall abweichen kann.

## Rechner

- Prozent: Nur die gesuchte Rechenart und die beiden bekannten Größen bleiben nötig.
- Mehrwertsteuer: Regulär 19 Prozent, ermäßigt 7 Prozent und 0 Prozent sind direkt wählbar.
- Rabatt: Ein zweiter Rabatt ist optional und stört die erste Rechnung nicht.
- Marge: Einstands- und Verkaufspreis sind die einzigen nicht ableitbaren Werte.
- Zinseszins: Kapital, Sparrate, Laufzeit und erwartete Rendite bleiben echte Szenarioangaben.
- Zahlungsgebühren: Betrag und Tarifwerte bleiben nötig, weil Anbieter und Vertrag nicht zuverlässig aus dem Browser erkennbar sind.
- Fahrtkosten: Strecke, Verbrauch und Kraftstoffpreis bleiben persönlich; Personenteilung ist eine weitere Einstellung.
- Stromkosten: Leistung und tägliche Laufzeit stehen vorn; Betriebstage und persönlicher Strompreis sind sinnvoll vorbelegt und anpassbar.
- Urlaub: Eigene Arbeitstage stehen vorn; Vollzeitwoche und volle zwölf Monate sind vorbelegt.
- Zeitspanne: Das Enddatum ist automatisch heute.
- Skonto: Rechnungsdatum ist automatisch heute; übliche Fristen sind vorbelegt.
- Stückpreis: Vergleichseinheit wird aus Stück, 100 oder 1.000 gewählt statt selbst ausgerechnet.
- Stundenlohn: Zwölf Gehälter sind Standard; abweichende Sonderzahlungen bleiben optional.
- Arbeitgeberkosten: Sozialversicherungsanteile und Beitragsgrenzen 2026 werden berechnet; nur betriebliche Umlagen bleiben änderbar.
- Minijob: Grenze 603 Euro und Mindestlohn 13,90 Euro für 2026 sind eingesetzt.
- Brutto-Netto: Nutzer geben Brutto, Steuerklasse und Kinderzahl ein; Tarif, Beitragsgrenzen und Sozialabgaben 2026 werden berechnet.
- GKV: Vollständiges Brutto wird automatisch auf 5.812,50 Euro monatlich begrenzt; 14,6 Prozent plus 2,9 Prozent Durchschnittszusatzbeitrag sind eingesetzt.
- Zusatzbeitrag: Beitragsgrenze und hälftiger Arbeitnehmeranteil werden automatisch angewendet.
- Pflegeversicherung: Kinderlosenzuschlag, Kinderabschläge und Beitragsgrenze werden abgeleitet; seltene gesetzliche Ausnahmen und die Sachsen-Abweichung bleiben unter den weiteren Einstellungen änderbar.
- Krankengeld: Das bisher verlangte Netto und der pauschale Abzug entfallen; beides wird aus Brutto und persönlichen Angaben geschätzt.
- Firmenwagen: Fahrzeugart bestimmt den 1-, 0,5- oder 0,25-Prozent-Ansatz; 0,03 Prozent je Entfernungskilometer werden eingesetzt.
- Pendlerpauschale: Seit 2026 gelten 0,38 Euro ab dem ersten Kilometer; alte Schwellen- und Satzfelder entfallen.
- GKV/PKV: GKV-Anteil und möglicher PKV-Arbeitgeberzuschuss werden aus den Werten 2026 abgeleitet.
- Monatsbudget: Einnahmen und Ausgaben bleiben persönliche Tatsachen und sind nicht automatisch ersetzbar.

## Browser-Werkzeuge

- PDF verkleinern, Bilder komprimieren, HEIC in JPG, PDFs zusammenfügen, JPG/PDF umwandeln und PDF unterschreiben: Verarbeitung startet nach Auswahl beziehungsweise nach der letzten nötigen Positionierung automatisch.
- Wörter und Zeichen: Auswertung war bereits live und bleibt es.
- Arbeitszeit: Ergebnis ändert sich ohne Berechnen-Knopf.
- IBAN und SEPA-QR: IBAN-Prüfung und QR-Erzeugung laufen, sobald die nötigen Angaben vollständig sind.
- QR-Code: Vorschau wird während der Eingabe aktualisiert.
- Farbkontrast: Auswertung war bereits live und bleibt es.
- Meta-Tags: Vorschau und HTML-Block werden während der Eingabe aktualisiert.

## Zentral gepflegte Werte für 2026

- GKV: 14,6 Prozent allgemeiner Beitrag, 2,9 Prozent durchschnittlicher Zusatzbeitrag, 5.812,50 Euro monatliche Beitragsbemessungsgrenze.
- Pflegeversicherung: 3,6 Prozent Grundbeitrag, 0,6 Prozent Kinderlosenzuschlag und 0,25 Prozentpunkte Abschlag je weiterem berücksichtigten Kind ab dem zweiten.
- Rentenversicherung: 18,6 Prozent gesamt und 8.450 Euro monatliche Beitragsbemessungsgrenze.
- Minijob: 603 Euro Verdienstgrenze und 13,90 Euro Mindestlohn.
- Entfernungspauschale: 0,38 Euro ab dem ersten Entfernungskilometer.
- Einkommensteuertarif: § 32a EStG für 2026 mit 12.348 Euro Grundfreibetrag.

Quellen: Bundesgesundheitsministerium, Bundesministerium für Arbeit und Soziales, Bundesregierung, Bundesfinanzministerium und § 32a EStG. Die Werte liegen gemeinsam in `src/calculator-data.js`; ein Jahreswechsel wird dort als eigener Pflegeschritt vorgenommen.
