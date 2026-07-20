import { PDFDocument } from "pdf-lib";
import "./styles.css";
import {
  downloadBlob,
  formatBytes,
  refreshIcons,
  sanitizeFileStem,
  setButtonLoading
} from "./shared.js";
import {
  canvasToBlob,
  destroyPdf,
  openPdf,
  renderPdfPage
} from "./pdf-render.js";

const MAX_FILE_BYTES = 60 * 1024 * 1024;
const MAX_PAGES = 80;

const profiles = {
  balanced: { dpi: 144, quality: 0.72, label: "Ausgewogen" },
  compact: { dpi: 108, quality: 0.58, label: "Möglichst klein" },
  print: { dpi: 192, quality: 0.84, label: "Bessere Qualität" },
  structure: { label: "Struktur erhalten" }
};

const elements = {
  dropzone: document.querySelector("[data-compress-dropzone]"),
  input: document.querySelector("[data-compress-input]"),
  file: document.querySelector("[data-compress-file]"),
  error: document.querySelector("[data-compress-error]"),
  notice: document.querySelector("[data-compress-notice]"),
  modes: document.querySelectorAll("[data-compress-mode]"),
  preview: document.querySelector("[data-compress-preview]"),
  previewEmpty: document.querySelector("[data-compress-preview-empty]"),
  fileName: document.querySelector("[data-compress-file-name]"),
  fileMeta: document.querySelector("[data-compress-file-meta]"),
  pages: document.querySelector("[data-compress-pages]"),
  inputSize: document.querySelector("[data-compress-input-size]"),
  progress: document.querySelector("[data-compress-progress]"),
  reset: document.querySelector("[data-compress-reset]"),
  process: document.querySelector("[data-compress-process]"),
  resultPanel: document.querySelector("[data-compress-result-panel]"),
  resultName: document.querySelector("[data-compress-result-name]"),
  resultMeta: document.querySelector("[data-compress-result-meta]"),
  resultStatus: document.querySelector("[data-compress-result-status]"),
  download: document.querySelector("[data-compress-download]")
};

let sourceFile = null;
let sourceBytes = null;
let previewPdf = null;
let activeProfile = "balanced";
let currentOutput = null;
let compressionTimer = 0;

function setError(message = "") {
  elements.error.querySelector("span").textContent = message;
  elements.error.hidden = !message;
}

function setNotice(message = "") {
  elements.notice.querySelector("span").textContent = message;
  elements.notice.hidden = !message;
}

function isPdf(file) {
  return file && (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf"));
}

async function selectFile(file) {
  setError();
  setNotice();
  clearResult();

  if (!isPdf(file)) {
    setError("Wähle eine PDF-Datei aus.");
    return;
  }
  if (file.size > MAX_FILE_BYTES) {
    setError("Die PDF ist größer als 60 MB. Teile sie zuerst in kleinere Abschnitte.");
    return;
  }

  await destroyPdf(previewPdf);
  previewPdf = null;
  sourceFile = file;
  sourceBytes = new Uint8Array(await file.arrayBuffer());

  try {
    previewPdf = await openPdf(sourceBytes);
    if (previewPdf.numPages > MAX_PAGES) {
      throw new Error(`Die PDF hat ${previewPdf.numPages} Seiten. Dieses Werkzeug verarbeitet höchstens ${MAX_PAGES} Seiten pro Durchgang.`);
    }

    await renderPdfPage(previewPdf, 1, {
      canvas: elements.preview,
      dpi: 96,
      maxPixels: 4_000_000
    });
    elements.preview.hidden = false;
    elements.previewEmpty.hidden = true;
    elements.file.hidden = false;
    elements.fileName.textContent = file.name;
    elements.fileMeta.textContent = `${previewPdf.numPages} ${previewPdf.numPages === 1 ? "Seite" : "Seiten"} · ${formatBytes(file.size)}`;
    elements.pages.textContent = String(previewPdf.numPages);
    elements.inputSize.textContent = formatBytes(file.size);
    elements.process.disabled = false;
    scheduleCompression();
  } catch (error) {
    await destroyPdf(previewPdf);
    previewPdf = null;
    sourceFile = null;
    sourceBytes = null;
    elements.file.hidden = true;
    elements.preview.hidden = true;
    elements.previewEmpty.hidden = false;
    elements.process.disabled = true;
    setError(error instanceof Error ? error.message : "Die PDF konnte nicht geöffnet werden. Sie ist möglicherweise geschützt oder beschädigt.");
  }
}

function selectProfile(profile) {
  activeProfile = profile;
  elements.modes.forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.compressMode === profile));
  });
  clearResult();
  setNotice(profile === "structure"
    ? "Dieser Modus bewahrt Text, Links und Formularfelder. Bei bereits gut optimierten PDFs kann die Datei gleich groß oder etwas größer werden."
    : "Die Seiten werden als Bilder neu aufgebaut. Dadurch werden Textauswahl, Links, Formulare und vorhandene digitale Signaturen entfernt.");
  scheduleCompression();
}

function scheduleCompression() {
  window.clearTimeout(compressionTimer);
  if (!sourceFile || !sourceBytes || !previewPdf) return;
  compressionTimer = window.setTimeout(compressPdf, 220);
}

async function rebuildWithImages(profile) {
  const result = await PDFDocument.create();
  result.setCreator("Andersen Web Tools");
  result.setProducer("Andersen Web Tools");

  for (let pageNumber = 1; pageNumber <= previewPdf.numPages; pageNumber += 1) {
    elements.progress.textContent = `Seite ${pageNumber} von ${previewPdf.numPages} wird verarbeitet …`;
    const rendered = await renderPdfPage(previewPdf, pageNumber, {
      dpi: profile.dpi,
      maxPixels: 18_000_000
    });
    const imageBlob = await canvasToBlob(rendered.canvas, "image/jpeg", profile.quality);
    const imageBytes = new Uint8Array(await imageBlob.arrayBuffer());
    const image = await result.embedJpg(imageBytes);
    const page = result.addPage([rendered.baseViewport.width, rendered.baseViewport.height]);
    page.drawImage(image, {
      x: 0,
      y: 0,
      width: page.getWidth(),
      height: page.getHeight()
    });
    rendered.canvas.width = 1;
    rendered.canvas.height = 1;
  }

  return result.save({ useObjectStreams: true });
}

async function preserveStructure() {
  const result = await PDFDocument.load(sourceBytes.slice(), { updateMetadata: false });
  result.setProducer("Andersen Web Tools");
  return result.save({ useObjectStreams: true, addDefaultPage: false });
}

async function compressPdf() {
  if (!sourceFile || !sourceBytes || !previewPdf) return;
  setError();
  clearResult();
  elements.progress.textContent = "PDF wird vorbereitet …";
  setButtonLoading(elements.process, true, "PDF wird verkleinert");

  try {
    const profile = profiles[activeProfile];
    const bytes = activeProfile === "structure"
      ? await preserveStructure()
      : await rebuildWithImages(profile);
    const fileName = `${sanitizeFileStem(sourceFile.name.slice(0, -4))}-verkleinert.pdf`;
    const blob = new Blob([bytes], { type: "application/pdf" });
    const savedBytes = sourceFile.size - blob.size;
    const savedPercent = sourceFile.size > 0 ? Math.round((savedBytes / sourceFile.size) * 100) : 0;
    currentOutput = { blob, fileName };

    elements.resultName.textContent = fileName;
    elements.resultMeta.textContent = `${formatBytes(sourceFile.size)} → ${formatBytes(blob.size)} · ${profile.label}`;
    elements.resultStatus.textContent = savedBytes > 0
      ? `${formatBytes(savedBytes)} gespart (${savedPercent} % kleiner).`
      : "Diese Einstellung hat die Datei nicht verkleinert. Probiere „Ausgewogen“ oder „Möglichst klein“ – oder behalte das Original.";
    elements.resultStatus.dataset.state = savedBytes > 0 ? "success" : "warning";
    elements.resultPanel.hidden = false;
    refreshIcons(elements.resultPanel);
    elements.resultPanel.scrollIntoView({ behavior: "smooth", block: "start" });
  } catch {
    setError("Die PDF konnte nicht verarbeitet werden. Geschützte, beschädigte oder sehr komplexe Dateien können den Browser überfordern.");
  } finally {
    elements.progress.textContent = "";
    setButtonLoading(elements.process, false);
  }
}

function clearResult() {
  currentOutput = null;
  elements.resultPanel.hidden = true;
}

async function resetAll() {
  await destroyPdf(previewPdf);
  previewPdf = null;
  sourceFile = null;
  sourceBytes = null;
  elements.input.value = "";
  elements.file.hidden = true;
  elements.preview.hidden = true;
  elements.previewEmpty.hidden = false;
  elements.pages.textContent = "0";
  elements.inputSize.textContent = "0 B";
  elements.process.disabled = true;
  setError();
  clearResult();
  selectProfile("balanced");
}

elements.input.addEventListener("change", () => selectFile(elements.input.files[0]));
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
  selectFile(event.dataTransfer.files[0]);
});
elements.modes.forEach((button) => button.addEventListener("click", () => selectProfile(button.dataset.compressMode)));
elements.process.addEventListener("click", compressPdf);
elements.reset.addEventListener("click", resetAll);
elements.download.addEventListener("click", () => {
  if (currentOutput) downloadBlob(currentOutput.blob, currentOutput.fileName);
});

selectProfile("balanced");
refreshIcons();
