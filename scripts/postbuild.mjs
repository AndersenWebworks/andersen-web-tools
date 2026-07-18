import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { BASE_PATH, PUBLIC_ROUTES, SITE_NAME, SITE_URL } from "../site.config.js";
import { calculators } from "../src/calculator-catalog.js";

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

function escapeHtml(value) {
  return escapeXml(value);
}

function calculatorCards() {
  return calculators.map((calculator) => [
    `<a class="calculator-card" href="${BASE_PATH}rechner/${calculator.slug}/" data-calculator-wave="${calculator.wave}" data-calculator-category="${escapeHtml(calculator.category)}">`,
    `  <span class="calculator-card__meta"><span>Welle ${calculator.wave}</span><span>${escapeHtml(calculator.category)}</span></span>`,
    `  <span><h3>${escapeHtml(calculator.title)}</h3><p>${escapeHtml(calculator.description)}</p></span>`,
    '  <i data-lucide="arrow-right"></i>',
    "</a>"
  ].join("\n")).join("\n");
}

async function writeCalculatorPages(outputDirectory) {
  const hubPath = resolve(outputDirectory, "rechner", "index.html");
  const templatePath = resolve(outputDirectory, "rechner", "werkzeug", "index.html");
  const template = await readFile(templatePath, "utf8");
  const hub = await readFile(hubPath, "utf8");
  await writeFile(hubPath, hub.split("__CALCULATOR_CARDS__").join(calculatorCards()), "utf8");

  for (const calculator of calculators) {
    const replacements = new Map([
      ["__CALCULATOR_SLUG__", calculator.slug],
      ["__CALCULATOR_TITLE__", escapeHtml(calculator.title)],
      ["__CALCULATOR_DESCRIPTION__", escapeHtml(calculator.description)],
      ["__CALCULATOR_INTRO__", escapeHtml(calculator.intro)],
      ["__CALCULATOR_EXPLANATION__", escapeHtml(calculator.explanation)],
      ["__CALCULATOR_NOTICE_HTML__", calculator.notice ? `<div class="status-message status-message--info"><i data-lucide="info"></i><span>${escapeHtml(calculator.notice)}</span></div>` : ""],
      ["__CALCULATOR_WAVE__", String(calculator.wave)],
      ["__CALCULATOR_CATEGORY__", escapeHtml(calculator.category)]
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
  await writeFile(resolve(outputDirectory, "sitemap.xml"), sitemap, "utf8");
  await writeFile(resolve(outputDirectory, "robots.txt"), robots, "utf8");
  await writeFile(resolve(outputDirectory, "site.webmanifest"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  await writeFile(resolve(outputDirectory, ".nojekyll"), "", "utf8");
}

if (process.argv[1] && resolve(process.argv[1]) === modulePath) {
  await writeProductionFiles();
}
