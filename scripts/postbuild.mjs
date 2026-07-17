import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { BASE_PATH, PUBLIC_ROUTES, SITE_NAME, SITE_URL } from "../site.config.js";

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
  await writeFile(resolve(outputDirectory, "sitemap.xml"), sitemap, "utf8");
  await writeFile(resolve(outputDirectory, "robots.txt"), robots, "utf8");
  await writeFile(resolve(outputDirectory, "site.webmanifest"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  await writeFile(resolve(outputDirectory, ".nojekyll"), "", "utf8");
}

if (process.argv[1] && resolve(process.argv[1]) === modulePath) {
  await writeProductionFiles();
}
