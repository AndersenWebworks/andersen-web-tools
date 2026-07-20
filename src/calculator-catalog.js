import { calculatorGuides } from "./calculator-guides.js";
import {
  calculationData2026,
  currentLocalDate,
  employerSocialContributions2026,
  estimatePayroll2026,
  socialContributions2026
} from "./calculator-data.js";

const currencyFormatter = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

const numberFormatter = new Intl.NumberFormat("de-DE", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2
});

const percentFormatter = new Intl.NumberFormat("de-DE", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2
});

const dateFormatter = new Intl.DateTimeFormat("de-DE", {
  timeZone: "UTC",
  day: "2-digit",
  month: "2-digit",
  year: "numeric"
});

function numberValue(values, key, label) {
  const value = Number(values[key]);
  if (!Number.isFinite(value)) throw new Error(`${label} fehlt oder ist keine gültige Zahl.`);
  return value;
}

function positiveValue(values, key, label, allowZero = false) {
  const value = numberValue(values, key, label);
  if (allowZero ? value < 0 : value <= 0) {
    throw new Error(`${label} muss ${allowZero ? "mindestens null" : "größer als null"} sein.`);
  }
  return value;
}

function currency(value) {
  return currencyFormatter.format(value);
}

function number(value, suffix = "") {
  return `${numberFormatter.format(value)}${suffix}`;
}

function percent(value) {
  return `${percentFormatter.format(value)} %`;
}

function metric(label, value, tone = "") {
  return { label, value, tone };
}

function result(primaryLabel, primaryValue, metrics, explanation) {
  return { primaryLabel, primaryValue, metrics, explanation };
}

function parseDate(value, label) {
  if (!value) throw new Error(`${label} fehlt.`);
  const date = new Date(`${value}T00:00:00Z`);
  if (!Number.isFinite(date.getTime())) throw new Error(`${label} ist ungültig.`);
  return date;
}

function addDays(date, days) {
  const output = new Date(date.getTime());
  output.setUTCDate(output.getUTCDate() + days);
  return output;
}

function fullDateDifference(start, end) {
  let cursor = new Date(start.getTime());
  let years = 0;
  let months = 0;

  while (true) {
    const next = new Date(cursor.getTime());
    next.setUTCFullYear(next.getUTCFullYear() + 1);
    if (next > end) break;
    cursor = next;
    years += 1;
  }

  while (true) {
    const next = new Date(cursor.getTime());
    next.setUTCMonth(next.getUTCMonth() + 1);
    if (next > end) break;
    cursor = next;
    months += 1;
  }

  const days = Math.floor((end - cursor) / 86400000);
  return { years, months, days };
}

const waveOne = [
  {
    slug: "prozentrechner",
    wave: 1,
    category: "Alltag",
    title: "Prozentrechner",
    description: "Prozentwert, Prozentsatz, Grundwert oder prozentuale Veränderung berechnen.",
    intro: "Vier typische Prozentaufgaben in einem Rechner – mit sichtbarem Rechenweg statt einer rätselhaften Ergebniszahl.",
    explanation: "Der Prozentwert ist Grundwert mal Prozentsatz geteilt durch 100. Bei Veränderungen wird die Differenz durch den Ausgangswert geteilt.",
    fields: [
      { id: "mode", label: "Was möchtest du berechnen?", type: "select", value: "part", options: [
        ["part", "Prozentwert"], ["rate", "Prozentsatz"], ["base", "Grundwert"], ["change", "Veränderung"]
      ] },
      { id: "base", label: "Grundwert", type: "number", value: 250, step: 0.01, visibleWhen: { mode: ["part", "rate"] } },
      { id: "rate", label: "Prozentsatz", type: "number", value: 19, step: 0.01, unit: "%", visibleWhen: { mode: ["part", "base"] } },
      { id: "part", label: "Prozentwert", type: "number", value: 47.5, step: 0.01, visibleWhen: { mode: ["rate", "base"] } },
      { id: "oldValue", label: "Ausgangswert", type: "number", value: 80, step: 0.01, visibleWhen: { mode: ["change"] } },
      { id: "newValue", label: "Neuer Wert", type: "number", value: 100, step: 0.01, visibleWhen: { mode: ["change"] } }
    ],
    calculate(values) {
      if (values.mode === "part") {
        const base = numberValue(values, "base", "Der Grundwert");
        const rate = numberValue(values, "rate", "Der Prozentsatz");
        const part = base * rate / 100;
        return result("Prozentwert", number(part), [metric("Grundwert", number(base)), metric("Prozentsatz", percent(rate))], `${number(base)} × ${number(rate)} ÷ 100 = ${number(part)}`);
      }
      if (values.mode === "rate") {
        const base = positiveValue(values, "base", "Der Grundwert");
        const part = numberValue(values, "part", "Der Prozentwert");
        const rate = part / base * 100;
        return result("Prozentsatz", percent(rate), [metric("Prozentwert", number(part)), metric("Grundwert", number(base))], `${number(part)} ÷ ${number(base)} × 100 = ${percent(rate)}`);
      }
      if (values.mode === "base") {
        const rate = positiveValue(values, "rate", "Der Prozentsatz");
        const part = numberValue(values, "part", "Der Prozentwert");
        const base = part / rate * 100;
        return result("Grundwert", number(base), [metric("Prozentwert", number(part)), metric("Prozentsatz", percent(rate))], `${number(part)} ÷ ${number(rate)} × 100 = ${number(base)}`);
      }
      const oldValue = positiveValue(values, "oldValue", "Der Ausgangswert");
      const newValue = numberValue(values, "newValue", "Der neue Wert");
      const difference = newValue - oldValue;
      const change = difference / oldValue * 100;
      return result("Veränderung", percent(change), [metric("Differenz", number(difference)), metric("Ausgangswert", number(oldValue))], `(${number(newValue)} − ${number(oldValue)}) ÷ ${number(oldValue)} × 100 = ${percent(change)}`);
    }
  },
  {
    slug: "mehrwertsteuerrechner",
    wave: 1,
    category: "Geschäft",
    title: "Mehrwertsteuerrechner",
    description: "Netto, Mehrwertsteuer und Brutto mit frei wählbarem Steuersatz berechnen.",
    intro: "Rechne von Netto zu Brutto oder löse aus einem Bruttopreis die enthaltene Mehrwertsteuer heraus.",
    explanation: "Von Netto zu Brutto wird der Nettobetrag mit 1 plus Steuersatz multipliziert. Bei der Rückwärtsrechnung wird Brutto durch diesen Faktor geteilt.",
    fields: [
      { id: "mode", label: "Rechenrichtung", type: "select", value: "net", options: [["net", "Netto zu Brutto"], ["gross", "Brutto zu Netto"]] },
      { id: "amount", label: "Ausgangsbetrag", type: "number", value: 100, min: 0, step: 0.01, unit: "€" },
      { id: "rate", label: "Mehrwertsteuersatz", type: "select", value: "19", options: [["19", "19 % – regulär"], ["7", "7 % – ermäßigt"], ["0", "0 %"]] }
    ],
    calculate(values) {
      const amount = positiveValue(values, "amount", "Der Betrag", true);
      const rate = positiveValue(values, "rate", "Der Steuersatz", true);
      const factor = 1 + rate / 100;
      const net = values.mode === "net" ? amount : amount / factor;
      const gross = values.mode === "net" ? amount * factor : amount;
      const tax = gross - net;
      return result(values.mode === "net" ? "Bruttobetrag" : "Nettobetrag", currency(values.mode === "net" ? gross : net), [metric("Netto", currency(net)), metric("Mehrwertsteuer", currency(tax)), metric("Brutto", currency(gross), "accent")], `Steuersatz: ${percent(rate)}. Die Steuerdifferenz beträgt ${currency(tax)}.`);
    }
  },
  {
    slug: "rabattrechner",
    wave: 1,
    category: "Alltag",
    title: "Rabattrechner",
    description: "Einen oder zwei aufeinanderfolgende Rabatte und den Endpreis berechnen.",
    intro: "Sieh sofort, was ein Rabatt wirklich spart – auch bei zwei Nachlässen, die nacheinander abgezogen werden.",
    explanation: "Mehrere Rabatte werden nacheinander auf den jeweils verbleibenden Preis angewendet. 20 und 10 Prozent ergeben deshalb zusammen 28 Prozent, nicht 30.",
    fields: [
      { id: "price", label: "Ursprünglicher Preis", type: "number", value: 120, min: 0, step: 0.01, unit: "€" },
      { id: "discountOne", label: "Erster Rabatt", type: "number", value: 20, min: 0, max: 100, step: 0.01, unit: "%" },
      { id: "discountTwo", label: "Zweiter Rabatt", type: "number", value: 0, min: 0, max: 100, step: 0.01, unit: "%", advanced: true }
    ],
    calculate(values) {
      const price = positiveValue(values, "price", "Der Preis", true);
      const first = positiveValue(values, "discountOne", "Der erste Rabatt", true);
      const second = positiveValue(values, "discountTwo", "Der zweite Rabatt", true);
      if (first > 100 || second > 100) throw new Error("Ein Rabatt darf höchstens 100 Prozent betragen.");
      const afterFirst = price * (1 - first / 100);
      const finalPrice = afterFirst * (1 - second / 100);
      const saved = price - finalPrice;
      return result("Endpreis", currency(finalPrice), [metric("Ersparnis", currency(saved), "accent"), metric("Effektiver Rabatt", percent(price ? saved / price * 100 : 0)), metric("Nach Rabatt 1", currency(afterFirst))], `${currency(price)} − ${currency(saved)} = ${currency(finalPrice)}`);
    }
  },
  {
    slug: "margenrechner",
    wave: 1,
    category: "Geschäft",
    title: "Marge und Handelsspanne berechnen",
    description: "Rohertrag, Gewinnaufschlag und Handelsspanne aus Einstands- und Verkaufspreis berechnen.",
    intro: "Marge und Aufschlag meinen nicht dasselbe. Dieser Rechner zeigt beide Werte sauber nebeneinander.",
    explanation: "Der Aufschlag bezieht den Rohertrag auf den Einstandspreis. Die Marge bezieht denselben Rohertrag auf den Verkaufspreis.",
    fields: [
      { id: "cost", label: "Einstandspreis", type: "number", value: 60, min: 0, step: 0.01, unit: "€" },
      { id: "sale", label: "Verkaufspreis netto", type: "number", value: 100, min: 0, step: 0.01, unit: "€" }
    ],
    calculate(values) {
      const cost = positiveValue(values, "cost", "Der Einstandspreis");
      const sale = positiveValue(values, "sale", "Der Verkaufspreis");
      const profit = sale - cost;
      const markup = profit / cost * 100;
      const margin = profit / sale * 100;
      return result("Rohertrag", currency(profit), [metric("Gewinnaufschlag", percent(markup)), metric("Handelsspanne", percent(margin), "accent"), metric("Verkaufspreis", currency(sale))], `Rohertrag ${currency(profit)}: bezogen auf den Einkauf ${percent(markup)}, bezogen auf den Verkauf ${percent(margin)}.`);
    }
  },
  {
    slug: "zinseszinsrechner",
    wave: 1,
    category: "Finanzen",
    title: "Zinseszins- und Sparplanrechner",
    description: "Endkapital, Einzahlungen und Zinsertrag mit monatlicher Sparrate berechnen.",
    intro: "Berechne, wie Startkapital, Sparrate, Laufzeit und jährliche Rendite gemeinsam wirken.",
    explanation: "Das Kapital wird monatlich verzinst; die Sparrate fließt jeweils am Monatsende ein. Steuern, Kosten und schwankende Kurse sind nicht berücksichtigt.",
    fields: [
      { id: "capital", label: "Startkapital", type: "number", value: 5000, min: 0, step: 10, unit: "€" },
      { id: "monthly", label: "Monatliche Sparrate", type: "number", value: 200, min: 0, step: 10, unit: "€" },
      { id: "rate", label: "Rendite pro Jahr", type: "number", value: 5, step: 0.01, unit: "%" },
      { id: "years", label: "Laufzeit", type: "number", value: 10, min: 0.08, max: 100, step: 1, unit: "Jahre" }
    ],
    calculate(values) {
      const capital = positiveValue(values, "capital", "Das Startkapital", true);
      const monthly = positiveValue(values, "monthly", "Die Sparrate", true);
      const annualRate = numberValue(values, "rate", "Die Rendite");
      const years = positiveValue(values, "years", "Die Laufzeit");
      const months = Math.round(years * 12);
      const monthlyRate = annualRate / 100 / 12;
      let balance = capital;
      for (let month = 0; month < months; month += 1) balance = balance * (1 + monthlyRate) + monthly;
      const deposits = capital + monthly * months;
      const yieldAmount = balance - deposits;
      return result("Endkapital", currency(balance), [metric("Einzahlungen", currency(deposits)), metric("Zinsertrag", currency(yieldAmount), "accent"), metric("Laufzeit", number(months, " Monate"))], `Annahme: ${percent(annualRate)} pro Jahr, monatliche Verzinsung und konstante Sparrate.`);
    }
  },
  {
    slug: "zahlungsgebuehrenrechner",
    wave: 1,
    category: "Geschäft",
    title: "Zahlungsgebührenrechner",
    description: "Prozentuale und feste Zahlungsgebühren berechnen oder einen Zielbetrag rückwärts kalkulieren.",
    intro: "Für PayPal und andere Zahlungsdienste: Gebühr abziehen oder den nötigen Zahlbetrag für einen gewünschten Nettoeingang bestimmen.",
    explanation: "Gebührenmodelle ändern sich. Deshalb bleiben Prozentsatz und Festgebühr sichtbar und frei änderbar.",
    fields: [
      { id: "mode", label: "Rechenrichtung", type: "select", value: "deduct", options: [["deduct", "Gebühr abziehen"], ["target", "Zahlbetrag für Nettoziel"]] },
      { id: "amount", label: "Betrag", type: "number", value: 100, min: 0, step: 0.01, unit: "€" },
      { id: "rate", label: "Variable Gebühr", type: "number", value: 2.99, min: 0, max: 99, step: 0.01, unit: "%" },
      { id: "fixed", label: "Festgebühr", type: "number", value: 0.39, min: 0, step: 0.01, unit: "€" }
    ],
    calculate(values) {
      const amount = positiveValue(values, "amount", "Der Betrag", true);
      const rate = positiveValue(values, "rate", "Die variable Gebühr", true);
      const fixed = positiveValue(values, "fixed", "Die Festgebühr", true);
      if (rate >= 100) throw new Error("Die variable Gebühr muss unter 100 Prozent liegen.");
      const charged = values.mode === "target" ? (amount + fixed) / (1 - rate / 100) : amount;
      const fee = charged * rate / 100 + fixed;
      const received = charged - fee;
      return result(values.mode === "target" ? "Nötiger Zahlbetrag" : "Nettoeingang", currency(values.mode === "target" ? charged : received), [metric("Gebühr", currency(fee), "accent"), metric("Zahlbetrag", currency(charged)), metric("Nettoeingang", currency(received))], `Berechnet mit ${percent(rate)} plus ${currency(fixed)} Festgebühr. Prüfe die Werte gegen deinen aktuellen Tarif.`);
    }
  },
  {
    slug: "fahrtkostenrechner",
    wave: 1,
    category: "Alltag",
    title: "Sprit- und Fahrtkostenrechner",
    description: "Kraftstoffverbrauch, Gesamtkosten und Kosten pro Person für eine Fahrt berechnen.",
    intro: "Plane die reinen Kraftstoffkosten einer Strecke oder teile sie fair auf mehrere Personen auf.",
    explanation: "Strecke mal Verbrauch je 100 Kilometer ergibt die Kraftstoffmenge. Weitere Fahrzeugkosten wie Verschleiß oder Versicherung sind nicht enthalten.",
    fields: [
      { id: "distance", label: "Gesamtstrecke", type: "number", value: 320, min: 0, step: 1, unit: "km" },
      { id: "consumption", label: "Verbrauch", type: "number", value: 7.2, min: 0, step: 0.1, unit: "l/100 km" },
      { id: "fuelPrice", label: "Kraftstoffpreis", type: "number", value: 1.75, min: 0, step: 0.01, unit: "€/l" },
      { id: "people", label: "Personen", type: "number", value: 1, min: 1, step: 1, advanced: true }
    ],
    calculate(values) {
      const distance = positiveValue(values, "distance", "Die Strecke", true);
      const consumption = positiveValue(values, "consumption", "Der Verbrauch", true);
      const fuelPrice = positiveValue(values, "fuelPrice", "Der Kraftstoffpreis", true);
      const people = positiveValue(values, "people", "Die Personenzahl");
      const liters = distance / 100 * consumption;
      const cost = liters * fuelPrice;
      return result("Kraftstoffkosten", currency(cost), [metric("Kraftstoff", number(liters, " l")), metric("Pro Person", currency(cost / people), "accent"), metric("Pro Kilometer", currency(distance ? cost / distance : 0))], `${number(distance, " km")} bei ${number(consumption, " l/100 km")} benötigen ${number(liters, " l")} Kraftstoff.`);
    }
  },
  {
    slug: "stromkostenrechner",
    wave: 1,
    category: "Alltag",
    title: "Stromkostenrechner",
    description: "Stromverbrauch und Kosten eines Geräts pro Tag, Monat und Jahr berechnen.",
    intro: "Finde heraus, was Computer, Fernseher, Heizungspumpe oder andere Geräte im Betrieb kosten.",
    explanation: "Watt werden durch 1.000 in Kilowatt umgerechnet und mit Laufzeit sowie Strompreis multipliziert.",
    fields: [
      { id: "watts", label: "Leistung", type: "number", value: 120, min: 0, step: 1, unit: "W" },
      { id: "hours", label: "Betrieb pro Tag", type: "number", value: 8, min: 0, max: 24, step: 0.25, unit: "Std." },
      { id: "days", label: "Betriebstage pro Jahr", type: "number", value: 365, min: 0, max: 366, step: 1, advanced: true },
      { id: "price", label: "Strompreis", type: "number", value: 0.35, min: 0, step: 0.01, unit: "€/kWh", advanced: true }
    ],
    calculate(values) {
      const watts = positiveValue(values, "watts", "Die Leistung", true);
      const hours = positiveValue(values, "hours", "Die tägliche Laufzeit", true);
      const days = positiveValue(values, "days", "Die Betriebstage", true);
      const price = positiveValue(values, "price", "Der Strompreis", true);
      const annualKwh = watts / 1000 * hours * days;
      const annualCost = annualKwh * price;
      return result("Kosten pro Jahr", currency(annualCost), [metric("Verbrauch pro Jahr", number(annualKwh, " kWh")), metric("Pro Monat", currency(annualCost / 12), "accent"), metric("Pro Betriebstag", currency(days ? annualCost / days : 0))], `${number(watts, " W")} × ${number(hours, " Std.")} × ${number(days, " Tage")} = ${number(annualKwh, " kWh")}.`);
    }
  },
  {
    slug: "urlaubsanspruch-rechner",
    wave: 1,
    category: "Arbeit",
    title: "Urlaubsanspruch umrechnen",
    description: "Urlaubstage bei anderer Wochenarbeitszeit oder anteiligen Beschäftigungsmonaten umrechnen.",
    intro: "Rechne einen Jahresurlaubsanspruch auf deine tatsächlichen Arbeitstage pro Woche und volle Beschäftigungsmonate um.",
    explanation: "Der Ausgangsurlaub wird im Verhältnis der Arbeitstage pro Woche und anschließend anteilig nach vollen Monaten umgerechnet.",
    notice: "Das Ergebnis ist eine mathematische Orientierung. Tarifvertrag, Arbeitsvertrag, Eintrittsdatum, Wartezeit und Rundungsregeln können den rechtlichen Anspruch verändern.",
    fields: [
      { id: "annual", label: "Jahresurlaub in Vollzeit", type: "number", value: 30, min: 0, step: 0.5, unit: "Tage" },
      { id: "fullDays", label: "Arbeitstage Vollzeit", type: "number", value: 5, min: 1, max: 7, step: 1, unit: "pro Woche", advanced: true },
      { id: "actualDays", label: "Eigene Arbeitstage", type: "number", value: 3, min: 1, max: 7, step: 1, unit: "pro Woche" },
      { id: "months", label: "Volle Beschäftigungsmonate", type: "number", value: 12, min: 1, max: 12, step: 1, advanced: true }
    ],
    calculate(values) {
      const annual = positiveValue(values, "annual", "Der Jahresurlaub", true);
      const fullDays = positiveValue(values, "fullDays", "Die Vollzeit-Arbeitstage");
      const actualDays = positiveValue(values, "actualDays", "Die eigenen Arbeitstage");
      const months = positiveValue(values, "months", "Die Beschäftigungsmonate");
      if (months > 12) throw new Error("Es können höchstens zwölf Monate berechnet werden.");
      const converted = annual / fullDays * actualDays;
      const prorated = converted * months / 12;
      return result("Rechnerischer Anspruch", number(prorated, " Tage"), [metric("Bei zwölf Monaten", number(converted, " Tage")), metric("Monatsanteil", number(converted / 12, " Tage")), metric("Beschäftigungszeit", number(months, " Monate"))], `${number(annual)} ÷ ${number(fullDays)} × ${number(actualDays)} × ${number(months)} ÷ 12 = ${number(prorated)}.`);
    }
  },
  {
    slug: "zeitspannenrechner",
    wave: 1,
    category: "Alltag",
    title: "Datums-, Alters- und Zeitspannenrechner",
    description: "Tage, Wochen und die genaue Zeitspanne zwischen zwei Daten berechnen.",
    intro: "Berechne Alter, Projektdauer, Fristen oder die genaue Zeit zwischen zwei Kalenderdaten.",
    explanation: "Volle Jahre und Monate werden kalendergenau gezählt. Die Gesamttage ergeben sich aus der tatsächlichen Differenz beider Daten.",
    fields: [
      { id: "start", label: "Startdatum", type: "date", value: "1990-01-01" },
      { id: "end", label: "Enddatum", type: "date", value: "today", valueProvider: currentLocalDate }
    ],
    calculate(values) {
      let start = parseDate(values.start, "Das Startdatum");
      let end = parseDate(values.end, "Das Enddatum");
      if (end < start) [start, end] = [end, start];
      const totalDays = Math.floor((end - start) / 86400000);
      const span = fullDateDifference(start, end);
      return result("Genaue Zeitspanne", `${span.years} Jahre, ${span.months} Monate, ${span.days} Tage`, [metric("Gesamttage", number(totalDays, " Tage")), metric("Volle Wochen", number(Math.floor(totalDays / 7), " Wochen")), metric("Resttage", number(totalDays % 7, " Tage"))], `${dateFormatter.format(start)} bis ${dateFormatter.format(end)}.`);
    }
  },
  {
    slug: "skontorechner",
    wave: 1,
    category: "Geschäft",
    title: "Skonto- und Zahlungszielrechner",
    description: "Skontobetrag, Zahlbetrag sowie Skonto- und Fälligkeitsdatum berechnen.",
    intro: "Berechne, wie viel du bei rechtzeitiger Zahlung überweist und bis wann Skonto oder das normale Zahlungsziel gelten.",
    explanation: "Skonto wird prozentual vom Rechnungsbetrag abgezogen. Die Datumsangaben werden als Kalendertage ab Rechnungsdatum gerechnet.",
    fields: [
      { id: "amount", label: "Rechnungsbetrag", type: "number", value: 1190, min: 0, step: 0.01, unit: "€" },
      { id: "rate", label: "Skonto", type: "number", value: 2, min: 0, max: 100, step: 0.01, unit: "%" },
      { id: "invoiceDate", label: "Rechnungsdatum", type: "date", value: "today", valueProvider: currentLocalDate },
      { id: "discountDays", label: "Skontofrist", type: "number", value: 10, min: 0, step: 1, unit: "Tage", advanced: true },
      { id: "dueDays", label: "Zahlungsziel", type: "number", value: 30, min: 0, step: 1, unit: "Tage", advanced: true }
    ],
    calculate(values) {
      const amount = positiveValue(values, "amount", "Der Rechnungsbetrag", true);
      const rate = positiveValue(values, "rate", "Der Skontosatz", true);
      const invoiceDate = parseDate(values.invoiceDate, "Das Rechnungsdatum");
      const discountDays = positiveValue(values, "discountDays", "Die Skontofrist", true);
      const dueDays = positiveValue(values, "dueDays", "Das Zahlungsziel", true);
      const discount = amount * rate / 100;
      const payment = amount - discount;
      return result("Zahlbetrag mit Skonto", currency(payment), [metric("Ersparnis", currency(discount), "accent"), metric("Skonto bis", dateFormatter.format(addDays(invoiceDate, discountDays))), metric("Fällig am", dateFormatter.format(addDays(invoiceDate, dueDays)))], `${percent(rate)} von ${currency(amount)} entsprechen ${currency(discount)}.`);
    }
  },
  {
    slug: "stueckpreisvergleich",
    wave: 1,
    category: "Alltag",
    title: "Stückpreisvergleich",
    description: "Zwei Packungsgrößen über ihren Preis pro Einheit direkt vergleichen.",
    intro: "Größer ist nicht automatisch günstiger. Vergleiche zwei Angebote über denselben Grundpreis.",
    explanation: "Der Preis wird durch die jeweilige Menge geteilt. Beide Mengen müssen in derselben Einheit eingegeben werden.",
    fields: [
      { id: "priceA", label: "Preis Angebot A", type: "number", value: 3.49, min: 0, step: 0.01, unit: "€" },
      { id: "quantityA", label: "Menge Angebot A", type: "number", value: 750, min: 0, step: 0.01 },
      { id: "priceB", label: "Preis Angebot B", type: "number", value: 4.29, min: 0, step: 0.01, unit: "€" },
      { id: "quantityB", label: "Menge Angebot B", type: "number", value: 1000, min: 0, step: 0.01 },
      { id: "unit", label: "Vergleichseinheit", type: "select", value: "1000", options: [["1", "pro Stück"], ["100", "pro 100"], ["1000", "pro 1.000"]], advanced: true }
    ],
    calculate(values) {
      const priceA = positiveValue(values, "priceA", "Der Preis A", true);
      const quantityA = positiveValue(values, "quantityA", "Die Menge A");
      const priceB = positiveValue(values, "priceB", "Der Preis B", true);
      const quantityB = positiveValue(values, "quantityB", "Die Menge B");
      const unit = positiveValue(values, "unit", "Die Vergleichseinheit");
      const unitPriceA = priceA / quantityA * unit;
      const unitPriceB = priceB / quantityB * unit;
      const difference = Math.abs(unitPriceA - unitPriceB);
      const winner = unitPriceA === unitPriceB ? "Beide Angebote sind gleich teuer" : `Angebot ${unitPriceA < unitPriceB ? "A" : "B"} ist günstiger`;
      return result("Besserer Preis", winner, [metric("Angebot A", currency(unitPriceA)), metric("Angebot B", currency(unitPriceB)), metric("Unterschied", currency(difference), "accent")], `Grundpreis je ${number(unit)} eingegebene Einheiten.`);
    }
  }
];

const waveTwo = [
  {
    slug: "stundenlohnrechner",
    wave: 2,
    category: "Arbeit",
    title: "Stundenlohn aus Monatsgehalt",
    description: "Stundenlohn, Jahresgehalt und Monatsstunden aus Gehalt und Wochenarbeitszeit berechnen.",
    intro: "Vergleiche Monatsgehalt und Stundenlohn auf derselben Grundlage.",
    explanation: "Die durchschnittlichen Monatsstunden ergeben sich aus Wochenstunden mal 52 geteilt durch 12.",
    fields: [
      { id: "monthly", label: "Monatsgehalt brutto", type: "number", value: 3500, min: 0, step: 10, unit: "€" },
      { id: "weeklyHours", label: "Wochenarbeitszeit", type: "number", value: 40, min: 0.1, max: 100, step: 0.25, unit: "Std." },
      { id: "payments", label: "Gehälter pro Jahr", type: "number", value: 12, min: 1, max: 20, step: 0.5, advanced: true }
    ],
    calculate(values) {
      const monthly = positiveValue(values, "monthly", "Das Monatsgehalt", true);
      const weeklyHours = positiveValue(values, "weeklyHours", "Die Wochenarbeitszeit");
      const payments = positiveValue(values, "payments", "Die Anzahl der Gehälter");
      const annualHours = weeklyHours * 52;
      const annualSalary = monthly * payments;
      const hourly = annualSalary / annualHours;
      return result("Rechnerischer Stundenlohn", currency(hourly), [metric("Jahresgehalt", currency(annualSalary)), metric("Monatsstunden", number(annualHours / 12, " Std.")), metric("Jahresstunden", number(annualHours, " Std."))], `${currency(annualSalary)} ÷ ${number(annualHours, " Stunden")} = ${currency(hourly)}.`);
    }
  },
  {
    slug: "arbeitgeberkostenrechner",
    wave: 2,
    category: "Arbeit",
    title: "Arbeitgeberkostenrechner",
    description: "Arbeitgeberkosten aus Bruttogehalt und den Sozialversicherungswerten für 2026 schätzen.",
    intro: "Trage das Bruttogehalt ein. Kranken-, Pflege-, Renten- und Arbeitslosenversicherung werden bis zu den geltenden Beitragsgrenzen berechnet.",
    explanation: "Die Arbeitgeberanteile werden mit den Werten und Beitragsgrenzen für 2026 berechnet. Nur betriebsabhängige Umlagen und weitere Kosten bleiben als anpassbare Angaben offen.",
    notice: "U1, U2, Insolvenzgeldumlage, Unfallversicherung und weitere Personalkosten hängen vom Betrieb ab und sind nur als gemeinsame Zusatzannahme enthalten.",
    fields: [
      { id: "gross", label: "Monatsbrutto", type: "number", value: 4000, min: 0, step: 10, unit: "€" },
      { id: "levies", label: "Betriebliche Umlagen und Unfallversicherung", type: "number", value: 2.5, min: 0, step: 0.1, unit: "%", advanced: true },
      { id: "fixed", label: "Weitere feste Monatskosten", type: "number", value: 0, min: 0, step: 1, unit: "€", advanced: true },
      { id: "additionalRate", label: "Zusatzbeitrag der Krankenkasse", type: "number", value: calculationData2026.health.averageAdditionalRate, min: 0, step: 0.01, unit: "%", advanced: true }
    ],
    calculate(values) {
      const gross = positiveValue(values, "gross", "Das Monatsbrutto", true);
      const levies = positiveValue(values, "levies", "Die Umlagen", true);
      const fixed = positiveValue(values, "fixed", "Die festen Kosten", true);
      const additionalRate = positiveValue(values, "additionalRate", "Der Zusatzbeitrag", true);
      const social = employerSocialContributions2026(gross, additionalRate).total;
      const levyCost = gross * levies / 100;
      const total = gross + social + levyCost + fixed;
      return result("Arbeitgeberkosten pro Monat", currency(total), [metric("Bruttogehalt", currency(gross)), metric("Sozialversicherung und Umlagen", currency(social + levyCost), "accent"), metric("Pro Jahr", currency(total * 12))], `Sozialversicherung 2026: ${currency(social)}. Betriebliche Zusatzkosten: ${currency(levyCost + fixed)}.`);
    }
  },
  {
    slug: "minijob-rechner",
    wave: 2,
    category: "Arbeit",
    title: "Minijob-Arbeitszeitrechner",
    description: "Mögliche Monatsstunden, Wochenstunden und Rentenbeitrag bei einem Minijob berechnen.",
    intro: "Trage nur deinen Stundenlohn ein. Die Verdienstgrenze für 2026 und der übliche eigene Rentenbeitrag sind bereits eingesetzt.",
    explanation: "Die Verdienstgrenze 2026 wird durch den Stundenlohn geteilt. Abweichende persönliche Werte lassen sich unter den weiteren Einstellungen ändern.",
    notice: "Der Rechner prüft keine schwankenden Entgelte, Mehrfachbeschäftigung oder individuellen Befreiungen.",
    fields: [
      { id: "hourly", label: "Stundenlohn", type: "number", value: calculationData2026.minijob.minimumWage, min: 0.01, step: 0.01, unit: "€" },
      { id: "limit", label: "Monatliche Verdienstgrenze", type: "number", value: calculationData2026.minijob.monthlyLimit, min: 0, step: 1, unit: "€", advanced: true },
      { id: "pensionRate", label: "Eigener Rentenbeitrag", type: "number", value: calculationData2026.minijob.employeePensionRate, min: 0, step: 0.1, unit: "%", advanced: true }
    ],
    calculate(values) {
      const limit = positiveValue(values, "limit", "Die Verdienstgrenze", true);
      const hourly = positiveValue(values, "hourly", "Der Stundenlohn");
      const pensionRate = positiveValue(values, "pensionRate", "Der Rentenbeitrag", true);
      const monthlyHours = limit / hourly;
      const pension = limit * pensionRate / 100;
      return result("Mögliche Monatsstunden", number(monthlyHours, " Std."), [metric("Pro Woche", number(monthlyHours * 12 / 52, " Std.")), metric("Eigener Rentenbeitrag", currency(pension)), metric("Nach Rentenbeitrag", currency(limit - pension), "accent")], `${currency(limit)} ÷ ${currency(hourly)} = ${number(monthlyHours, " Stunden")}.`);
    }
  },
  {
    slug: "brutto-netto-schaetzer",
    wave: 2,
    category: "Arbeit",
    title: "Brutto-Netto-Schätzer",
    description: "Monatsnetto aus Brutto, Steuerklasse und den Sozialversicherungswerten für 2026 schätzen.",
    intro: "Du nennst Brutto und wenige persönliche Angaben. Steuertarif, Beitragsgrenzen und Sozialabgaben für 2026 setzt der Rechner selbst ein.",
    explanation: "Sozialabgaben werden bis zu den Beitragsgrenzen 2026 berechnet. Die Steuer wird aus dem Einkommensteuertarif 2026 angenähert und auf den Monat verteilt.",
    notice: "Die Näherung ersetzt keine Lohnabrechnung. Freibeträge, Einmalzahlungen, Steuerklassen V und VI sowie weitere persönliche Besonderheiten sind nicht enthalten.",
    fields: [
      { id: "gross", label: "Monatsbrutto", type: "number", value: 4000, min: 0, step: 10, unit: "€" },
      { id: "taxClass", label: "Steuerklasse", type: "select", value: "1", options: [["1", "I"], ["3", "III"], ["4", "IV"]] },
      { id: "children", label: "Kinder unter 25", type: "select", value: "0", options: [["0", "Keine"], ["1", "1 Kind"], ["2", "2 Kinder"], ["3", "3 Kinder"], ["4", "4 Kinder"], ["5", "5 oder mehr"]] },
      { id: "churchRate", label: "Kirchensteuer", type: "select", value: "0", options: [["0", "Keine"], ["8", "8 %"], ["9", "9 %"]], advanced: true },
      { id: "childlessSurcharge", label: "Kinderlosenzuschlag zur Pflegeversicherung", type: "select", value: "yes", options: [["yes", "Gilt für mich"], ["no", "Gilt für mich nicht"]], advanced: true },
      { id: "additionalRate", label: "Zusatzbeitrag der Krankenkasse", type: "number", value: calculationData2026.health.averageAdditionalRate, min: 0, step: 0.01, unit: "%", advanced: true },
      { id: "other", label: "Weitere Abzüge", type: "number", value: 0, min: 0, step: 1, unit: "€", advanced: true }
    ],
    calculate(values) {
      const gross = positiveValue(values, "gross", "Das Monatsbrutto", true);
      const other = positiveValue(values, "other", "Die weiteren Abzüge", true);
      const payroll = estimatePayroll2026(gross, values);
      const net = payroll.net - other;
      const taxes = payroll.monthlyIncomeTax + payroll.monthlySoli + payroll.monthlyChurchTax;
      const deductions = gross - net;
      return result("Geschätztes Netto", currency(net), [metric("Sozialabgaben", currency(payroll.social.total)), metric("Steuern", currency(taxes)), metric("Abzüge gesamt", currency(deductions), "accent")], `${currency(gross)} minus ${currency(deductions)} berechnete Abzüge. Nettoquote: ${percent(gross ? net / gross * 100 : 0)}.`);
    }
  },
  {
    slug: "gkv-beitragsrechner",
    wave: 2,
    category: "Versicherung",
    title: "GKV-Beitragsrechner",
    description: "Krankenversicherungsbeitrag aus beitragspflichtigem Einkommen und Zusatzbeitrag berechnen.",
    intro: "Trage dein Monatsbrutto ein. Der Rechner begrenzt es automatisch auf die Beitragsbemessungsgrenze 2026 und setzt den allgemeinen Beitragssatz ein.",
    explanation: "Allgemeiner Beitrag und Zusatzbeitrag werden addiert, bis zur Beitragsbemessungsgrenze 2026 berechnet und bei Beschäftigten hälftig geteilt.",
    notice: "Der Zusatzbeitrag unterscheidet sich je nach Krankenkasse. Eingesetzt ist der Durchschnitt für 2026; deinen Kassensatz kannst du unter den weiteren Einstellungen ändern.",
    fields: [
      { id: "income", label: "Monatsbrutto", type: "number", value: 4500, min: 0, step: 10, unit: "€" },
      { id: "additionalRate", label: "Zusatzbeitrag der Krankenkasse", type: "number", value: calculationData2026.health.averageAdditionalRate, min: 0, step: 0.01, unit: "%", advanced: true }
    ],
    calculate(values) {
      const income = positiveValue(values, "income", "Das beitragspflichtige Einkommen", true);
      const additionalRate = positiveValue(values, "additionalRate", "Der Zusatzbeitrag", true);
      const contributionBase = Math.min(income, calculationData2026.health.monthlyCeiling);
      const totalRate = calculationData2026.health.generalRate + additionalRate;
      const total = contributionBase * totalRate / 100;
      return result("Eigener Beitrag pro Monat", currency(total / 2), [metric("Gesamtbeitrag", currency(total)), metric("Arbeitgeberanteil", currency(total / 2)), metric("Berechnetes Einkommen", currency(contributionBase), "accent")], `${percent(totalRate)} auf höchstens ${currency(calculationData2026.health.monthlyCeiling)} Monatseinkommen.`);
    }
  },
  {
    slug: "zusatzbeitrag-vergleich",
    wave: 2,
    category: "Versicherung",
    title: "GKV-Zusatzbeitrag vergleichen",
    description: "Monatliche und jährliche Mehrkosten zwischen zwei Zusatzbeitragssätzen berechnen.",
    intro: "Sieh, was eine Änderung des Zusatzbeitrags für deinen Arbeitnehmeranteil ausmacht.",
    explanation: "Die Differenz der Beitragssätze wird auf das beitragspflichtige Einkommen gerechnet und bei Beschäftigten hälftig angesetzt.",
    fields: [
      { id: "income", label: "Monatsbrutto", type: "number", value: 4500, min: 0, step: 10, unit: "€" },
      { id: "oldRate", label: "Bisheriger Zusatzbeitrag", type: "number", value: 2.5, min: 0, step: 0.01, unit: "%" },
      { id: "newRate", label: "Neuer Zusatzbeitrag", type: "number", value: 3.5, min: 0, step: 0.01, unit: "%" },
      { id: "employeeShare", label: "Eigener Anteil", type: "number", value: 50, min: 0, max: 100, step: 1, unit: "%", advanced: true }
    ],
    calculate(values) {
      const income = positiveValue(values, "income", "Das Einkommen", true);
      const oldRate = positiveValue(values, "oldRate", "Der bisherige Zusatzbeitrag", true);
      const newRate = positiveValue(values, "newRate", "Der neue Zusatzbeitrag", true);
      const employeeShare = positiveValue(values, "employeeShare", "Der eigene Anteil", true);
      const contributionBase = Math.min(income, calculationData2026.health.monthlyCeiling);
      const monthlyDifference = contributionBase * (newRate - oldRate) / 100 * employeeShare / 100;
      return result("Änderung pro Monat", currency(monthlyDifference), [metric("Pro Jahr", currency(monthlyDifference * 12), "accent"), metric("Satzdifferenz", percent(newRate - oldRate)), metric("Berechnetes Einkommen", currency(contributionBase))], `${percent(newRate - oldRate)} Unterschied auf höchstens ${currency(calculationData2026.health.monthlyCeiling)} Monatseinkommen.`);
    }
  },
  {
    slug: "pflegeversicherung-rechner",
    wave: 2,
    category: "Versicherung",
    title: "Pflegeversicherungsbeitrag",
    description: "Eigenen Pflegeversicherungsbeitrag aus Monatsbrutto, Kinderzahl und den Werten für 2026 berechnen.",
    intro: "Trage Einkommen und Kinderzahl ein. Beitragssatz, Kinderlosenzuschlag, Abschläge und Beitragsgrenze für 2026 werden automatisch berücksichtigt.",
    explanation: "Der Beitrag wird bis zur Beitragsbemessungsgrenze 2026 gerechnet. Kinderlose zahlen einen Zuschlag; ab dem zweiten berücksichtigten Kind unter 25 sinkt der eigene Satz schrittweise.",
    notice: "Für Sachsen gilt ein anderer Arbeitgeberanteil. Diese Abweichung lässt sich unter den weiteren Einstellungen wählen.",
    fields: [
      { id: "income", label: "Monatsbrutto", type: "number", value: 4500, min: 0, step: 10, unit: "€" },
      { id: "children", label: "Kinder unter 25", type: "select", value: "0", options: [["0", "Keine"], ["1", "1 Kind"], ["2", "2 Kinder"], ["3", "3 Kinder"], ["4", "4 Kinder"], ["5", "5 oder mehr"]] },
      { id: "childlessSurcharge", label: "Kinderlosenzuschlag", type: "select", value: "yes", options: [["yes", "Gilt für mich"], ["no", "Gilt für mich nicht"]], advanced: true },
      { id: "saxony", label: "Arbeitsort Sachsen", type: "select", value: "", options: [["", "Nein"], ["yes", "Ja"]], advanced: true }
    ],
    calculate(values) {
      const income = positiveValue(values, "income", "Das Einkommen", true);
      const contributionBase = Math.min(income, calculationData2026.care.monthlyCeiling);
      const contributions = socialContributions2026(income, { children: values.children, childlessSurcharge: values.childlessSurcharge, saxony: values.saxony === "yes" });
      const employerRate = values.saxony === "yes" ? 1.3 : calculationData2026.care.employerRate;
      const employer = contributionBase * employerRate / 100;
      return result("Eigener Beitrag pro Monat", currency(contributions.care), [metric("Arbeitgeberanteil", currency(employer)), metric("Gesamtbeitrag", currency(contributions.care + employer), "accent"), metric("Eigener Satz", percent(contributions.careRate))], `Berechnet auf ${currency(contributionBase)} mit den Beitragssätzen für 2026.`);
    }
  },
  {
    slug: "krankengeldrechner",
    wave: 2,
    category: "Versicherung",
    title: "Krankengeld-Schätzung",
    description: "Krankengeld aus Monatsbrutto und wenigen persönlichen Angaben für 2026 schätzen.",
    intro: "Trage dein Brutto ein. Das nötige Netto und die Abzüge vom Krankengeld werden aus den Angaben für 2026 geschätzt.",
    explanation: "Die Rechnung verwendet den niedrigeren Wert aus 70 Prozent des begrenzten Bruttos und 90 Prozent des geschätzten Nettos. Renten-, Arbeitslosen- und Pflegebeitrag werden anschließend abgezogen.",
    notice: "Bemessungsgrenzen, Einmalzahlungen, individuelle Versicherungsverhältnisse und die Berechnung deiner Krankenkasse können abweichen.",
    fields: [
      { id: "gross", label: "Regelmäßiges Monatsbrutto", type: "number", value: 3500, min: 0, step: 10, unit: "€" },
      { id: "taxClass", label: "Steuerklasse", type: "select", value: "1", options: [["1", "I"], ["3", "III"], ["4", "IV"]] },
      { id: "children", label: "Kinder unter 25", type: "select", value: "0", options: [["0", "Keine"], ["1", "1 Kind"], ["2", "2 Kinder"], ["3", "3 Kinder"], ["4", "4 Kinder"], ["5", "5 oder mehr"]] },
      { id: "churchRate", label: "Kirchensteuer", type: "select", value: "0", options: [["0", "Keine"], ["8", "8 %"], ["9", "9 %"]], advanced: true },
      { id: "childlessSurcharge", label: "Kinderlosenzuschlag zur Pflegeversicherung", type: "select", value: "yes", options: [["yes", "Gilt für mich"], ["no", "Gilt für mich nicht"]], advanced: true },
      { id: "additionalRate", label: "Zusatzbeitrag der Krankenkasse", type: "number", value: calculationData2026.health.averageAdditionalRate, min: 0, step: 0.01, unit: "%", advanced: true }
    ],
    calculate(values) {
      const gross = positiveValue(values, "gross", "Das Monatsbrutto", true);
      const payroll = estimatePayroll2026(gross, values);
      const limitedGross = Math.min(gross, calculationData2026.health.monthlyCeiling);
      const grossBenefit = Math.min(limitedGross * 0.7, payroll.net * 0.9);
      const deductionRate = calculationData2026.pension.employeeRate + calculationData2026.unemployment.employeeRate + payroll.social.careRate;
      const payout = grossBenefit * (1 - deductionRate / 100);
      return result("Geschätzter Zahlbetrag", currency(payout), [metric("Geschätztes bisheriges Netto", currency(payroll.net)), metric("Krankengeld vor Abzügen", currency(grossBenefit)), metric("Pro Kalendertag", currency(payout / 30), "accent")], `Vom Brutto-Krankengeld werden hier ${percent(deductionRate)} für Rente, Arbeitslosigkeit und Pflege abgezogen.`);
    }
  },
  {
    slug: "firmenwagenrechner",
    wave: 2,
    category: "Arbeit",
    title: "Firmenwagen-Sachbezug",
    description: "Monatlichen geldwerten Vorteil eines Firmenwagens nach Fahrzeugart und Arbeitsweg berechnen.",
    intro: "Wähle die Fahrzeugart und trage Listenpreis sowie Arbeitsweg ein. Die üblichen pauschalen Ansätze setzt der Rechner selbst ein.",
    explanation: "Je nach Fahrzeugart werden 1, 0,5 oder 0,25 Prozent des Listenpreises angesetzt. Für den Arbeitsweg kommen monatlich 0,03 Prozent je Entfernungskilometer hinzu.",
    notice: "Ob ein Elektro- oder Hybridfahrzeug die Voraussetzungen für einen ermäßigten Ansatz erfüllt, muss anhand von Fahrzeug, Anschaffungszeitpunkt und geltendem Recht geprüft werden.",
    fields: [
      { id: "listPrice", label: "Bruttolistenpreis", type: "number", value: 45000, min: 0, step: 100, unit: "€" },
      { id: "vehicleType", label: "Fahrzeugart", type: "select", value: "1", options: [["1", "Verbrenner oder regulärer Ansatz"], ["0.5", "begünstigtes Elektro- oder Hybridfahrzeug"], ["0.25", "begünstigtes Elektrofahrzeug mit Viertelansatz"]] },
      { id: "distance", label: "Einfache Entfernung zur Arbeit", type: "number", value: 20, min: 0, step: 1, unit: "km" }
    ],
    calculate(values) {
      const listPrice = positiveValue(values, "listPrice", "Der Listenpreis", true);
      const vehicleRate = positiveValue(values, "vehicleType", "Der Fahrzeugansatz", true);
      const distance = positiveValue(values, "distance", "Die Entfernung", true);
      const commuteRate = 0.03;
      const vehicleBenefit = listPrice * vehicleRate / 100;
      const commuteBenefit = listPrice * commuteRate / 100 * distance;
      const totalBenefit = vehicleBenefit + commuteBenefit;
      return result("Geldwerter Vorteil pro Monat", currency(totalBenefit), [metric("Private Fahrzeugnutzung", currency(vehicleBenefit)), metric("Arbeitsweg", currency(commuteBenefit)), metric("Pro Jahr", currency(totalBenefit * 12), "accent")], `${percent(vehicleRate)} des Listenpreises plus ${percent(commuteRate)} je Entfernungskilometer.`);
    }
  },
  {
    slug: "pendlerpauschale-rechner",
    wave: 2,
    category: "Arbeit",
    title: "Pendlerpauschale berechnen",
    description: "Entfernungspauschale 2026 aus Arbeitstagen und einfacher Strecke berechnen.",
    intro: "Berechne den jährlichen Werbungskostenbetrag für Fahrten zur ersten Tätigkeitsstätte.",
    explanation: "Gezählt wird die einfache Entfernung. Seit 1. Januar 2026 gelten 38 Cent ab dem ersten Entfernungskilometer.",
    notice: "Der Rechner zeigt den abziehbaren Betrag, nicht die direkte Steuererstattung. Gesetzliche Höchstbeträge und Sonderfälle sind nicht vollständig abgebildet.",
    fields: [
      { id: "distance", label: "Einfache Entfernung", type: "number", value: 35, min: 0, step: 1, unit: "km" },
      { id: "days", label: "Arbeitstage im Jahr", type: "number", value: 220, min: 0, max: 366, step: 1 }
    ],
    calculate(values) {
      const distance = positiveValue(values, "distance", "Die Entfernung", true);
      const days = positiveValue(values, "days", "Die Arbeitstage", true);
      const daily = distance * calculationData2026.commuterAllowance;
      const annual = daily * days;
      return result("Entfernungspauschale pro Jahr", currency(annual), [metric("Pro Arbeitstag", currency(daily), "accent"), metric("Einfache Entfernung", number(distance, " km")), metric("Kilometersatz 2026", currency(calculationData2026.commuterAllowance))], `${number(days, " Tage")} × ${number(distance, " km")} × ${currency(calculationData2026.commuterAllowance)}.`);
    }
  },
  {
    slug: "gkv-pkv-vergleich",
    wave: 2,
    category: "Versicherung",
    title: "GKV- und PKV-Kosten vergleichen",
    description: "Eigene monatliche Kosten einer gesetzlichen und privaten Krankenversicherung als Szenario vergleichen.",
    intro: "Trage Einkommen und den Gesamtbeitrag eines konkreten PKV-Angebots ein. GKV-Anteil, Beitragsgrenze und möglicher Arbeitgeberzuschuss werden automatisch berechnet.",
    explanation: "Der GKV-Anteil wird mit den Beitragswerten und der Beitragsgrenze für 2026 berechnet. Der PKV-Arbeitgeberzuschuss wird auf die Hälfte des Beitrags und den gesetzlichen Höchstzuschuss begrenzt.",
    notice: "Das ist kein Tarifvergleich. Leistungen, Alterungsrückstellungen, Selbstbehalt, Familienversicherung und Beitragsentwicklung gehören in eine echte Versicherungsentscheidung.",
    fields: [
      { id: "income", label: "Monatsbrutto", type: "number", value: 4500, min: 0, step: 10, unit: "€" },
      { id: "pkv", label: "PKV-Beitrag einschließlich Pflege", type: "number", value: 850, min: 0, step: 1, unit: "€" },
      { id: "children", label: "Kinder unter 25", type: "select", value: "0", options: [["0", "Keine"], ["1", "1 Kind"], ["2", "2 Kinder"], ["3", "3 Kinder"], ["4", "4 Kinder"], ["5", "5 oder mehr"]] },
      { id: "childlessSurcharge", label: "Kinderlosenzuschlag zur Pflegeversicherung", type: "select", value: "yes", options: [["yes", "Gilt für mich"], ["no", "Gilt für mich nicht"]], advanced: true },
      { id: "additionalRate", label: "Zusatzbeitrag der Krankenkasse", type: "number", value: calculationData2026.health.averageAdditionalRate, min: 0, step: 0.01, unit: "%", advanced: true },
      { id: "selfPay", label: "Erwarteter Selbstbehalt pro Jahr", type: "number", value: 0, min: 0, step: 10, unit: "€", advanced: true }
    ],
    calculate(values) {
      const income = positiveValue(values, "income", "Das GKV-Einkommen", true);
      const pkv = positiveValue(values, "pkv", "Der PKV-Beitrag", true);
      const additionalRate = positiveValue(values, "additionalRate", "Der Zusatzbeitrag", true);
      const selfPay = positiveValue(values, "selfPay", "Der Selbstbehalt", true);
      const contributionBase = Math.min(income, calculationData2026.health.monthlyCeiling);
      const healthEmployee = contributionBase * (calculationData2026.health.generalRate + additionalRate) / 200;
      const care = socialContributions2026(income, { children: values.children, childlessSurcharge: values.childlessSurcharge, additionalRate }).care;
      const gkvEmployee = healthEmployee + care;
      const maxEmployerSubsidy = calculationData2026.health.monthlyCeiling * (
        (calculationData2026.health.generalRate + additionalRate) / 200 + calculationData2026.care.employerRate / 100
      );
      const pkvEmployer = Math.min(pkv / 2, maxEmployerSubsidy);
      const pkvEmployee = Math.max(0, pkv - pkvEmployer) + selfPay / 12;
      const difference = pkvEmployee - gkvEmployee;
      return result("Monatlicher Unterschied", currency(difference), [metric("Eigener GKV-Anteil", currency(gkvEmployee)), metric("Eigene PKV-Kosten", currency(pkvEmployee)), metric("Berechneter PKV-Zuschuss", currency(pkvEmployer), "accent")], `${difference > 0 ? "PKV-Szenario teurer" : "PKV-Szenario günstiger"}: ${currency(Math.abs(difference))} pro Monat, Leistungen nicht verglichen.`);
    }
  },
  {
    slug: "monatsbudget-rechner",
    wave: 2,
    category: "Finanzen",
    title: "Monatsbudget und Sparquote",
    description: "Freien Monatsbetrag, Sparquote und jährliches Sparpotenzial aus Einnahmen und Ausgaben berechnen.",
    intro: "Ordne Fixkosten, variable Ausgaben und Sparen in ein einfaches Monatsbudget ein.",
    explanation: "Vom Nettoeinkommen werden Fixkosten, variable Ausgaben und bereits geplantes Sparen abgezogen. Die Sparquote bezieht den Sparbetrag auf das Nettoeinkommen.",
    fields: [
      { id: "income", label: "Nettoeinnahmen", type: "number", value: 3000, min: 0, step: 10, unit: "€" },
      { id: "fixed", label: "Fixkosten", type: "number", value: 1400, min: 0, step: 10, unit: "€" },
      { id: "variable", label: "Variable Ausgaben", type: "number", value: 900, min: 0, step: 10, unit: "€" },
      { id: "savings", label: "Geplantes Sparen", type: "number", value: 400, min: 0, step: 10, unit: "€" }
    ],
    calculate(values) {
      const income = positiveValue(values, "income", "Die Einnahmen", true);
      const fixed = positiveValue(values, "fixed", "Die Fixkosten", true);
      const variable = positiveValue(values, "variable", "Die variablen Ausgaben", true);
      const savings = positiveValue(values, "savings", "Das geplante Sparen", true);
      const remainder = income - fixed - variable - savings;
      return result("Freier Monatsbetrag", currency(remainder), [metric("Sparquote", percent(income ? savings / income * 100 : 0), "accent"), metric("Ausgabenquote", percent(income ? (fixed + variable) / income * 100 : 0)), metric("Sparbetrag pro Jahr", currency(savings * 12))], `${currency(income)} minus ${currency(fixed + variable)} Ausgaben und ${currency(savings)} Sparen.`);
    }
  }
];

const calculatorDefinitions = [...waveOne, ...waveTwo];

export const calculators = calculatorDefinitions.map((calculator) => {
  const guide = calculatorGuides[calculator.slug];
  if (!guide) throw new Error(`Für ${calculator.slug} fehlt die verständliche Rechner-Erklärung.`);

  const fields = calculator.fields.map((field) => {
    const help = guide.fieldHelp[field.id];
    if (!help) throw new Error(`Für ${calculator.slug}.${field.id} fehlt die Feld-Erklärung.`);
    return { ...field, help };
  });

  return { ...calculator, ...guide, fields };
});

export const calculatorBySlug = new Map(calculators.map((calculator) => [calculator.slug, calculator]));

export const calculatorRoutes = calculators.map((calculator) => `/rechner/${calculator.slug}/`);
