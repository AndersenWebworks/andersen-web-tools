import "./styles.css";
import {
  copyText,
  refreshIcons,
  showToast
} from "./shared.js";

const defaults = {
  url: "https://beispiel.de/leistung/",
  title: "Webdesign für kleine Unternehmen | Beispiel",
  description: "Webdesign für kleine Unternehmen in Plau am See. Mit Leistungsseiten, Kontaktformular und persönlicher Betreuung.",
  siteName: "Beispiel",
  type: "website",
  image: "",
  index: true,
  follow: true
};

const elements = {
  url: document.querySelector("[data-meta-url]"),
  title: document.querySelector("[data-meta-title]"),
  description: document.querySelector("[data-meta-description]"),
  siteName: document.querySelector("[data-meta-site-name]"),
  type: document.querySelector("[data-meta-type]"),
  image: document.querySelector("[data-meta-image]"),
  index: document.querySelector("[data-meta-index]"),
  follow: document.querySelector("[data-meta-follow]"),
  titleCounter: document.querySelector("[data-title-counter]"),
  descriptionCounter: document.querySelector("[data-description-counter]"),
  previewUrl: document.querySelector("[data-preview-url]"),
  previewTitle: document.querySelector("[data-preview-title]"),
  previewDescription: document.querySelector("[data-preview-description]"),
  socialImage: document.querySelector("[data-social-image]"),
  socialDomain: document.querySelector("[data-social-domain]"),
  socialTitle: document.querySelector("[data-social-title]"),
  socialDescription: document.querySelector("[data-social-description]"),
  error: document.querySelector("[data-meta-error]"),
  generate: document.querySelector("[data-meta-generate]"),
  reset: document.querySelector("[data-meta-reset]"),
  resultPanel: document.querySelector("[data-meta-result-panel]"),
  code: document.querySelector("[data-meta-code]"),
  copy: document.querySelector("[data-meta-copy]")
};

let generatedCode = "";

function setError(message = "") {
  elements.error.querySelector("span").textContent = message;
  elements.error.hidden = !message;
}

function parseHttpUrl(value, label, required = true) {
  const candidate = value.trim();
  if (!candidate && !required) return null;
  if (!candidate) throw new Error(`${label} fehlt.`);
  let url;
  try {
    url = new URL(candidate);
  } catch {
    throw new Error(`${label} ist keine vollständige Webadresse.`);
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") throw new Error(`${label} muss mit http:// oder https:// beginnen.`);
  return url;
}

function escapeHtml(value) {
  let output = "";
  for (const character of String(value)) {
    if (character === "&") output += "&amp;";
    else if (character === "<") output += "&lt;";
    else if (character === ">") output += "&gt;";
    else if (character === '"') output += "&quot;";
    else if (character === "'") output += "&#039;";
    else output += character;
  }
  return output;
}

function previewPath(url) {
  const parts = url.pathname.split("/").filter(Boolean);
  const visible = parts.slice(0, 2).join(" › ");
  return visible ? `${url.hostname} › ${visible}` : url.hostname;
}

function updateCounter(element, length, warning, error) {
  element.textContent = `${length} ${length === 1 ? "Zeichen" : "Zeichen"}`;
  if (length > error) element.dataset.state = "error";
  else if (length > warning) element.dataset.state = "warning";
  else delete element.dataset.state;
}

function updatePreview() {
  let url;
  try {
    url = parseHttpUrl(elements.url.value, "Die Seitenadresse");
  } catch {
    url = new URL(defaults.url);
  }
  const title = elements.title.value.trim() || "Seitentitel fehlt";
  const description = elements.description.value.trim() || "Eine klare Beschreibung der Seite fehlt noch.";
  elements.previewUrl.textContent = previewPath(url);
  elements.previewTitle.textContent = title;
  elements.previewDescription.textContent = description;
  elements.socialDomain.textContent = url.hostname.toUpperCase();
  elements.socialTitle.textContent = title;
  elements.socialDescription.textContent = description;
  updateCounter(elements.titleCounter, elements.title.value.length, 60, 70);
  updateCounter(elements.descriptionCounter, elements.description.value.length, 155, 170);

  const hasImage = Boolean(elements.image.value.trim());
  elements.socialImage.innerHTML = hasImage
    ? '<i data-lucide="file-image"></i><span>Vorschaubild hinterlegt</span>'
    : '<i data-lucide="file-image"></i><span class="sr-only">Kein Vorschaubild angegeben</span>';
  refreshIcons(elements.socialImage);
  generateCode(false);
}

function collectData() {
  const url = parseHttpUrl(elements.url.value, "Die Seitenadresse");
  const imageUrl = parseHttpUrl(elements.image.value, "Die Vorschaubild-URL", false);
  const title = elements.title.value.trim();
  const description = elements.description.value.trim();
  if (!title) throw new Error("Trage einen Seitentitel ein.");
  if (!description) throw new Error("Trage eine Meta-Description ein.");
  return {
    url: url.href,
    title,
    description,
    siteName: elements.siteName.value.trim(),
    type: elements.type.value,
    image: imageUrl ? imageUrl.href : "",
    robots: `${elements.index.checked ? "index" : "noindex"}, ${elements.follow.checked ? "follow" : "nofollow"}`
  };
}

function buildMetaCode(data) {
  const lines = [
    `<title>${escapeHtml(data.title)}</title>`,
    `<meta name="description" content="${escapeHtml(data.description)}">`,
    `<link rel="canonical" href="${escapeHtml(data.url)}">`,
    `<meta name="robots" content="${data.robots}">`,
    "",
    `<meta property="og:type" content="${escapeHtml(data.type)}">`,
    `<meta property="og:locale" content="de_DE">`,
    `<meta property="og:title" content="${escapeHtml(data.title)}">`,
    `<meta property="og:description" content="${escapeHtml(data.description)}">`,
    `<meta property="og:url" content="${escapeHtml(data.url)}">`
  ];
  if (data.siteName) lines.push(`<meta property="og:site_name" content="${escapeHtml(data.siteName)}">`);
  if (data.image) {
    lines.push(`<meta property="og:image" content="${escapeHtml(data.image)}">`);
    lines.push(`<meta property="og:image:width" content="1200">`);
    lines.push(`<meta property="og:image:height" content="630">`);
  }
  lines.push("");
  lines.push(`<meta name="twitter:card" content="${data.image ? "summary_large_image" : "summary"}">`);
  lines.push(`<meta name="twitter:title" content="${escapeHtml(data.title)}">`);
  lines.push(`<meta name="twitter:description" content="${escapeHtml(data.description)}">`);
  if (data.image) lines.push(`<meta name="twitter:image" content="${escapeHtml(data.image)}">`);
  return lines.join("\n");
}

function generateCode(scrollToResult = true) {
  setError();
  try {
    const data = collectData();
    generatedCode = buildMetaCode(data);
    elements.code.textContent = generatedCode;
    elements.resultPanel.hidden = false;
    if (scrollToResult) elements.resultPanel.scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (error) {
    elements.resultPanel.hidden = true;
    setError(error instanceof Error ? error.message : "Die Meta-Tags konnten nicht erzeugt werden.");
  }
}

function resetForm() {
  elements.url.value = defaults.url;
  elements.title.value = defaults.title;
  elements.description.value = defaults.description;
  elements.siteName.value = defaults.siteName;
  elements.type.value = defaults.type;
  elements.image.value = defaults.image;
  elements.index.checked = defaults.index;
  elements.follow.checked = defaults.follow;
  setError();
  updatePreview();
}

[elements.url, elements.title, elements.description, elements.siteName, elements.image].forEach((control) => control.addEventListener("input", updatePreview));
[elements.type, elements.index, elements.follow].forEach((control) => control.addEventListener("change", updatePreview));
elements.generate.addEventListener("click", () => generateCode());
elements.reset.addEventListener("click", resetForm);
elements.copy.addEventListener("click", async () => {
  if (!generatedCode) return;
  await copyText(generatedCode);
  showToast("Meta-Tags kopiert.");
});

updatePreview();
