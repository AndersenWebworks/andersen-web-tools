import QRCode from "qrcode";
import "./styles.css";
import {
  downloadBlob,
  refreshIcons,
  setButtonLoading
} from "./shared.js";

const elements = {
  modes: document.querySelectorAll("[data-qr-mode]"),
  panels: document.querySelectorAll("[data-qr-panel]"),
  url: document.querySelector("[data-qr-url]"),
  text: document.querySelector("[data-qr-text]"),
  wifiName: document.querySelector("[data-qr-wifi-name]"),
  wifiSecurity: document.querySelector("[data-qr-wifi-security]"),
  wifiPassword: document.querySelector("[data-qr-wifi-password]"),
  wifiHidden: document.querySelector("[data-qr-wifi-hidden]"),
  firstName: document.querySelector("[data-qr-first-name]"),
  lastName: document.querySelector("[data-qr-last-name]"),
  organization: document.querySelector("[data-qr-organization]"),
  phone: document.querySelector("[data-qr-phone]"),
  email: document.querySelector("[data-qr-email]"),
  contactUrl: document.querySelector("[data-qr-contact-url]"),
  size: document.querySelector("[data-qr-size]"),
  sizeValue: document.querySelector("[data-qr-size-value]"),
  correction: document.querySelector("[data-qr-correction]"),
  foreground: document.querySelector("[data-qr-foreground]"),
  background: document.querySelector("[data-qr-background]"),
  canvas: document.querySelector("[data-qr-canvas]"),
  placeholder: document.querySelector("[data-qr-placeholder]"),
  error: document.querySelector("[data-qr-error]"),
  generate: document.querySelector("[data-qr-generate]"),
  reset: document.querySelector("[data-qr-reset]"),
  downloadPng: document.querySelector("[data-qr-download-png]"),
  downloadSvg: document.querySelector("[data-qr-download-svg]")
};

let activeMode = "link";
let currentPayload = "";
let currentSvg = "";
let generationTimer = 0;

function setError(message = "") {
  elements.error.querySelector("span").textContent = message;
  elements.error.hidden = !message;
}

function escapeQrText(value) {
  return String(value || "")
    .replaceAll("\\", "\\\\")
    .replaceAll(";", "\\;")
    .replaceAll(",", "\\,")
    .replaceAll(":", "\\:")
    .replaceAll("\n", "\\n")
    .replaceAll("\r", "");
}

function validatedHttpUrl(value, label) {
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`${label} ist keine vollständige Webadresse.`);
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") throw new Error(`${label} muss mit http:// oder https:// beginnen.`);
  return url.href;
}

function buildWifiPayload() {
  const name = elements.wifiName.value.trim();
  if (!name) throw new Error("Trage den Namen des WLANs ein.");
  const security = elements.wifiSecurity.value;
  const password = elements.wifiPassword.value;
  if (security !== "nopass" && !password) throw new Error("Trage das WLAN-Passwort ein oder wähle ein offenes Netzwerk.");
  return `WIFI:T:${security};S:${escapeQrText(name)};P:${security === "nopass" ? "" : escapeQrText(password)};H:${elements.wifiHidden.checked ? "true" : "false"};;`;
}

function buildContactPayload() {
  const firstName = elements.firstName.value.trim();
  const lastName = elements.lastName.value.trim();
  if (!firstName && !lastName) throw new Error("Trage mindestens einen Vor- oder Nachnamen ein.");
  const fullName = [firstName, lastName].filter(Boolean).join(" ");
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${escapeQrText(lastName)};${escapeQrText(firstName)};;;`,
    `FN:${escapeQrText(fullName)}`
  ];
  if (elements.organization.value.trim()) lines.push(`ORG:${escapeQrText(elements.organization.value.trim())}`);
  if (elements.phone.value.trim()) lines.push(`TEL;TYPE=CELL:${escapeQrText(elements.phone.value.trim())}`);
  if (elements.email.value.trim()) lines.push(`EMAIL:${escapeQrText(elements.email.value.trim())}`);
  if (elements.contactUrl.value.trim()) lines.push(`URL:${validatedHttpUrl(elements.contactUrl.value.trim(), "Die Kontakt-Webadresse")}`);
  lines.push("END:VCARD");
  return lines.join("\n");
}

function buildPayload() {
  if (activeMode === "link") {
    const value = elements.url.value.trim();
    if (!value) throw new Error("Trage eine Webadresse ein.");
    return validatedHttpUrl(value, "Die Webadresse");
  }
  if (activeMode === "text") {
    const value = elements.text.value.trim();
    if (!value) throw new Error("Trage den Text für den QR-Code ein.");
    return value;
  }
  if (activeMode === "wifi") return buildWifiPayload();
  return buildContactPayload();
}

function qrOptions() {
  return {
    errorCorrectionLevel: elements.correction.value,
    width: Number(elements.size.value),
    margin: 4,
    color: {
      dark: elements.foreground.value,
      light: elements.background.value
    }
  };
}

function hexToRgb(hex) {
  return {
    red: Number.parseInt(hex.slice(1, 3), 16),
    green: Number.parseInt(hex.slice(3, 5), 16),
    blue: Number.parseInt(hex.slice(5, 7), 16)
  };
}

function luminanceChannel(channel) {
  const normalized = channel / 255;
  return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
}

function colorLuminance(hex) {
  const color = hexToRgb(hex);
  return 0.2126 * luminanceChannel(color.red) + 0.7152 * luminanceChannel(color.green) + 0.0722 * luminanceChannel(color.blue);
}

function qrContrast() {
  const first = colorLuminance(elements.foreground.value);
  const second = colorLuminance(elements.background.value);
  return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
}

function selectMode(mode) {
  activeMode = mode;
  elements.modes.forEach((button) => {
    const selected = button.dataset.qrMode === mode;
    button.setAttribute("aria-selected", String(selected));
    button.tabIndex = selected ? 0 : -1;
  });
  elements.panels.forEach((panel) => {
    panel.hidden = panel.dataset.qrPanel !== mode;
  });
  clearResult();
  setError();
  scheduleGeneration();
}

function clearResult() {
  currentPayload = "";
  currentSvg = "";
  elements.canvas.hidden = true;
  elements.placeholder.hidden = false;
  elements.downloadPng.disabled = true;
  elements.downloadSvg.disabled = true;
}

async function generateQrCode() {
  setError();
  setButtonLoading(elements.generate, true, "QR-Code wird erstellt");
  try {
    const payload = buildPayload();
    if (qrContrast() < 3) throw new Error("Vordergrund und Hintergrund brauchen mehr Kontrast, damit der QR-Code zuverlässig lesbar bleibt.");
    const options = qrOptions();
    await QRCode.toCanvas(elements.canvas, payload, options);
    currentSvg = await QRCode.toString(payload, { ...options, type: "svg" });
    currentPayload = payload;
    elements.placeholder.hidden = true;
    elements.canvas.hidden = false;
    elements.downloadPng.disabled = false;
    elements.downloadSvg.disabled = false;
  } catch (error) {
    clearResult();
    setError(error instanceof Error ? error.message : "Der QR-Code konnte nicht erstellt werden.");
  } finally {
    setButtonLoading(elements.generate, false);
  }
}

function hasRequiredInput() {
  if (activeMode === "link") return Boolean(elements.url.value.trim());
  if (activeMode === "text") return Boolean(elements.text.value.trim());
  if (activeMode === "wifi") return Boolean(elements.wifiName.value.trim());
  return Boolean(elements.firstName.value.trim() || elements.lastName.value.trim());
}

function scheduleGeneration() {
  window.clearTimeout(generationTimer);
  clearResult();
  setError();
  if (!hasRequiredInput()) return;
  generationTimer = window.setTimeout(generateQrCode, 220);
}

function downloadPng() {
  if (!currentPayload) return;
  elements.canvas.toBlob((blob) => {
    if (blob) downloadBlob(blob, "qr-code.png");
  }, "image/png");
}

function downloadSvg() {
  if (!currentSvg) return;
  downloadBlob(new Blob([currentSvg], { type: "image/svg+xml;charset=utf-8" }), "qr-code.svg");
}

function resetAll() {
  elements.url.value = "https://andersen-webworks.de/";
  elements.text.value = "";
  elements.wifiName.value = "";
  elements.wifiSecurity.value = "WPA";
  elements.wifiPassword.value = "";
  elements.wifiHidden.checked = false;
  elements.firstName.value = "";
  elements.lastName.value = "";
  elements.organization.value = "";
  elements.phone.value = "";
  elements.email.value = "";
  elements.contactUrl.value = "";
  elements.size.value = "512";
  elements.sizeValue.textContent = "512 px";
  elements.correction.value = "M";
  elements.foreground.value = "#17201d";
  elements.background.value = "#ffffff";
  selectMode("link");
}

elements.modes.forEach((button) => button.addEventListener("click", () => selectMode(button.dataset.qrMode)));
elements.size.addEventListener("input", () => {
  elements.sizeValue.textContent = `${elements.size.value} px`;
  scheduleGeneration();
});
elements.wifiSecurity.addEventListener("change", () => {
  const open = elements.wifiSecurity.value === "nopass";
  elements.wifiPassword.disabled = open;
  if (open) elements.wifiPassword.value = "";
  scheduleGeneration();
});
document.querySelectorAll(".qr-fields input, .qr-fields textarea, .qr-fields select, .qr-options input, .qr-options select").forEach((control) => {
  control.addEventListener("input", scheduleGeneration);
  control.addEventListener("change", scheduleGeneration);
});
elements.generate.addEventListener("click", generateQrCode);
elements.reset.addEventListener("click", resetAll);
elements.downloadPng.addEventListener("click", downloadPng);
elements.downloadSvg.addEventListener("click", downloadSvg);

refreshIcons();
scheduleGeneration();
