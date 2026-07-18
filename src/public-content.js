import { browserTools } from "./tool-catalog.js";

export function escapeHtml(value) {
  return String(value)
    .split("&").join("&amp;")
    .split("<").join("&lt;")
    .split(">").join("&gt;")
    .split('"').join("&quot;")
    .split("'").join("&#39;");
}

function renderSteps(steps) {
  return steps.map((step, index) => [
    '<li class="guide-step">',
    `  <span class="guide-step__number" aria-hidden="true">${index + 1}</span>`,
    `  <p>${escapeHtml(step)}</p>`,
    "</li>"
  ].join("\n")).join("\n");
}

function renderTerms(terms) {
  return terms.map(([term, explanation]) => [
    '<div class="glossary-item">',
    `  <dt>${escapeHtml(term)}</dt>`,
    `  <dd>${escapeHtml(explanation)}</dd>`,
    "</div>"
  ].join("\n")).join("\n");
}

function relatedBrowserTools(tool) {
  const sameCategory = browserTools.filter((candidate) => candidate.slug !== tool.slug && candidate.category === tool.category);
  const otherTools = browserTools.filter((candidate) => candidate.slug !== tool.slug && candidate.category !== tool.category);
  return [...sameCategory, ...otherTools].slice(0, 3);
}

function renderRelatedTools(tool, basePath) {
  return relatedBrowserTools(tool).map((candidate) => [
    `<a class="related-link" href="${basePath}${candidate.slug}/">`,
    `  <span><strong>${escapeHtml(candidate.title)}</strong><span>${escapeHtml(candidate.description)}</span></span>`,
    '  <i data-lucide="arrow-right"></i>',
    "</a>"
  ].join("\n")).join("\n");
}

export function renderStaticToolGuide(tool, basePath) {
  return [
    '<section class="content-band content-band--guide" aria-labelledby="guide-heading">',
    '  <div class="container guide-layout">',
    "    <div>",
    '      <h2 id="guide-heading">So benutzt du das Werkzeug</h2>',
    `      <p class="guide-intro">${escapeHtml(tool.description)}</p>`,
    "    </div>",
    `    <ol class="guide-steps">${renderSteps(tool.steps)}</ol>`,
    "  </div>",
    "</section>",
    '<section class="content-band content-band--soft" aria-labelledby="terms-heading">',
    '  <div class="container glossary-layout">',
    "    <div>",
    '      <h2 id="terms-heading">Begriffe aus diesem Werkzeug</h2>',
    "      <p>Diese Wörter werden in den Einstellungen oder im Ergebnis verwendet.</p>",
    "    </div>",
    `    <dl class="glossary-list">${renderTerms(tool.terms)}</dl>`,
    "  </div>",
    "</section>",
    '<section class="related-section" aria-labelledby="related-heading">',
    '  <div class="container">',
    '    <div class="related-section__heading"><h2 id="related-heading">Das könnte dir auch helfen</h2><a href="' + basePath + 'alle-werkzeuge/">Alle Werkzeuge ansehen</a></div>',
    `    <div class="related-links">${renderRelatedTools(tool, basePath)}</div>`,
    "  </div>",
    "</section>"
  ].join("\n");
}

export function renderGuideSteps(steps) {
  return renderSteps(steps);
}

export function renderGuideTerms(terms) {
  return renderTerms(terms);
}
