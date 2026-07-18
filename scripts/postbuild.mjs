import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { BASE_PATH, PUBLIC_ROUTES, SITE_NAME, SITE_URL } from "../site.config.js";
import { calculators } from "../src/calculator-catalog.js";
import { escapeHtml, renderGuideSteps, renderGuideTerms } from "../src/public-content.js";
import { browserTools } from "../src/tool-catalog.js";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const modulePath = fileURLToPath(import.meta.url);
const defaultOutputDirectory = resolve(scriptDirectory, "..", "dist");

function escapeXml(value) {
  let output = "";
  for (const character of value) {
    if (character === "&") output += "&amp;";
    else if (character === "<") output += "&lt;";
    else if (character === ">") output += "&gt;";
    else if (character === '"') output += "&quot;";
    else if (character === "'") output += "&apos;";
    else output += character;
  }
  return output;
}

function calculatorCards() {
  return calculators.map((calculator) => [
    `<a class="calculator-card" href="${BASE_PATH}rechner/${calculator.slug}/" data-calculator-category="${escapeHtml(calculator.category)}">`,
    `  <span class="calculator-card__meta"><span>${escapeHtml(calculator.category)}</span><span>Kostenlos</span></span>`,
    `  <span><h3>${escapeHtml(calculator.title)}</h3><p>${escapeHtml(calculator.description)}</p></span>`,
    '  <i data-lucide="arrow-right"></i>',
    "</a>"
  ].join("\n")).join("\n");
}

function calculatorPath(calculator) {
  return `${BASE_PATH}rechner/${calculator.slug}/`;
}

function relatedCalculators(calculator) {
  const sameCategory = calculators.filter((candidate) => candidate.slug !== calculator.slug && candidate.category === calculator.category);
  const otherCategories = calculators.filter((candidate) => candidate.slug !== calculator.slug && candidate.category !== calculator.category);
  return [...sameCategory, ...otherCategories].slice(0, 3);
}

function calculatorFaq(calculator) {
  return calculator.faq.map(([question, answer]) => [
    "<details>",
    `  <summary>${escapeHtml(question)}</summary>`,
    `  <div><p>${escapeHtml(answer)}</p></div>`,
    "</details>"
  ].join("\n")).join("\n");
}

function calculatorRelatedLinks(calculator) {
  return relatedCalculators(calculator).map((candidate) => [
    `<a class="related-link" href="${calculatorPath(candidate)}">`,
    `  <span><strong>${escapeHtml(candidate.title)}</strong><span>${escapeHtml(candidate.description)}</span></span>`,
    '  <i data-lucide="arrow-right"></i>',
    "</a>"
  ].join("\n")).join("\n");
}

function calculatorSchema(calculator) {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "@id": `${SITE_URL}/rechner/${calculator.slug}/#app`,
        name: calculator.title,
        url: `${SITE_URL}/rechner/${calculator.slug}/`,
        applicationCategory: "UtilitiesApplication",
        operatingSystem: "Webbrowser",
        inLanguage: "de-DE",
        isAccessibleForFree: true,
        offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
        description: calculator.description,
        featureList: calculator.steps
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Andersen Web Tools", item: `${SITE_URL}/` },
          { "@type": "ListItem", position: 2, name: "Rechner", item: `${SITE_URL}/rechner/` },
          { "@type": "ListItem", position: 3, name: calculator.title, item: `${SITE_URL}/rechner/${calculator.slug}/` }
        ]
      },
      {
        "@type": "FAQPage",
        mainEntity: calculator.faq.map(([question, answer]) => ({
          "@type": "Question",
          name: question,
          acceptedAnswer: { "@type": "Answer", text: answer }
        }))
      }
    ]
  });
}

function calculatorHubSchema() {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Kostenlose Online-Rechner",
    numberOfItems: calculators.length,
    itemListElement: calculators.map((calculator, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${SITE_URL}/rechner/${calculator.slug}/`,
      name: calculator.title,
      description: calculator.description
    }))
  });
}

const browserCategoryOrder = ["PDF", "Bilder", "Text", "Arbeit", "Geschäft", "Web"];
const calculatorCategoryOrder = ["Alltag", "Geschäft", "Arbeit", "Finanzen", "Versicherung"];
const categoryIds = new Map([
  ["PDF", "pdf"], ["Bilder", "bilder"], ["Text", "text"], ["Arbeit", "arbeit"],
  ["Geschäft", "geschaeft"], ["Web", "web"], ["Alltag", "alltag"],
  ["Finanzen", "finanzen"], ["Versicherung", "versicherung"]
]);

function portalCard(item, type) {
  const href = type === "Rechner" ? calculatorPath(item) : `${BASE_PATH}${item.slug}/`;
  return [
    `<a class="portal-card" href="${href}">`,
    `  <span class="portal-card__type">${escapeHtml(type)}</span>`,
    `  <span><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.description)}</p></span>`,
    '  <i data-lucide="arrow-right"></i>',
    "</a>"
  ].join("\n");
}

function portalSection(title, description, items, type, category) {
  const typeId = type === "Rechner" ? "rechner" : "werkzeuge";
  const id = `${typeId}-${categoryIds.get(category) || "weitere"}`;
  return [
    `<section class="portal-group" id="${id}" aria-labelledby="${id}-heading">`,
    '  <div class="container">',
    '    <div class="portal-group__heading">',
    `      <h2 id="${id}-heading">${escapeHtml(title)}</h2>`,
    `      <p>${escapeHtml(description)}</p>`,
    "    </div>",
    `    <div class="portal-grid">${items.map((item) => portalCard(item, type)).join("\n")}</div>`,
    "  </div>",
    "</section>"
  ].join("\n");
}

function allToolSections() {
  const sections = [];
  for (const category of browserCategoryOrder) {
    const items = browserTools.filter((tool) => tool.category === category);
    if (items.length === 0) continue;
    const descriptions = {
      PDF: "PDF-Dateien verkleinern, verbinden, umwandeln oder sichtbar unterschreiben.",
      Bilder: "Fotos kompatibel machen, Dateigröße reduzieren und Bilddaten entfernen.",
      Text: "Texte prüfen, zählen und besser für feste Längenvorgaben einschätzen.",
      Arbeit: "Arbeitszeiten in Uhrzeit und Dezimalwert berechnen.",
      Geschäft: "Zahlungsdaten kontrollieren und für eine Überweisung vorbereiten.",
      Web: "QR-Codes, Farbkontraste und Seitendaten für Websites erstellen oder prüfen."
    };
    sections.push(portalSection(category, descriptions[category], items, "Werkzeug", category));
  }

  for (const category of calculatorCategoryOrder) {
    const items = calculators.filter((calculator) => calculator.category === category);
    if (items.length === 0) continue;
    const descriptions = {
      Alltag: "Prozente, Rabatte, Fahrtkosten, Stromverbrauch, Zeitspannen und Stückpreise berechnen.",
      Geschäft: "Mehrwertsteuer, Marge, Zahlungsgebühren und Skonto berechnen.",
      Arbeit: "Urlaub, Stundenlohn, Arbeitgeberkosten, Minijob, Firmenwagen und Arbeitsweg berechnen.",
      Finanzen: "Sparplan, Zinseszins und Monatsbudget berechnen.",
      Versicherung: "GKV, Pflegebeiträge, Krankengeld und Beitragsunterschiede berechnen."
    };
    sections.push(portalSection(`${category} berechnen`, descriptions[category], items, "Rechner", category));
  }
  return sections.join("\n");
}

function allToolsSchema() {
  const items = [
    ...browserTools.map((tool) => ({ ...tool, url: `${SITE_URL}/${tool.slug}/` })),
    ...calculators.map((calculator) => ({ ...calculator, url: `${SITE_URL}/rechner/${calculator.slug}/` }))
  ];
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Kostenlose Online-Werkzeuge und Rechner",
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: item.url,
      name: item.title,
      description: item.description
    }))
  });
}

async function writePortalPage(outputDirectory) {
  const target = resolve(outputDirectory, "alle-werkzeuge", "index.html");
  let html = await readFile(target, "utf8");
  html = html
    .split("__ALL_TOOLS_SECTIONS__").join(allToolSections())
    .split("__ALL_TOOLS_SCHEMA__").join(allToolsSchema());
  await writeFile(target, html, "utf8");
}

function publicCatalog() {
  return {
    version: 1,
    name: SITE_NAME,
    language: "de-DE",
    privacy: "Dateien und Eingaben werden im Browser verarbeitet und nicht an Andersen Webworks übertragen.",
    directory: `${SITE_URL}/alle-werkzeuge/`,
    tools: [
      ...browserTools.map((tool) => ({
        type: "browser-tool",
        title: tool.title,
        category: tool.category,
        url: `${SITE_URL}/${tool.slug}/`,
        description: tool.description,
        steps: tool.steps,
        terms: Object.fromEntries(tool.terms)
      })),
      ...calculators.map((calculator) => ({
        type: "calculator",
        title: calculator.title,
        category: calculator.category,
        url: `${SITE_URL}/rechner/${calculator.slug}/`,
        description: calculator.description,
        inputs: calculator.fields.map((field) => ({ label: field.label, unit: field.unit || null, explanation: field.help })),
        steps: calculator.steps,
        terms: Object.fromEntries(calculator.terms)
      }))
    ]
  };
}

function llmsText() {
  const lines = [
    `# ${SITE_NAME}`,
    "",
    "> Kostenlose deutschsprachige Browser-Werkzeuge und Online-Rechner von Andersen Webworks. Ohne Konto, Werbung, Tracking oder Datei-Upload.",
    "",
    "## Wichtige Seiten",
    `- [Alle Werkzeuge](${SITE_URL}/alle-werkzeuge/): Vollständige Übersicht aller Werkzeuge und Rechner`,
    `- [Rechner](${SITE_URL}/rechner/): Rechner für Alltag, Geschäft, Arbeit, Finanzen und Versicherung`,
    `- [Datenschutz](${SITE_URL}/datenschutz/): Erklärung der lokalen Browser-Verarbeitung`,
    `- [Maschinenlesbarer Katalog](${SITE_URL}/werkzeuge.json): Strukturierte Angaben zu Aufgaben, Eingaben und Begriffen`,
    "",
    "## Werkzeuge"
  ];
  browserTools.forEach((tool) => lines.push(`- [${tool.title}](${SITE_URL}/${tool.slug}/): ${tool.description}`));
  lines.push("", "## Rechner");
  calculators.forEach((calculator) => lines.push(`- [${calculator.title}](${SITE_URL}/rechner/${calculator.slug}/): ${calculator.description}`));
  return `${lines.join("\n")}\n`;
}

async function writeCalculatorPages(outputDirectory) {
  const hubPath = resolve(outputDirectory, "rechner", "index.html");
  const templatePath = resolve(outputDirectory, "rechner", "werkzeug", "index.html");
  const template = await readFile(templatePath, "utf8");
  const hub = await readFile(hubPath, "utf8");
  const renderedHub = hub
    .split("__CALCULATOR_CARDS__").join(calculatorCards())
    .split("__CALCULATOR_HUB_SCHEMA__").join(calculatorHubSchema());
  await writeFile(hubPath, renderedHub, "utf8");

  for (const calculator of calculators) {
    const replacements = new Map([
      ["__CALCULATOR_SLUG__", calculator.slug],
      ["__CALCULATOR_TITLE__", escapeHtml(calculator.title)],
      ["__CALCULATOR_DESCRIPTION__", escapeHtml(calculator.description)],
      ["__CALCULATOR_INTRO__", escapeHtml(calculator.intro)],
      ["__CALCULATOR_EXPLANATION__", escapeHtml(calculator.explanation)],
      ["__CALCULATOR_NOTICE_HTML__", calculator.notice ? `<div class="status-message status-message--info"><i data-lucide="info"></i><span>${escapeHtml(calculator.notice)}</span></div>` : ""],
      ["__CALCULATOR_CATEGORY__", escapeHtml(calculator.category)],
      ["__CALCULATOR_STEPS_HTML__", renderGuideSteps(calculator.steps)],
      ["__CALCULATOR_TERMS_HTML__", renderGuideTerms(calculator.terms)],
      ["__CALCULATOR_FAQ_HTML__", calculatorFaq(calculator)],
      ["__CALCULATOR_RELATED_HTML__", calculatorRelatedLinks(calculator)],
      ["__CALCULATOR_SCHEMA__", calculatorSchema(calculator)]
    ]);
    let html = template;
    replacements.forEach((value, token) => {
      html = html.split(token).join(value);
    });
    const targetDirectory = resolve(outputDirectory, "rechner", calculator.slug);
    await mkdir(targetDirectory, { recursive: true });
    await writeFile(resolve(targetDirectory, "index.html"), html, "utf8");
  }

  const templateFallback = [
    "<!doctype html>",
    '<html lang="de"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">',
    '<meta name="robots" content="noindex, follow"><title>Rechner auswählen – Andersen Web Tools</title></head>',
    `<body><main><h1>Rechner auswählen</h1><p><a href="${BASE_PATH}rechner/">Zur Rechnerübersicht</a></p></main></body></html>`,
    ""
  ].join("\n");
  await writeFile(templatePath, templateFallback, "utf8");
}

export async function writeProductionFiles(outputDirectory = defaultOutputDirectory) {
  const today = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Berlin",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date());

  const urls = PUBLIC_ROUTES.map((route) => [
    "  <url>",
    `    <loc>${escapeXml(`${SITE_URL}${route}`)}</loc>`,
    `    <lastmod>${today}</lastmod>`,
    "  </url>"
  ].join("\n")).join("\n");

  const sitemap = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urls,
    "</urlset>",
    ""
  ].join("\n");

  const robots = [
    "User-agent: *",
    `Allow: ${BASE_PATH}`,
    "",
    `Sitemap: ${SITE_URL}/sitemap.xml`,
    ""
  ].join("\n");

  const manifest = {
    name: SITE_NAME,
    short_name: "Web Tools",
    description: "Kostenlose Browser-Werkzeuge von Andersen Webworks. Ohne Datei-Upload, Konto, Werbung oder Tracking.",
    lang: "de-DE",
    start_url: BASE_PATH,
    scope: BASE_PATH,
    display: "standalone",
    background_color: "#f6f7f2",
    theme_color: "#0b725f",
    icons: [
      {
        src: `${BASE_PATH}favicon.svg`,
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any"
      }
    ]
  };

  await mkdir(outputDirectory, { recursive: true });
  await writeCalculatorPages(outputDirectory);
  await writePortalPage(outputDirectory);
  await writeFile(resolve(outputDirectory, "sitemap.xml"), sitemap, "utf8");
  await writeFile(resolve(outputDirectory, "robots.txt"), robots, "utf8");
  await writeFile(resolve(outputDirectory, "site.webmanifest"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  await writeFile(resolve(outputDirectory, "werkzeuge.json"), `${JSON.stringify(publicCatalog(), null, 2)}\n`, "utf8");
  await writeFile(resolve(outputDirectory, "llms.txt"), llmsText(), "utf8");
  await writeFile(resolve(outputDirectory, ".nojekyll"), "", "utf8");
}

if (process.argv[1] && resolve(process.argv[1]) === modulePath) {
  await writeProductionFiles();
}
