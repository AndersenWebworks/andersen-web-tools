export const calculatorGuides = {
  prozentrechner: {
    steps: [
      "Wähle zuerst, welche Größe du suchst: Prozentwert, Prozentsatz, Grundwert oder Veränderung.",
      "Trage die beiden Werte ein, die du bereits kennst.",
      "Sobald beide Werte eingetragen sind, erscheinen Ergebnis und Rechnung."
    ],
    fieldHelp: {
      mode: "Der Rechner passt die folgenden Felder an die gewählte Prozentaufgabe an.",
      base: "Der ganze Ausgangswert, auf den sich die Prozentangabe bezieht, zum Beispiel 250 Euro.",
      rate: "Der Anteil in Prozent, zum Beispiel 19 bei 19 Prozent.",
      part: "Der Teil des Grundwerts, zum Beispiel 47,50 Euro von insgesamt 250 Euro.",
      oldValue: "Der Wert vor der Erhöhung oder Senkung.",
      newValue: "Der Wert nach der Erhöhung oder Senkung."
    },
    terms: [
      ["Grundwert", "Das Ganze, von dem ein prozentualer Anteil berechnet wird."],
      ["Prozentwert", "Der konkrete Teil des Grundwerts."],
      ["Prozentsatz", "Der Anteil in Hundertsteln, angegeben mit dem Zeichen %." ]
    ],
    faq: [
      ["Wie berechne ich 19 Prozent von 250?", "Wähle Prozentwert, trage 250 als Grundwert und 19 als Prozentsatz ein."],
      ["Warum sind 20 Prozent mehr und danach 20 Prozent weniger nicht wieder der Ausgangswert?", "Weil sich die zweite Rechnung auf einen anderen Grundwert bezieht. Der Rechner für Veränderungen zeigt diesen Unterschied."]
    ]
  },
  mehrwertsteuerrechner: {
    steps: [
      "Wähle, ob dein Ausgangsbetrag netto oder brutto ist.",
      "Trage Betrag und passenden Mehrwertsteuersatz ein.",
      "Du erhältst Nettobetrag, Steueranteil und Bruttobetrag getrennt."
    ],
    fieldHelp: {
      mode: "Netto zu Brutto addiert die Steuer. Brutto zu Netto löst die bereits enthaltene Steuer heraus.",
      amount: "Der Betrag, den du bereits kennst. Ob er netto oder brutto ist, legst du darüber fest.",
      rate: "Der anzuwendende Steuersatz, häufig 19 oder 7 Prozent. Prüfe, welcher Satz für deinen Fall gilt."
    },
    terms: [
      ["Netto", "Preis ohne Mehrwertsteuer."],
      ["Brutto", "Preis einschließlich Mehrwertsteuer."],
      ["Mehrwertsteuer", "Steueranteil zwischen Netto- und Bruttobetrag."]
    ],
    faq: [
      ["Kann ich einen anderen Steuersatz als 19 oder 7 Prozent verwenden?", "Ja. Das Feld ist frei änderbar, damit auch andere oder künftige Steuersätze berechnet werden können."],
      ["Warum sind 19 Prozent vom Bruttopreis nicht die enthaltene Steuer?", "Weil die 19 Prozent auf den Nettopreis aufgeschlagen werden. Für die Rückwärtsrechnung wird der Bruttopreis durch 1,19 geteilt."]
    ]
  },
  rabattrechner: {
    steps: [
      "Trage den Preis vor allen Rabatten ein.",
      "Gib den ersten und bei Bedarf einen zweiten Rabatt ein. Ohne zweiten Rabatt bleibt dort 0 stehen.",
      "Der Rechner zeigt Endpreis, Ersparnis und den tatsächlich wirksamen Gesamtrabatt."
    ],
    fieldHelp: {
      price: "Der Preis, bevor ein Rabatt abgezogen wird.",
      discountOne: "Der erste Nachlass in Prozent.",
      discountTwo: "Ein zusätzlicher Nachlass, der auf den bereits reduzierten Preis angewendet wird."
    },
    terms: [
      ["Rabatt", "Ein prozentualer Nachlass auf einen Preis."],
      ["Effektiver Rabatt", "Die gesamte Ersparnis im Verhältnis zum ursprünglichen Preis."],
      ["Aufeinanderfolgende Rabatte", "Der zweite Rabatt wird vom bereits verminderten Preis abgezogen."]
    ],
    faq: [
      ["Ergeben 20 Prozent und 10 Prozent zusammen 30 Prozent Rabatt?", "Nein. Nacheinander angewendet ergeben sie 28 Prozent, weil der zweite Rabatt auf den schon reduzierten Preis wirkt."],
      ["Was trage ich ein, wenn es nur einen Rabatt gibt?", "Lass den zweiten Rabatt einfach bei 0 Prozent."]
    ]
  },
  margenrechner: {
    steps: [
      "Trage deinen Einkaufspreis ohne Mehrwertsteuer ein.",
      "Trage den geplanten oder tatsächlichen Netto-Verkaufspreis ein.",
      "Vergleiche Rohertrag, Gewinnaufschlag und Handelsspanne im Ergebnis."
    ],
    fieldHelp: {
      cost: "Was dich die Ware oder Leistung im Einkauf kostet, ohne Mehrwertsteuer.",
      sale: "Der Verkaufspreis ohne Mehrwertsteuer. Nur so sind Einkauf und Verkauf sauber vergleichbar."
    },
    terms: [
      ["Rohertrag", "Verkaufspreis minus Einstandspreis, noch vor weiteren Betriebskosten und Steuern."],
      ["Gewinnaufschlag", "Rohertrag im Verhältnis zum Einstandspreis."],
      ["Handelsspanne oder Marge", "Rohertrag im Verhältnis zum Verkaufspreis."]
    ],
    faq: [
      ["Sind Marge und Aufschlag dasselbe?", "Nein. Beide verwenden denselben Rohertrag, beziehen ihn aber auf unterschiedliche Ausgangswerte."],
      ["Soll ich Brutto- oder Nettopreise eingeben?", "Für eine geschäftliche Kalkulation solltest du beide Preise netto eingeben."]
    ]
  },
  zinseszinsrechner: {
    steps: [
      "Trage vorhandenes Startkapital und deine monatliche Sparrate ein.",
      "Gib eine angenommene jährliche Rendite und die Laufzeit ein.",
      "Vergleiche im Ergebnis deine Einzahlungen mit dem rechnerischen Zinsertrag."
    ],
    fieldHelp: {
      capital: "Der Betrag, der zu Beginn bereits angelegt ist. Ohne Startkapital kannst du 0 eintragen.",
      monthly: "Der Betrag, der in dieser Rechnung am Ende jedes Monats hinzukommt.",
      rate: "Angenommene durchschnittliche Wertentwicklung pro Jahr. Sie ist keine Garantie.",
      years: "Wie lange das Geld angelegt und die Sparrate eingezahlt wird."
    },
    terms: [
      ["Zinseszins", "Erträge werden mit angelegt und können in späteren Zeiträumen selbst weitere Erträge erzeugen."],
      ["Rendite", "Prozentuale Wertentwicklung einer Anlage in einem Zeitraum."],
      ["Endkapital", "Rechnerischer Gesamtwert aus Einzahlungen und Erträgen am Ende der Laufzeit."]
    ],
    faq: [
      ["Ist das Ergebnis eine sichere Prognose?", "Nein. Der Rechner verwendet eine gleichbleibende Rendite. Reale Anlagen schwanken und können Kosten oder Steuern verursachen."],
      ["Wann wird die Sparrate eingezahlt?", "In dieser Rechnung jeweils am Monatsende."]
    ]
  },
  zahlungsgebuehrenrechner: {
    steps: [
      "Wähle, ob du die Gebühr von einem Zahlbetrag abziehen oder einen gewünschten Nettoeingang erreichen willst.",
      "Übernimm Prozentsatz und Festgebühr aus deinem aktuellen Anbietertarif.",
      "Der Rechner trennt Zahlbetrag, Gebühr und verbleibenden Nettoeingang."
    ],
    fieldHelp: {
      mode: "Gebühr abziehen startet mit dem Zahlbetrag. Nettoziel berechnet rückwärts, was der Kunde zahlen müsste.",
      amount: "Je nach Rechenrichtung der vorhandene Zahlbetrag oder der gewünschte Betrag nach Gebühren.",
      rate: "Der prozentuale Teil der Gebühr laut aktuellem Tarif des Zahlungsdienstes.",
      fixed: "Ein fester Betrag, der zusätzlich pro Zahlung berechnet wird."
    },
    terms: [
      ["Variable Gebühr", "Gebühr, deren Höhe vom Zahlbetrag abhängt."],
      ["Festgebühr", "Fester Betrag pro Zahlung, unabhängig von ihrer Höhe."],
      ["Nettoeingang", "Betrag, der nach Abzug der Zahlungsgebühren übrig bleibt."]
    ],
    faq: [
      ["Sind die voreingestellten Gebühren immer aktuell?", "Nein. Zahlungsanbieter ändern Tarife. Prüfe Prozentsatz und Festgebühr in deinem Vertrag und passe die Felder an."],
      ["Kann ich damit andere Anbieter als PayPal berechnen?", "Ja, wenn deren Gebühr aus einem Prozentsatz und einer festen Gebühr besteht."]
    ]
  },
  fahrtkostenrechner: {
    steps: [
      "Trage Hin- und Rückweg zusammen als Gesamtstrecke ein.",
      "Ergänze Verbrauch, aktuellen Kraftstoffpreis und die Zahl der Mitfahrenden.",
      "Du siehst Gesamtkosten, benötigte Liter und den Anteil pro Person."
    ],
    fieldHelp: {
      distance: "Alle gefahrenen Kilometer zusammen. Für Hin- und Rückfahrt musst du beide Strecken berücksichtigen.",
      consumption: "Durchschnittlicher Kraftstoffverbrauch deines Fahrzeugs für 100 Kilometer.",
      fuelPrice: "Preis für einen Liter des verwendeten Kraftstoffs.",
      people: "Zahl der Personen, auf die die reinen Kraftstoffkosten gleichmäßig verteilt werden sollen."
    },
    terms: [
      ["Verbrauch je 100 km", "Liter Kraftstoff, die das Fahrzeug durchschnittlich für 100 Kilometer benötigt."],
      ["Gesamtstrecke", "Alle Kilometer der geplanten Fahrt einschließlich Rückweg und Umwegen."],
      ["Fahrtkosten", "Hier nur Kraftstoffkosten; Verschleiß, Versicherung und Wertverlust sind nicht enthalten."]
    ],
    faq: [
      ["Sind Wartung und Verschleiß enthalten?", "Nein. Der Rechner ermittelt bewusst nur die Kraftstoffkosten."],
      ["Muss ich die einfache Strecke oder Hin- und Rückweg eingeben?", "Trage alle tatsächlich gefahrenen Kilometer als Gesamtstrecke ein."]
    ]
  },
  stromkostenrechner: {
    steps: [
      "Lies die Leistung des Geräts in Watt vom Typenschild oder Netzteil ab.",
      "Trage tägliche Nutzungsdauer, Betriebstage und deinen Strompreis ein.",
      "Der Rechner zeigt Verbrauch und Kosten pro Tag, Monat und Jahr."
    ],
    fieldHelp: {
      watts: "Elektrische Leistung des Geräts. Sie steht meist auf dem Typenschild oder Netzteil.",
      hours: "Durchschnittliche Zahl der Stunden, die das Gerät an einem Betriebstag läuft.",
      days: "An wie vielen Tagen im Jahr das Gerät ungefähr genutzt wird.",
      price: "Preis für eine Kilowattstunde aus deinem Stromvertrag."
    },
    terms: [
      ["Watt", "Einheit der momentanen elektrischen Leistung."],
      ["Kilowattstunde (kWh)", "Energiemenge, die ein Gerät mit 1.000 Watt in einer Stunde verbraucht."],
      ["Betriebstag", "Ein Tag, an dem das Gerät für die eingetragene Dauer genutzt wird."]
    ],
    faq: [
      ["Warum weicht der echte Verbrauch manchmal ab?", "Viele Geräte ziehen nicht ständig ihre Nennleistung. Eine Steckdosen-Messung liefert dann den genaueren Durchschnitt."],
      ["Wo finde ich meinen Strompreis?", "Auf der letzten Abrechnung oder im Preisblatt deines Stromvertrags, meist in Cent oder Euro je kWh."]
    ]
  },
  "urlaubsanspruch-rechner": {
    steps: [
      "Übernimm den Jahresurlaub und die Wochenarbeitstage einer vergleichbaren Vollzeitstelle.",
      "Trage deine eigenen Arbeitstage pro Woche und die vollen Beschäftigungsmonate ein.",
      "Nutze das Ergebnis als rechnerische Orientierung und prüfe Vertrag und Rundungsregeln."
    ],
    fieldHelp: {
      annual: "Urlaubstage pro Jahr, die bei der angegebenen Vollzeit-Woche gelten.",
      fullDays: "Zahl der regelmäßigen Arbeitstage pro Woche in der Vollzeit-Vergleichsgröße.",
      actualDays: "An wie vielen festen Tagen pro Woche du tatsächlich arbeitest.",
      months: "Volle Monate im betreffenden Urlaubsjahr, für die anteilig gerechnet werden soll."
    },
    terms: [
      ["Jahresurlaub", "Urlaubsanspruch für ein vollständiges Beschäftigungsjahr."],
      ["Arbeitstage pro Woche", "Tage mit Arbeitspflicht, nicht die Zahl der Wochenstunden."],
      ["Anteiliger Urlaub", "Auf einen Teil des Jahres umgerechneter Jahresurlaub."]
    ],
    faq: [
      ["Zählen meine Wochenstunden oder meine Arbeitstage?", "Für diese Umrechnung zählt, auf wie viele Tage sich die Arbeit verteilt."],
      ["Ist das Ergebnis mein verbindlicher Rechtsanspruch?", "Nein. Eintrittsdatum, Wartezeit, Vertrag, Tarif und Rundung können das Ergebnis verändern."]
    ]
  },
  zeitspannenrechner: {
    steps: [
      "Wähle das frühere Datum als Startdatum.",
      "Wähle das spätere Datum als Enddatum.",
      "Das Ergebnis zeigt Gesamttage und die kalendergenaue Aufteilung in Jahre, Monate und Tage."
    ],
    fieldHelp: {
      start: "Der Beginn der Zeitspanne, zum Beispiel Geburts-, Start- oder Rechnungsdatum.",
      end: "Das Datum, bis zu dem gerechnet werden soll."
    },
    terms: [
      ["Kalendergenau", "Monate und Jahre werden nach ihren echten Kalenderlängen gezählt."],
      ["Gesamttage", "Tatsächliche Zahl der Tage zwischen beiden Daten."],
      ["Zeitspanne", "Zeitraum vom Startdatum bis zum Enddatum."]
    ],
    faq: [
      ["Wird der Starttag mitgezählt?", "Der Rechner zeigt die verstrichene Zeit zwischen beiden Datumsgrenzen."],
      ["Kann ich damit mein Alter berechnen?", "Ja. Trage dein Geburtsdatum als Start und den gewünschten Stichtag als Ende ein."]
    ]
  },
  skontorechner: {
    steps: [
      "Trage Rechnungsbetrag, Rechnungsdatum und den angebotenen Skontosatz ein.",
      "Ergänze die Frist für Skonto und das normale Zahlungsziel in Kalendertagen.",
      "Du erhältst Zahlbetrag, Ersparnis sowie beide Stichtage."
    ],
    fieldHelp: {
      amount: "Gesamter Rechnungsbetrag, von dem der Skontoabzug berechnet wird.",
      rate: "Prozentualer Nachlass bei Zahlung innerhalb der Skontofrist.",
      invoiceDate: "Datum, von dem aus beide Fristen gezählt werden.",
      discountDays: "Zahl der Kalendertage, in denen die vergünstigte Zahlung möglich ist.",
      dueDays: "Zahl der Kalendertage bis zur normalen Fälligkeit ohne Skonto."
    },
    terms: [
      ["Skonto", "Preisnachlass für eine Zahlung innerhalb einer kurzen vereinbarten Frist."],
      ["Skontofrist", "Zeitraum, in dem der reduzierte Betrag gezahlt werden darf."],
      ["Zahlungsziel", "Spätestes vereinbartes Zahlungsdatum ohne den Skontoabzug."]
    ],
    faq: [
      ["Rechnet der Rechner mit Werk- oder Kalendertagen?", "Er addiert Kalendertage. Abweichende Vertragsregeln musst du gesondert berücksichtigen."],
      ["Was ist der Zahlbetrag?", "Das ist der Rechnungsbetrag nach Abzug des Skontos."]
    ]
  },
  stueckpreisvergleich: {
    steps: [
      "Trage Preis und Menge des ersten Angebots ein.",
      "Ergänze Preis und Menge des zweiten Angebots in derselben Einheit.",
      "Vergleiche die Kosten pro Einheit und die Ersparnis des günstigeren Angebots."
    ],
    fieldHelp: {
      priceA: "Gesamtpreis der ersten Packung oder Menge.",
      quantityA: "Inhalt des ersten Angebots, zum Beispiel 500 Gramm.",
      priceB: "Gesamtpreis der zweiten Packung oder Menge.",
      quantityB: "Inhalt des zweiten Angebots in genau derselben Einheit wie Angebot A.",
      unit: "Gemeinsame Bezugsmenge für den Preisvergleich, zum Beispiel 100 Gramm oder 1 Liter."
    },
    terms: [
      ["Stückpreis", "Preis für eine einzelne Einheit oder eine festgelegte Vergleichsmenge."],
      ["Vergleichseinheit", "Gemeinsame Menge, auf die beide Preise umgerechnet werden."],
      ["Grundpreis", "Preis je standardisierter Mengeneinheit, etwa pro Kilogramm oder Liter."]
    ],
    faq: [
      ["Kann ich Gramm und Kilogramm direkt mischen?", "Nein. Rechne beide Mengen vorher in dieselbe Einheit um, zum Beispiel beide in Gramm."],
      ["Was gebe ich als Vergleichseinheit ein?", "Eine sinnvolle gemeinsame Menge, zum Beispiel 100 für den Preis je 100 Gramm."]
    ]
  },
  stundenlohnrechner: {
    steps: [
      "Trage dein regelmäßiges Brutto-Monatsgehalt und die vereinbarten Wochenstunden ein.",
      "Wähle, wie viele Gehälter du pro Jahr erhältst.",
      "Der Rechner zeigt durchschnittliche Monatsstunden, Jahresgehalt und rechnerischen Stundenlohn."
    ],
    fieldHelp: {
      monthly: "Regelmäßiges Bruttogehalt vor Steuern und Abgaben.",
      weeklyHours: "Vertraglich vereinbarte Arbeitsstunden in einer normalen Woche.",
      payments: "Zahl der Gehaltszahlungen pro Jahr. Bei Weihnachts- oder Urlaubsgeld können es mehr als zwölf sein."
    },
    terms: [
      ["Bruttogehalt", "Gehalt vor Abzug von Steuern und Sozialversicherungsbeiträgen."],
      ["Monatsstunden", "Durchschnittliche Arbeitsstunden pro Monat, aus 52 Wochen auf zwölf Monate verteilt."],
      ["Rechnerischer Stundenlohn", "Jahresbrutto geteilt durch die vereinbarte Jahresarbeitszeit."]
    ],
    faq: [
      ["Warum wird mit 52 Wochen gerechnet?", "So werden unterschiedlich lange Monate auf einen Jahresdurchschnitt gebracht."],
      ["Sind Überstunden enthalten?", "Nur wenn sie bereits in der eingetragenen Wochenarbeitszeit oder im Gehalt berücksichtigt sind."]
    ]
  },
  arbeitgeberkostenrechner: {
    steps: [
      "Trage das monatliche Bruttogehalt ein.",
      "Öffne die weiteren Einstellungen nur, wenn betriebliche Umlagen oder feste Zusatzkosten abweichen.",
      "Das Ergebnis zeigt Brutto, Sozialversicherung und gesamte Monats- und Jahreskosten."
    ],
    fieldHelp: {
      gross: "Bruttogehalt des Beschäftigten vor persönlichen Abzügen.",
      levies: "Weitere prozentuale Arbeitgeberkosten wie Umlagen und Unfallversicherung.",
      fixed: "Feste monatliche Zusatzkosten, etwa Zuschüsse, Ausstattung oder pauschal angesetzte Verwaltungskosten.",
      additionalRate: "Zusatzbeitrag der Krankenkasse. Der Arbeitgeber trägt bei Beschäftigten grundsätzlich die Hälfte."
    },
    terms: [
      ["Lohnnebenkosten", "Zusätzliche Arbeitgeberkosten neben dem Bruttogehalt."],
      ["Arbeitgeberanteil", "Teil der Sozialversicherungsbeiträge, den der Arbeitgeber trägt."],
      ["Umlagen", "Arbeitgeberbeiträge zu Ausgleichsverfahren, zum Beispiel bei Krankheit oder Mutterschaft."]
    ],
    faq: [
      ["Ist das Ergebnis eine vollständige Lohnabrechnung?", "Nein. Beitragsgrenzen, individuelle Umlagen und weitere Personalkosten können abweichen."],
      ["Woher bekomme ich die richtigen Prozentsätze?", "Aus deiner Lohnabrechnung, Lohnsoftware oder von der zuständigen Abrechnungsstelle."]
    ]
  },
  "minijob-rechner": {
    steps: [
      "Trage deinen vereinbarten Stundenlohn ein.",
      "Ändere Verdienstgrenze oder Rentenbeitrag nur, wenn sie in deinem Fall vom eingesetzten Wert abweichen.",
      "Du erhältst die rechnerisch möglichen Monats- und Wochenstunden sowie den Rentenabzug."
    ],
    fieldHelp: {
      limit: "Maximaler regelmäßiger Monatsverdienst, bis zu dem deine Beschäftigung als Minijob behandelt werden soll.",
      hourly: "Vereinbarter Bruttoverdienst für eine Arbeitsstunde.",
      pensionRate: "Prozentualer Eigenanteil zur Rentenversicherung, sofern er bei dir anfällt."
    },
    terms: [
      ["Verdienstgrenze", "Höchster regelmäßiger Monatsverdienst für die betrachtete Minijob-Grenze."],
      ["Stundenlohn", "Bruttoverdienst für eine Arbeitsstunde."],
      ["Rentenbeitrag", "Eigener Beitrag zur gesetzlichen Rentenversicherung."]
    ],
    faq: [
      ["Welche Verdienstgrenze ist eingesetzt?", "Für 2026 sind 603 Euro im Monat eingesetzt."],
      ["Prüft der Rechner mehrere Minijobs?", "Nein. Mehrfachbeschäftigung und schwankende Verdienste brauchen eine individuelle Prüfung."]
    ]
  },
  "brutto-netto-schaetzer": {
    steps: [
      "Trage dein Monatsbrutto ein und wähle Steuerklasse sowie Kinderzahl.",
      "Ergänze Kirchensteuer oder einen abweichenden Krankenkassen-Zusatzbeitrag nur bei Bedarf.",
      "Der Rechner setzt Tarif und Beitragsgrenzen für 2026 ein und zeigt Steuern, Sozialabgaben und Netto."
    ],
    fieldHelp: {
      gross: "Gesamtes Monatsgehalt vor allen Abzügen.",
      taxClass: "Steuerklasse auf deiner Lohnabrechnung. Diese Näherung unterstützt I, III und IV.",
      children: "Kinder unter 25, die beim Pflegeversicherungsbeitrag berücksichtigt werden.",
      churchRate: "Kirchensteuersatz deines Bundeslands. Wenn du keine Kirchensteuer zahlst, bleibt die Auswahl auf Keine.",
      childlessSurcharge: "Der Zuschlag gilt grundsätzlich für kinderlose Versicherte ab 23 Jahren. Unter 23 oder bei einer gesetzlichen Ausnahme wählst du Gilt für mich nicht.",
      additionalRate: "Zusatzbeitrag deiner Krankenkasse. Voreingestellt ist der Durchschnitt für 2026.",
      other: "Weitere monatliche Abzüge, zum Beispiel ein eigener Zusatzbeitrag oder eine Pfändung."
    },
    terms: [
      ["Beitragspflichtiges Brutto", "Einkommen, auf das Sozialversicherungsbeiträge berechnet werden."],
      ["Lohnsteuer", "Vom Arbeitgeber einbehaltene Vorauszahlung auf die Einkommensteuer."],
      ["Netto", "Betrag nach den eingetragenen Steuern, Sozialabgaben und weiteren Abzügen."]
    ],
    faq: [
      ["Warum ist das Ergebnis eine Schätzung?", "Eine echte Lohnabrechnung berücksichtigt mehr persönliche Merkmale, Freibeträge, Einmalzahlungen und amtliche Rundungsregeln."],
      ["Warum fehlen Steuerklassen V und VI?", "Dafür wäre eine vereinfachte Näherung zu unzuverlässig. Diese Fälle gehören in einen amtlichen oder fachlich geprüften Lohnsteuerrechner."]
    ]
  },
  "gkv-beitragsrechner": {
    steps: [
      "Trage dein vollständiges Monatsbrutto ein.",
      "Ändere den voreingestellten Zusatzbeitrag nur, wenn du den Satz deiner Krankenkasse kennst.",
      "Der Rechner zeigt Gesamtbeitrag sowie den rechnerisch hälftigen Anteil beider Seiten."
    ],
    fieldHelp: {
      income: "Monatsbrutto vor Abzügen. Der Rechner begrenzt es automatisch auf die Beitragsbemessungsgrenze 2026.",
      additionalRate: "Kassenindividueller Zusatzbeitrag. Voreingestellt ist der Durchschnitt für 2026."
    },
    terms: [
      ["Beitragspflichtiges Einkommen", "Einkommen, das für die Beitragsberechnung berücksichtigt wird."],
      ["Zusatzbeitrag", "Von der Krankenkasse festgelegter Beitrag zusätzlich zum allgemeinen Satz."],
      ["Beitragsbemessungsgrenze", "Obergrenze des Einkommens, bis zu der Beiträge berechnet werden."]
    ],
    faq: [
      ["Soll ich mein vollständiges Brutto eingeben?", "Ja. Einkommen oberhalb von 5.812,50 Euro im Monat wird für 2026 automatisch begrenzt."],
      ["Ist der Arbeitnehmeranteil immer genau die Hälfte?", "Der Rechner verwendet diese Grundannahme. Individuelle Sonderregeln sind nicht enthalten."]
    ]
  },
  "zusatzbeitrag-vergleich": {
    steps: [
      "Trage dein beitragspflichtiges Monatseinkommen ein.",
      "Übernimm alten und neuen Zusatzbeitrag sowie deinen eigenen Anteil.",
      "Das Ergebnis zeigt die monatliche und jährliche Mehr- oder Minderbelastung."
    ],
    fieldHelp: {
      income: "Monatsbrutto vor Abzügen. Der Rechner berücksichtigt automatisch die Beitragsbemessungsgrenze 2026.",
      oldRate: "Bisheriger Zusatzbeitrag deiner Krankenkasse in Prozent.",
      newRate: "Neuer oder zum Vergleich verwendeter Zusatzbeitrag in Prozent.",
      employeeShare: "Anteil des Unterschieds, den du selbst trägst. Bei hälftiger Teilung sind das 50 Prozent."
    },
    terms: [
      ["Zusatzbeitrag", "Kassenindividueller Prozentsatz zusätzlich zum allgemeinen GKV-Beitrag."],
      ["Eigener Anteil", "Teil des Beitragsunterschieds, der bei dir selbst ankommt."],
      ["Beitragspflichtiges Einkommen", "Einkommen innerhalb der geltenden Beitragsgrenzen."]
    ],
    faq: [
      ["Was bedeutet eigener Anteil 50 Prozent?", "Dann wird die Differenz in dieser Rechnung hälftig zwischen Arbeitnehmer und Arbeitgeber geteilt."],
      ["Vergleicht der Rechner auch Leistungen der Kassen?", "Nein. Er vergleicht nur die eingegebenen Zusatzbeiträge und keine Leistungen oder Bonusprogramme."]
    ]
  },
  "pflegeversicherung-rechner": {
    steps: [
      "Trage dein Monatsbrutto ein und wähle die Zahl der berücksichtigten Kinder unter 25.",
      "Wähle Sachsen nur, wenn dort dein Beschäftigungsort liegt.",
      "Der Rechner setzt Beitragsgrenze, Kinderlosenzuschlag und Kinderabschläge für 2026 ein."
    ],
    fieldHelp: {
      income: "Monatsbrutto vor Abzügen. Der Rechner begrenzt es automatisch auf die Beitragsbemessungsgrenze 2026.",
      children: "Berücksichtigte Kinder unter 25. Ab dem zweiten Kind sinkt der eigene Beitrag schrittweise.",
      childlessSurcharge: "Der Zuschlag gilt grundsätzlich für kinderlose Versicherte ab 23 Jahren. Unter 23 oder bei einer gesetzlichen Ausnahme wählst du Gilt für mich nicht.",
      saxony: "In Sachsen ist der Arbeitgeberanteil niedriger und der eigene Anteil entsprechend höher."
    },
    terms: [
      ["Grundbeitrag", "Allgemeiner Beitrag zur Pflegeversicherung vor persönlichen Zu- oder Abschlägen."],
      ["Persönlicher Zuschlag", "Zusätzlicher Beitragsanteil, der nur bei bestimmten persönlichen Voraussetzungen anfällt."],
      ["Arbeitgeberanteil", "Teil des Beitrags, den der Arbeitgeber trägt."]
    ],
    faq: [
      ["Wie wird Kinderlosigkeit berücksichtigt?", "Bei keiner berücksichtigten Kinderzahl wird der Kinderlosenzuschlag von 0,6 Prozentpunkten eingesetzt."],
      ["Warum gibt es eine Auswahl für Sachsen?", "Dort ist die Aufteilung zwischen Arbeitgeber und Beschäftigten anders als in den übrigen Bundesländern."]
    ]
  },
  krankengeldrechner: {
    steps: [
      "Trage dein regelmäßiges Monatsbrutto ein und wähle Steuerklasse sowie Kinderzahl.",
      "Ergänze Kirchensteuer oder einen abweichenden Zusatzbeitrag nur bei Bedarf.",
      "Der Rechner schätzt zuerst dein Netto und daraus Krankengeld sowie verbleibenden Zahlbetrag."
    ],
    fieldHelp: {
      gross: "Regelmäßiges Bruttoarbeitsentgelt pro Monat vor allen Abzügen.",
      taxClass: "Steuerklasse auf deiner Lohnabrechnung. Diese Näherung unterstützt I, III und IV.",
      children: "Kinder unter 25, die beim Pflegeversicherungsbeitrag berücksichtigt werden.",
      churchRate: "Kirchensteuersatz deines Bundeslands oder Keine.",
      childlessSurcharge: "Der Zuschlag gilt grundsätzlich für kinderlose Versicherte ab 23 Jahren. Unter 23 oder bei einer gesetzlichen Ausnahme wählst du Gilt für mich nicht.",
      additionalRate: "Zusatzbeitrag deiner Krankenkasse. Voreingestellt ist der Durchschnitt für 2026."
    },
    terms: [
      ["Brutto-Krankengeld", "Ausgangsbetrag vor den noch abzuführenden Sozialversicherungsbeiträgen."],
      ["Zahlbetrag", "Geschätzter Betrag nach den eingetragenen Abzügen."],
      ["Regelmäßiges Netto", "Üblicher monatlicher Auszahlungsbetrag vor Beginn der Arbeitsunfähigkeit."]
    ],
    faq: [
      ["Warum wird der niedrigere von zwei Werten verwendet?", "Die Grundformel begrenzt das Krankengeld auf 70 Prozent vom Brutto und zugleich auf höchstens 90 Prozent vom Netto."],
      ["Ist das Ergebnis der Betrag meiner Krankenkasse?", "Nein. Bemessungsgrenzen, Einmalzahlungen und dein Versicherungsverhältnis können zu einem anderen Ergebnis führen."]
    ]
  },
  firmenwagenrechner: {
    steps: [
      "Trage den Bruttolistenpreis ein und wähle die passende Fahrzeugart.",
      "Ergänze die einfache Entfernung zur ersten Tätigkeitsstätte.",
      "Das Ergebnis zeigt den geldwerten Vorteil für Fahrzeugnutzung und Arbeitsweg."
    ],
    fieldHelp: {
      listPrice: "Offizieller Bruttolistenpreis des Fahrzeugs bei Erstzulassung, nicht der tatsächliche Kaufpreis.",
      vehicleType: "Wähle den pauschalen Ansatz, dessen Voraussetzungen dein Fahrzeug tatsächlich erfüllt.",
      distance: "Einfache Strecke zwischen Wohnung und erster Tätigkeitsstätte.",
    },
    terms: [
      ["Bruttolistenpreis", "Unverbindlicher Listenpreis des Neuwagens einschließlich Umsatzsteuer und Sonderausstattung."],
      ["Geldwerter Vorteil", "Steuerpflichtiger Wert der privaten Nutzung eines betrieblichen Vorteils."],
      ["Grenzabgabensatz", "Geschätzter Anteil von Steuern und Abgaben auf zusätzliches Einkommen."]
    ],
    faq: [
      ["Kann ich den tatsächlichen Kaufpreis eingeben?", "Für die pauschale Methode wird normalerweise der maßgebliche Bruttolistenpreis verwendet, nicht der Kaufpreis."],
      ["Sind Elektroauto-Sonderregeln enthalten?", "Die üblichen ermäßigten Ansätze sind auswählbar. Ob dein Fahrzeug die Voraussetzungen erfüllt, musst du anhand des konkreten Fahrzeugs prüfen."]
    ]
  },
  "pendlerpauschale-rechner": {
    steps: [
      "Trage die einfache Entfernung zur ersten Tätigkeitsstätte und deine Arbeitstage ein.",
      "Der Rechner verwendet automatisch 38 Cent ab dem ersten Kilometer für 2026.",
      "Der Rechner zeigt den jährlichen Werbungskostenbetrag, nicht die Steuererstattung."
    ],
    fieldHelp: {
      distance: "Nur die einfache Strecke zwischen Wohnung und erster Tätigkeitsstätte, nicht Hin- und Rückweg.",
      days: "Tage im Jahr, an denen du diese Strecke tatsächlich zur Arbeit zurücklegst."
    },
    terms: [
      ["Entfernungspauschale", "Steuerlich ansetzbarer Betrag für Wege zur ersten Tätigkeitsstätte."],
      ["Einfache Entfernung", "Nur der Weg von der Wohnung zur Arbeit, ohne Rückweg."],
      ["Werbungskosten", "Beruflich veranlasste Ausgaben, die das zu versteuernde Einkommen mindern können."]
    ],
    faq: [
      ["Ist der berechnete Betrag meine Steuererstattung?", "Nein. Er mindert gegebenenfalls das zu versteuernde Einkommen. Die tatsächliche Steuerwirkung hängt von deiner Situation ab."],
      ["Zähle ich Homeoffice-Tage mit?", "Nur Tage, an denen du die eingetragene Strecke tatsächlich zur ersten Tätigkeitsstätte gefahren bist."]
    ]
  },
  "gkv-pkv-vergleich": {
    steps: [
      "Trage dein Monatsbrutto und den Gesamtbeitrag eines konkreten PKV-Angebots ein.",
      "Wähle die berücksichtigte Kinderzahl; ergänze Selbstbehalt oder abweichenden Zusatzbeitrag nur bei Bedarf.",
      "Vergleiche nur die eigenen Kosten. Leistungen und langfristige Beitragsentwicklung gehören in eine separate Entscheidung."
    ],
    fieldHelp: {
      income: "Monatsbrutto vor Abzügen. Für die GKV werden die Beitragsgrenzen 2026 automatisch angewendet.",
      pkv: "Monatlicher Gesamtbeitrag des konkreten privaten Angebots einschließlich Pflegepflichtversicherung.",
      children: "Kinder unter 25, die den eigenen Pflegeversicherungsbeitrag beeinflussen.",
      childlessSurcharge: "Der Zuschlag gilt grundsätzlich für kinderlose Versicherte ab 23 Jahren. Unter 23 oder bei einer gesetzlichen Ausnahme wählst du Gilt für mich nicht.",
      additionalRate: "Zusatzbeitrag deiner Krankenkasse. Voreingestellt ist der Durchschnitt für 2026.",
      selfPay: "Betrag pro Jahr, den du voraussichtlich selbst für Leistungen tragen musst, bevor oder weil der Tarif nicht zahlt."
    },
    terms: [
      ["Selbstbehalt", "Gesundheitskosten, die du pro Jahr zunächst oder vollständig selbst trägst."],
      ["Arbeitgeberzuschuss", "Anteil, den der Arbeitgeber zum privaten Krankenversicherungsbeitrag beisteuert."],
      ["Szenariovergleich", "Rechnerischer Kostenvergleich mit deinen Eingaben, kein Tarif- oder Leistungsvergleich."]
    ],
    faq: [
      ["Empfiehlt der Rechner GKV oder PKV?", "Nein. Er vergleicht nur die eingegebenen eigenen Monatskosten."],
      ["Warum wird der Selbstbehalt auf den Monat umgelegt?", "So lässt sich ein erwarteter Jahresbetrag mit den monatlichen Beiträgen vergleichen."]
    ]
  },
  "monatsbudget-rechner": {
    steps: [
      "Trage alle regelmäßigen Nettoeinnahmen eines Monats ein.",
      "Teile deine Ausgaben in feste Kosten, veränderliche Ausgaben und geplantes Sparen auf.",
      "Der Rechner zeigt freien Betrag, Sparquote, Ausgabenquote und jährliches Sparpotenzial."
    ],
    fieldHelp: {
      income: "Alle Einnahmen, die dir in einem normalen Monat tatsächlich zur Verfügung stehen.",
      fixed: "Regelmäßige, weitgehend feste Zahlungen wie Miete, Versicherungen und Abos.",
      variable: "Veränderliche Ausgaben wie Lebensmittel, Freizeit, Kleidung oder Tanken.",
      savings: "Betrag, den du im Monat bewusst zurücklegen oder investieren möchtest."
    },
    terms: [
      ["Fixkosten", "Regelmäßig wiederkehrende Ausgaben mit meist gleichbleibender Höhe."],
      ["Variable Ausgaben", "Ausgaben, deren Höhe von Monat zu Monat schwankt."],
      ["Sparquote", "Geplanter Sparbetrag im Verhältnis zu den Nettoeinnahmen."]
    ],
    faq: [
      ["Was bedeutet ein negativer freier Monatsbetrag?", "Dann sind eingetragene Ausgaben und Sparziel zusammen höher als deine Einnahmen."],
      ["Gehören jährliche Rechnungen zu den Fixkosten?", "Du kannst ihren Jahresbetrag durch zwölf teilen und als monatliche Rücklage bei den Fixkosten berücksichtigen."]
    ]
  }
};
