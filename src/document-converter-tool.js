import JSZip from "jszip";
import { PDFDocument } from "pdf-lib";
import "./styles.css";
import {
  downloadBlob,
  formatBytes,
  refreshIcons,
  sanitizeFileStem,
  setButtonLoading
} from "./shared.js";
import { decodeImage, imageCanvasBlob, limitedDimensions } from "./image-utils.js";
import { canvasToBlob, destroyPdf, openPdf, renderPdfPage } from "./pdf-render.js";

const A4 = { width: 595.28, height: 841.89 };
const MAX_IMAGE_FILES = 30;
const MAX_IMAGE_TOTAL = 160 * 1024 * 1024;
const MAX_PDF_BYTES = 60 * 1024 * 1024;
const MAX_PDF_PAGES = 80;

const elements = {
  modes: document.querySelectorAll("[data-convert-mode]"),
  panels: document.querySelectorAll("[data-convert-panel]"),
  toPdfDropzone: document.querySelector("[data-to-pdf-dropzone]"),
  toPdfInput: document.querySelector("[data-to-pdf-input]"),
  toPdfList: document.querySelector("[data-to-pdf-list]"),
  toPdfError: document.querySelector("[data-to-pdf-error]"),
  toPdfPageSize: document.querySelector("[data-to-pdf-page-size]"),
  toPdfMargin: document.querySelector("[data-to-pdf-margin]"),
  toPdfCount: document.querySelector("[data-to-pdf-count]"),
  toPdfSize: document.querySelector("[data-to-pdf-size]"),
  toPdfReset: document.querySelector("[data-to-pdf-reset]"),
  toPdfProcess: document.querySelector("[data-to-pdf-process]"),
  toPdfResult: document.querySelector("[data-to-pdf-result]"),
  toPdfResultName: document.querySelector("[data-to-pdf-result-name]"),
  toPdfResultMeta: document.querySelector("[data-to-pdf-result-meta]"),
  toPdfDownload: document.querySelector("[data-to-pdf-download]"),
  toImageDropzone: document.querySelector("[data-to-image-dropzone]"),
  toImageInput: document.querySelector("[data-to-image-input]"),
  toImageFile: document.querySelector("[data-to-image-file]"),
  toImageFileName: document.querySelector("[data-to-image-file-name]"),
  toImageFileMeta: document.querySelector("[data-to-image-file-meta]"),
  toImageError: document.querySelector("[data-to-image-error]"),
  toImageDpi: document.querySelector("[data-to-image-dpi]"),
  toImageQuality: document.querySelector("[data-to-image-quality]"),
  toImageQualityValue: document.querySelector("[data-to-image-quality-value]"),
  toImagePages: document.querySelector("[data-to-image-pages]"),
  toImageReset: document.querySelector("[data-to-image-reset]"),
  toImageProcess: document.querySelector("[data-to-image-process]"),
  toImageResult: document.querySelector("[data-to-image-result]"),
  toImageResults: document.querySelector("[data-to-image-results]"),
  toImageDownloadAll: document.querySelector("[data-to-image-download-all]")
};

let activeMode = "images-to-pdf";
let imageFiles = [];
let pdfOutput = null;
let sourcePdfFile = null;
let sourcePdf = null;
let imageResults = [];
let toPdfTimer = 0;
let toImageTimer = 0;

function setError(element, message = "") {
  element.querySelector("span").textContent = message;
  element.hidden = !message;
}

function selectMode(mode) {
  activeMode = mode;
  elements.modes.forEach((button) => {
    const selected = button.dataset.convertMode === mode;
    button.setAttribute("aria-selected", String(selected));
    button.tabIndex = selected ? 0 : -1;
  });
  elements.panels.forEach((panel) => {
    panel.hidden = panel.dataset.convertPanel !== mode;
  });
}

function isSupportedImage(file) {
  return file && ["image/jpeg", "image/png", "image/webp"].includes(file.type);
}

function clearPdfOutput() {
  pdfOutput = null;
  elements.toPdfResult.hidden = true;
}

function renderImageFiles() {
  elements.toPdfList.replaceChildren();
  let totalBytes = 0;
  imageFiles.forEach((file, index) => {
    totalBytes += file.size;
    const row = document.createElement("div");
    row.className = "file-row";
    row.innerHTML = `<div class="file-row__icon"><i data-lucide="file-image"></i></div><div class="file-row__meta"><strong></strong><span></span></div><div class="file-row__actions"><button class="icon-button" type="button" title="Nach oben" aria-label="Nach oben"><i data-lucide="chevron-up"></i></button><button class="icon-button" type="button" title="Nach unten" aria-label="Nach unten"><i data-lucide="chevron-down"></i></button><button class="icon-button" type="button" title="Entfernen" aria-label="Entfernen"><i data-lucide="trash-2"></i></button></div>`;
    row.querySelector("strong").textContent = file.name;
    row.querySelector("span").textContent = formatBytes(file.size);
    const buttons = row.querySelectorAll("button");
    buttons[0].disabled = index === 0;
    buttons[1].disabled = index === imageFiles.length - 1;
    buttons[0].addEventListener("click", () => moveImage(index, -1));
    buttons[1].addEventListener("click", () => moveImage(index, 1));
    buttons[2].addEventListener("click", () => {
      imageFiles.splice(index, 1);
      clearPdfOutput();
      renderImageFiles();
      schedulePdfCreation();
    });
    elements.toPdfList.append(row);
  });
  elements.toPdfCount.textContent = String(imageFiles.length);
  elements.toPdfSize.textContent = formatBytes(totalBytes);
  elements.toPdfProcess.disabled = imageFiles.length === 0;
  refreshIcons(elements.toPdfList);
}

function moveImage(index, direction) {
  const nextIndex = index + direction;
  if (nextIndex < 0 || nextIndex >= imageFiles.length) return;
  const [file] = imageFiles.splice(index, 1);
  imageFiles.splice(nextIndex, 0, file);
  clearPdfOutput();
  renderImageFiles();
  schedulePdfCreation();
}

function addImageFiles(fileList) {
  setError(elements.toPdfError);
  clearPdfOutput();
  let totalBytes = imageFiles.reduce((sum, file) => sum + file.size, 0);
  for (const file of [...(fileList || [])]) {
    if (!isSupportedImage(file)) {
      setError(elements.toPdfError, "Unterstützt werden JPG-, PNG- und WebP-Bilder.");
      continue;
    }
    if (imageFiles.length >= MAX_IMAGE_FILES) {
      setError(elements.toPdfError, `Pro Durchgang sind höchstens ${MAX_IMAGE_FILES} Bilder möglich.`);
      break;
    }
    if (totalBytes + file.size > MAX_IMAGE_TOTAL) {
      setError(elements.toPdfError, "Die Bildauswahl ist zusammen größer als 160 MB.");
      break;
    }
    imageFiles.push(file);
    totalBytes += file.size;
  }
  elements.toPdfInput.value = "";
  renderImageFiles();
  schedulePdfCreation();
}

function schedulePdfCreation() {
  window.clearTimeout(toPdfTimer);
  clearPdfOutput();
  if (!imageFiles.length) return;
  toPdfTimer = window.setTimeout(createPdfFromImages, 280);
}

function scheduleImageCreation() {
  window.clearTimeout(toImageTimer);
  clearImageResults();
  if (!sourcePdf) return;
  toImageTimer = window.setTimeout(createImagesFromPdf, 320);
}

async function imageForPdf(file) {
  const decoded = await decodeImage(file);
  try {
    const dimensions = limitedDimensions(decoded.width, decoded.height, 0, 24_000_000);
    const canvas = document.createElement("canvas");
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;
    const context = canvas.getContext("2d", { alpha: false });
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(decoded.source, 0, 0, canvas.width, canvas.height);
    return {
      blob: await imageCanvasBlob(canvas, "image/jpeg", 0.92),
      height: dimensions.height,
      width: dimensions.width
    };
  } finally {
    decoded.close();
  }
}

function pageGeometry(imageWidth, imageHeight) {
  const margin = Number(elements.toPdfMargin.value) * 2.8346456693;
  if (elements.toPdfPageSize.value === "original") {
    const rawWidth = imageWidth * 0.75;
    const rawHeight = imageHeight * 0.75;
    const scale = Math.min(1, 1440 / Math.max(rawWidth, rawHeight));
    return {
      height: Math.max(72, rawHeight * scale),
      margin: 0,
      width: Math.max(72, rawWidth * scale)
    };
  }
  const landscape = imageWidth > imageHeight;
  return {
    height: landscape ? A4.width : A4.height,
    margin,
    width: landscape ? A4.height : A4.width
  };
}

async function createPdfFromImages() {
  if (!imageFiles.length) return;
  setError(elements.toPdfError);
  clearPdfOutput();
  setButtonLoading(elements.toPdfProcess, true, "PDF wird erstellt");
  try {
    const pdf = await PDFDocument.create();
    for (const file of imageFiles) {
      const prepared = await imageForPdf(file);
      const image = await pdf.embedJpg(new Uint8Array(await prepared.blob.arrayBuffer()));
      const geometry = pageGeometry(prepared.width, prepared.height);
      const page = pdf.addPage([geometry.width, geometry.height]);
      const availableWidth = geometry.width - geometry.margin * 2;
      const availableHeight = geometry.height - geometry.margin * 2;
      const scale = Math.min(availableWidth / prepared.width, availableHeight / prepared.height);
      const width = prepared.width * scale;
      const height = prepared.height * scale;
      page.drawImage(image, {
        x: (geometry.width - width) / 2,
        y: (geometry.height - height) / 2,
        width,
        height
      });
    }
    pdf.setTitle("Bilder als PDF");
    pdf.setCreator("Andersen Web Tools");
    pdf.setProducer("Andersen Web Tools");
    const bytes = await pdf.save({ useObjectStreams: true });
    pdfOutput = {
      blob: new Blob([bytes], { type: "application/pdf" }),
      fileName: "bilder.pdf"
    };
    elements.toPdfResultName.textContent = pdfOutput.fileName;
    elements.toPdfResultMeta.textContent = `${imageFiles.length} ${imageFiles.length === 1 ? "Bild" : "Bilder"} · ${formatBytes(pdfOutput.blob.size)} · ohne Wasserzeichen`;
    elements.toPdfResult.hidden = false;
    refreshIcons(elements.toPdfResult);
    elements.toPdfResult.scrollIntoView({ behavior: "smooth", block: "start" });
  } catch {
    setError(elements.toPdfError, "Mindestens ein Bild konnte nicht in die PDF übernommen werden.");
  } finally {
    setButtonLoading(elements.toPdfProcess, false);
  }
}

async function selectPdf(file) {
  setError(elements.toImageError);
  clearImageResults();
  await destroyPdf(sourcePdf);
  sourcePdf = null;
  sourcePdfFile = null;
  elements.toImageFile.hidden = true;
  elements.toImageProcess.disabled = true;

  if (!file || (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf"))) {
    setError(elements.toImageError, "Wähle eine PDF-Datei aus.");
    return;
  }
  if (file.size > MAX_PDF_BYTES) {
    setError(elements.toImageError, "Die PDF ist größer als 60 MB.");
    return;
  }

  try {
    sourcePdf = await openPdf(await file.arrayBuffer());
    if (sourcePdf.numPages > MAX_PDF_PAGES) throw new Error(`Die PDF hat mehr als ${MAX_PDF_PAGES} Seiten.`);
    sourcePdfFile = file;
    elements.toImageFileName.textContent = file.name;
    elements.toImageFileMeta.textContent = `${sourcePdf.numPages} ${sourcePdf.numPages === 1 ? "Seite" : "Seiten"} · ${formatBytes(file.size)}`;
    elements.toImagePages.textContent = String(sourcePdf.numPages);
    elements.toImageFile.hidden = false;
    elements.toImageProcess.disabled = false;
    scheduleImageCreation();
  } catch (error) {
    await destroyPdf(sourcePdf);
    sourcePdf = null;
    setError(elements.toImageError, error instanceof Error ? error.message : "Die PDF konnte nicht gelesen werden.");
  }
}

function clearImageResults() {
  imageResults = [];
  elements.toImageResults.replaceChildren();
  elements.toImageResult.hidden = true;
}

function renderImageResults() {
  elements.toImageResults.replaceChildren();
  imageResults.forEach((result) => {
    const row = document.createElement("div");
    row.className = "result-row";
    row.innerHTML = `<div class="file-row__icon"><i data-lucide="file-image"></i></div><div class="file-row__meta"><strong></strong><span></span></div><div class="file-row__actions"><button class="button button--secondary" type="button"><i data-lucide="download"></i> JPG</button></div>`;
    row.querySelector("strong").textContent = result.fileName;
    row.querySelector("span").textContent = `${result.width} × ${result.height} px · ${formatBytes(result.blob.size)}`;
    row.querySelector("button").addEventListener("click", () => downloadBlob(result.blob, result.fileName));
    elements.toImageResults.append(row);
  });
  elements.toImageDownloadAll.hidden = imageResults.length < 2;
  elements.toImageResult.hidden = false;
  refreshIcons(elements.toImageResult);
  elements.toImageResult.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function createImagesFromPdf() {
  if (!sourcePdf || !sourcePdfFile) return;
  setError(elements.toImageError);
  clearImageResults();
  setButtonLoading(elements.toImageProcess, true, "Seiten werden umgewandelt");
  try {
    const output = [];
    const stem = sanitizeFileStem(sourcePdfFile.name.slice(0, -4));
    for (let pageNumber = 1; pageNumber <= sourcePdf.numPages; pageNumber += 1) {
      const rendered = await renderPdfPage(sourcePdf, pageNumber, {
        dpi: Number(elements.toImageDpi.value),
        maxPixels: 18_000_000
      });
      const blob = await canvasToBlob(rendered.canvas, "image/jpeg", Number(elements.toImageQuality.value) / 100);
      output.push({
        blob,
        fileName: `${stem}-seite-${String(pageNumber).padStart(2, "0")}.jpg`,
        height: rendered.canvas.height,
        width: rendered.canvas.width
      });
      rendered.canvas.width = 1;
      rendered.canvas.height = 1;
    }
    imageResults = output;
    renderImageResults();
  } catch {
    setError(elements.toImageError, "Die PDF-Seiten konnten nicht vollständig in Bilder umgewandelt werden.");
  } finally {
    setButtonLoading(elements.toImageProcess, false);
  }
}

async function downloadImageZip() {
  if (imageResults.length < 2) return;
  setButtonLoading(elements.toImageDownloadAll, true, "ZIP wird erstellt");
  try {
    const zip = new JSZip();
    imageResults.forEach((result) => zip.file(result.fileName, result.blob));
    const blob = await zip.generateAsync({ type: "blob", compression: "DEFLATE", compressionOptions: { level: 5 } });
    downloadBlob(blob, `${sanitizeFileStem(sourcePdfFile.name.slice(0, -4))}-seiten.zip`);
  } finally {
    setButtonLoading(elements.toImageDownloadAll, false);
  }
}

function resetImagesToPdf() {
  imageFiles = [];
  elements.toPdfInput.value = "";
  elements.toPdfPageSize.value = "a4";
  elements.toPdfMargin.value = "10";
  setError(elements.toPdfError);
  clearPdfOutput();
  renderImageFiles();
}

async function resetPdfToImages() {
  await destroyPdf(sourcePdf);
  sourcePdf = null;
  sourcePdfFile = null;
  elements.toImageInput.value = "";
  elements.toImageFile.hidden = true;
  elements.toImagePages.textContent = "0";
  elements.toImageDpi.value = "144";
  elements.toImageQuality.value = "84";
  elements.toImageQualityValue.textContent = "84 %";
  elements.toImageProcess.disabled = true;
  setError(elements.toImageError);
  clearImageResults();
}

elements.modes.forEach((button) => button.addEventListener("click", () => selectMode(button.dataset.convertMode)));
elements.toPdfInput.addEventListener("change", () => addImageFiles(elements.toPdfInput.files));
elements.toPdfDropzone.addEventListener("dragover", (event) => {
  event.preventDefault();
  elements.toPdfDropzone.dataset.active = "true";
});
elements.toPdfDropzone.addEventListener("dragleave", () => {
  elements.toPdfDropzone.dataset.active = "false";
});
elements.toPdfDropzone.addEventListener("drop", (event) => {
  event.preventDefault();
  elements.toPdfDropzone.dataset.active = "false";
  addImageFiles(event.dataTransfer.files);
});
elements.toPdfPageSize.addEventListener("change", schedulePdfCreation);
elements.toPdfMargin.addEventListener("change", schedulePdfCreation);
elements.toPdfProcess.addEventListener("click", createPdfFromImages);
elements.toPdfReset.addEventListener("click", resetImagesToPdf);
elements.toPdfDownload.addEventListener("click", () => {
  if (pdfOutput) downloadBlob(pdfOutput.blob, pdfOutput.fileName);
});
elements.toImageInput.addEventListener("change", () => selectPdf(elements.toImageInput.files[0]));
elements.toImageDropzone.addEventListener("dragover", (event) => {
  event.preventDefault();
  elements.toImageDropzone.dataset.active = "true";
});
elements.toImageDropzone.addEventListener("dragleave", () => {
  elements.toImageDropzone.dataset.active = "false";
});
elements.toImageDropzone.addEventListener("drop", (event) => {
  event.preventDefault();
  elements.toImageDropzone.dataset.active = "false";
  selectPdf(event.dataTransfer.files[0]);
});
elements.toImageQuality.addEventListener("input", () => {
  elements.toImageQualityValue.textContent = `${elements.toImageQuality.value} %`;
  scheduleImageCreation();
});
elements.toImageDpi.addEventListener("change", scheduleImageCreation);
elements.toImageProcess.addEventListener("click", createImagesFromPdf);
elements.toImageReset.addEventListener("click", resetPdfToImages);
elements.toImageDownloadAll.addEventListener("click", downloadImageZip);

selectMode(activeMode);
renderImageFiles();
refreshIcons();
