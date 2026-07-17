import "./styles.css";
import {
  copyText,
  refreshIcons,
  showToast
} from "./shared.js";

const elements = {
  foregroundColor: document.querySelector("[data-foreground-color]"),
  foregroundText: document.querySelector("[data-foreground-text]"),
  backgroundColor: document.querySelector("[data-background-color]"),
  backgroundText: document.querySelector("[data-background-text]"),
  swap: document.querySelector("[data-swap-colors]"),
  ratio: document.querySelector("[data-contrast-ratio]"),
  summary: document.querySelector("[data-contrast-summary]"),
  preview: document.querySelector("[data-contrast-preview]"),
  error: document.querySelector("[data-contrast-error]"),
  optimize: document.querySelector("[data-optimize-color]"),
  reset: document.querySelector("[data-contrast-reset]"),
  copy: document.querySelector("[data-copy-colors]")
};

const passItems = {
  normalAa: document.querySelector('[data-pass-item="normal-aa"]'),
  largeAa: document.querySelector('[data-pass-item="large-aa"]'),
  normalAaa: document.querySelector('[data-pass-item="normal-aaa"]'),
  largeAaa: document.querySelector('[data-pass-item="large-aaa"]'),
  ui: document.querySelector('[data-pass-item="ui"]')
};

const hexadecimalCharacters = new Set(["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f"]);

function normalizeHex(value) {
  const candidate = String(value || "").trim().toLowerCase();
  if (candidate.length !== 7 || candidate[0] !== "#") return null;
  for (let index = 1; index < candidate.length; index += 1) {
    if (!hexadecimalCharacters.has(candidate[index])) return null;
  }
  return candidate.toUpperCase();
}

function hexToRgb(hex) {
  return {
    red: Number.parseInt(hex.slice(1, 3), 16),
    green: Number.parseInt(hex.slice(3, 5), 16),
    blue: Number.parseInt(hex.slice(5, 7), 16)
  };
}

function channelLuminance(channel) {
  const normalized = channel / 255;
  return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
}

function luminance(color) {
  return 0.2126 * channelLuminance(color.red) + 0.7152 * channelLuminance(color.green) + 0.0722 * channelLuminance(color.blue);
}

function contrastRatio(foreground, background) {
  const first = luminance(foreground);
  const second = luminance(background);
  const lighter = Math.max(first, second);
  const darker = Math.min(first, second);
  return (lighter + 0.05) / (darker + 0.05);
}

function setError(message = "") {
  elements.error.querySelector("span").textContent = message;
  elements.error.hidden = !message;
}

function setPass(element, passed) {
  element.dataset.pass = String(passed);
  const icon = element.querySelector("svg, i");
  if (icon) {
    const replacement = document.createElement("i");
    replacement.dataset.lucide = passed ? "circle-check" : "circle-x";
    icon.replaceWith(replacement);
  }
}

function summaryForRatio(ratio) {
  if (ratio >= 7) return "Sehr hoher Kontrast. Die Kombination erfüllt AA und AAA für alle Textgrößen.";
  if (ratio >= 4.5) return "Guter Kontrast. Normaler Text erfüllt AA, großer Text auch AAA.";
  if (ratio >= 3) return "Nur für großen Text und grafische Bedienelemente ausreichend. Normaler Text fällt durch.";
  return "Zu wenig Kontrast. Text und wichtige Bedienelemente sind so nicht ausreichend unterscheidbar.";
}

function updateResult() {
  const foreground = normalizeHex(elements.foregroundText.value);
  const background = normalizeHex(elements.backgroundText.value);
  if (!foreground || !background) {
    setError("Farben müssen als sechsstelliger Hex-Wert eingegeben werden, zum Beispiel #17201D.");
    return null;
  }
  setError();
  elements.foregroundColor.value = foreground;
  elements.backgroundColor.value = background;
  elements.foregroundText.value = foreground;
  elements.backgroundText.value = background;
  const ratio = contrastRatio(hexToRgb(foreground), hexToRgb(background));
  elements.ratio.textContent = `${ratio.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}:1`;
  elements.summary.textContent = summaryForRatio(ratio);
  elements.preview.style.color = foreground;
  elements.preview.style.backgroundColor = background;
  setPass(passItems.normalAa, ratio >= 4.5);
  setPass(passItems.largeAa, ratio >= 3);
  setPass(passItems.normalAaa, ratio >= 7);
  setPass(passItems.largeAaa, ratio >= 4.5);
  setPass(passItems.ui, ratio >= 3);
  refreshIcons(document.querySelector(".pass-grid"));
  return ratio;
}

function syncFromColor(colorInput, textInput) {
  textInput.value = colorInput.value.toUpperCase();
  updateResult();
}

function swapColors() {
  const foreground = elements.foregroundText.value;
  elements.foregroundText.value = elements.backgroundText.value;
  elements.backgroundText.value = foreground;
  updateResult();
}

function mixColor(start, target, amount) {
  return {
    red: Math.round(start.red + (target.red - start.red) * amount),
    green: Math.round(start.green + (target.green - start.green) * amount),
    blue: Math.round(start.blue + (target.blue - start.blue) * amount)
  };
}

function componentToHex(value) {
  return value.toString(16).padStart(2, "0").toUpperCase();
}

function rgbToHex(color) {
  return `#${componentToHex(color.red)}${componentToHex(color.green)}${componentToHex(color.blue)}`;
}

function distance(first, second) {
  return Math.sqrt((first.red - second.red) ** 2 + (first.green - second.green) ** 2 + (first.blue - second.blue) ** 2);
}

function accessibleMix(start, background, target) {
  if (contrastRatio(target, background) < 4.5) return null;
  let low = 0;
  let high = 1;
  for (let step = 0; step < 24; step += 1) {
    const middle = (low + high) / 2;
    const candidate = mixColor(start, target, middle);
    if (contrastRatio(candidate, background) >= 4.5) high = middle;
    else low = middle;
  }
  return mixColor(start, target, high);
}

function optimizeForeground() {
  const foregroundHex = normalizeHex(elements.foregroundText.value);
  const backgroundHex = normalizeHex(elements.backgroundText.value);
  if (!foregroundHex || !backgroundHex) {
    updateResult();
    return;
  }
  const foreground = hexToRgb(foregroundHex);
  const background = hexToRgb(backgroundHex);
  if (contrastRatio(foreground, background) >= 4.5) {
    showToast("Die Textfarbe erfüllt bereits AA für normalen Text.");
    return;
  }
  const black = accessibleMix(foreground, background, { red: 0, green: 0, blue: 0 });
  const white = accessibleMix(foreground, background, { red: 255, green: 255, blue: 255 });
  const candidates = [black, white].filter(Boolean);
  if (!candidates.length) {
    showToast("Für diesen Hintergrund wurde keine passende Textfarbe gefunden.", "error");
    return;
  }
  candidates.sort((first, second) => distance(first, foreground) - distance(second, foreground));
  elements.foregroundText.value = rgbToHex(candidates[0]);
  updateResult();
  showToast("Textfarbe auf mindestens 4,5:1 angepasst.");
}

function resetColors() {
  elements.foregroundText.value = "#17201D";
  elements.backgroundText.value = "#FFFFFF";
  updateResult();
}

elements.foregroundColor.addEventListener("input", () => syncFromColor(elements.foregroundColor, elements.foregroundText));
elements.backgroundColor.addEventListener("input", () => syncFromColor(elements.backgroundColor, elements.backgroundText));
elements.foregroundText.addEventListener("input", updateResult);
elements.backgroundText.addEventListener("input", updateResult);
elements.swap.addEventListener("click", swapColors);
elements.optimize.addEventListener("click", optimizeForeground);
elements.reset.addEventListener("click", resetColors);
elements.copy.addEventListener("click", async () => {
  const foreground = normalizeHex(elements.foregroundText.value);
  const background = normalizeHex(elements.backgroundText.value);
  if (!foreground || !background) {
    updateResult();
    return;
  }
  await copyText(`Text: ${foreground}\nHintergrund: ${background}\nKontrast: ${elements.ratio.textContent}`);
  showToast("Farben und Kontrast kopiert.");
});

updateResult();
