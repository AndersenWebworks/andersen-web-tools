import "./styles.css";
import { copyText, refreshIcons, showToast } from "./shared.js";

const elements = {
  modes: document.querySelectorAll("[data-time-mode]"),
  panels: document.querySelectorAll("[data-time-panel]"),
  start: document.querySelector("[data-time-start]"),
  end: document.querySelector("[data-time-end]"),
  break: document.querySelector("[data-time-break]"),
  target: document.querySelector("[data-time-target]"),
  endStart: document.querySelector("[data-end-start]"),
  endBreak: document.querySelector("[data-end-break]"),
  endTarget: document.querySelector("[data-end-target]"),
  error: document.querySelector("[data-time-error]"),
  result: document.querySelector("[data-time-result]"),
  gross: document.querySelector("[data-time-gross]"),
  net: document.querySelector("[data-time-net]"),
  decimal: document.querySelector("[data-time-decimal]"),
  industrial: document.querySelector("[data-time-industrial]"),
  balance: document.querySelector("[data-time-balance]"),
  calculatedEnd: document.querySelector("[data-time-calculated-end]"),
  calculatedEndNote: document.querySelector("[data-time-calculated-end-note]"),
  reset: document.querySelector("[data-time-reset]"),
  copy: document.querySelector("[data-time-copy]"),
  empty: document.querySelector("[data-time-empty]"),
  resultDuration: document.querySelector("[data-time-result-duration]"),
  resultEnd: document.querySelector("[data-time-result-end]")
};

let activeMode = "duration";
let currentSummary = "";

function setError(message = "") {
  elements.error.querySelector("span").textContent = message;
  elements.error.hidden = !message;
}

function parseClock(value, label) {
  const parts = String(value || "").split(":");
  if (parts.length !== 2) throw new Error(`${label} fehlt.`);
  const hours = Number(parts[0]);
  const minutes = Number(parts[1]);
  if (!Number.isInteger(hours) || !Number.isInteger(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    throw new Error(`${label} ist ungültig.`);
  }
  return hours * 60 + minutes;
}

function positiveMinutes(value, label) {
  const minutes = Number(value);
  if (!Number.isFinite(minutes) || minutes < 0 || minutes > 720) throw new Error(`${label} muss zwischen 0 und 720 Minuten liegen.`);
  return Math.round(minutes);
}

function targetMinutes(value) {
  const hours = Number(value);
  if (!Number.isFinite(hours) || hours <= 0 || hours > 24) throw new Error("Die Sollzeit muss zwischen 0 und 24 Stunden liegen.");
  return Math.round(hours * 60);
}

function formatMinutes(totalMinutes, signed = false) {
  const sign = totalMinutes < 0 ? "−" : signed && totalMinutes > 0 ? "+" : "";
  const absolute = Math.abs(Math.round(totalMinutes));
  const hours = Math.floor(absolute / 60);
  const minutes = absolute % 60;
  return `${sign}${hours}:${String(minutes).padStart(2, "0")} Std.`;
}

function formatDecimal(minutes) {
  return `${new Intl.NumberFormat("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(minutes / 60)} Std.`;
}

function formatIndustrialMinutes(minutes) {
  return new Intl.NumberFormat("de-DE", { maximumFractionDigits: 2 }).format((minutes * 100) / 60);
}

function formatClock(totalMinutes) {
  const normalized = totalMinutes % 1440;
  const hours = Math.floor(normalized / 60);
  const minutes = normalized % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")} Uhr`;
}

function selectMode(mode) {
  activeMode = mode;
  elements.modes.forEach((button) => {
    const selected = button.dataset.timeMode === mode;
    button.setAttribute("aria-selected", String(selected));
    button.tabIndex = selected ? 0 : -1;
  });
  elements.panels.forEach((panel) => {
    panel.hidden = panel.dataset.timePanel !== mode;
  });
  elements.result.hidden = true;
  elements.empty.hidden = false;
  elements.resultDuration.hidden = mode !== "duration";
  elements.resultEnd.hidden = mode !== "end";
  elements.copy.disabled = true;
  currentSummary = "";
  setError();
  calculate();
}

function calculateDuration() {
  const start = parseClock(elements.start.value, "Die Startzeit");
  let end = parseClock(elements.end.value, "Die Endzeit");
  if (end < start) end += 1440;
  const breakMinutes = positiveMinutes(elements.break.value, "Die Pause");
  const gross = end - start;
  if (breakMinutes >= gross) throw new Error("Die Pause muss kürzer als die Anwesenheitszeit sein.");
  const net = gross - breakMinutes;
  const target = targetMinutes(elements.target.value);
  const balance = net - target;
  elements.gross.textContent = formatMinutes(gross);
  elements.net.textContent = formatMinutes(net);
  elements.decimal.textContent = formatDecimal(net);
  elements.industrial.textContent = formatIndustrialMinutes(net);
  elements.balance.textContent = formatMinutes(balance, true);
  elements.balance.dataset.state = balance >= 0 ? "success" : "warning";
  currentSummary = `Arbeitszeit: ${formatMinutes(net)}, Dezimal: ${formatDecimal(net)}, Industrieminuten: ${formatIndustrialMinutes(net)}, Saldo: ${formatMinutes(balance, true)}`;
}

function calculateEndTime() {
  const start = parseClock(elements.endStart.value, "Die Startzeit");
  const breakMinutes = positiveMinutes(elements.endBreak.value, "Die Pause");
  const target = targetMinutes(elements.endTarget.value);
  const end = start + breakMinutes + target;
  elements.calculatedEnd.textContent = formatClock(end);
  elements.calculatedEndNote.textContent = end >= 1440
    ? `Die Endzeit liegt am Folgetag. Enthalten sind ${formatMinutes(target)} Arbeitszeit und ${breakMinutes} Minuten Pause.`
    : `Enthalten sind ${formatMinutes(target)} Arbeitszeit und ${breakMinutes} Minuten Pause.`;
  currentSummary = `Feierabend: ${formatClock(end)}${end >= 1440 ? " am Folgetag" : ""}`;
}

function calculate() {
  setError();
  try {
    if (activeMode === "duration") calculateDuration();
    else calculateEndTime();
    elements.resultDuration.hidden = activeMode !== "duration";
    elements.resultEnd.hidden = activeMode !== "end";
    elements.result.hidden = false;
    elements.empty.hidden = true;
    elements.copy.disabled = false;
  } catch (error) {
    elements.result.hidden = true;
    elements.empty.hidden = false;
    elements.copy.disabled = true;
    currentSummary = "";
    setError(error instanceof Error ? error.message : "Die Arbeitszeit konnte nicht berechnet werden.");
  }
}

function resetAll() {
  elements.start.value = "08:00";
  elements.end.value = "16:30";
  elements.break.value = "30";
  elements.target.value = "8";
  elements.endStart.value = "08:00";
  elements.endBreak.value = "30";
  elements.endTarget.value = "8";
  selectMode("duration");
}

elements.modes.forEach((button) => button.addEventListener("click", () => selectMode(button.dataset.timeMode)));
document.querySelectorAll("[data-time-panel] input").forEach((input) => input.addEventListener("input", calculate));
elements.reset.addEventListener("click", resetAll);
elements.copy.addEventListener("click", async () => {
  await copyText(currentSummary);
  showToast("Ergebnis kopiert.");
});

selectMode(activeMode);
refreshIcons();
