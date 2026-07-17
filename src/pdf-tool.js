import { PDFDocument } from "pdf-lib";
import "./styles.css";
import {
  downloadBlob,
  formatBytes,
  refreshIcons,
  sanitizeFileStem,
  setButtonLoading
} from "./shared.js";

const MAX_FILES = 20;
const MAX_FILE_BYTES = 100 * 1024 * 1024;
const MAX_TOTAL_BYTES = 200 * 1024 * 1024;

const elements = {
  dropzone: document.querySelector("[data-pdf-dropzone]"),
  input: document.querySelector("[data-pdf-input]"),
  list: document.querySelector("[data-pdf-list]"),
  error: document.querySelector("[data-pdf-error]"),
  name: document.querySelector("[data-pdf-name]"),
  fileCount: document.querySelector("[data-pdf-file-count]"),
  pageCount: document.querySelector("[data-pdf-page-count]"),
  size: document.querySelector("[data-pdf-size]"),
  reset: document.querySelector("[data-pdf-reset]"),
  merge: document.querySelector("[data-pdf-merge]"),
  resultPanel: document.querySelector("[data-pdf-result-panel]"),
  resultName: document.querySelector("[data-pdf-result-name]"),
  resultMeta: document.querySelector("[data-pdf-result-meta]"),
  download: document.querySelector("[data-pdf-download]")
};

let items = [];
let currentOutput = null;
let counter = 0;
let draggedId = null;

function setError(message = "") {
  elements.error.querySelector("span").textContent = message;
  elements.error.hidden = !message;
}

function isPdf(file) {
  return file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
}

async function readPdf(file) {
  const bytes = await file.arrayBuffer();
  const document = await PDFDocument.load(bytes, { updateMetadata: false });
  return { bytes, pageCount: document.getPageCount() };
}

async function addFiles(fileList) {
  setError();
  clearOutput();
  const candidates = Array.from(fileList);
  const availableSlots = MAX_FILES - items.length;
  const selected = candidates.slice(0, Math.max(availableSlots, 0));
  const problems = [];
  let selectedBytes = items.reduce((total, item) => total + item.file.size, 0);
  let totalLimitReported = false;

  if (candidates.length > availableSlots) problems.push(`Es sind höchstens ${MAX_FILES} PDF-Dateien pro Durchgang möglich.`);

  for (const file of selected) {
    if (!isPdf(file)) {
      problems.push(`${file.name} ist keine PDF-Datei.`);
      continue;
    }
    if (file.size > MAX_FILE_BYTES) {
      problems.push(`${file.name} ist größer als 100 MB.`);
      continue;
    }
    if (selectedBytes + file.size > MAX_TOTAL_BYTES) {
      if (!totalLimitReported) problems.push("Pro Durchgang sind insgesamt höchstens 200 MB möglich.");
      totalLimitReported = true;
      continue;
    }
    try {
      const parsed = await readPdf(file);
      counter += 1;
      items.push({ id: `pdf-${counter}`, file, bytes: parsed.bytes, pageCount: parsed.pageCount });
      selectedBytes += file.size;
    } catch {
      problems.push(`${file.name} ist geschützt, beschädigt oder nicht lesbar.`);
    }
  }

  renderItems();
  if (problems.length) setError(problems.join(" "));
  elements.input.value = "";
}

function moveItem(id, direction) {
  const index = items.findIndex((item) => item.id === id);
  const target = index + direction;
  if (index < 0 || target < 0 || target >= items.length) return;
  const moving = items[index];
  items[index] = items[target];
  items[target] = moving;
  clearOutput();
  renderItems();
}

function removeItem(id) {
  const index = items.findIndex((item) => item.id === id);
  if (index < 0) return;
  items.splice(index, 1);
  clearOutput();
  renderItems();
}

function reorderByDrop(targetId) {
  if (!draggedId || draggedId === targetId) return;
  const from = items.findIndex((item) => item.id === draggedId);
  const to = items.findIndex((item) => item.id === targetId);
  if (from < 0 || to < 0) return;
  const [moving] = items.splice(from, 1);
  items.splice(to, 0, moving);
  clearOutput();
  renderItems();
}

function renderItems() {
  elements.list.replaceChildren();
  let pages = 0;
  let bytes = 0;

  items.forEach((item, index) => {
    pages += item.pageCount;
    bytes += item.file.size;
    const row = document.createElement("div");
    row.className = "file-row";
    row.draggable = true;
    row.dataset.pdfId = item.id;
    row.addEventListener("dragstart", () => {
      draggedId = item.id;
      row.dataset.dragging = "true";
    });
    row.addEventListener("dragend", () => {
      draggedId = null;
      delete row.dataset.dragging;
    });
    row.addEventListener("dragover", (event) => event.preventDefault());
    row.addEventListener("drop", (event) => {
      event.preventDefault();
      reorderByDrop(item.id);
    });

    const icon = document.createElement("div");
    icon.className = "file-row__icon";
    icon.innerHTML = '<i data-lucide="file-text"></i>';

    const meta = document.createElement("div");
    meta.className = "file-row__meta";
    const name = document.createElement("strong");
    name.textContent = item.file.name;
    const details = document.createElement("span");
    details.textContent = `${item.pageCount} ${item.pageCount === 1 ? "Seite" : "Seiten"} · ${formatBytes(item.file.size)} · Position ${index + 1}`;
    meta.append(name, details);

    const actions = document.createElement("div");
    actions.className = "file-row__actions";
    const drag = document.createElement("span");
    drag.className = "icon-button";
    drag.title = "Datei ziehen";
    drag.setAttribute("aria-hidden", "true");
    drag.innerHTML = '<i data-lucide="grip-vertical"></i>';
    const up = document.createElement("button");
    up.className = "icon-button";
    up.type = "button";
    up.disabled = index === 0;
    up.title = "Nach oben verschieben";
    up.setAttribute("aria-label", `${item.file.name} nach oben verschieben`);
    up.innerHTML = '<i data-lucide="chevron-up"></i>';
    up.addEventListener("click", () => moveItem(item.id, -1));
    const down = document.createElement("button");
    down.className = "icon-button";
    down.type = "button";
    down.disabled = index === items.length - 1;
    down.title = "Nach unten verschieben";
    down.setAttribute("aria-label", `${item.file.name} nach unten verschieben`);
    down.innerHTML = '<i data-lucide="chevron-down"></i>';
    down.addEventListener("click", () => moveItem(item.id, 1));
    const remove = document.createElement("button");
    remove.className = "icon-button";
    remove.type = "button";
    remove.title = "Datei aus der Auswahl entfernen";
    remove.setAttribute("aria-label", `${item.file.name} aus der Auswahl entfernen`);
    remove.innerHTML = '<i data-lucide="trash-2"></i>';
    remove.addEventListener("click", () => removeItem(item.id));
    actions.append(drag, up, down, remove);

    row.append(icon, meta, actions);
    elements.list.append(row);
  });

  elements.fileCount.textContent = String(items.length);
  elements.pageCount.textContent = String(pages);
  elements.size.textContent = formatBytes(bytes);
  elements.merge.disabled = items.length < 2;
  refreshIcons(elements.list);
}

function outputName() {
  const stem = sanitizeFileStem(elements.name.value || "zusammengefuehrt");
  return `${stem}.pdf`;
}

async function mergePdfs() {
  if (items.length < 2) return;
  setError();
  clearOutput();
  setButtonLoading(elements.merge, true, "PDF wird erstellt");

  try {
    const result = await PDFDocument.create();
    for (const item of items) {
      const source = await PDFDocument.load(item.bytes, { updateMetadata: false });
      const pages = await result.copyPages(source, source.getPageIndices());
      pages.forEach((page) => result.addPage(page));
    }
    result.setTitle(outputName().slice(0, -4));
    result.setCreator("Andersen Web Tools");
    result.setProducer("Andersen Web Tools");
    const bytes = await result.save({ useObjectStreams: true });
    currentOutput = { blob: new Blob([bytes], { type: "application/pdf" }), fileName: outputName(), pages: result.getPageCount() };
    renderOutput();
  } catch {
    setError("Die PDF-Dateien konnten nicht zusammengefügt werden. Prüfe, ob eine Datei geschützt oder beschädigt ist.");
  } finally {
    setButtonLoading(elements.merge, false);
  }
}

function renderOutput() {
  if (!currentOutput) return;
  elements.resultName.textContent = currentOutput.fileName;
  elements.resultMeta.textContent = `${currentOutput.pages} Seiten · ${formatBytes(currentOutput.blob.size)} · ohne Wasserzeichen`;
  elements.resultPanel.hidden = false;
  refreshIcons(elements.resultPanel);
  elements.resultPanel.scrollIntoView({ behavior: "smooth", block: "start" });
}

function clearOutput() {
  currentOutput = null;
  elements.resultPanel.hidden = true;
}

function resetAll() {
  items = [];
  clearOutput();
  setError();
  elements.name.value = "zusammengefuehrt";
  renderItems();
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
elements.name.addEventListener("input", clearOutput);
elements.merge.addEventListener("click", mergePdfs);
elements.reset.addEventListener("click", resetAll);
elements.download.addEventListener("click", () => {
  if (currentOutput) downloadBlob(currentOutput.blob, currentOutput.fileName);
});
