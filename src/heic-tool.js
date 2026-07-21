import { heicTo } from "heic-to/csp";
import JSZip from "jszip";
import "./styles.css";
import {
  downloadBlob,
  formatBytes,
  refreshIcons,
  sanitizeFileStem,
  setButtonLoading
} from "./shared.js";
import { redrawImage } from "./image-utils.js";

const MAX_FILES = 12;
const MAX_FILE_BYTES = 40 * 1024 * 1024;
const MAX_TOTAL_BYTES = 140 * 1024 * 1024;

const elements = {
  dropzone: document.querySelector("[data-heic-dropzone]"),
  input: document.querySelector("[data-heic-input]"),
  list: document.querySelector("[data-heic-list]"),
  error: document.querySelector("[data-heic-error]"),
  quality: document.querySelector("[data-heic-quality]"),
  qualityValue: document.querySelector("[data-heic-quality-value]"),
  width: document.querySelector("[data-heic-width]"),
  fileCount: document.querySelector("[data-heic-file-count]"),
  inputSize: document.querySelector("[data-heic-input-size]"),
  reset: document.querySelector("[data-heic-reset]"),
  process: document.querySelector("[data-heic-process]"),
  resultPanel: document.querySelector("[data-heic-result-panel]"),
  results: document.querySelector("[data-heic-results]"),
  summary: document.querySelector("[data-heic-summary]"),
  downloadAll: document.querySelector("[data-heic-download-all]")
};

let files = [];
let results = [];
let convertTimer = 0;

function setError(message = "") {
  elements.error.querySelector("span").textContent = message;
  elements.error.hidden = !message;
}

function isHeic(file) {
  if (!file) return false;
  const name = file.name.toLowerCase();
  return name.endsWith(".heic") || name.endsWith(".heif") || file.type === "image/heic" || file.type === "image/heif";
}

function clearResults() {
  results = [];
  elements.results.replaceChildren();
  elements.resultPanel.hidden = true;
}

function renderFiles() {
  elements.list.replaceChildren();
  let totalBytes = 0;

  files.forEach((file, index) => {
    totalBytes += file.size;
    const row = document.createElement("div");
    row.className = "file-row";
    row.innerHTML = `<div class="file-row__icon"><i data-lucide="file-image"></i></div><div class="file-row__meta"><strong></strong><span></span></div><div class="file-row__actions"><button class="icon-button" type="button" title="Datei entfernen" aria-label="Datei entfernen"><i data-lucide="trash-2"></i></button></div>`;
    row.querySelector("strong").textContent = file.name;
    row.querySelector("span").textContent = formatBytes(file.size);
    row.querySelector("button").addEventListener("click", () => {
      files.splice(index, 1);
      clearResults();
      renderFiles();
      scheduleConversion();
    });
    elements.list.append(row);
  });

  elements.fileCount.textContent = String(files.length);
  elements.inputSize.textContent = formatBytes(totalBytes);
  elements.process.disabled = files.length === 0;
  refreshIcons(elements.list);
}

function addFiles(fileList) {
  setError();
  clearResults();
  const additions = [...(fileList || [])];
  const accepted = [];
  let totalBytes = files.reduce((sum, file) => sum + file.size, 0);

  for (const file of additions) {
    if (!isHeic(file)) {
      setError("Mindestens eine Datei ist kein HEIC- oder HEIF-Bild.");
      continue;
    }
    if (file.size > MAX_FILE_BYTES) {
      setError(`${file.name} ist größer als 40 MB.`);
      continue;
    }
    if (files.length + accepted.length >= MAX_FILES) {
      setError(`Pro Durchgang sind höchstens ${MAX_FILES} Bilder möglich.`);
      break;
    }
    if (totalBytes + file.size > MAX_TOTAL_BYTES) {
      setError("Die ausgewählten Bilder sind zusammen größer als 140 MB.");
      break;
    }
    accepted.push(file);
    totalBytes += file.size;
  }

  files.push(...accepted);
  elements.input.value = "";
  renderFiles();
  scheduleConversion();
}

function scheduleConversion() {
  window.clearTimeout(convertTimer);
  clearResults();
  if (!files.length) return;
  convertTimer = window.setTimeout(convertAll, 320);
}

async function convertFile(file, fileIndex) {
  const converted = await heicTo({
    blob: file,
    type: "image/jpeg",
    quality: Number(elements.quality.value) / 100
  });
  const convertedBlobs = Array.isArray(converted) ? converted : [converted];
  const output = [];

  for (let index = 0; index < convertedBlobs.length; index += 1) {
    const redrawn = await redrawImage(convertedBlobs[index], {
      maxWidth: Number(elements.width.value),
      quality: Number(elements.quality.value) / 100,
      type: "image/jpeg"
    });
    const suffix = convertedBlobs.length > 1 ? `-${index + 1}` : "";
    output.push({
      blob: redrawn.blob,
      fileName: `${sanitizeFileStem(file.name.slice(0, file.name.lastIndexOf(".")))}${suffix}.jpg`,
      height: redrawn.height,
      sourceIndex: fileIndex,
      width: redrawn.width
    });
  }

  return output;
}

function renderResults() {
  elements.results.replaceChildren();
  let outputBytes = 0;

  results.forEach((result) => {
    outputBytes += result.blob.size;
    const row = document.createElement("div");
    row.className = "result-row";
    row.innerHTML = `<div class="file-row__icon"><i data-lucide="file-image"></i></div><div class="file-row__meta"><strong></strong><span></span></div><div class="file-row__actions"><button class="button button--secondary" type="button"><i data-lucide="download"></i> JPG</button></div>`;
    row.querySelector("strong").textContent = result.fileName;
    row.querySelector("span").textContent = `${result.width} × ${result.height} px · ${formatBytes(result.blob.size)}`;
    row.querySelector("button").addEventListener("click", () => downloadBlob(result.blob, result.fileName));
    elements.results.append(row);
  });

  const sourceBytes = files.reduce((sum, file) => sum + file.size, 0);
  elements.summary.innerHTML = `<div class="summary-item"><span>JPG-Dateien</span><strong>${results.length}</strong></div><div class="summary-item"><span>Ausgabe</span><strong>${formatBytes(outputBytes)}</strong></div><div class="summary-item"><span>Quelldaten</span><strong>${formatBytes(sourceBytes)}</strong></div>`;
  elements.downloadAll.hidden = results.length < 2;
  elements.resultPanel.hidden = false;
  refreshIcons(elements.resultPanel);
  elements.resultPanel.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function convertAll() {
  if (!files.length) return;
  setError();
  clearResults();
  setButtonLoading(elements.process, true, "HEIC wird umgewandelt");

  try {
    const converted = [];
    for (let index = 0; index < files.length; index += 1) {
      converted.push(...await convertFile(files[index], index));
    }
    results = converted;
    renderResults();
  } catch {
    clearResults();
    setError("Mindestens ein Bild konnte nicht gelesen werden. Manche HEIC-Varianten enthalten mehrere Ebenen oder Kamera-Daten, die der Browser nicht dekodieren kann.");
  } finally {
    setButtonLoading(elements.process, false);
  }
}

async function downloadAll() {
  if (results.length < 2) return;
  setButtonLoading(elements.downloadAll, true, "ZIP wird erstellt");
  try {
    const zip = new JSZip();
    results.forEach((result) => zip.file(result.fileName, result.blob));
    const blob = await zip.generateAsync({ type: "blob", compression: "DEFLATE", compressionOptions: { level: 6 } });
    downloadBlob(blob, "heic-in-jpg.zip");
  } finally {
    setButtonLoading(elements.downloadAll, false);
  }
}

function resetAll() {
  files = [];
  elements.input.value = "";
  elements.quality.value = "88";
  elements.qualityValue.textContent = "88 %";
  elements.width.value = "0";
  setError();
  clearResults();
  renderFiles();
}

elements.input.addEventListener("change", () => addFiles(elements.input.files));
elements.dropzone.addEventListener("dragover", (event) => {
  event.preventDefault();
  elements.dropzone.dataset.active = "true";
});
elements.dropzone.addEventListener("dragleave", () => {
  elements.dropzone.dataset.active = "false";
});
elements.dropzone.addEventListener("drop", (event) => {
  event.preventDefault();
  elements.dropzone.dataset.active = "false";
  addFiles(event.dataTransfer.files);
});
elements.quality.addEventListener("input", () => {
  elements.qualityValue.textContent = `${elements.quality.value} %`;
  scheduleConversion();
});
elements.width.addEventListener("input", scheduleConversion);
elements.process.addEventListener("click", convertAll);
elements.reset.addEventListener("click", resetAll);
elements.downloadAll.addEventListener("click", downloadAll);

renderFiles();
refreshIcons();
