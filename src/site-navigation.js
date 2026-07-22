import { calculators } from "./calculator-catalog.js";
import { browserTools } from "./tool-catalog.js";
import { escapeHtml } from "./public-content.js";

function grouped(items, categories) {
  const itemCategories = [...new Set(items.map((item) => item.category))];
  const orderedCategories = [
    ...categories.filter((category) => itemCategories.includes(category)),
    ...itemCategories.filter((category) => !categories.includes(category))
  ];
  return orderedCategories
    .map((category) => ({
      category,
      items: items.filter((item) => item.category === category)
    }))
    .filter((group) => group.items.length > 0);
}

function normalizePath(path, basePath) {
  const indexFile = "index.html";
  let normalized = String(path || "/").split("?")[0].split("#")[0];
  if (basePath !== "/" && normalized.startsWith(basePath)) {
    normalized = `/${normalized.slice(basePath.length)}`;
  }
  if (normalized.endsWith(indexFile)) normalized = normalized.slice(0, -indexFile.length);
  if (!normalized.startsWith("/")) normalized = `/${normalized}`;
  if (normalized !== "/" && !normalized.endsWith("/")) normalized += "/";
  return normalized;
}

function href(basePath, route) {
  return route === "/" ? basePath : `${basePath}${route.slice(1)}`;
}

function currentAttribute(active) {
  return active ? ' aria-current="page"' : "";
}

function renderLinkList(items, basePath, type) {
  return items.map((item) => {
    const route = type === "calculator" ? `/rechner/${item.slug}/` : `/${item.slug}/`;
    return `<a class="nav-directory__link" href="${href(basePath, route)}">${escapeHtml(item.title)}</a>`;
  }).join("\n");
}

function renderGroups(groups, basePath, type) {
  return groups.map((group, index) => {
    const groupId = `nav-${type}-group-${index}`;
    return [
      `<div class="nav-directory__group" data-nav-group>`,
      `  <button class="nav-directory__group-toggle" type="button" data-nav-group-toggle aria-expanded="false" aria-controls="${groupId}-items">`,
      `    <span>${escapeHtml(group.category)}</span>`,
      '    <i data-lucide="chevron-down" aria-hidden="true"></i>',
      "  </button>",
      `  <div class="nav-directory__group-list" id="${groupId}-items" data-nav-group-items hidden>${renderLinkList(group.items, basePath, type)}</div>`,
      "</div>"
    ].join("\n");
  }).join("\n");
}

const browserGroups = [
  {
    category: "Dateien und Bilder",
    items: browserTools.filter((tool) => tool.category === "PDF" || tool.category === "Bilder")
  },
  {
    category: "Text, Web und Alltag",
    items: browserTools.filter((tool) => tool.category !== "PDF" && tool.category !== "Bilder")
  }
];

const calculatorGroups = grouped(calculators, ["Alltag", "Geschäft", "Arbeit", "Finanzen", "Versicherung"]);
const browserRoutes = new Set(browserTools.map((tool) => `/${tool.slug}/`));

export function renderSiteNavigation(path, basePath) {
  const currentPath = normalizePath(path, basePath);
  const browserSectionActive = currentPath === "/alle-werkzeuge/" || browserRoutes.has(currentPath);
  const calculatorSectionActive = currentPath === "/rechner/" || currentPath.startsWith("/rechner/");
  const privacyActive = currentPath === "/datenschutz/";
  const total = browserTools.length + calculators.length;

  return [
    '<nav class="site-nav" id="site-navigation" data-navigation aria-label="Hauptnavigation">',
    '  <div class="site-nav__primary">',
    `    <button class="site-nav__tools-button" type="button" data-tools-menu-toggle aria-expanded="false" aria-controls="tool-directory-menu"${currentAttribute(browserSectionActive)}><span>Alle Werkzeuge</span><i data-lucide="chevron-down"></i></button>`,
    `    <a class="site-nav__mobile-overview" href="${href(basePath, "/alle-werkzeuge/")}"${currentAttribute(browserSectionActive)}>Übersicht</a>`,
    `    <a href="${href(basePath, "/rechner/")}"${currentAttribute(calculatorSectionActive)}>Rechner</a>`,
    `    <a href="${href(basePath, "/datenschutz/")}"${currentAttribute(privacyActive)}>Datenschutz</a>`,
    "  </div>",
    '  <div class="nav-directory" id="tool-directory-menu" data-tool-directory aria-label="Werkzeugverzeichnis">',
    '    <div class="container nav-directory__inner">',
    '      <div class="nav-directory__header">',
    `        <strong>Alle ${total} Werkzeuge</strong>`,
    `        <a href="${href(basePath, "/alle-werkzeuge/")}">Gesamtübersicht <i data-lucide="arrow-right"></i></a>`,
    "      </div>",
    '      <div class="nav-directory__layout">',
    '        <section class="nav-directory__section" aria-labelledby="nav-browser-tools-heading">',
    '          <h2 id="nav-browser-tools-heading">Werkzeuge</h2>',
    `          <div class="nav-directory__groups nav-directory__groups--browser">${renderGroups(browserGroups, basePath, "browser")}</div>`,
    "        </section>",
    '        <section class="nav-directory__section nav-directory__section--calculators" aria-labelledby="nav-calculators-heading">',
    '          <h2 id="nav-calculators-heading">Rechner</h2>',
    `          <div class="nav-directory__groups nav-directory__groups--calculators">${renderGroups(calculatorGroups, basePath, "calculator")}</div>`,
    "        </section>",
    "      </div>",
    "    </div>",
    "  </div>",
    "</nav>"
  ].join("\n");
}
