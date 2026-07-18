import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { parse } from "parse5";
import { PUBLIC_ROUTES } from "../site.config.js";
import { calculatorBySlug } from "../src/calculator-catalog.js";

const ignoredElements = new Set(["script", "style", "svg", "template"]);
const controlElements = new Set(["a", "button", "input", "label", "option", "select", "textarea"]);
const metadataProperties = new Set([
  "description",
  "og:title",
  "og:description",
  "twitter:title",
  "twitter:description"
]);

function compactText(value) {
  let output = "";
  let previousWasSpace = true;
  for (const character of String(value || "")) {
    const isSpace = character.trim() === "";
    if (isSpace) {
      if (!previousWasSpace) output += " ";
      previousWasSpace = true;
    } else {
      output += character;
      previousWasSpace = false;
    }
  }
  return output.trim();
}

function attributeMap(node) {
  return new Map((node.attrs || []).map((attribute) => [attribute.name, attribute.value]));
}

function nodeText(node) {
  if (node.nodeName === "#text") return compactText(node.value);
  if (ignoredElements.has(node.tagName)) return "";
  return compactText((node.childNodes || []).map(nodeText).filter(Boolean).join(" "));
}

function collectPage(document) {
  const content = [];
  const controls = [];
  const metadata = {};
  let title = "";

  function visit(node, ignored = false) {
    const isIgnored = ignored || ignoredElements.has(node.tagName);
    if (node.tagName === "title") title = nodeText(node);

    if (node.tagName === "meta") {
      const attributes = attributeMap(node);
      const key = attributes.get("name") || attributes.get("property") || "";
      if (metadataProperties.has(key)) metadata[key] = compactText(attributes.get("content"));
    }

    if (!isIgnored && node.nodeName === "#text") {
      const text = compactText(node.value);
      if (text) content.push(text);
    }

    if (!isIgnored && controlElements.has(node.tagName)) {
      const attributes = attributeMap(node);
      const labels = [
        attributes.get("aria-label"),
        attributes.get("alt"),
        attributes.get("placeholder"),
        attributes.get("title"),
        nodeText(node)
      ].map(compactText).filter(Boolean);
      if (labels.length > 0) controls.push({ element: node.tagName, labels: [...new Set(labels)] });
    }

    for (const child of node.childNodes || []) visit(child, isIgnored);
  }

  visit(document);
  return {
    title,
    metadata,
    content,
    controls
  };
}

function routeFile(outputDirectory, route) {
  if (route === "/") return resolve(outputDirectory, "index.html");
  return resolve(outputDirectory, route.slice(1), "index.html");
}

function calculatorState(route) {
  const parts = route.split("/").filter(Boolean);
  if (parts.length !== 2 || parts[0] !== "rechner") return null;
  const calculator = calculatorBySlug.get(parts[1]);
  if (!calculator) return null;
  const values = Object.fromEntries(calculator.fields.map((field) => [field.id, field.value]));
  return {
    category: calculator.category,
    fields: calculator.fields.map((field) => ({
      label: field.label,
      type: field.type,
      unit: field.unit || "",
      options: field.options || []
    })),
    defaultResult: calculator.calculate(values)
  };
}

export async function writePublicCopySurface(outputDirectory, targetPath = resolve(".clautz", "public-copy-surface.json")) {
  const pages = [];
  for (const route of [...PUBLIC_ROUTES, "/404/"]) {
    const htmlPath = route === "/404/" ? resolve(outputDirectory, "404.html") : routeFile(outputDirectory, route);
    const html = await readFile(htmlPath, "utf8");
    const page = collectPage(parse(html));
    pages.push({
      route,
      ...page,
      interactionState: calculatorState(route)
    });
  }

  const surface = {
    version: 1,
    project: "andersen-web-tools",
    pages
  };
  await writeFile(targetPath, `${JSON.stringify(surface, null, 2)}\n`, "utf8");
  return surface;
}
