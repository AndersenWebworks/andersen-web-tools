import {
  electronicFormatIBAN,
  friendlyFormatIBAN,
  isSEPACountry,
  isValidBIC,
  isValidIBAN,
  validateIBAN
} from "ibantools";
import QRCode from "qrcode";
import "./styles.css";
import { copyText, downloadBlob, refreshIcons, setButtonLoading, showToast } from "./shared.js";

const elements = {
  iban: document.querySelector("[data-iban-input]"),
  validate: document.querySelector("[data-iban-validate]"),
  validation: document.querySelector("[data-iban-validation]"),
  validationTitle: document.querySelector("[data-iban-validation-title]"),
  validationText: document.querySelector("[data-iban-validation-text]"),
  country: document.querySelector("[data-iban-country]"),
  length: document.querySelector("[data-iban-length]"),
  sepa: document.querySelector("[data-iban-sepa]"),
  copy: document.querySelector("[data-iban-copy]"),
  recipient: document.querySelector("[data-sepa-recipient]"),
  bic: document.querySelector("[data-sepa-bic]"),
  amount: document.querySelector("[data-sepa-amount]"),
  purpose: document.querySelector("[data-sepa-purpose]"),
  error: document.querySelector("[data-sepa-error]"),
  generate: document.querySelector("[data-sepa-generate]"),
  reset: document.querySelector("[data-sepa-reset]"),
  canvas: document.querySelector("[data-sepa-canvas]"),
  placeholder: document.querySelector("[data-sepa-placeholder]"),
  downloadPng: document.querySelector("[data-sepa-download-png]"),
  downloadSvg: document.querySelector("[data-sepa-download-svg]")
};

let normalizedIban = "";
let currentPayload = "";
let currentSvg = "";
let validationTimer = 0;
let generationTimer = 0;

function setError(message = "") {
  elements.error.querySelector("span").textContent = message;
  elements.error.hidden = !message;
}

function clearQr() {
  currentPayload = "";
  currentSvg = "";
  elements.canvas.hidden = true;
  elements.placeholder.hidden = false;
  elements.downloadPng.disabled = true;
  elements.downloadSvg.disabled = true;
}

function countryName(code) {
  if (!code) return "–";
  try {
    return new Intl.DisplayNames(["de"], { type: "region" }).of(code) || code;
  } catch {
    return code;
  }
}

function validateCurrentIban() {
  clearQr();
  normalizedIban = electronicFormatIBAN(elements.iban.value) || "";
  const validation = validateIBAN(normalizedIban);
  const valid = Boolean(normalizedIban && validation.valid && isValidIBAN(normalizedIban));
  const countryCode = normalizedIban.slice(0, 2);
  elements.validation.hidden = false;
  elements.validation.dataset.state = valid ? "success" : "error";
  elements.validationTitle.textContent = valid ? "Die IBAN ist formal gültig." : "Die IBAN ist nicht gültig.";
  elements.validationText.textContent = valid
    ? "Länge, Länderformat und Prüfziffer stimmen. Das bestätigt nicht, dass das Konto existiert oder zum genannten Empfänger gehört."
    : "Prüfe Länderkennung, Länge und Zahlendreher. Das Werkzeug fragt keine Bank und kein Kontoregister ab.";
  elements.country.textContent = valid ? countryName(countryCode) : "–";
  elements.length.textContent = normalizedIban ? String(normalizedIban.length) : "0";
  elements.sepa.textContent = valid ? (isSEPACountry(countryCode) ? "Ja" : "Nein") : "–";
  elements.copy.disabled = !valid;
  if (valid) elements.iban.value = friendlyFormatIBAN(normalizedIban);
  return valid;
}

function normalizedSingleLine(value) {
  return String(value || "").replaceAll("\r", " ").replaceAll("\n", " ").trim();
}

function parseAmount() {
  const source = elements.amount.value.trim().replace(",", ".");
  const amount = Number(source);
  if (!Number.isFinite(amount) || amount <= 0 || amount > 999999999.99) {
    throw new Error("Trage einen Betrag zwischen 0,01 und 999.999.999,99 Euro ein.");
  }
  return amount.toFixed(2);
}

function buildSepaPayload() {
  if (!validateCurrentIban()) throw new Error("Für den Überweisungs-QR-Code wird eine gültige IBAN benötigt.");
  const countryCode = normalizedIban.slice(0, 2);
  if (!isSEPACountry(countryCode)) throw new Error("Die IBAN gehört nicht zum SEPA-Zahlungsraum.");
  const recipient = normalizedSingleLine(elements.recipient.value);
  if (!recipient || recipient.length > 70) throw new Error("Der Empfängername muss zwischen 1 und 70 Zeichen lang sein.");
  const bic = elements.bic.value.replaceAll(" ", "").toUpperCase();
  if (bic && !isValidBIC(bic)) throw new Error("Die BIC ist nicht gültig. Innerhalb des EWR kann das Feld leer bleiben.");
  const purpose = normalizedSingleLine(elements.purpose.value);
  if (purpose.length > 140) throw new Error("Der Verwendungszweck darf höchstens 140 Zeichen lang sein.");
  const amount = parseAmount();
  const payload = [
    "BCD",
    "002",
    "1",
    "SCT",
    bic,
    recipient,
    normalizedIban,
    `EUR${amount}`,
    "",
    "",
    purpose,
    ""
  ].join("\n");
  if (new TextEncoder().encode(payload).length > 331) throw new Error("Die Angaben sind für einen standardkonformen SEPA-QR-Code zu lang.");
  return payload;
}

async function generateSepaQr() {
  setError();
  clearQr();
  setButtonLoading(elements.generate, true, "QR-Code wird erstellt");
  try {
    currentPayload = buildSepaPayload();
    const options = {
      errorCorrectionLevel: "M",
      margin: 4,
      width: 512,
      color: { dark: "#17201d", light: "#ffffff" }
    };
    await QRCode.toCanvas(elements.canvas, currentPayload, options);
    currentSvg = await QRCode.toString(currentPayload, { ...options, type: "svg" });
    elements.placeholder.hidden = true;
    elements.canvas.hidden = false;
    elements.downloadPng.disabled = false;
    elements.downloadSvg.disabled = false;
  } catch (error) {
    clearQr();
    setError(error instanceof Error ? error.message : "Der SEPA-QR-Code konnte nicht erstellt werden.");
  } finally {
    setButtonLoading(elements.generate, false);
  }
}

function scheduleValidation() {
  window.clearTimeout(validationTimer);
  window.clearTimeout(generationTimer);
  elements.validation.hidden = true;
  elements.copy.disabled = true;
  clearQr();
  if (electronicFormatIBAN(elements.iban.value)?.length < 4) return;
  validationTimer = window.setTimeout(() => {
    const valid = validateCurrentIban();
    if (valid) scheduleQrGeneration();
  }, 220);
}

function scheduleQrGeneration() {
  window.clearTimeout(generationTimer);
  clearQr();
  setError();
  if (!normalizedIban || !isValidIBAN(normalizedIban) || !elements.recipient.value.trim() || !elements.amount.value.trim()) return;
  generationTimer = window.setTimeout(generateSepaQr, 260);
}

function resetAll() {
  normalizedIban = "";
  elements.iban.value = "";
  elements.recipient.value = "";
  elements.bic.value = "";
  elements.amount.value = "";
  elements.purpose.value = "";
  elements.validation.hidden = true;
  elements.copy.disabled = true;
  setError();
  clearQr();
}

elements.validate.addEventListener("click", validateCurrentIban);
elements.iban.addEventListener("input", scheduleValidation);
elements.copy.addEventListener("click", async () => {
  await copyText(friendlyFormatIBAN(normalizedIban));
  showToast("IBAN kopiert.");
});
document.querySelectorAll("[data-sepa-recipient], [data-sepa-bic], [data-sepa-amount], [data-sepa-purpose]").forEach((input) => input.addEventListener("input", scheduleQrGeneration));
elements.generate.addEventListener("click", generateSepaQr);
elements.reset.addEventListener("click", resetAll);
elements.downloadPng.addEventListener("click", () => {
  if (!currentPayload) return;
  elements.canvas.toBlob((blob) => {
    if (blob) downloadBlob(blob, "sepa-ueberweisung.png");
  }, "image/png");
});
elements.downloadSvg.addEventListener("click", () => {
  if (currentSvg) downloadBlob(new Blob([currentSvg], { type: "image/svg+xml;charset=utf-8" }), "sepa-ueberweisung.svg");
});

refreshIcons();
