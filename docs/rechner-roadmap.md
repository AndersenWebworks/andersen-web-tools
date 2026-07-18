# Rechner-Roadmap

Stand: 18. Juli 2026

## Ziel

Der Rechnerbereich wird ein eigenständiger, auffindbarer Teil der Andersen Web Tools. Jeder Rechner bekommt eine eigene URL, einen klaren Rechenweg und eine mobile Bedienung. Alle Eingaben bleiben im Browser. Die Rechner verzichten auf Konten, Tracking und externe Laufzeitdienste.

## Welle 1: Dauerläufer

Welle 1 deckt häufige, pflegeleichte Rechenaufgaben ab. Die Formeln sind transparent und brauchen keine jährliche Gesetzespflege.

1. Prozentrechner
2. Mehrwertsteuerrechner
3. Rabattrechner
4. Marge- und Handelsspannenrechner
5. Zinseszins- und Sparplanrechner
6. Zahlungsgebührenrechner
7. Sprit- und Fahrtkostenrechner
8. Stromkostenrechner
9. Urlaubsanspruch umrechnen
10. Datums-, Alters- und Zeitspannenrechner
11. Skonto- und Zahlungszielrechner
12. Stückpreisvergleich

## Welle 2: Arbeit, Gehalt und Versicherung

Welle 2 baut die geschäftsnahen Rechner aus. Wo Tarife, Grenzwerte oder persönliche Abzüge schwanken, bleiben die betreffenden Werte sichtbar und änderbar. So ist die Rechnung nachvollziehbar und behauptet keine amtliche Einzelfallberechnung.

1. Stundenlohn aus Monatsgehalt
2. Arbeitgeberkosten
3. Minijob-Arbeitszeit
4. Brutto-Netto-Schätzung mit sichtbaren Abzugssätzen
5. GKV-Beitragsrechner
6. Zusatzbeitrag-Vergleich
7. Pflegeversicherungsbeitrag
8. Krankengeld-Schätzung
9. Firmenwagen-Sachbezug
10. Pendlerpauschale
11. GKV-PKV-Kostenvergleich
12. Monatsbudget und Sparquote

## Gemeinsame Produktregeln

- Jeder Rechner hat eine eigene indexierbare Seite und steht in Sitemap sowie Rechner-Hub.
- Ein gemeinsames, datengetriebenes Formularsystem verhindert abweichende Bedienlogik.
- Ergebnisse zeigen nicht nur eine Zahl, sondern auch die wesentlichen Zwischenschritte.
- Gesetzlich oder tariflich veränderliche Werte sind im Formular sichtbar und editierbar.
- Finanz-, Steuer-, Gesundheits- und Versicherungsrechner werden als nachvollziehbare Orientierung bezeichnet, nicht als Beratung oder verbindlicher Bescheid.
- Das bestehende GitHub-Pages-Deployment bleibt ohne Backend nutzbar.
- Jedes Eingabefeld erklärt direkt darunter, welcher Wert gemeint ist und warum er für die Rechnung gebraucht wird.
- Jede Rechnerseite enthält eine Bedienfolge, ein kleines Begriffslexikon, häufige Missverständnisse und direkte Links zu passenden Folgerechnern.
- Rechner-Hub, vollständige Werkzeugübersicht, Sitemap, `werkzeuge.json` und `llms.txt` verwenden denselben Katalogstand.

## Spätere Welle

Ein amtlicher Brutto-Netto-Rechner mit Steuerklassen, ein Midijob-Rechner, Elterngeld, Arbeitslosengeld, Wohngeld und weitere Sozialleistungsrechner brauchen eine versionierte, amtlich geprüfte Regelbasis. Sie werden erst aufgenommen, wenn Quellenpflege, Jahreswechsel und Vergleichsfälle als eigener Wartungsprozess stehen.
