import { PDFDocument } from "pdf-lib";
import "./styles.css";
import {
  downloadBlob,
  formatBytes,
  refreshIcons,
  sanitizeFileStem,
  setButtonLoading
} from "./shared.js";
import { decodeImage, redrawImage } from "./image-utils.js";
import { destroyPdf, openPdf, renderPdfPage } from "./pdf-render.js";

const MAX_PDF_BYTES = 60 * 1024 * 1024;
const MAX_PAGES = 80;

const elements = {
  dropzone: document.querySelector("[data-sign-pdf-dropzone]"),
  input: document.querySelector("[data-sign-pdf-input]"),
  file: document.querySelector("[data-sign-pdf-file]"),
  fileName: document.querySelector("[data-sign-pdf-file-name]"),
  fileMeta: document.querySelector("[data-sign-pdf-file-meta]"),
  error: document.querySelector("[data-sign-error]"),
  previewFrame: document.querySelector("[data-sign-preview-frame]"),
  preview: document.querySelector("[data-sign-preview]"),
  overlay: document.querySelector("[data-sign-overlay]"),
  previewEmpty: document.querySelector("[data-sign-preview-empty]"),
  previewHint: document.querySelector("[data-sign-preview-hint]"),
  page: document.querySelector("[data-sign-page]"),
  previousPage: document.querySelector("[data-sign-previous-page]"),
  nextPage: document.querySelector("[data-sign-next-page]"),
  pad: document.querySelector("[data-signature-pad]"),
  clearPad: document.querySelector("[data-signature-clear]"),
  signatureInput: document.querySelector("[data-signature-input]"),
  signatureStatus: document.querySelector("[data-signature-status]"),
  width: document.querySelector("[data-signature-width]"),
  widthValue: document.querySelector("[data-signature-width-value]"),
  reset: document.querySelector("[data-sign-reset]"),
  process: document.querySelector("[data-sign-process]"),
  resultPanel: document.querySelector("[data-sign-result-panel]"),
  resultName: document.querySelector("[data-sign-result-name]"),
  resultMeta: document.querySelector("[data-sign-result-meta]"),
  download: document.querySelector("[data-sign-download]")
};

let sourceFile = null;
let sourceBytes = null;
let previewPdf = null;
let selectedPage = 1;
let signatureBlob = null;
let signatureDrawable = null;
let signatureAspect = 3.5;
let signaturePosition = { x: 0.72, y: 0.82 };
let drawing = false;
let hasInk = false;
let currentOutput = null;

function setError(message = "") {
  elements.error.querySelector("span").textContent = message;
  elements.error.hidden = !message;
}

function clearResult() {
  currentOutput = null;
  elements.resultPanel.hidden = true;
}

function updateReadyState() {
  elements.process.disabled = !(sourceBytes && previewPdf && signatureBlob);
  elements.signatureStatus.textContent = signatureBlob
    ? "Unterschrift bereit. Klicke in der Vorschau auf die gewünschte Stelle."
    : "Zeichne deine Unterschrift oder lade ein Bild davon hoch.";
}

function padPoint(event) {
  const bounds = elements.pad.getBoundingClientRect();
  return {
    x: (event.clientX - bounds.left) * (elements.pad.width / bounds.width),
    y: (event.clientY - bounds.top) * (elements.pad.height / bounds.height)
  };
}

function beginDrawing(event) {
  drawing = true;
  hasInk = true;
  elements.pad.setPointerCapture(event.pointerId);
  const point = padPoint(event);
  const context = elements.pad.getContext("2d");
  context.beginPath();
  context.moveTo(point.x, point.y);
}

function continueDrawing(event) {
  if (!drawing) return;
  const point = padPoint(event);
  const context = elements.pad.getContext("2d");
  context.lineWidth = 6;
  context.lineCap = "round";
  context.lineJoin = "round";
  context.strokeStyle = "#17201d";
  context.lineTo(point.x, point.y);
  context.stroke();
}

async function finishDrawing(event) {
  if (!drawing) return;
  drawing = false;
  if (elements.pad.hasPointerCapture(event.pointerId)) elements.pad.releasePointerCapture(event.pointerId);
  if (!hasInk) return;
  const blob = await new Promise((resolve) => elements.pad.toBlob(resolve, "image/png"));
  if (blob) await setSignature(blob);
}

async function setSignature(blob) {
  if (signatureDrawable) signatureDrawable.close();
  signatureDrawable = await decodeImage(blob);
  signatureBlob = blob;
  signatureAspect = signatureDrawable.width / signatureDrawable.height;
  clearResult();
  updateReadyState();
  drawSignaturePreview();
}

async function loadSignatureImage(file) {
  setError();
  if (!file || !["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
    setError("Wähle ein PNG-, JPG- oder WebP-Bild deiner Unterschrift aus.");
    return;
  }
  if (file.size > 8 * 1024 * 1024) {
    setError("Das Unterschriftsbild ist größer als 8 MB.");
    return;
  }
  try {
    const prepared = await redrawImage(file, { maxWidth: 1600, maxPixels: 5_000_000, type: "image/png" });
    await setSignature(prepared.blob);
  } catch {
    setError("Das Unterschriftsbild konnte nicht gelesen werden.");
  } finally {
    elements.signatureInput.value = "";
  }
}

function clearSignature() {
  const context = elements.pad.getContext("2d");
  context.clearRect(0, 0, elements.pad.width, elements.pad.height);
  hasInk = false;
  signatureBlob = null;
  if (signatureDrawable) signatureDrawable.close();
  signatureDrawable = null;
  clearResult();
  updateReadyState();
  drawSignaturePreview();
}

function drawSignaturePreview() {
  const context = elements.overlay.getContext("2d");
  context.clearRect(0, 0, elements.overlay.width, elements.overlay.height);
  if (!signatureDrawable || !elements.overlay.width || !elements.overlay.height) return;
  const width = elements.overlay.width * (Number(elements.width.value) / 100);
  const height = width / signatureAspect;
  const x = Math.max(0, Math.min(elements.overlay.width - width, signaturePosition.x * elements.overlay.width - width / 2));
  const y = Math.max(0, Math.min(elements.overlay.height - height, signaturePosition.y * elements.overlay.height - height / 2));
  context.drawImage(signatureDrawable.source, x, y, width, height);
}

async function renderSelectedPage() {
  if (!previewPdf) return;
  try {
    await renderPdfPage(previewPdf, selectedPage, {
      canvas: elements.preview,
      dpi: 110,
      maxPixels: 7_000_000
    });
    elements.overlay.width = elements.preview.width;
    elements.overlay.height = elements.preview.height;
    elements.preview.hidden = false;
    elements.overlay.hidden = false;
    elements.previewEmpty.hidden = true;
    elements.previewHint.hidden = false;
    elements.page.value = String(selectedPage);
    elements.previousPage.disabled = selectedPage <= 1;
    elements.nextPage.disabled = selectedPage >= previewPdf.numPages;
    drawSignaturePreview();
  } catch {
    setError("Die ausgewählte PDF-Seite konnte nicht angezeigt werden.");
  }
}

async function selectPdf(file) {
  setError();
  clearResult();
  await destroyPdf(previewPdf);
  previewPdf = null;
  sourceFile = null;
  sourceBytes = null;
  elements.file.hidden = true;
  elements.preview.hidden = true;
  elements.overlay.hidden = true;
  elements.previewEmpty.hidden = false;
  elements.previewHint.hidden = true;

  if (!file || (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf"))) {
    setError("Wähle eine PDF-Datei aus.");
    updateReadyState();
    return;
  }
  if (file.size > MAX_PDF_BYTES) {
    setError("Die PDF ist größer als 60 MB.");
    updateReadyState();
    return;
  }

  try {
    sourceBytes = new Uint8Array(await file.arrayBuffer());
    previewPdf = await openPdf(sourceBytes);
    if (previewPdf.numPages > MAX_PAGES) throw new Error(`Die PDF hat mehr als ${MAX_PAGES} Seiten.`);
    sourceFile = file;
    selectedPage = 1;
    elements.page.replaceChildren();
    for (let pageNumber = 1; pageNumber <= previewPdf.numPages; pageNumber += 1) {
      const option = document.createElement("option");
      option.value = String(pageNumber);
      option.textContent = `Seite ${pageNumber}`;
      elements.page.append(option);
    }
    elements.fileName.textContent = file.name;
    elements.fileMeta.textContent = `${previewPdf.numPages} ${previewPdf.numPages === 1 ? "Seite" : "Seiten"} · ${formatBytes(file.size)}`;
    elements.file.hidden = false;
    await renderSelectedPage();
  } catch (error) {
    await destroyPdf(previewPdf);
    previewPdf = null;
    sourceFile = null;
    sourceBytes = null;
    setError(error instanceof Error ? error.message : "Die PDF konnte nicht gelesen werden.");
  }
  updateReadyState();
}

function placeSignature(event) {
  if (!signatureBlob || !previewPdf) return;
  const bounds = elements.previewFrame.getBoundingClientRect();
  signaturePosition = {
    x: Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width)),
    y: Math.max(0, Math.min(1, (event.clientY - bounds.top) / bounds.height))
  };
  clearResult();
  drawSignaturePreview();
}

async function signPdf() {
  if (!sourceBytes || !sourceFile || !signatureBlob) return;
  setError();
  clearResult();
  setButtonLoading(elements.process, true, "PDF wird unterschrieben");
  try {
    const pdf = await PDFDocument.load(sourceBytes.slice(), { updateMetadata: false });
    const signature = await pdf.embedPng(new Uint8Array(await signatureBlob.arrayBuffer()));
    const page = pdf.getPage(selectedPage - 1);
    const pageWidth = page.getWidth();
    const pageHeight = page.getHeight();
    const width = pageWidth * (Number(elements.width.value) / 100);
    const height = width / signatureAspect;
    const x = Math.max(0, Math.min(pageWidth - width, signaturePosition.x * pageWidth - width / 2));
    const yFromTop = signaturePosition.y * pageHeight - height / 2;
    const y = Math.max(0, Math.min(pageHeight - height, pageHeight - yFromTop - height));
    page.drawImage(signature, { x, y, width, height });
    pdf.setProducer("Andersen Web Tools");
    const bytes = await pdf.save({ useObjectStreams: true });
    currentOutput = {
      blob: new Blob([bytes], { type: "application/pdf" }),
      fileName: `${sanitizeFileStem(sourceFile.name.slice(0, -4))}-unterschrieben.pdf`
    };
    elements.resultName.textContent = currentOutput.fileName;
    elements.resultMeta.textContent = `Unterschrift auf Seite ${selectedPage} · ${formatBytes(currentOutput.blob.size)} · Quelldatei unverändert`;
    elements.resultPanel.hidden = false;
    refreshIcons(elements.resultPanel);
    elements.resultPanel.scrollIntoView({ behavior: "smooth", block: "start" });
  } catch {
    setError("Die Unterschrift konnte nicht in die PDF eingesetzt werden.");
  } finally {
    setButtonLoading(elements.process, false);
  }
}

async function resetAll() {
  await destroyPdf(previewPdf);
  previewPdf = null;
  sourceFile = null;
  sourceBytes = null;
  selectedPage = 1;
  signaturePosition = { x: 0.72, y: 0.82 };
  elements.input.value = "";
  elements.file.hidden = true;
  elements.page.replaceChildren();
  elements.preview.hidden = true;
  elements.overlay.hidden = true;
  elements.previewEmpty.hidden = false;
  elements.previewHint.hidden = true;
  elements.width.value = "28";
  elements.widthValue.textContent = "28 %";
  setError();
  clearResult();
  clearSignature();
}

elements.pad.width = 900;
elements.pad.height = 240;
elements.pad.addEventListener("pointerdown", beginDrawing);
elements.pad.addEventListener("pointermove", continueDrawing);
elements.pad.addEventListener("pointerup", finishDrawing);
elements.pad.addEventListener("pointercancel", finishDrawing);
elements.clearPad.addEventListener("click", clearSignature);
elements.signatureInput.addEventListener("change", () => loadSignatureImage(elements.signatureInput.files[0]));
elements.input.addEventListener("change", () => selectPdf(elements.input.files[0]));
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
  selectPdf(event.dataTransfer.files[0]);
});
elements.page.addEventListener("change", () => {
  selectedPage = Number(elements.page.value);
  clearResult();
  renderSelectedPage();
});
elements.previousPage.addEventListener("click", () => {
  if (selectedPage <= 1) return;
  selectedPage -= 1;
  clearResult();
  renderSelectedPage();
});
elements.nextPage.addEventListener("click", () => {
  if (!previewPdf || selectedPage >= previewPdf.numPages) return;
  selectedPage += 1;
  clearResult();
  renderSelectedPage();
});
elements.previewFrame.addEventListener("click", placeSignature);
elements.width.addEventListener("input", () => {
  elements.widthValue.textContent = `${elements.width.value} %`;
  clearResult();
  drawSignaturePreview();
});
elements.process.addEventListener("click", signPdf);
elements.reset.addEventListener("click", resetAll);
elements.download.addEventListener("click", () => {
  if (currentOutput) downloadBlob(currentOutput.blob, currentOutput.fileName);
});

updateReadyState();
refreshIcons();
